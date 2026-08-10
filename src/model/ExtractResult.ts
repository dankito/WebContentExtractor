export class ExtractResult {

  static error(url: string | undefined, errorMessage: string): ExtractResult {
    return new ExtractResult(false, url, errorMessage, undefined)
  }

  static successHtml(url: string | undefined, html: string, pageContentAsText?: string): ExtractResult {
    return new ExtractResult(true, url, undefined, html, pageContentAsText)
  }


  constructor(
    readonly success: boolean,
    readonly url?: string,

    readonly errorMessage?: string,

    readonly pageContentHtml?: string,
    readonly pageContentAsText?: string,
  ) { }


}