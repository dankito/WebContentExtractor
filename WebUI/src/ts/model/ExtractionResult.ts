import type { WebFetcherResult } from "./WebFetcherResult"
import type { ExtractFromHtmlResult } from "./ExtractFromHtmlResult"

export interface ExtractionResult extends ExtractFromHtmlResult{
  url: string
  fetchResult?: WebFetcherResult
}
