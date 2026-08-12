import { ExtractedContent } from "../model/ExtractedContent"
import type { ReadabilityContentExtractor } from "./ReadabilityContentExtractor"
import type { Result } from "../model/Result"
import type { ExtractFromUrlRequest } from "../model/requestParameter/ExtractFromUrlRequest"
import type { WebFetcher } from "../webFetcher/WebFetcher"
import type { ContentConverterService } from "./contentConverter/ContentConverterService"
import type { HtmlCleaner } from "./html/HtmlCleaner"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { UrlVerificationService } from "./utils/UrlVerificationService"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import { TextConversionResult } from "@shared/model/TextConversionResult.ts"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult.ts"

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

    const fetchHtmlResult = await this.webFetcher.fetchHtml(url!, params.webRequestOptions)

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


  convertToMarkdown(html: string, options?: MarkdownConversionOptions): MarkdownConversionResult {
    const result = this.contentConverter.convertToMarkdown(html, options)

    return result.mapMarkdownOnSuccess(markdown =>
      this.htmlCleaner.normalizeWhitespace(this.htmlCleaner.stripInvisibleUnicode(markdown)))
  }

  convertToPlainText(html: string, options?: TextConversionOptions): TextConversionResult {
    // Readability strips all new lines from text content, so prefer html-to-text in favor of content.pageContentAsText
    const textConversionResult = this.contentConverter.convertToPlainText(html, options)

    return textConversionResult.mapTextOnSuccess(text =>
      this.htmlCleaner.normalizeWhitespace(this.htmlCleaner.stripInvisibleUnicode(text)))
  }

}