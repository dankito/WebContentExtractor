import { ExtractRequestBase } from "./ExtractRequestBase"
import type { OutputFormat } from "./OutputFormat"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"

export class ExtractFromHtmlRequest extends ExtractRequestBase {

  constructor(
    readonly html: string,
    readonly format?: OutputFormat,
    readonly includeMetadata?: boolean,
    readonly extractorOptions?: WebContentExtractorOptions,
    readonly converterOptions?: MarkdownConverterOptions,
  ) {
    super(format, includeMetadata, extractorOptions, converterOptions)
  }

}