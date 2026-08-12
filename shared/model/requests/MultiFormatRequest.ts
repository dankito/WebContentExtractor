import { WebRequestOptions } from "../WebRequestOptions"
import { OutputSelection } from "./OutputSelection"
import { MarkdownConversionOptions } from "../MarkdownConversionOptions"
import { TextConversionOptions } from "../TextConversionOptions"

export class MultiFormatRequest {

  constructor(
    readonly url: string,

    readonly include: OutputSelection,

    readonly webRequestOptions?: WebRequestOptions,

    readonly markdownConversionOptions?: MarkdownConversionOptions,
    readonly textConversionOptions?: TextConversionOptions,
  ) { }

}