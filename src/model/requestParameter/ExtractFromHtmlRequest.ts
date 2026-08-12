import { ExtractRequestBase } from "./ExtractRequestBase.ts"
import { ConvertToPlainTextOptions } from "../../service/contentConverter/ConvertToPlainTextOptions.ts"
import type { ConvertToMarkdownOptions } from "../../service/contentConverter/ConvertToMarkdownOptions.ts"

export class ExtractFromHtmlRequest extends ExtractRequestBase {

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