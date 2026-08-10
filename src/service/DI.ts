import { PageContentExtractionService } from "./PageContentExtractionService.ts"
import { RequestValidator } from "./RequestValidator.ts"
import { DomService } from "./html/DomService.ts"
import { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"
import { HtmlCleaner } from "./html/HtmlCleaner.ts"
import type { WebFetcher } from "../webFetcher/WebFetcher.ts"
import { FetchApiWebFetcher } from "../webFetcher/FetchApiWebFetcher.ts"
import { ContentConverter } from "./ContentConverter.ts"

export class DI {

  static readonly requestValidator = new RequestValidator()


  static readonly domService = new DomService()

  static readonly htmlCleaner = new HtmlCleaner()

  static readonly contentConverter = new ContentConverter()

  static readonly webFetcher: WebFetcher = new FetchApiWebFetcher()


  static readonly readability = new ReadabilityContentExtractor(DI.domService, DI.htmlCleaner)

  static readonly pageContentExtractionService = new PageContentExtractionService(DI.readability, DI.contentConverter, DI.webFetcher)

}