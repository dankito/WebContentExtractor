import { OutputSelection } from "./OutputSelection"
import { MarkdownConversionOptions } from "../MarkdownConversionOptions"
import { TextConversionOptions } from "../TextConversionOptions"
import { MultiFormatRequestCommon } from "@shared/model/requests/MultiFormatRequestCommon.ts"

export class MultiFormatFromHtmlRequest extends MultiFormatRequestCommon {

  constructor(
    readonly html: string,

    include: OutputSelection,

    markdownConversionOptions?: MarkdownConversionOptions,
    textConversionOptions?: TextConversionOptions,
  ) {
    super(include, markdownConversionOptions, textConversionOptions)
  }

}