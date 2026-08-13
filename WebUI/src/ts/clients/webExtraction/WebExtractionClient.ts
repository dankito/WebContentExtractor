import type { ExtractionRequest } from "../../model/ExtractionRequest"
import type { ExtractResponse } from "../../model/ExtractResponse"
import type { WebClient } from "../web/WebClient"
import { WebRequest } from "../web/WebRequest"
import type { MarkdownConversionResult } from "../../model/MarkdownConversionResult"
import { ExtractFromHtmlRequest } from "../../model/ExtractFromHtmlRequest"
import type { MarkdownConverterOptions } from "../../model/MarkdownConverterOptions"
import type { MultiFormatRequest } from "@shared/model/requests/MultiFormatRequest"
import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
import { OutputFormat } from "../../model/OutputFormat"

export class WebExtractionClient {

  constructor(private readonly webClient: WebClient) { }


  async extractFromUrl(request: ExtractionRequest): Promise<ExtractResponse> {
    if (request.format === OutputFormat.Html) {
      return this.webClient.post(new WebRequest("/extract", request))
    } else {
      const response: string = await this.webClient.post(new WebRequest("/extract", request, "application/json", this.mapOutputFormat(request.format)))
      return { pageContentHtml: response, url: request.url }
    }
  }

  async extractFromHtml(request: ExtractFromHtmlRequest): Promise<ExtractResponse> {
    if (request.format === OutputFormat.Html) {
      return this.webClient.post(new WebRequest(`/extract/html`,
        request, "application/json", "application/json"))
    } else {
      const response: string = await this.webClient.post(new WebRequest(`/extract/html`,
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


  async extractMultipleResponseFormat(request: MultiFormatRequest): Promise<MultiFormatResponse> {
    return this.webClient.post(new WebRequest("/extract/multi-format", request))
  }

  async convertHtmlToMarkdown(html: string, options?: MarkdownConverterOptions): Promise<MarkdownConversionResult> {
    return this.webClient.post(new WebRequest(`/convert${options?.converters?.length ? "?converter=" + options.converters[0] : ""}`,
      html, "text/html", "text/markdown"))
  }

}
