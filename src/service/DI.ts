import { PageContentExtractionService } from "./PageContentExtractionService.ts"
import { RequestValidator } from "./RequestValidator.ts"

export class DI {

  static pageContentExtractionService = new PageContentExtractionService()

  static requestValidator = new RequestValidator()

}