import type { WebFetcherResult } from "./WebFetcherResult"
import type { WebContentExtractionResult } from "./WebContentExtractionResult"
import type { ExtractedMetadata } from "./ExtractedMetadata"
import type { MarkdownConversionResult } from "./MarkdownConversionResult"

export interface MultiFormatExtractionResult {
  readonly url: string

  // contains raw html
  readonly fetch_result: WebFetcherResult
  // contains extracted page content html
  readonly extraction_result?: WebContentExtractionResult

  readonly metadata?: ExtractedMetadata

  raw_markdown?: MarkdownConversionResult
  content_markdown?: MarkdownConversionResult

  raw_text?: MarkdownConversionResult
  content_text?: MarkdownConversionResult
}