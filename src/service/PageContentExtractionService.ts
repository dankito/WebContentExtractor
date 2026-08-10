import { ExtractedContent } from "../model/ExtractedContent.ts"
import type { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"
import type { Result } from "../model/Result.ts"

export class PageContentExtractionService {

  constructor(private readonly readability: ReadabilityContentExtractor) { }

  /**
   * Extracts readable content from HTML.
   */
  extractContentFromHtml(html: string, url?: string): Result<ExtractedContent> {
    return this.readability.cleanAndExtractReadableContent(html, url)
  }

}