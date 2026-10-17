import type { WebClientEngine } from "@shared/model/WebClientEngine.ts"

export class WebRequestOptions {

  static DefaultTimeout = 60_000
  static DefaultFollowRedirects = true

  constructor(
    readonly fetchers: WebClientEngine[] | undefined = undefined,

    readonly userAgent: string | undefined = undefined,
    readonly timeout: number | undefined = WebRequestOptions.DefaultTimeout,
    readonly followRedirects: boolean = WebRequestOptions.DefaultFollowRedirects,
  ) { }

}