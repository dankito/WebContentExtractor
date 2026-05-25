import type { ExtractedMetadata } from "./ExtractedMetadata"
import type { WebFetcherResult } from "./WebFetcherResult"
import type { WebContentExtractionResult } from "./WebContentExtractionResult"
import type { MarkdownConversionResult } from "./MarkdownConversionResult"
import type { OutputFormat } from "./OutputFormat"

export interface ExtractionResult {
  url: string
  format: OutputFormat
  content: string
  metadata?: ExtractedMetadata
  fetch_result?: WebFetcherResult
  extraction_result?: WebContentExtractionResult
  conversion_result?: MarkdownConversionResult
}
