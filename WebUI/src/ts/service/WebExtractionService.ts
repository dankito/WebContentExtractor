import type { WebExtractionClient } from "../clients/webExtraction/WebExtractionClient"
import type { ExtractionRequest } from "../model/ExtractionRequest"
import type { ExtractionResult } from "../model/ExtractionResult"
import type { MarkdownConversionResult } from "../model/MarkdownConversionResult"

export class WebExtractionService {

  constructor(private readonly client: WebExtractionClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResult> {
    return this.client.extract(request)
  }

  async convertHtmlToMarkdown(html: string): Promise<MarkdownConversionResult> {
    return this.client.convertHtmlToMarkdown(html)
  }

}