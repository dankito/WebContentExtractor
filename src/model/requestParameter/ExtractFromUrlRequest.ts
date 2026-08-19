import { ExtractRequestBase } from "./ExtractRequestBase"
import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { ResponseFormat } from "../responses/ResponseFormat.ts"

export class ExtractFromUrlRequest extends ExtractRequestBase {

  constructor(
    url: string,

    outputFormat?: ResponseFormat,

    includeMetadata?: boolean,

    markdownConversionOptions?: MarkdownConversionOptions,
    textConversionOptions?: TextConversionOptions,

    readonly webRequestOptions?: WebRequestOptions,
  ) {
    super(url, outputFormat, includeMetadata, markdownConversionOptions, textConversionOptions)
  }

}