import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import type { WebFetcher } from "./WebFetcher"
import type { Result } from "../model/Result"
import { ErrorResult } from "../model/ErrorResult"
import { SuccessResult } from "../model/SuccessResult"

export class FetchApiWebFetcher implements WebFetcher {

  async fetchHtml(url: string, options?: WebRequestOptions): Promise<Result<string>> {
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

      if (!response.ok) {
        const responseBody = await response.text()
        console.error(`Fetching ${url} failed with status: ${response.status}`, responseBody)
        return ErrorResult.for(`Fetching ${url} failed with status: ${response.status}.${responseBody ? "Response body: " + responseBody : ""}`)
      }

      return SuccessResult.for(await response.text())
    } catch (error) {
      console.error(`Failed to fetch HTML from ${url}:`, error)
      return ErrorResult.forError(error)
    }
  }

}