import { WebFetcher } from "@shared/model/WebFetcher"

export class WebClientResponse {

  static success(fetcher: WebFetcher, response: string, statusCode: number, finalUrl: string, headers: Record<string, string>, cookies: string[], durationMs?: number): WebClientResponse {
    return new WebClientResponse(fetcher, undefined, response, statusCode, finalUrl, headers, cookies, durationMs)
  }

  static error(fetcher: WebFetcher, error: string, statusCode?: number, finalUrl?: string, headers?: Record<string, string>, cookies?: string[], durationMs?: number): WebClientResponse {
    return new WebClientResponse(fetcher, error, undefined, statusCode, finalUrl, headers, cookies, durationMs)
  }


  constructor(
    readonly fetcher: WebFetcher,

    readonly error?: string,

    readonly responseBody?: string,

    readonly statusCode?: number,
    readonly finalUrl?: string,

    readonly headers?: Record<string, string>,
    readonly cookies?: string[],

    readonly durationMs?: number,
  ) { }

}