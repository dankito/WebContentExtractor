import { MarkdownConverter } from "./MarkdownConverter"

export class MarkdownConversionResult {

  static success(converter: MarkdownConverter, markdown: string): MarkdownConversionResult {
    return new MarkdownConversionResult(converter, true, markdown)
  }

  static error(converter: MarkdownConverter, error: string): MarkdownConversionResult {
    return new MarkdownConversionResult(converter, false, undefined, error)
  }


  private constructor(
    readonly converter: MarkdownConverter,
    readonly success: boolean,

    // either markdown or error is set
    readonly markdown?: string, // or output
    readonly error?: string, // or ConversionError { code: string, message: string }
  ) { }


  mapMarkdownOnSuccess(mapper: (markdown: string) => string): MarkdownConversionResult {
    if (this.markdown != undefined) {
      return new MarkdownConversionResult(this.converter, this.success, mapper(this.markdown!), this.error)
    } else {
      return this
    }
  }

}