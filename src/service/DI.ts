import { PageContentExtractionService } from "./PageContentExtractionService.ts"
import { RequestValidator } from "./RequestValidator.ts"
import { DomService } from "./html/DomService.ts"
import { ReadabilityContentExtractor } from "./ReadabilityContentExtractor.ts"

export class DI {

  static readonly requestValidator = new RequestValidator()


  static readonly domService = new DomService()

  static readonly readability = new ReadabilityContentExtractor(DI.domService)

  static readonly pageContentExtractionService = new PageContentExtractionService(DI.readability)

}