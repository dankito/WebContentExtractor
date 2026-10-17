import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import type { WebClient } from "./WebClient.ts"
import { WebClientEngine } from "@shared/model/WebClientEngine.ts"
import { ErrorUtil } from "../service/utils/ErrorUtil.ts"
import { WebClientResponse } from "./WebClientResponse.ts"
import { Stopwatch } from "@shared/service/utils/Stopwatch.ts"

export class FetchApiWebClient implements WebClient {

  async fetch(url: string, options?: WebRequestOptions): Promise<WebClientResponse> {
    try {
      const headers = new Headers();
      if (options?.userAgent) {
        headers.set("User-Agent", options.userAgent);
      }
      const stopwatch = new Stopwatch()

      const response = await fetch(url, {
        method: "GET",
        redirect: options?.followRedirects ? "follow" : "manual",
        signal: options?.timeout ? AbortSignal.timeout(options.timeout) : undefined,
        headers
      })

      const responseBody = await response.text()
      const duration = stopwatch.stopToMillis()

      if (!response.ok) {
        console.error(`Fetching ${url} failed with status: ${response.status}`, responseBody)
        return WebClientResponse.error(WebClientEngine.JsFetchApi, `Fetching ${url} failed with status: ${response.status}.${responseBody ? "Response body: " + responseBody : ""}`,
          response.status, response.url, this.headersToRecord(response.headers), response.headers.getSetCookie(), duration)
      }

      return WebClientResponse.success(WebClientEngine.JsFetchApi, responseBody, response.status, response.url,
        this.headersToRecord(response.headers), response.headers.getSetCookie(), duration)
    } catch (error) {
      console.error(`Failed to fetch HTML from ${url}:`, error)
      return WebClientResponse.error(WebClientEngine.JsFetchApi, ErrorUtil.errorMessageOfError(error))
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