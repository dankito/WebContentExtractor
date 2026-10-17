import type { WebClient } from "./WebClient"
import type { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { WebClientResponse } from "./WebClientResponse"
import { WebClientEngine } from "@shared/model/WebClientEngine.ts"
import type { WebFetcherResponse } from "./webFetcher/WebFetcherResponse"
import { WebFetcherRequest } from "./webFetcher/WebFetcherRequest"
import { FetchStrategy } from "./webFetcher/FetchStrategy.ts"


export class WebFetcherWebClient implements WebClient {

  constructor(private readonly baseUrl: string) { }


  async fetch(url: string, options?: WebRequestOptions): Promise<WebClientResponse> {
    const strategies = (options?.fetchers ?? []).filter(it => it != WebClientEngine.JsFetchApi).map(it => this.mapEngineToStrategy(it))
    const request = new WebFetcherRequest(url, options?.timeout, options?.userAgent, options?.followRedirects, strategies)

    const response = await fetch(this.baseUrl + "/fetch", {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      }
    })

    if (response.ok) {
      return this.mapSuccessResponse(response)
    } else {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
  }


  private async mapSuccessResponse(response: Response): Promise<WebClientResponse> {
    const fetchResponse = await response.json() as WebFetcherResponse

    const fetcher = this.mapStrategyToEngine(fetchResponse.strategy)
    const cookies: string[] | undefined = fetchResponse.cookies ? [] : undefined // TODO: map cookies
    const durationMs = fetchResponse.elapsed_microseconds ? fetchResponse.elapsed_microseconds / 1000 : undefined

    return new WebClientResponse(fetcher, undefined, fetchResponse.html, fetchResponse.status_code, fetchResponse.final_url,
      fetchResponse.headers, cookies, durationMs)
  }

  private mapStrategyToEngine(strategy: FetchStrategy): WebClientEngine {
    if (strategy === FetchStrategy.CAMOUFOX) {
      return WebClientEngine.Camoufox
    } else if (strategy === FetchStrategy.ZENDRIVER) {
      return WebClientEngine.Zendriver
    } else {
      return WebClientEngine.CurlCffi
    }
  }

  private mapEngineToStrategy(engine: WebClientEngine): FetchStrategy {
    if (engine === WebClientEngine.Camoufox) {
      return FetchStrategy.CAMOUFOX
    } else if (engine === WebClientEngine.Zendriver) {
      return FetchStrategy.ZENDRIVER
    } else {
      return FetchStrategy.CURL_CFFI
    }
  }

}