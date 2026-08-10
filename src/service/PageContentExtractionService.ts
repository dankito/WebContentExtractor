import { ExtractResult } from "../model/ExtractResult.ts"
import type { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"

export class PageContentExtractionService {

  constructor(private readonly readability: ReadabilityContentExtractor) { }

  /**
   * Extracts readable content from HTML.
   */
  extractContentFromHtml(html: string, url?: string): ExtractResult {
    return this.readability.cleanAndExtractReadableContent(html, url)
  }

}