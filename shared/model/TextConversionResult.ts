import { TextConverter } from "./TextConverter"

export class TextConversionResult {

  static success(converter: TextConverter, text: string): TextConversionResult {
    return new TextConversionResult(converter, true, text)
  }

  static error(converter: TextConverter, error: string): TextConversionResult {
    return new TextConversionResult(converter, false, undefined, error)
  }


  private constructor(
    readonly converter: TextConverter,
    readonly success: boolean,

    // either text or error is set
    readonly text?: string,
    readonly error?: string,
  ) { }


  mapTextOnSuccess(mapper: (text: string) => string): TextConversionResult {
    if (this.text != undefined) {
      return new TextConversionResult(this.converter, this.success, mapper(this.text!), this.error)
    } else {
      return this
    }
  }

}