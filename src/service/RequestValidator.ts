import { ExtractFromHtmlQueryParams } from "../model/requestParameter/ExtractFromHtmlQueryParams.ts"
import { type HonoRequest } from "hono"
import type { Result } from "../model/Result.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import { SuccessResult } from "../model/SuccessResult.ts"

export class RequestValidator {

  async parseExtractFromHtmlQueryParams(request: HonoRequest): Promise<Result<ExtractFromHtmlQueryParams>> {
    let body: Record<string, string>

    try {
      body = await request.json()
    } catch {
      return ErrorResult.for("Invalid JSON body")
    }

    const { html, url, includeMetadata } = body

    if (!html) {
      return ErrorResult.for("Missing required parameter: html")
    }

    return SuccessResult.for(new ExtractFromHtmlQueryParams(html, url, includeMetadata === "true"))
  }


}