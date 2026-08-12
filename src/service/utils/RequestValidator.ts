import { ExtractFromHtmlRequest } from "../../model/requestParameter/ExtractFromHtmlRequest"
import { ExtractFromUrlRequest } from "../../model/requestParameter/ExtractFromUrlRequest"
import { type HonoRequest } from "hono"
import type { Result } from "../../model/Result"
import { ErrorResult } from "../../model/ErrorResult"
import { SuccessResult } from "../../model/SuccessResult"
import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import { ExtractFromHtmlSchema, ExtractFromUrlSchema } from "../../model/requestParameter/ValidationSchemas"
import { z } from "zod"
import { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"

export class RequestValidator {

  async parseExtractFromUrlParams(request: HonoRequest, extractFromBody: boolean): Promise<Result<ExtractFromUrlRequest>> {
    let params: any

    try {
      params = extractFromBody ? await request.json() : request.query()
    } catch {
      return ErrorResult.for("Invalid JSON body", true)
    }

    const validation = ExtractFromUrlSchema.safeParse(params)
    if (!validation.success) {
      return ErrorResult.for(validation.error.issues[0].message, true)
    }

    const data = validation.data

    return SuccessResult.for(new ExtractFromUrlRequest(
      data.url,
      data.includeMetadata,
      this.mapToConvertToMarkdownOptions(data),
      this.mapToConvertToPlainTextOptions(data),
      this.mapToWebRequestOptions(data)
    ))
  }


  async parseExtractFromHtmlParams(request: HonoRequest): Promise<Result<ExtractFromHtmlRequest>> {
    let body: any

    try {
      body = await request.json()
    } catch {
      return ErrorResult.for("Invalid JSON body", true)
    }

    const validation = ExtractFromHtmlSchema.safeParse(body)
    if (!validation.success) {
      return ErrorResult.for(validation.error.issues[0].message, true)
    }

    const data = validation.data

    return SuccessResult.for(new ExtractFromHtmlRequest(
      data.html,
      data.url || undefined,
      data.includeMetadata,
      this.mapToConvertToMarkdownOptions(data),
      this.mapToConvertToPlainTextOptions(data)
    ))
  }


  mapToExtractFromUrlParams(data: z.infer<typeof ExtractFromUrlSchema>): ExtractFromUrlRequest {
    return new ExtractFromUrlRequest(
      data.url,
      data.includeMetadata,
      this.mapToConvertToMarkdownOptions(data),
      this.mapToConvertToPlainTextOptions(data),
      this.mapToWebRequestOptions(data)
    )
  }


  mapToExtractFromHtmlParams(data: z.infer<typeof ExtractFromHtmlSchema>): ExtractFromHtmlRequest {
    return new ExtractFromHtmlRequest(
      data.html,
      data.url || undefined,
      data.includeMetadata,
      this.mapToConvertToMarkdownOptions(data),
      this.mapToConvertToPlainTextOptions(data)
    )
  }


  private mapToConvertToMarkdownOptions(data: z.infer<typeof ExtractFromUrlSchema> | z.infer<typeof ExtractFromHtmlSchema>): MarkdownConversionOptions | undefined {
    if (data.includeImages === undefined) {
      return undefined
    }

    return new MarkdownConversionOptions(data.includeImages)
  }

  private mapToConvertToPlainTextOptions(data: z.infer<typeof ExtractFromUrlSchema> | z.infer<typeof ExtractFromHtmlSchema>): TextConversionOptions | undefined {
    if (data.preserveLinkUrlsInPlainText === undefined && data.preserveImageUrlsInPlainText === undefined) {
      return undefined
    }

    return new TextConversionOptions(data.preserveLinkUrlsInPlainText, data.preserveImageUrlsInPlainText)
  }

  private mapToWebRequestOptions(data: z.infer<typeof ExtractFromUrlSchema>): WebRequestOptions | undefined {
    if (data.timeout === undefined && data.userAgent === undefined && data.followRedirects === undefined) {
      return undefined
    }

    return new WebRequestOptions(data.userAgent, data.timeout, data.followRedirects)
  }

}