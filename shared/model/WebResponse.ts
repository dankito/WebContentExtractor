import { WebFetcher } from "./WebFetcher"

export class WebResponse {

  constructor(
    readonly fetcher: WebFetcher,

    readonly error?: string,

    readonly statusCode?: number,
    readonly finalUrl?: string,

    readonly headers?: Record<string, string>,
    readonly cookies?: string[],

    readonly durationMs?: number,
  ) { }

}