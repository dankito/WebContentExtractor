import { ExtractedContent } from "../model/ExtractedContent"
import type { ReadabilityContentExtractor } from "./ReadabilityContentExtractor"
import type { Result } from "../model/Result"
import type { ExtractFromUrlRequest } from "../model/requestParameter/ExtractFromUrlRequest"
import type { WebFetcher } from "../webFetcher/WebFetcher"
import type { ContentConverterService } from "./contentConverter/ContentConverterService"
import type { HtmlCleaner } from "./html/HtmlCleaner"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import { ErrorResult } from "../model/ErrorResult"
import type { UrlVerificationService } from "./utils/UrlVerificationService"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { MultiFormatRequest } from "@shared/model/requests/MultiFormatRequest.ts"
import { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse.ts"
import type { WebRequestOptions } from "@shared/model/WebRequestOptions.ts"
import { TextConversionResult } from "@shared/model/TextConversionResult.ts"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult.ts"
import type { SuccessResult } from "../model/SuccessResult.ts"

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
  async extractContentFromUrl(request: ExtractFromUrlRequest): Promise<Result<ExtractedContent>> {
    const { url } = request

    const fetchHtmlResult = await this.fetchPageHtml(url!, request.webRequestOptions)

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


  async extractMultipleFormats(request: MultiFormatRequest): Promise<MultiFormatResponse> {
    // TODO: get web response details from WebRequester
    const fetchHtmlResult = await this.fetchPageHtml(request.url, request.webRequestOptions)
    if (fetchHtmlResult.success == false) {
      return new MultiFormatResponse()
    }

    const extractContentResult = request.include.requiresExtractingContent()
      ? this.extractContentFromHtml(fetchHtmlResult.data, request.url) : undefined

    return this.convertFormats(request, fetchHtmlResult, extractContentResult)
  }

  private convertFormats(request: MultiFormatRequest, fetchHtmlResult: SuccessResult<string>, extractContentResult: Result<ExtractedContent> | undefined): MultiFormatResponse {
    const include = request.include
    const rawHtml = fetchHtmlResult.data

    const rawMarkdown = include.rawMarkdown ? this.convertToMarkdown(rawHtml, request.markdownConversionOptions) : undefined
    const rawText = include.rawText ? this.convertToPlainText(rawHtml, request.textConversionOptions) : undefined

    const contentHtml = extractContentResult?.success ? extractContentResult.data.pageContentHtml : undefined
    let contentMarkdown: MarkdownConversionResult | undefined = undefined
    let contentText: TextConversionResult | undefined = undefined
    if (contentHtml) {
      contentMarkdown = include.contentMarkdown ? this.convertToMarkdown(contentHtml, request.markdownConversionOptions) : undefined
      contentText = include.contentText ? this.convertToPlainText(contentHtml, request.textConversionOptions) : undefined
    }

    return new MultiFormatResponse(
      undefined,
      include.rawHtml ? rawHtml : undefined,
      include.rawMarkdown ? rawMarkdown : undefined,
      include.rawText ? rawText : undefined,

      extractContentResult,
      include.contentHtml ? contentHtml : undefined,
      include.contentMarkdown ? contentMarkdown : undefined,
      include.contentText ? contentText : undefined,

      include.pageMetadata && extractContentResult?.success ? extractContentResult.data.metadata : undefined,
    )
  }


  private async fetchPageHtml(url: string, webRequestOptions?: WebRequestOptions): Promise<Result<string>> {
    // for security reasons local urls and non-http urls get blocked.
    // An attacker could use the server to probe internal network resources, access cloud metadata services (e.g., 169.254.169.254), or bypass firewalls by making the request originate from the server itself.
    const urlVerificationError = await this.urlVerificationService.hasCorrectProtocolAndIsNonLocalUrl(url!)
    if (urlVerificationError !== null) {
      return ErrorResult.for(urlVerificationError, true)
    }

    return this.webFetcher.fetchHtml(url!, webRequestOptions)
  }


  convertToMarkdown(html: string, options?: MarkdownConversionOptions): MarkdownConversionResult {
    const result = this.contentConverter.convertToMarkdown(html, options)

    return result.mapMarkdownOnSuccess(markdown => this.cleanText(markdown))
  }

  convertToPlainText(html: string, options?: TextConversionOptions): TextConversionResult {
    // Readability strips all new lines from text content, so prefer html-to-text in favor of content.pageContentAsText
    const textConversionResult = this.contentConverter.convertToPlainText(html, options)

    return textConversionResult.mapTextOnSuccess(text => this.cleanText(text))
  }


  cleanText(text: string): string {
    return this.htmlCleaner.normalizeWhitespace(this.htmlCleaner.stripInvisibleUnicode(text))
  }

}