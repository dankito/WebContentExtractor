import type { OutputFormat } from "./OutputFormat"
import type { ExtractedMetadata } from "./ExtractedMetadata"
import type { WebContentExtractionResult } from "./WebContentExtractionResult"
import type { MarkdownConversionResult } from "./MarkdownConversionResult"

export interface ExtractFromHtmlResult {
  format: OutputFormat
  content?: string
  metadata?: ExtractedMetadata
  extraction_result?: WebContentExtractionResult
  conversion_result?: MarkdownConversionResult
}