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
import type { MultiFormatFromUrlRequest } from "@shared/model/requests/MultiFormatFromUrlRequest.ts"
import { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse.ts"
import type { WebRequestOptions } from "@shared/model/WebRequestOptions.ts"
import { TextConversionResult } from "@shared/model/TextConversionResult.ts"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult.ts"
import { SuccessResult } from "../model/SuccessResult.ts"
import { WebFetcherResponse } from "../webFetcher/WebFetcherResponse.ts"
import { WebResponse } from "@shared/model/WebResponse.ts"
import { Stopwatch } from "@shared/service/utils/Stopwatch.ts"
import type { MultiFormatFromHtmlRequest } from "@shared/model/requests/MultiFormatFromHtmlRequest.ts"
import type { MultiFormatRequestCommon } from "@shared/model/requests/MultiFormatRequestCommon.ts"

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
    } else if (fetchHtmlResult.data.error) {
      return ErrorResult.for(fetchHtmlResult.data.error)
    }

    const rawHtml = fetchHtmlResult.data.responseBody!
    return this.extractContentFromHtml(rawHtml, url)
  }


  /**
   * Extracts readable content from HTML.
   */
  extractContentFromHtml(html: string, url?: string): Result<ExtractedContent> {
    const sanitized = this.htmlCleaner.stripInvisibleUnicode(html)

    return this.readability.cleanAndExtractReadableContent(sanitized, url)
  }


  async extractMultipleFormatsFromUrl(request: MultiFormatFromUrlRequest): Promise<Result<MultiFormatResponse>> {
    const fetchHtmlResult = await this.fetchPageHtml(request.url, request.webRequestOptions)
    if (fetchHtmlResult.success == false) {
      return fetchHtmlResult
    }

    const webFetcherResponse = fetchHtmlResult.data
    const webResponse = new WebResponse(webFetcherResponse.fetcher, webFetcherResponse.error, webFetcherResponse.statusCode, webFetcherResponse.finalUrl,
      webFetcherResponse.headers, webFetcherResponse.cookies, webFetcherResponse.durationMs)
    if (webFetcherResponse.error) {
      return SuccessResult.for(new MultiFormatResponse(webResponse))
    }

    const rawHtml = webFetcherResponse.responseBody!

    return this.extractContentAndConvertFormats(request, rawHtml, request.url, webResponse)
  }

  async extractMultipleFormatsFromHtml(request: MultiFormatFromHtmlRequest): Promise<Result<MultiFormatResponse>> {
    return this.extractContentAndConvertFormats(request, request.html)
  }

  async extractContentAndConvertFormats(request: MultiFormatRequestCommon, rawHtml: string, url?: string, webResponse?: WebResponse): Promise<Result<MultiFormatResponse>> {
    const extractContentResult = request.include.requiresExtractingContent()
      ? this.extractContentFromHtml(rawHtml, url) : undefined

    return SuccessResult.for(this.convertFormats(request, rawHtml, webResponse, extractContentResult))
  }

  private convertFormats(request: MultiFormatRequestCommon, rawHtml: string, webResponse?: WebResponse, extractContentResult?: Result<ExtractedContent>): MultiFormatResponse {
    const include = request.include

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
      webResponse,
      include.rawHtml ? rawHtml : undefined,
      include.rawMarkdown ? rawMarkdown : undefined,
      include.rawText ? rawText : undefined,

      extractContentResult && extractContentResult.success === false ? extractContentResult.details.errorMessage : undefined,
      include.contentHtml ? contentHtml : undefined,
      include.contentMarkdown ? contentMarkdown : undefined,
      include.contentText ? contentText : undefined,

      include.metadata && extractContentResult?.success ? extractContentResult.data.metadata : undefined,
    )
  }


  private async fetchPageHtml(url: string, webRequestOptions?: WebRequestOptions): Promise<Result<WebFetcherResponse>> {
    // for security reasons local urls and non-http urls get blocked.
    // An attacker could use the server to probe internal network resources, access cloud metadata services (e.g., 169.254.169.254), or bypass firewalls by making the request originate from the server itself.
    const urlVerificationError = await this.urlVerificationService.hasCorrectProtocolAndIsNonLocalUrl(url!)
    if (urlVerificationError !== null) {
      return ErrorResult.for(urlVerificationError, true)
    }

    return SuccessResult.for(await this.webFetcher.fetch(url!, webRequestOptions))
  }


  convertToMarkdown(html: string, options?: MarkdownConversionOptions): MarkdownConversionResult {
    const stopwatch = new Stopwatch()
    const result = this.contentConverter.convertToMarkdown(html, options)
    result.durationMs = stopwatch.stopToMillis()

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