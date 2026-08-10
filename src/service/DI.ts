import { PageContentExtractionService } from "./PageContentExtractionService.ts"
import { RequestValidator } from "./RequestValidator.ts"
import { DomService } from "./html/DomService.ts"
import { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"
import { HtmlCleaner } from "./html/HtmlCleaner.ts"

export class DI {

  static readonly requestValidator = new RequestValidator()


  static readonly domService = new DomService()

  static htmlCleaner = new HtmlCleaner()

  static readonly readability = new ReadabilityContentExtractor(DI.domService, DI.htmlCleaner)

  static readonly pageContentExtractionService = new PageContentExtractionService(DI.readability)

}