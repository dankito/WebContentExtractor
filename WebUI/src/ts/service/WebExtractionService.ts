import type { WebExtractionClient } from "../clients/webExtraction/WebExtractionClient"
import type { ExtractionRequest } from "../model/ExtractionRequest"
import type { ExtractionResult } from "../model/ExtractionResult"
import type { MarkdownConversionResult } from "../model/MarkdownConversionResult"
import { ExtractFromHtmlRequest } from "../model/ExtractFromHtmlRequest"
import type { ExtractFromHtmlResult } from "../model/ExtractFromHtmlResult"
import type { MarkdownConverterOptions } from "../model/MarkdownConverterOptions"

export class WebExtractionService {

  constructor(private readonly client: WebExtractionClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResult> {
    return this.client.extract(request)
  }

  async extractFromHtml(request: ExtractFromHtmlRequest): Promise<ExtractFromHtmlResult> {
    return this.client.extractFromHtml(request)
  }

  async convertHtmlToMarkdown(html: string, options?: MarkdownConverterOptions): Promise<MarkdownConversionResult> {
    return this.client.convertHtmlToMarkdown(html, options)
  }

}