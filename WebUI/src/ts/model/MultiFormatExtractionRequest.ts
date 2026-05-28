import type { WebFetcherOptions } from "./WebFetcherOptions"
import { RequestedFormat } from "./RequestedFormat"
import type { WebContentExtractorOptions } from "./WebContentExtractorOptions"
import type { MarkdownConverterOptions } from "./MarkdownConverterOptions"

export class MultiFormatExtractionRequest {

  constructor(
    readonly url: string,
    readonly formats: RequestedFormat[] = [ RequestedFormat.ContentHtml ],
    readonly includeMetadata?: boolean,
    readonly webFetcherOptions?: WebFetcherOptions,
    readonly extractorOptions?: WebContentExtractorOptions,
    readonly converterOptions?: MarkdownConverterOptions,
  ) { }

}