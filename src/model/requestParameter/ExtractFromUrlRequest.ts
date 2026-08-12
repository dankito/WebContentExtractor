import { ExtractRequestBase } from "./ExtractRequestBase.ts"
import { WebFetcherOptions } from "../../webFetcher/WebFetcherOptions.ts"
import { ConvertToPlainTextOptions } from "../../service/contentConverter/ConvertToPlainTextOptions.ts"
import type { ConvertToMarkdownOptions } from "../../service/contentConverter/ConvertToMarkdownOptions.ts"

export class ExtractFromUrlRequest extends ExtractRequestBase {

  constructor(
    url: string,

    includeMetadata?: boolean,

    convertToMarkdownOptions?: ConvertToMarkdownOptions,
    convertToPlainTextOptions?: ConvertToPlainTextOptions,

    readonly webFetcherOptions?: WebFetcherOptions,
  ) {
    super(url, includeMetadata, convertToMarkdownOptions, convertToPlainTextOptions)
  }

}