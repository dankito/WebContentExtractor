import type { WebExtractionClient } from "../clients/webExtraction/WebExtractionClient"
import type { ExtractionRequest } from "../model/ExtractionRequest"
import type { ExtractionResult } from "../model/ExtractionResult"
import type { MarkdownConversionResult } from "../model/MarkdownConversionResult"
import { ExtractFromHtmlRequest } from "../model/ExtractFromHtmlRequest"
import type { ExtractFromHtmlResult } from "../model/ExtractFromHtmlResult"
import type { MarkdownConverterOptions } from "../model/MarkdownConverterOptions"
import type { MultiFormatExtractionRequest } from "../model/MultiFormatExtractionRequest"
import type { MultiFormatExtractionResult } from "../model/MultiFormatExtractionResult"
import { OutputFormat } from "../model/OutputFormat"

export class WebExtractionService {

  constructor(private readonly client: WebExtractionClient) { }


  async extract(request: ExtractionRequest): Promise<ExtractionResult> {
    return await this.client.extract(request)
  }

  async extractFromHtml(request: ExtractFromHtmlRequest): Promise<ExtractFromHtmlResult> {
    return await this.client.extractFromHtml(request)
  }

  async extractMultipleResponseFormat(request: MultiFormatExtractionRequest): Promise<MultiFormatExtractionResult> {
    return await this.client.extractMultipleResponseFormat(request)
  }

  async extractMultipleResponseFormatFromHtml(request: ExtractFromHtmlRequest): Promise<MultiFormatExtractionResult> {
    // TODO: of course not really correct, but it works for our use case
    const htmlRequest = { ...request, format: OutputFormat.Html }
    const contentHtml = await this.client.extractFromHtml(htmlRequest)

    const markdownRequest = { ...request, format: OutputFormat.Markdown }
    const contentMarkdown = await this.client.extractFromHtml(markdownRequest)

    if (contentHtml.extractionResult) {
      contentHtml.extractionResult.content = contentHtml.content
    }
    if (contentMarkdown.conversionResult) {
      contentMarkdown.conversionResult.content = contentMarkdown.content
    }

    return {
      url: "",
      fetchResult: undefined,

      extractionResult: contentHtml.extractionResult ?? contentMarkdown.extractionResult,
      metadata: contentHtml.metadata ?? contentMarkdown.metadata,

      contentMarkdown: contentMarkdown.conversionResult,
    }
  }

  async convertHtmlToMarkdown(html: string, options?: MarkdownConverterOptions): Promise<MarkdownConversionResult> {
    return await this.client.convertHtmlToMarkdown(html, options)
  }

}