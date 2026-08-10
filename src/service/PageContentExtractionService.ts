import { ExtractResult } from "../model/ExtractResult.ts"

export class PageContentExtractionService {

  /**
   * Extracts readable content from HTML.
   */
  extractContentFromHtml(html: string, url?: string): ExtractResult {
    // TODO: extract page content
    const pageContentHtml = html

    return new ExtractResult(pageContentHtml, url)
  }

}