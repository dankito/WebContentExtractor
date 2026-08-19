import { ExtractRequestBase } from "./ExtractRequestBase"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"

export class ExtractFromHtmlRequest extends ExtractRequestBase {

  constructor(
    readonly html: string,
    url?: string,

    includeMetadata?: boolean,

    markdownConversionOptions?: MarkdownConversionOptions,
    textConversionOptions?: TextConversionOptions,
  ) {
    super(url, includeMetadata, markdownConversionOptions, textConversionOptions)
  }

}