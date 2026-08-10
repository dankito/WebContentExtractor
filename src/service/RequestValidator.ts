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

    return SuccessResult.for(new ExtractFromHtmlQueryParams(html, url, this.parseBoolean(includeMetadata)))
  }


  private parseBoolean(value?: string | boolean): boolean {
    if (!!!value) {
      return false
    }

    if (typeof value === "boolean") {
      return value
    }

    const normalized = value.trim().toLowerCase()
    return normalized === "true" // may use: ['true', '1', 'yes', 'on'].includes(normalized)
  }


}