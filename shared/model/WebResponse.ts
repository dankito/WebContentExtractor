import { WebClientEngine } from "./WebClientEngine.ts"

export class WebResponse {

  constructor(
    readonly fetcher: WebClientEngine,

    readonly error?: string,

    readonly statusCode?: number,
    readonly finalUrl?: string,

    readonly headers?: Record<string, string>,
    readonly cookies?: string[],

    readonly durationMs?: number,
  ) { }

}