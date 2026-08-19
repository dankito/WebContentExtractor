import { ExtractRequestBase } from "./ExtractRequestBase"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { ResponseFormat } from "../responses/ResponseFormat.ts"

export class ExtractFromHtmlRequest extends ExtractRequestBase {

  constructor(
    readonly html: string,
    url?: string,

    outputFormat?: ResponseFormat,

    includeMetadata?: boolean,

    markdownConversionOptions?: MarkdownConversionOptions,
    textConversionOptions?: TextConversionOptions,
  ) {
    super(url, outputFormat, includeMetadata, markdownConversionOptions, textConversionOptions)
  }

}