import { WebRequestOptions } from "../WebRequestOptions"
import { OutputSelection } from "./OutputSelection"
import { MarkdownConversionOptions } from "../MarkdownConversionOptions"
import { TextConversionOptions } from "../TextConversionOptions"
import { MultiFormatRequestCommon } from "@shared/model/requests/MultiFormatRequestCommon.ts"

export class MultiFormatFromUrlRequest extends MultiFormatRequestCommon {

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