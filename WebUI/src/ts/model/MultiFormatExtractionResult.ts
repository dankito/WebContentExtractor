import type { WebFetcherResult } from "./WebFetcherResult"
import type { WebContentExtractionResult } from "./WebContentExtractionResult"
import type { ExtractedMetadata } from "./ExtractedMetadata"

export interface MultiFormatExtractionResult {
  readonly url: string
  readonly fetch_result: WebFetcherResult

  readonly extraction_result?: WebContentExtractionResult
  readonly metadata?: ExtractedMetadata

  raw_html?: string
  content_html?: string

  raw_markdown?: string
  content_markdown?: string

  raw_text?: string
  content_text?: string
}