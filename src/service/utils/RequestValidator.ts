import { ExtractFromHtmlRequest } from "../../model/requestParameter/ExtractFromHtmlRequest"
import { ExtractFromUrlRequest } from "../../model/requestParameter/ExtractFromUrlRequest"
import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import {
  ConvertHtmlRequestSchema,
  ExtractFromHtmlSchema,
  ExtractFromUrlQueryParamsSchema, ExtractFromUrlRequestBodySchema, MarkdownConversionOptionsSchema, MultiFormatFromHtmlRequestSchema,
  MultiFormatFromUrlRequestSchema,
  OutputSelectionSchema, TextConversionOptionsSchema,
  WebRequestOptionsSchema
} from "../../model/requestParameter/ValidationSchemas"
import { z } from "zod"
import { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import { MultiFormatFromUrlRequest } from "@shared/model/requests/MultiFormatFromUrlRequest.ts"
import { OutputSelection } from "@shared/model/requests/OutputSelection.ts"
import { MultiFormatFromHtmlRequest } from "@shared/model/requests/MultiFormatFromHtmlRequest.ts"
import { ConvertHtmlRequest } from "@shared/model/requests/ConvertHtmlRequest.ts"


export class RequestValidator {

  mapToExtractFromUrlRequest(data: z.infer<typeof ExtractFromUrlQueryParamsSchema | typeof ExtractFromUrlRequestBodySchema>, extractFromBody: boolean): ExtractFromUrlRequest {
    if (extractFromBody) {
      return this.mapToExtractFromUrlRequestFromRequestBody(data)
    } else {
      return this.mapToExtractFromUrlRequestFromQueryParams(data)
    }
  }

  mapToExtractFromUrlRequestFromQueryParams(data: z.infer<typeof ExtractFromUrlQueryParamsSchema>): ExtractFromUrlRequest {
    return new ExtractFromUrlRequest(
      data.url,
      data.outputFormat,
      data.includeMetadata,
      this.mapToMarkdownConversionOptionsFromQueryParameter(data),
      this.mapToTextConversionOptionsFromQueryParameter(data),
      this.mapToWebRequestOptions(data),
    )
  }

  mapToExtractFromUrlRequestFromRequestBody(data: z.infer<typeof ExtractFromUrlRequestBodySchema>): ExtractFromUrlRequest {
    return new ExtractFromUrlRequest(
      data.url,
      data.outputFormat,
      data.includeMetadata,
      this.mapToMarkdownConversionOptions(data.markdownConversionOptions),
      this.mapToTextConversionOptions(data.textConversionOptions),
      data.webRequestOptions ? this.mapToWebRequestOptions(data.webRequestOptions) : undefined,
    )
  }


  mapToExtractFromHtmlRequest(data: z.infer<typeof ExtractFromHtmlSchema>): ExtractFromHtmlRequest {
    return new ExtractFromHtmlRequest(
      data.html,
      data.url || undefined,
      data.outputFormat,
      data.includeMetadata,
      this.mapToMarkdownConversionOptions(data.markdownConversionOptions),
      this.mapToTextConversionOptions(data.textConversionOptions),
    )
  }


  mapToMultiFormatFromUrlRequest(data: z.infer<typeof MultiFormatFromUrlRequestSchema>): MultiFormatFromUrlRequest {
    return new MultiFormatFromUrlRequest(
      data.url,
      this.mapToOutputSelection(data.include),
      data.webRequestOptions ? this.mapToWebRequestOptions(data.webRequestOptions) : undefined,
      this.mapToMarkdownConversionOptions(data.markdownConversionOptions),
      this.mapToTextConversionOptions(data.textConversionOptions),
    )
  }

  mapToMultiFormatFromHtmlRequest(data: z.infer<typeof MultiFormatFromHtmlRequestSchema>): MultiFormatFromHtmlRequest {
    return new MultiFormatFromHtmlRequest(
      data.html,
      this.mapToOutputSelection(data.include),
      this.mapToMarkdownConversionOptions(data.markdownConversionOptions),
      this.mapToTextConversionOptions(data.textConversionOptions),
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
      this.mapToMarkdownConversionOptions(data.markdownConversionOptions),
      this.mapToTextConversionOptions(data.textConversionOptions)
    )
  }


  private mapToMarkdownConversionOptions(data: z.infer<typeof MarkdownConversionOptionsSchema> | undefined): MarkdownConversionOptions | undefined {
    if (data === undefined) {
      return undefined
    }

    return new MarkdownConversionOptions(data.includeImages)
  }

  private mapToMarkdownConversionOptionsFromQueryParameter(data: z.infer<typeof ExtractFromUrlQueryParamsSchema>): MarkdownConversionOptions | undefined {
    if (data.includeImages === undefined) {
      return undefined
    }

    return new MarkdownConversionOptions(data.includeImages)
  }

  private mapToTextConversionOptions(data: z.infer<typeof TextConversionOptionsSchema> | undefined): TextConversionOptions | undefined {
    if (data === undefined) {
      return undefined
    }

    return new TextConversionOptions(data.preserveLinkUrls, data.preserveImageUrls)
  }

  private mapToTextConversionOptionsFromQueryParameter(data: z.infer<typeof ExtractFromUrlQueryParamsSchema>): TextConversionOptions | undefined {
    if (data.preserveLinkUrlsInPlainText === undefined && data.preserveImageUrlsInPlainText === undefined) {
      return undefined
    }

    return new TextConversionOptions(data.preserveLinkUrlsInPlainText, data.preserveImageUrlsInPlainText)
  }

  private mapToWebRequestOptions(data: z.infer<typeof WebRequestOptionsSchema | typeof ExtractFromUrlQueryParamsSchema>): WebRequestOptions | undefined {
    if (data.timeout === undefined && data.userAgent === undefined && data.followRedirects === undefined) {
      return undefined
    }

    return new WebRequestOptions(data.userAgent, data.timeout, data.followRedirects)
  }

}