import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import type { WebFetcher } from "./WebFetcher"
import { WebFetcher as WebFetcherEnum } from "@shared/model/WebFetcher.ts"
import { ErrorUtil } from "../service/utils/ErrorUtil.ts"
import { WebFetcherResponse } from "./WebFetcherResponse.ts"

export class FetchApiWebFetcher implements WebFetcher {

  async fetch(url: string, options?: WebRequestOptions): Promise<WebFetcherResponse> {
    try {
      const headers = new Headers();
      if (options?.userAgent) {
        headers.set("User-Agent", options.userAgent);
      }

      const response = await fetch(url, {
        method: "GET",
        redirect: options?.followRedirects ? "follow" : "manual",
        signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined,
        headers
      })

      const responseBody = await response.text()

      if (!response.ok) {
        console.error(`Fetching ${url} failed with status: ${response.status}`, responseBody)
        return WebFetcherResponse.error(WebFetcherEnum.JsFetchApi, `Fetching ${url} failed with status: ${response.status}.${responseBody ? "Response body: " + responseBody : ""}`)
      }

      return WebFetcherResponse.success(WebFetcherEnum.JsFetchApi, responseBody, response.status, response.url,
        this.headersToRecord(response.headers), response.headers.getSetCookie())
    } catch (error) {
      console.error(`Failed to fetch HTML from ${url}:`, error)
      return WebFetcherResponse.error(WebFetcherEnum.JsFetchApi, ErrorUtil.errorMessageOfError(error))
    }
  }


  private headersToRecord(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

}