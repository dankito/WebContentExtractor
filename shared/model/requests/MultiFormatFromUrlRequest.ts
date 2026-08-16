import { WebRequestOptions } from "../WebRequestOptions"
import { OutputSelection } from "./OutputSelection"
import { MarkdownConversionOptions } from "../MarkdownConversionOptions"
import { TextConversionOptions } from "../TextConversionOptions"
import { MultiFormatRequestBase } from "@shared/model/requests/MultiFormatRequestBase.ts"

export class MultiFormatFromUrlRequest extends MultiFormatRequestBase {

  constructor(
    readonly url: string,

    include: OutputSelection,

    readonly webRequestOptions?: WebRequestOptions,

    markdownConversionOptions?: MarkdownConversionOptions,
    textConversionOptions?: TextConversionOptions,
  ) {
    super(include, markdownConversionOptions, textConversionOptions)
  }

}