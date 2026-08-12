import { ExtractFromHtmlRequest } from "../../model/requestParameter/ExtractFromHtmlRequest.ts"
import { ExtractFromUrlRequest } from "../../model/requestParameter/ExtractFromUrlRequest.ts"
import { type HonoRequest } from "hono"
import type { Result } from "../../model/Result.ts"
import { ErrorResult } from "../../model/ErrorResult.ts"
import { SuccessResult } from "../../model/SuccessResult.ts"
import { WebFetcherOptions } from "../../webFetcher/WebFetcherOptions.ts"
import { ConvertToPlainTextOptions } from "../contentConverter/ConvertToPlainTextOptions.ts"
import { ExtractFromHtmlSchema, ExtractFromUrlSchema } from "../../model/requestParameter/ValidationSchemas.ts"
import { z } from "zod"
import { ConvertToMarkdownOptions } from "../contentConverter/ConvertToMarkdownOptions.ts"

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
      this.mapToWebFetcherOptions(data)
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
      this.mapToWebFetcherOptions(data)
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


  private mapToConvertToMarkdownOptions(data: z.infer<typeof ExtractFromUrlSchema> | z.infer<typeof ExtractFromHtmlSchema>): ConvertToMarkdownOptions | undefined {
    if (data.includeImages === undefined) {
      return undefined
    }

    return new ConvertToMarkdownOptions(data.includeImages)
  }

  private mapToConvertToPlainTextOptions(data: z.infer<typeof ExtractFromUrlSchema> | z.infer<typeof ExtractFromHtmlSchema>): ConvertToPlainTextOptions | undefined {
    if (data.preserveLinkUrlsInPlainText === undefined && data.preserveImageUrlsInPlainText === undefined) {
      return undefined
    }

    return new ConvertToPlainTextOptions(data.preserveLinkUrlsInPlainText, data.preserveImageUrlsInPlainText)
  }

  private mapToWebFetcherOptions(data: z.infer<typeof ExtractFromUrlSchema>): WebFetcherOptions | undefined {
    if (data.timeout === undefined && data.userAgent === undefined && data.followRedirects === undefined) {
      return undefined
    }

    return new WebFetcherOptions(data.userAgent, data.timeout, data.followRedirects)
  }

}