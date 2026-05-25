import type { ExtractionRequest } from "../../model/ExtractionRequest"
import type { ExtractionResult } from "../../model/ExtractionResult"
import type { WebClient } from "../web/WebClient"
import { WebRequest } from "../web/WebRequest"

export class WebExtractionClient {

  constructor(private readonly webClient: WebClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResult> {
    return this.webClient.post(new WebRequest("/extract", request))
  }

}
