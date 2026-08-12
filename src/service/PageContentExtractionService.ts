import { ExtractedContent } from "../model/ExtractedContent.ts"
import type { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"
import type { Result } from "../model/Result.ts"
import type { ExtractFromUrlRequest } from "../model/requestParameter/ExtractFromUrlRequest.ts"
import type { WebFetcher } from "../webFetcher/WebFetcher.ts"
import type { ContentConverterService } from "./contentConverter/ContentConverterService.ts"
import type { HtmlCleaner } from "./html/HtmlCleaner.ts"
import { ConvertToPlainTextOptions } from "./contentConverter/ConvertToPlainTextOptions.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import type { UrlVerificationService } from "./utils/UrlVerificationService.ts"
import type { ConvertToMarkdownOptions } from "./contentConverter/ConvertToMarkdownOptions.ts"
import { SuccessResult } from "../model/SuccessResult.ts"

export class PageContentExtractionService {

  constructor(
    private readonly readability: ReadabilityContentExtractor,
    private readonly htmlCleaner: HtmlCleaner,
    private readonly contentConverter: ContentConverterService,
    private readonly webFetcher: WebFetcher,
    private readonly urlVerificationService: UrlVerificationService,
  ) { }


  /**
   * Extracts readable content from a URL.
   */
  async extractContentFromUrl(params: ExtractFromUrlRequest): Promise<Result<ExtractedContent>> {
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


  convertToMarkdown(content: ExtractedContent, options?: ConvertToMarkdownOptions): Result<string> {
    const result = this.contentConverter.convertToMarkdown(content.pageContentHtml, options)

    if (result.success) {
      const markdown = result.data
      return SuccessResult.for(this.htmlCleaner.normalizeWhitespace(this.htmlCleaner.stripInvisibleUnicode(markdown)))
    } else {
      return result
    }
  }

  convertToPlainText(content: ExtractedContent, options?: ConvertToPlainTextOptions): string {
    // Readability strips all new lines from text content, so prefer html-to-text in favor of content.pageContentAsText
    const text = this.contentConverter.convertToPlainText(content.pageContentHtml, options)

    return this.htmlCleaner.normalizeWhitespace(this.htmlCleaner.stripInvisibleUnicode(text))
  }

}