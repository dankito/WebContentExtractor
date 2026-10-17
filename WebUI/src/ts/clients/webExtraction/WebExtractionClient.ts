import type { WebClient } from "../web/WebClient"
import { WebRequest } from "../web/WebRequest"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult"
import type { MultiFormatFromUrlRequest } from "@shared/model/requests/MultiFormatFromUrlRequest"
import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
import type { MultiFormatFromHtmlRequest } from "@shared/model/requests/MultiFormatFromHtmlRequest"
import { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import { ConvertHtmlRequest } from "@shared/model/requests/ConvertHtmlRequest"
import type { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { TextConversionResult } from "@shared/model/TextConversionResult"

export class WebExtractionClient {

  constructor(private readonly webClient: WebClient) { }


  async extractMultipleFormatsFromUrl(request: MultiFormatFromUrlRequest): Promise<MultiFormatResponse> {
    return this.webClient.post(new WebRequest("/extract/from-url/formats", request))
  }

  async extractMultipleFormatsFromHtml(request: MultiFormatFromHtmlRequest): Promise<MultiFormatResponse> {
    return this.webClient.post(new WebRequest("/extract/from-html/formats", request))
  }


  async convertHtmlToMarkdown(html: string, options?: MarkdownConversionOptions): Promise<MarkdownConversionResult> {
    return this.webClient.post(new WebRequest("/convert", new ConvertHtmlRequest(html, options), "application/json", "application/json"))
  }

  async convertHtmlToText(html: string, options?: TextConversionOptions): Promise<TextConversionResult> {
    return this.webClient.post(new WebRequest("/convert", new ConvertHtmlRequest(html, undefined, options),
      "application/json", "application/json"))
  }

}
