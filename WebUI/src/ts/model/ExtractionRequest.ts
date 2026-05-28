import type { OutputFormat } from "./OutputFormat"
import type { WebFetcherOptions } from "./WebFetcherOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import { ExtractRequestBase } from "./ExtractRequestBase"

export class ExtractionRequest extends ExtractRequestBase {

  constructor(
    readonly url: string,
    readonly format?: OutputFormat,
    readonly includeMetadata?: boolean,
    readonly webFetcherOptions?: WebFetcherOptions,
    readonly extractorOptions?: WebContentExtractorOptions,
    readonly converterOptions?: MarkdownConverterOptions,
  ) {
    super(format, includeMetadata, extractorOptions, converterOptions)
  }
  
}
