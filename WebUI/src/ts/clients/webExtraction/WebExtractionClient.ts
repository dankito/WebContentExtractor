import type { ExtractionRequest } from "../../model/ExtractionRequest"
import type { ExtractResponse } from "../../model/ExtractResponse"
import type { WebClient } from "../web/WebClient"
import { WebRequest } from "../web/WebRequest"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult"
import { ExtractFromHtmlRequest } from "../../model/ExtractFromHtmlRequest"
import type { MultiFormatFromUrlRequest } from "@shared/model/requests/MultiFormatFromUrlRequest"
import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
import { OutputFormat } from "../../model/OutputFormat"
import type { MultiFormatFromHtmlRequest } from "@shared/model/requests/MultiFormatFromHtmlRequest"
import { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import { ConvertHtmlRequest } from "@shared/model/requests/ConvertHtmlRequest"
import type { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { TextConversionResult } from "@shared/model/TextConversionResult"

export class WebExtractionClient {

  constructor(private readonly webClient: WebClient) { }


  async extractFromUrl(request: ExtractionRequest): Promise<ExtractResponse> {
    if (request.format === OutputFormat.Html) {
      return this.webClient.post(new WebRequest("/extract/from-url", request))
    } else {
      const response: string = await this.webClient.post(new WebRequest("/extract", request, "application/json", this.mapOutputFormat(request.format)))
      return { pageContentHtml: response, url: request.url }
    }
  }

  async extractFromHtml(request: ExtractFromHtmlRequest): Promise<ExtractResponse> {
    if (request.format === OutputFormat.Html) {
      return this.webClient.post(new WebRequest(`/extract/from-html`,
        request, "application/json", "application/json"))
    } else {
      const response: string = await this.webClient.post(new WebRequest(`/extract/from-html`,
        request, "application/json", this.mapOutputFormat(request.format)))
      return { pageContentHtml: response }
    }
  }

  // TODO: get rid of this
  private mapOutputFormat(format: OutputFormat | undefined): string {
    if (format == OutputFormat.Markdown) {
      return "text/markdown"
    } else if (format == OutputFormat.Text) {
      return "text/plain"
    }

    return "application/json"
  }


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
