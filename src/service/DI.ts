import { PageContentExtractionService } from "./PageContentExtractionService.ts"
import { RequestValidator } from "./utils/RequestValidator.ts"
import { DomService } from "./html/DomService.ts"
import { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"
import { HtmlCleaner } from "./html/HtmlCleaner.ts"
import type { WebFetcher } from "../webFetcher/WebFetcher.ts"
import { FetchApiWebFetcher } from "../webFetcher/FetchApiWebFetcher.ts"
import { ContentConverterService } from "./contentConverter/ContentConverterService.ts"
import { UrlVerificationService } from "./utils/UrlVerificationService.ts"
import { HttpUtil } from "./utils/HttpUtil.ts"
import { HtmlToTextConverter } from "./contentConverter/HtmlToTextConverter.ts"
import type { HtmlToMarkdownConverter } from "./contentConverter/HtmlToMarkdownConverter.ts"
import { KreuzbergHtmlToMarkdownConverter } from "./contentConverter/KreuzbergHtmlToMarkdownConverter.ts"

export class DI {

  static readonly requestValidator = new RequestValidator()


  static readonly domService = new DomService()

  static readonly htmlCleaner = new HtmlCleaner()

  static readonly htmlToTextConverter = new HtmlToTextConverter()

  static readonly htmlToMarkdownConverter: HtmlToMarkdownConverter = new KreuzbergHtmlToMarkdownConverter()

  static readonly contentConverter = new ContentConverterService(DI.htmlToMarkdownConverter, DI.htmlToTextConverter)

  static readonly webFetcher: WebFetcher = new FetchApiWebFetcher()

  static readonly urlVerificationService = new UrlVerificationService()

  static readonly httpUtil = new HttpUtil()


  static readonly readability = new ReadabilityContentExtractor(DI.domService, DI.htmlCleaner)

  static readonly pageContentExtractionService = new PageContentExtractionService(DI.readability, DI.htmlCleaner,
    DI.contentConverter, DI.webFetcher, DI.urlVerificationService)

}