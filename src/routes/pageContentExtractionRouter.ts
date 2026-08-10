import { Context, Hono } from "hono"
import { DI } from "../service/DI.ts"
import { ErrorResponse } from "../model/responses/ErrorResponse.ts"
import { ExtractResponse } from "../model/responses/ExtractResponse.ts"
import type { ExtractFromHtmlQueryParams } from "../model/requestParameter/ExtractFromHtmlQueryParams.ts"
import type { ExtractedContent } from "../model/ExtractedContent.ts"


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

  if (validationResult.success === false) {
    return context.json<ErrorResponse>(ErrorResponse.from(validationResult), 400)
  }

  try {
    const params: ExtractFromHtmlQueryParams = validationResult.data

    const result = extractionService.extractContentFromHtml(params.html, params.url)

    if (result.success) {
      return mapToResponse(params, result.data, context)
    } else {
      return context.json<ErrorResponse>(ErrorResponse.from(result), 500)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return context.json<ErrorResponse>(new ErrorResponse("Extraction failed", message), 500)
  }
})


function mapToResponse(params: ExtractFromHtmlQueryParams, content: ExtractedContent, context: Context) {
  return context.json(new ExtractResponse(content.url, content.pageContentHtml, params.includeMetadata ? content.metadata : undefined))
}


