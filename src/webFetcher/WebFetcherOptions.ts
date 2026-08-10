export class WebFetcherOptions {

  static DefaultTimeout = 60_000
  static DefaultFollowRedirects = true

  constructor(
    readonly userAgent: string | undefined = undefined,
    readonly timeout: number = WebFetcherOptions.DefaultTimeout,
    readonly followRedirects: boolean = WebFetcherOptions.DefaultFollowRedirects,
  ) { }

}