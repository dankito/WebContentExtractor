import { ExtractFromHtmlRequest } from "../../model/requestParameter/ExtractFromHtmlRequest"
import { ExtractFromUrlRequest } from "../../model/requestParameter/ExtractFromUrlRequest"
import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import {
  ConvertHtmlRequestSchema,
  ExtractFromHtmlSchema,
  ExtractFromUrlSchema, MultiFormatFromHtmlRequestSchema,
  MultiFormatFromUrlRequestSchema,
  OutputSelectionSchema,
  WebRequestOptionsSchema
} from "../../model/requestParameter/ValidationSchemas"
import { z } from "zod"
import { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import { MultiFormatFromUrlRequest } from "@shared/model/requests/MultiFormatFromUrlRequest.ts"
import { OutputSelection } from "@shared/model/requests/OutputSelection.ts"
import { MultiFormatFromHtmlRequest } from "@shared/model/requests/MultiFormatFromHtmlRequest.ts"
import { ConvertHtmlRequest } from "@shared/model/requests/ConvertHtmlRequest.ts"


export class RequestValidator {

  mapToExtractFromUrlRequest(data: z.infer<typeof ExtractFromUrlSchema>): ExtractFromUrlRequest {
    return new ExtractFromUrlRequest(
      data.url,
      data.includeMetadata,
      this.mapToConvertToMarkdownOptionsFromQueryParameter(data),
      this.mapToConvertToPlainTextOptionsFromQueryParameter(data),
      this.mapToWebRequestOptions(data)
    )
  }


  mapToExtractFromHtmlRequest(data: z.infer<typeof ExtractFromHtmlSchema>): ExtractFromHtmlRequest {
    return new ExtractFromHtmlRequest(
      data.html,
      data.url || undefined,
      data.includeMetadata,
      this.mapToConvertToMarkdownOptionsFromQueryParameter(data),
      this.mapToConvertToPlainTextOptionsFromQueryParameter(data)
    )
  }


  mapToMultiFormatFromUrlRequest(data: z.infer<typeof MultiFormatFromUrlRequestSchema>): MultiFormatFromUrlRequest {
    return new MultiFormatFromUrlRequest(
      data.url,
      this.mapToOutputSelection(data.include),
      this.mapToWebRequestOptions(data),
      this.mapToConvertToMarkdownOptions(data),
      this.mapToConvertToPlainTextOptions(data)
    )
  }

  mapToMultiFormatFromHtmlRequest(data: z.infer<typeof MultiFormatFromHtmlRequestSchema>): MultiFormatFromHtmlRequest {
    return new MultiFormatFromHtmlRequest(
      data.html,
      this.mapToOutputSelection(data.include),
      this.mapToConvertToMarkdownOptions(data),
      this.mapToConvertToPlainTextOptions(data)
    )
  }

  mapToOutputSelection(data: z.infer<typeof OutputSelectionSchema>): OutputSelection {
    return new OutputSelection(
      data.rawHtml, data.rawMarkdown, data.rawText,
      data.contentHtml, data.contentMarkdown, data.contentText,
      data.metadata
    )
  }


  mapToConvertHtmlRequest(data: z.infer<typeof ConvertHtmlRequestSchema>): ConvertHtmlRequest {
    return new ConvertHtmlRequest(
      data.html,
      this.mapToConvertToMarkdownOptions(data),
      this.mapToConvertToPlainTextOptions(data)
    )
  }


  private mapToConvertToMarkdownOptions(data: z.infer<typeof MultiFormatFromHtmlRequestSchema | typeof MultiFormatFromUrlRequestSchema | typeof ConvertHtmlRequestSchema>): MarkdownConversionOptions | undefined {
    if (data.markdownConversionOptions === undefined) {
      return undefined
    }

    return new MarkdownConversionOptions(data.markdownConversionOptions.includeImages)
  }

  private mapToConvertToMarkdownOptionsFromQueryParameter(data: z.infer<typeof ExtractFromUrlSchema> | z.infer<typeof ExtractFromHtmlSchema>): MarkdownConversionOptions | undefined {
    if (data.includeImages === undefined) {
      return undefined
    }

    return new MarkdownConversionOptions(data.includeImages)
  }

  private mapToConvertToPlainTextOptions(data: z.infer<typeof MultiFormatFromHtmlRequestSchema | typeof MultiFormatFromUrlRequestSchema | typeof ConvertHtmlRequestSchema>): TextConversionOptions | undefined {
    if (data.textConversionOptions === undefined) {
      return undefined
    }

    return new TextConversionOptions(data.textConversionOptions.preserveLinkUrls, data.textConversionOptions.preserveImageUrls)
  }

  private mapToConvertToPlainTextOptionsFromQueryParameter(data: z.infer<typeof ExtractFromUrlSchema> | z.infer<typeof ExtractFromHtmlSchema>): TextConversionOptions | undefined {
    if (data.preserveLinkUrlsInPlainText === undefined && data.preserveImageUrlsInPlainText === undefined) {
      return undefined
    }

    return new TextConversionOptions(data.preserveLinkUrlsInPlainText, data.preserveImageUrlsInPlainText)
  }

  private mapToWebRequestOptions(data: z.infer<typeof WebRequestOptionsSchema | typeof ExtractFromUrlSchema>): WebRequestOptions | undefined {
    if (data.timeout === undefined && data.userAgent === undefined && data.followRedirects === undefined) {
      return undefined
    }

    return new WebRequestOptions(data.userAgent, data.timeout, data.followRedirects)
  }

}