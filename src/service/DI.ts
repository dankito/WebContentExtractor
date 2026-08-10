import { PageContentExtractionService } from "./PageContentExtractionService.ts"
import { RequestValidator } from "./RequestValidator.ts"
import { DomService } from "./html/DomService.ts"
import { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"
import { HtmlCleaner } from "./html/HtmlCleaner.ts"
import type { WebFetcher } from "../webFetcher/WebFetcher.ts"
import { FetchApiWebFetcher } from "../webFetcher/FetchApiWebFetcher.ts"

export class DI {

  static readonly requestValidator = new RequestValidator()


  static readonly domService = new DomService()

  static readonly htmlCleaner = new HtmlCleaner()

  static readonly webFetcher: WebFetcher = new FetchApiWebFetcher()


  static readonly readability = new ReadabilityContentExtractor(DI.domService, DI.htmlCleaner)

  static readonly pageContentExtractionService = new PageContentExtractionService(DI.readability, DI.webFetcher)

}