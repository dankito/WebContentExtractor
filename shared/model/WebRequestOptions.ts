export class WebRequestOptions {

  static DefaultTimeout = 60_000
  static DefaultFollowRedirects = true

  constructor(
    readonly userAgent: string | undefined = undefined,
    readonly timeout: number = WebRequestOptions.DefaultTimeout,
    readonly followRedirects: boolean = WebRequestOptions.DefaultFollowRedirects,
  ) { }

}