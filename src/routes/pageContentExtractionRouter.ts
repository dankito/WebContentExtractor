import { Hono } from "hono"
import { DI } from "../service/DI.ts"
import { ErrorResponse } from "../model/ErrorResponse.ts"
import { ValidationError } from "../model/ValidationError.ts"
import type { ExtractFromHtmlQueryParams } from "../model/requestParameter/ExtractFromHtmlQueryParams.ts"
import { ExtractResponse } from "../model/ExtractResponse.ts"


export const pageContentExtractionRouter = new Hono()


const extractionService = DI.pageContentExtractionService

const requestValidator = DI.requestValidator


/**
 * POST /extract/html
 * Body: { html, url?, format?, includeMetadata? }
 *
 * Extract content from provided HTML.
 */
pageContentExtractionRouter.post("/extract/html", async (context) => {
  const validationResult = await requestValidator.parseExtractFromHtmlQueryParams(context.req)

  if (validationResult instanceof ValidationError) {
    return context.json<ErrorResponse>(new ErrorResponse(validationResult.error), 400)
  }

  try {
    const params = validationResult as ExtractFromHtmlQueryParams

    const result = extractionService.extractContentFromHtml(params.html, params.url)

    if (result.success) {
      return context.json(new ExtractResponse(result.url, result.pageContentHtml!!))
    } else {
      return context.json<ErrorResponse>(new ErrorResponse(result.errorMessage ?? "Extraction failed"), 500)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return context.json<ErrorResponse>(new ErrorResponse("Extraction failed", message), 500)
  }
})


