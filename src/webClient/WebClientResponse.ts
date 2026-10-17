import { WebClientEngine } from "@shared/model/WebClientEngine.ts"

export class WebClientResponse {

  static success(fetcher: WebClientEngine, response: string, statusCode: number, finalUrl: string, headers: Record<string, string>, cookies: string[], durationMs?: number): WebClientResponse {
    return new WebClientResponse(fetcher, undefined, response, statusCode, finalUrl, headers, cookies, durationMs)
  }

  static error(fetcher: WebClientEngine, error: string, statusCode?: number, finalUrl?: string, headers?: Record<string, string>, cookies?: string[], durationMs?: number): WebClientResponse {
    return new WebClientResponse(fetcher, error, undefined, statusCode, finalUrl, headers, cookies, durationMs)
  }


  constructor(
    readonly fetcher: WebClientEngine,

    readonly error?: string,

    readonly responseBody?: string,

    readonly statusCode?: number,
    readonly finalUrl?: string,

    readonly headers?: Record<string, string>,
    readonly cookies?: string[],

    readonly durationMs?: number,
  ) { }

}