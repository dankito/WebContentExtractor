import { WebFetcher } from "@shared/model/WebFetcher.ts"

export class WebFetcherResponse {

  static success(fetcher: WebFetcher, response: string, statusCode: number, finalUrl: string, headers: Record<string, string>, cookies: string[]): WebFetcherResponse {
    return new WebFetcherResponse(fetcher, undefined, response, statusCode, finalUrl, headers, cookies)
  }

  static error(fetcher: WebFetcher, error: string, statusCode?: number, finalUrl?: string, headers?: Record<string, string>, cookies?: string[]): WebFetcherResponse {
    return new WebFetcherResponse(fetcher, error, undefined, statusCode, finalUrl, headers, cookies)
  }


  constructor(
    readonly fetcher: WebFetcher,

    readonly error?: string,

    readonly responseBody?: string,

    readonly statusCode?: number,
    readonly finalUrl?: string,

    readonly headers?: Record<string, string>,
    readonly cookies?: string[],
  ) { }

}