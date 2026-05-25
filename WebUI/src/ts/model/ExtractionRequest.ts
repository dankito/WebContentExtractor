import type { OutputFormat } from "./OutputFormat"
import type { WebFetcherOptions } from "./WebFetcherOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"

export class ExtractionRequest {

  constructor(
    readonly url: string,
    readonly format?: OutputFormat,
    readonly include_metadata?: boolean,
    readonly web_fetcher_options?: WebFetcherOptions,
    readonly extractor_options?: WebContentExtractorOptions,
    readonly converter_options?: MarkdownConverterOptions,
  ) { }
  
}
