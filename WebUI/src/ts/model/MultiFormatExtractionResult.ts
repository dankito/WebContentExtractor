import type { WebFetcherResult } from "./WebFetcherResult"
import type { WebContentExtractionResult } from "./WebContentExtractionResult"
import type { ExtractedMetadata } from "@shared/model/ExtractedMetadata"
import type { MarkdownConversionResult } from "./MarkdownConversionResult"

export interface MultiFormatExtractionResult {
  readonly url: string

  // contains raw html
  readonly fetchResult: WebFetcherResult
  // contains extracted page content html
  readonly extractionResult?: WebContentExtractionResult

  readonly metadata?: ExtractedMetadata

  rawMarkdown?: MarkdownConversionResult
  contentMarkdown?: MarkdownConversionResult

  rawText?: MarkdownConversionResult
  contentText?: MarkdownConversionResult
}