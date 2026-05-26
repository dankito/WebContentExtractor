import type { ExtractionRequest } from "../../model/ExtractionRequest"
import type { ExtractionResult } from "../../model/ExtractionResult"
import type { WebClient } from "../web/WebClient"
import { WebRequest } from "../web/WebRequest"
import type { MarkdownConversionResult } from "../../model/MarkdownConversionResult"
import type { MarkdownConverterOptions } from "../../model/MarkdownConverterOptions"

export class WebExtractionClient {

  constructor(private readonly webClient: WebClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResult> {
    return this.webClient.post(new WebRequest("/extract", request))
  }

  async convertHtmlToMarkdown(html: string, options?: MarkdownConverterOptions): Promise<MarkdownConversionResult> {
    return this.webClient.post(new WebRequest(`/convert${options?.converters?.length ? "?converter=" + options.converters[0] : ""}`,
      html, "text/html", "text/markdown"))
  }

}
