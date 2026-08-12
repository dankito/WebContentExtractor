import type { ExtractionRequest } from "../../model/ExtractionRequest"
import type { ExtractResponse } from "../../model/ExtractResponse"
import type { WebClient } from "../web/WebClient"
import { WebRequest } from "../web/WebRequest"
import type { MarkdownConversionResult } from "../../model/MarkdownConversionResult"
import { ExtractFromHtmlRequest } from "../../model/ExtractFromHtmlRequest"
import type { MarkdownConverterOptions } from "../../model/MarkdownConverterOptions"
import type { MultiFormatExtractionRequest } from "../../model/MultiFormatExtractionRequest"
import type { MultiFormatExtractionResult } from "../../model/MultiFormatExtractionResult"
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


  async extractMultipleResponseFormat(request: MultiFormatExtractionRequest): Promise<MultiFormatExtractionResult> {
    return this.webClient.post(new WebRequest("/extract/multiple", request))
  }

  async convertHtmlToMarkdown(html: string, options?: MarkdownConverterOptions): Promise<MarkdownConversionResult> {
    return this.webClient.post(new WebRequest(`/convert${options?.converters?.length ? "?converter=" + options.converters[0] : ""}`,
      html, "text/html", "text/markdown"))
  }


  private createQueryParameters(request: ExtractFromHtmlRequest): string {
    const params = new URLSearchParams()
    if (request.format) {
      params.append("format", request.format)
    }
    if (request.includeMetadata) {
      params.append("include_metadata", request.includeMetadata.toString())
    }
    if (request.extractorOptions?.extractors?.length) {
      params.append("extractor", request.extractorOptions?.extractors[0])
    }
    if (request.converterOptions?.converters?.length) {
      params.append("converter", request.converterOptions?.converters[0])
    }

    if (params.size) {
      return "?" + params.toString()
    } else {
      return ""
    }
  }

}
