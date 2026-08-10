import { ExtractedContent } from "../model/ExtractedContent.ts"
import type { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"
import type { Result } from "../model/Result.ts"
import type { ExtractFromUrlParams } from "../model/requestParameter/ExtractFromUrlParams.ts"
import type { WebFetcher } from "../webFetcher/WebFetcher.ts"
import type { ContentConverter } from "./ContentConverter.ts"

export class PageContentExtractionService {

  constructor(
    private readonly readability: ReadabilityContentExtractor,
    private readonly contentConverter: ContentConverter,
    private readonly webFetcher: WebFetcher,
  ) { }


  /**
   * Extracts readable content from a URL.
   */
  async extractContentFromUrl(params: ExtractFromUrlParams): Promise<Result<ExtractedContent>> {
    const { url } = params

    const fetchHtmlResult = await this.webFetcher.fetchHtml(url, params.webFetcherOptions)

    if (fetchHtmlResult.success == false) {
      return fetchHtmlResult
    }

    const rawHtml = fetchHtmlResult.data
    return this.extractContentFromHtml(rawHtml, url)
  }


  /**
   * Extracts readable content from HTML.
   */
  extractContentFromHtml(html: string, url?: string): Result<ExtractedContent> {
    return this.readability.cleanAndExtractReadableContent(html, url)
  }


  convertToPlainText(content: ExtractedContent): string {
    return content.pageContentAsText ?? this.contentConverter.convertToPlainText(content.pageContentHtml)
  }

}