import type { WebExtractionClient } from "../clients/webExtraction/WebExtractionClient"
import type { ExtractionRequest } from "../model/ExtractionRequest"
import type { ExtractionResponse } from "../model/ExtractionResponse"

export class WebExtractionService {

  constructor(private readonly client: WebExtractionClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResponse> {
    return this.client.extract(request)
  }

}