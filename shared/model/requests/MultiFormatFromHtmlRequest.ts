import { OutputSelection } from "./OutputSelection"
import { MarkdownConversionOptions } from "../MarkdownConversionOptions"
import { TextConversionOptions } from "../TextConversionOptions"
import { MultiFormatRequestBase } from "@shared/model/requests/MultiFormatRequestBase.ts"

export class MultiFormatFromHtmlRequest extends MultiFormatRequestBase {

  constructor(
    readonly html: string,

    include: OutputSelection,

    markdownConversionOptions?: MarkdownConversionOptions,
    textConversionOptions?: TextConversionOptions,
  ) {
    super(include, markdownConversionOptions, textConversionOptions)
  }

}