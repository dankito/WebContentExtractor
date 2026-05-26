import type { WebFetcherOptions } from "./WebFetcherOptions"
import { RequestedFormat } from "./RequestedFormat"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"

export class MultiFormatExtractionRequest {

  constructor(
    readonly url: string,
    readonly formats: RequestedFormat[] = [ RequestedFormat.ContentHtml ],
    readonly include_metadata?: boolean,
    readonly web_fetcher_options?: WebFetcherOptions,
    readonly extractor_options?: WebContentExtractorOptions,
    readonly converter_options?: MarkdownConverterOptions,
  ) { }

}