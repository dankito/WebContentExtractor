import { ConvertToPlainTextOptions } from "../../service/contentConverter/ConvertToPlainTextOptions.ts"
import type { ConvertToMarkdownOptions } from "../../service/contentConverter/ConvertToMarkdownOptions.ts"

export class ExtractParamsBase {

  constructor(
    readonly url?: string,

    readonly includeMetadata?: boolean,

    readonly convertToMarkdownOptions?: ConvertToMarkdownOptions,
    readonly convertToPlainTextOptions?: ConvertToPlainTextOptions,
  ) { }

}