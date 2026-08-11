import { ExtractParamsBase } from "./ExtractParamsBase.ts"
import { ConvertToPlainTextOptions } from "../../service/contentConverter/ConvertToPlainTextOptions.ts"
import type { ConvertToMarkdownOptions } from "../../service/contentConverter/ConvertToMarkdownOptions.ts"

export class ExtractFromHtmlParams extends ExtractParamsBase {

  constructor(
    readonly html: string,
    url?: string,

    includeMetadata?: boolean,

    convertToMarkdownOptions?: ConvertToMarkdownOptions,
    convertToPlainTextOptions?: ConvertToPlainTextOptions,
  ) {
    super(url, includeMetadata, convertToMarkdownOptions, convertToPlainTextOptions)
  }

}