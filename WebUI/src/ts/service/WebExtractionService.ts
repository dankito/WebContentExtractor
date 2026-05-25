import type { WebExtractionClient } from "../clients/webExtraction/WebExtractionClient"
import type { ExtractionRequest } from "../model/ExtractionRequest"
import type { ExtractionResult } from "../model/ExtractionResult"

export class WebExtractionService {

  constructor(private readonly client: WebExtractionClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResult> {
    return this.client.extract(request)
  }

}