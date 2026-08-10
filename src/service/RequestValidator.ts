import { ExtractFromHtmlQueryParams } from "../model/requestParameter/ExtractFromHtmlQueryParams.ts"
import { type HonoRequest } from "hono"
import { ValidationError } from "../model/ValidationError.ts"

export class RequestValidator {

  async parseExtractFromHtmlQueryParams(request: HonoRequest): Promise<ExtractFromHtmlQueryParams | ValidationError> {
    let body: Record<string, string>

    try {
      body = await request.json()
    } catch {
      return new ValidationError("Invalid JSON body")
    }

    const { html, url } = body

    if (!html) {
      return new ValidationError("Missing required parameter: html")
    }

    return new ExtractFromHtmlQueryParams(html, url)
  }


}