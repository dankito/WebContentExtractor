import type { FetchEngine } from "./FetchEngine.ts"

export class WebFetcherRequest {

  constructor(
    readonly url: string,

    readonly timeout?: number,
    readonly fingerprint?: string,
    readonly followRedirects?: boolean,

    readonly engines: FetchEngine[] = [],

    readonly executeJavaScript?: boolean,
    readonly loadLazyContent?: boolean,

    /** Headers to send to the target url. */
    readonly headers?: Record<string, string>,
    /** Cookies to send to the target url. */
    readonly cookies?: Record<string, string>,
  ) { }

}