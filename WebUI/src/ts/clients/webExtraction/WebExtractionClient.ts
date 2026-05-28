import type { ExtractionRequest } from "../../model/ExtractionRequest"
import type { ExtractionResult } from "../../model/ExtractionResult"
import type { WebClient } from "../web/WebClient"
import { WebRequest } from "../web/WebRequest"
import type { MarkdownConversionResult } from "../../model/MarkdownConversionResult"
import { ExtractFromHtmlRequest } from "../../model/ExtractFromHtmlRequest"
import type { ExtractFromHtmlResult } from "../../model/ExtractFromHtmlResult"
import type { MarkdownConverterOptions } from "../../model/MarkdownConverterOptions"
import type { MultiFormatExtractionRequest } from "../../model/MultiFormatExtractionRequest"
import type { MultiFormatExtractionResult } from "../../model/MultiFormatExtractionResult"

export class WebExtractionClient {

  constructor(private readonly webClient: WebClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResult> {
    return this.webClient.post(new WebRequest("/extract", request))
  }

  async extractFromHtml(request: ExtractFromHtmlRequest): Promise<ExtractFromHtmlResult> {
    return this.webClient.post(new WebRequest(`/extract/html${this.createQueryParameters(request)}`,
      request.html, "text/html", "application/json"))
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
