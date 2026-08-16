import type { WebExtractionClient } from "../clients/webExtraction/WebExtractionClient"
import type { ExtractionRequest } from "../model/ExtractionRequest"
import type { ExtractResponse } from "../model/ExtractResponse"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult"
import { ExtractFromHtmlRequest } from "../model/ExtractFromHtmlRequest"
import type { MultiFormatFromUrlRequest } from "@shared/model/requests/MultiFormatFromUrlRequest"
import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
import type { MultiFormatFromHtmlRequest } from "@shared/model/requests/MultiFormatFromHtmlRequest"
import { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { TextConversionResult } from "@shared/model/TextConversionResult"

export class WebExtractionService {

  constructor(private readonly client: WebExtractionClient) { }


  async extractFromUrl(request: ExtractionRequest): Promise<ExtractResponse> {
    return await this.client.extractFromUrl(request)
  }

  async extractFromHtml(request: ExtractFromHtmlRequest): Promise<ExtractResponse> {
    return await this.client.extractFromHtml(request)
  }


  async extractMultipleFormatsFromUrl(request: MultiFormatFromUrlRequest): Promise<MultiFormatResponse> {
    return await this.client.extractMultipleFormatsFromUrl(request)
  }

  async extractMultipleFormatsFromHtml(request: MultiFormatFromHtmlRequest): Promise<MultiFormatResponse> {
    return await this.client.extractMultipleFormatsFromHtml(request)
  }


  async convertHtmlToMarkdown(html: string, options?: MarkdownConversionOptions): Promise<MarkdownConversionResult> {
    return await this.client.convertHtmlToMarkdown(html, options)
  }

  async convertHtmlToText(html: string, options?: TextConversionOptions): Promise<TextConversionResult> {
    return await this.client.convertHtmlToText(html, options)
  }

}