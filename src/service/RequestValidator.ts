import { ExtractFromHtmlParams } from "../model/requestParameter/ExtractFromHtmlParams.ts"
import { ExtractFromUrlParams } from "../model/requestParameter/ExtractFromUrlParams.ts"
import { type HonoRequest } from "hono"
import type { Result } from "../model/Result.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import { SuccessResult } from "../model/SuccessResult.ts"
import { WebFetcherOptions } from "../webFetcher/WebFetcherOptions.ts"
import { ConvertToPlainTextOptions } from "./converter/ConvertToPlainTextOptions.ts"
import { ExtractFromHtmlSchema, ExtractFromUrlSchema } from "../model/requestParameter/ValidationSchemas.ts"
import { z } from "zod"

export class RequestValidator {

  async parseExtractFromUrlParams(request: HonoRequest, extractFromBody: boolean): Promise<Result<ExtractFromUrlParams>> {
    let params: any

    try {
      params = extractFromBody ? await request.json() : request.query()
    } catch {
      return ErrorResult.for("Invalid JSON body")
    }

    const validation = ExtractFromUrlSchema.safeParse(params)
    if (!validation.success) {
      return ErrorResult.for(validation.error.issues[0].message)
    }

    const data = validation.data

    return SuccessResult.for(new ExtractFromUrlParams(
      data.url,
      data.includeMetadata,
      this.mapToConvertToPlainTextOptions(data),
      this.mapToWebFetcherOptions(data)
    ))
  }


  async parseExtractFromHtmlParams(request: HonoRequest): Promise<Result<ExtractFromHtmlParams>> {
    let body: any

    try {
      body = await request.json()
    } catch {
      return ErrorResult.for("Invalid JSON body")
    }

    const validation = ExtractFromHtmlSchema.safeParse(body)
    if (!validation.success) {
      return ErrorResult.for(validation.error.issues[0].message)
    }

    const data = validation.data

    return SuccessResult.for(new ExtractFromHtmlParams(
      data.html,
      data.url || undefined,
      data.includeMetadata,
      this.mapToConvertToPlainTextOptions(data)
    ))
  }


  mapToExtractFromUrlParams(data: z.infer<typeof ExtractFromUrlSchema>): ExtractFromUrlParams {
    return new ExtractFromUrlParams(
      data.url,
      data.includeMetadata,
      this.mapToConvertToPlainTextOptions(data),
      this.mapToWebFetcherOptions(data)
    )
  }


  mapToExtractFromHtmlParams(data: z.infer<typeof ExtractFromHtmlSchema>): ExtractFromHtmlParams {
    return new ExtractFromHtmlParams(
      data.html,
      data.url || undefined,
      data.includeMetadata,
      this.mapToConvertToPlainTextOptions(data)
    )
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