import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { ResponseFormat } from "../responses/ResponseFormat.ts"

export class ExtractRequestBase {

  constructor(
    readonly url?: string,

    readonly outputFormat?: ResponseFormat,

    readonly includeMetadata?: boolean,

    readonly markdownConversionOptions?: MarkdownConversionOptions,
    readonly textConversionOptions?: TextConversionOptions,
  ) { }

}