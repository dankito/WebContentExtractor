import { type FetchApiWebClient } from "./FetchApiWebClient.ts"
import type { WebClient } from "./WebClient.ts"
import type { WebRequestOptions } from "@shared/model/WebRequestOptions.ts"
import { WebClientResponse } from "./WebClientResponse.ts"
import { WebFetcherWebClient } from "./WebFetcherWebClient.ts"
import { WebClientEngine } from "@shared/model/WebClientEngine.ts"

export class WebClientSelector implements WebClient {

  readonly webFetcher: WebFetcherWebClient | null

  constructor(readonly fetchApi: FetchApiWebClient, webFetcherUrl?: string) {
    this.webFetcher = webFetcherUrl ? new WebFetcherWebClient(webFetcherUrl) : null
  }


  async fetch(url: string, options?: WebRequestOptions): Promise<WebClientResponse> {
    const fetchers = options?.fetchers
    const hasFetchers = fetchers !== undefined && fetchers.length > 0
    const includesJsFetchApi = hasFetchers && fetchers.includes(WebClientEngine.JsFetchApi)
    const includesOtherFetchers = hasFetchers && fetchers.some(fetcher => fetcher !== WebClientEngine.JsFetchApi)

    if (hasFetchers && !includesJsFetchApi) { // try WebFetcher only, the user wants it that way
      if (this.webFetcher == null) {
        return WebClientResponse.error(fetchers[0], `WebFetcher is not configured, but is required by the specified fetchers ${fetchers?.join()}. Did you set WEB_FETCHER_URL?`)
      }

      return await this.tryWebFetcher(url, options)
    }

    try {
      const response = await this.fetchApi.fetch(url, options)
      if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
        return response
      }

      if (this.webFetcher == null) {
        return response
      }
      if (hasFetchers && !includesOtherFetchers) {
        return response
      }
    } catch (error) {
      console.error(`Requesting '${url}' with Fetch API failed`, error)

      if (hasFetchers && !includesOtherFetchers) {
        WebClientResponse.error(WebClientEngine.JsFetchApi, `JS Fetch API failed, and you configured that WebFetcher should not be requested as fallback.`)
      }
      if (this.webFetcher == null) { // we cannot escalate to WebFetcher
        WebClientResponse.error(WebClientEngine.JsFetchApi, `JS Fetch API failed and WebFetcher is not configured, so cannot use it as fallback. Did you set WEB_FETCHER_URL?`)
      }
    }

    // at this point it's certain that webFetcher is not null
    return await this.tryWebFetcher(url, options)
  }


  private async tryWebFetcher(url: string, options?: WebRequestOptions): Promise<WebClientResponse> {
    return await this.webFetcher!.fetch(url, options)
  }

}