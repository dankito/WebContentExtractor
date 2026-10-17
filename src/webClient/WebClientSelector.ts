import  { type FetchApiWebClient } from "./FetchApiWebClient.ts"
import type { WebClient } from "./WebClient.ts"
import type { WebRequestOptions } from "@shared/model/WebRequestOptions.ts"
import type { WebClientResponse } from "./WebClientResponse.ts"
import { WebFetcherWebClient } from "./WebFetcherWebClient.ts"

export class WebClientSelector implements WebClient {

  readonly webFetcher: WebFetcherWebClient | null

  constructor(readonly fetchApi: FetchApiWebClient, webFetcherUrl?: string) {
    this.webFetcher = webFetcherUrl ? new WebFetcherWebClient(webFetcherUrl) : null
  }


  async fetch(url: string, options?: WebRequestOptions): Promise<WebClientResponse> {
    try {
      const response = await this.fetchApi.fetch(url, options)
      if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
        return response
      }
      if (this.webFetcher == null) {
        return response
      }
    } catch (error) {
      console.error(`Requesting '${url}' with Fetch API failed`, error)

      if (this.webFetcher == null) { // we cannot escalate to WebFetcher
        throw error
      }
    }

    // at this point it's certain that webFetcher is not null
    return await this.tryWebFetcher(url, options)
  }


  private async tryWebFetcher(url: string, options?: WebRequestOptions): Promise<WebClientResponse> {
    return await this.webFetcher!.fetch(url, options)
  }

}