import { ExtractedContent } from "../model/ExtractedContent.ts"
import type { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"
import type { Result } from "../model/Result.ts"
import type { ExtractFromUrlParams } from "../model/requestParameter/ExtractFromUrlParams.ts"
import type { WebFetcher } from "../webFetcher/WebFetcher.ts"
import type { ContentConverter } from "./ContentConverter.ts"
import type { HtmlCleaner } from "./html/HtmlCleaner.ts"
import { ConvertToPlainTextOptions } from "./converter/ConvertToPlainTextOptions.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import type { UrlVerificationService } from "./UrlVerificationService.ts"

export class PageContentExtractionService {

  constructor(
    private readonly readability: ReadabilityContentExtractor,
    private readonly htmlCleaner: HtmlCleaner,
    private readonly contentConverter: ContentConverter,
    private readonly webFetcher: WebFetcher,
    private readonly urlVerificationService: UrlVerificationService,
  ) { }


  /**
   * Extracts readable content from a URL.
   */
  async extractContentFromUrl(params: ExtractFromUrlParams): Promise<Result<ExtractedContent>> {
    const { url } = params

    // for security reasons local urls and non-http urls get blocked.
    // An attacker could use the server to probe internal network resources, access cloud metadata services (e.g., 169.254.169.254), or bypass firewalls by making the request originate from the server itself.
    const urlVerificationError = await this.urlVerificationService.hasCorrectProtocolAndIsNonLocalUrl(url!)
    if (urlVerificationError !== null) {
      return ErrorResult.for(urlVerificationError, true)
    }

    const fetchHtmlResult = await this.webFetcher.fetchHtml(url!, params.webFetcherOptions)

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
    const sanitized = this.htmlCleaner.stripInvisibleUnicode(html)

    return this.readability.cleanAndExtractReadableContent(sanitized, url)
  }


  convertToPlainText(content: ExtractedContent, options?: ConvertToPlainTextOptions): string {
    // Readability strips all new lines from text content, so prefer html-to-text in favor of content.pageContentAsText
    const text = this.contentConverter.convertToPlainText(content.pageContentHtml, options)

    return this.htmlCleaner.normalizeWhitespace(this.htmlCleaner.stripInvisibleUnicode(text))
  }

}