import type { WebFetcher } from "./WebFetcher"

export class WebFetcherOptions {

  constructor(
    readonly fetchers?: WebFetcher[],
    readonly timeout?: number,
    readonly userAgent?: string,
    readonly followRedirects?: boolean,
  ) { }

}