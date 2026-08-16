import { MarkdownConversionOptions } from "../MarkdownConversionOptions"
import { TextConversionOptions } from "../TextConversionOptions"

export class ConvertHtmlRequest {

  constructor(
    readonly html: string,

    readonly markdownConversionOptions?: MarkdownConversionOptions,
    readonly textConversionOptions?: TextConversionOptions,
  ) { }

}