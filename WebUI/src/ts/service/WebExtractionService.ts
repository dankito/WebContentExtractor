import type { WebExtractionClient } from "../clients/webExtraction/WebExtractionClient"
import type { ExtractionRequest } from "../model/ExtractionRequest"
import type { ExtractResponse } from "../model/ExtractResponse"
import type { MarkdownConversionResult } from "../model/MarkdownConversionResult"
import { ExtractFromHtmlRequest } from "../model/ExtractFromHtmlRequest"
import type { MarkdownConverterOptions } from "../model/MarkdownConverterOptions"
import type { MultiFormatRequest } from "@shared/model/requests/MultiFormatRequest"
import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
import type { MultiFormatFromHtmlRequest } from "@shared/model/requests/MultiFormatFromHtmlRequest"

export class WebExtractionService {

  constructor(private readonly client: WebExtractionClient) { }


  async extractFromUrl(request: ExtractionRequest): Promise<ExtractResponse> {
    return await this.client.extractFromUrl(request)
  }

  async extractFromHtml(request: ExtractFromHtmlRequest): Promise<ExtractResponse> {
    return await this.client.extractFromHtml(request)
  }


  async extractMultipleFormatsFromUrl(request: MultiFormatRequest): Promise<MultiFormatResponse> {
    return await this.client.extractMultipleFormatsFromUrl(request)
  }

  async extractMultipleFormatsFromHtml(request: MultiFormatFromHtmlRequest): Promise<MultiFormatResponse> {
    return await this.client.extractMultipleFormatsFromHtml(request)
  }

  // async extractMultipleResponseFormatFromHtml(request: ExtractFromHtmlRequest): Promise<MultiFormatExtractionResult> {
  //   // TODO: of course not really correct, but it works for our use case
  //   const htmlRequest = { ...request, format: OutputFormat.Html }
  //   const contentHtml = await this.client.extractFromHtml(htmlRequest)
  //
  //   const markdownRequest = { ...request, format: OutputFormat.Markdown }
  //   const contentMarkdown = await this.client.extractFromHtml(markdownRequest)
  //
  //   if (contentHtml.extractionResult) {
  //     contentHtml.extractionResult.content = contentHtml.content
  //   }
  //   if (contentMarkdown.conversionResult) {
  //     contentMarkdown.conversionResult.content = contentMarkdown.content
  //   }
  //
  //   return {
  //     url: "",
  //     fetchResult: undefined,
  //
  //     extractionResult: contentHtml.extractionResult ?? contentMarkdown.extractionResult,
  //     metadata: contentHtml.metadata ?? contentMarkdown.metadata,
  //
  //     contentMarkdown: contentMarkdown.conversionResult,
  //   }
  // }

  async convertHtmlToMarkdown(html: string, options?: MarkdownConverterOptions): Promise<MarkdownConversionResult> {
    return await this.client.convertHtmlToMarkdown(html, options)
  }

}