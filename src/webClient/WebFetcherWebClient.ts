import type { WebClient } from "./WebClient"
import type { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { WebClientResponse } from "./WebClientResponse"
import { WebClientEngine } from "@shared/model/WebClientEngine.ts"
import type { WebFetcherResponse } from "./webFetcher/WebFetcherResponse"
import { WebFetcherRequest } from "./webFetcher/WebFetcherRequest"
import { FetchEngine } from "./webFetcher/FetchEngine.ts"


export class WebFetcherWebClient implements WebClient {

  constructor(private readonly baseUrl: string) { }


  async fetch(url: string, options?: WebRequestOptions): Promise<WebClientResponse> {
    const engines = (options?.fetchers ?? []).filter(it => it != WebClientEngine.JsFetchApi).map(it => this.mapToFetchEngine(it))
    const timeout = options?.timeout ? options.timeout / 1000 : undefined
    const request = new WebFetcherRequest(url, timeout, options?.userAgent, options?.followRedirects, engines)

    const response = await fetch(this.baseUrl + "/fetch/details", {
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

    const engine = this.mapToWebClientEngine(fetchResponse.engine)
    const cookies: string[] | undefined = fetchResponse.cookies ? [] : undefined // TODO: map cookies
    const durationMs = fetchResponse.elapsedMs ?? undefined

    return new WebClientResponse(engine, undefined, fetchResponse.content, fetchResponse.statusCode, fetchResponse.finalUrl,
      fetchResponse.headers, cookies, durationMs)
  }

  private mapToWebClientEngine(engine: FetchEngine): WebClientEngine {
    if (engine === FetchEngine.Camoufox) {
      return WebClientEngine.Camoufox
    } else {
      return WebClientEngine.Impit
    }
  }

  private mapToFetchEngine(engine: WebClientEngine): FetchEngine {
    if (engine === WebClientEngine.Camoufox) {
      return FetchEngine.Camoufox
    } else {
      return FetchEngine.Impit
    }
  }

}