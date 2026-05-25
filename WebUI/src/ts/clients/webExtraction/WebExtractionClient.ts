import type { ExtractionRequest } from "../../model/ExtractionRequest"
import type { ExtractionResponse } from "../../model/ExtractionResponse"
import type { WebClient } from "../web/WebClient"
import { WebRequest } from "../web/WebRequest"

export class WebExtractionClient {

  constructor(private readonly webClient: WebClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResponse> {
    return this.webClient.post(new WebRequest("/extract", request))
  }

}
