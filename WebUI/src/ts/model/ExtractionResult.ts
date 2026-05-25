import type { ExtractedMetadata } from "./ExtractedMetadata"
import type { WebFetcherResult } from "./WebFetcherResult"
import type { WebContentExtractionResult } from "./WebContentExtractionResult"
import type { MarkdownConversionResult } from "./MarkdownConversionResult"

export interface ExtractionResult {
  url: string
  format: string
  content: string
  metadata?: ExtractedMetadata
  fetch_result?: WebFetcherResult
  extraction_result?: WebContentExtractionResult
  conversion_result?: MarkdownConversionResult
}
