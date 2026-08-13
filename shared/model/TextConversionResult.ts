import { TextConverter } from "./TextConverter"

export class TextConversionResult {

  static success(converter: TextConverter, text: string, durationMs?: number): TextConversionResult {
    return new TextConversionResult(converter, true, text, undefined, durationMs)
  }

  static error(converter: TextConverter, error: string, durationMs?: number): TextConversionResult {
    return new TextConversionResult(converter, false, undefined, error, durationMs)
  }


  private constructor(
    readonly converter: TextConverter,
    readonly success: boolean,

    // either text or error is set
    readonly text?: string,
    readonly error?: string,

    readonly durationMs?: number,
  ) { }


  mapTextOnSuccess(mapper: (text: string) => string): TextConversionResult {
    if (this.text != undefined) {
      return new TextConversionResult(this.converter, this.success, mapper(this.text!), this.error, this.durationMs)
    } else {
      return this
    }
  }

}