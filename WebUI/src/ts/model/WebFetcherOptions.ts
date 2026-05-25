import type { WebFetcher } from "./WebFetcher"

export class WebFetcherOptions {

  constructor(
    readonly fetchers?: WebFetcher[],
    readonly timeout?: number,
    readonly user_agent?: string,
    readonly follow_redirects?: boolean,
  ) { }

}