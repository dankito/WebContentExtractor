import { ExtractRequestBase } from "./ExtractRequestBase"
import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"

export class ExtractFromUrlRequest extends ExtractRequestBase {

  constructor(
    url: string,

    includeMetadata?: boolean,

    convertToMarkdownOptions?: MarkdownConversionOptions,
    convertToPlainTextOptions?: TextConversionOptions,

    readonly webRequestOptions?: WebRequestOptions,
  ) {
    super(url, includeMetadata, convertToMarkdownOptions, convertToPlainTextOptions)
  }

}