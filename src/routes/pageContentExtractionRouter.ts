import { Context, Hono } from "hono"
import { DI } from "../service/DI.ts"
import { ErrorResponse } from "../model/responses/ErrorResponse.ts"
import { ExtractResponse } from "../model/responses/ExtractResponse.ts"
import type { ExtractFromHtmlParams } from "../model/requestParameter/ExtractFromHtmlParams.ts"
import type { ExtractedContent } from "../model/ExtractedContent.ts"
import type { ExtractFromUrlParams } from "../model/requestParameter/ExtractFromUrlParams.ts"
import { ExtractParamsBase } from "../model/requestParameter/ExtractParamsBase.ts"
import type { Result } from "../model/Result.ts"
import { ErrorResult } from "../model/ErrorResult.ts"


export const pageContentExtractionRouter = new Hono()


const extractionService = DI.pageContentExtractionService

const requestValidator = DI.requestValidator



/**
 * GET /extract?url=...&format=...&includeMetadata=...&timeout=...&userAgent=...
 *
 * Quick, cacheable single-call extraction via query params.
 */
pageContentExtractionRouter.get("/extract", async (context) => {
  return await extractFromUrl(context, false)
})

/**
 * POST /extract
 * Body: { url, format?, includeMetadata?, timeout?, userAgent? }
 *
 * Preferred when passing long URLs or additional options.
 */
pageContentExtractionRouter.post("/extract", async (context) => {
  return await extractFromUrl(context, true)
})


/**
 * POST /extract/html
 * Body: { html, url?, format?, includeMetadata? }
 *
 * Extract content from provided HTML.
 */
pageContentExtractionRouter.post("/extract/html", async (context) => {
  const validationResult = await requestValidator.parseExtractFromHtmlParams(context.req)

  if (validationResult.success === false) {
    return context.json<ErrorResponse>(ErrorResponse.from(validationResult), 400)
  }

  try {
    const params: ExtractFromHtmlParams = validationResult.data

    const result = extractionService.extractContentFromHtml(params.html, params.url)

    return mapToResponse(params, result, context)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return context.json<ErrorResponse>(new ErrorResponse("Extraction failed", message), 500)
  }
})



async function extractFromUrl(context: Context, extractFromBody: boolean) {
  const request = context.req

  const validationResult = await requestValidator.parseExtractFromUrlParams(request, extractFromBody)

  if (validationResult.success === false) {
    return context.json<ErrorResponse>(ErrorResponse.from(validationResult), 400)
  }

  try {
    const params: ExtractFromUrlParams = validationResult.data

    const result = await extractionService.extractContentFromUrl(params)

    return mapToResponse(params, result, context)
  } catch (error) {
    return context.json<ErrorResponse>(ErrorResponse.from(ErrorResult.forError(error)), 500)
  }
}

function mapToResponse(params: ExtractParamsBase, result: Result<ExtractedContent>, context: Context) {
  if (result.success === false) {
    return context.json<ErrorResponse>(ErrorResponse.from(result), 500)
  } else {
    const content = result.data
    const acceptHeaders = (context.req.header("Accept") ?? "").split(",").map(format => format.trim().toLowerCase())

    if (acceptHeaders.includes("text/html")) {
      return context.html(content.pageContentHtml)
    } else if (acceptHeaders.includes("text/plain")) {
      return context.text(extractionService.convertToPlainText(content, params.convertToPlainTextOptions))
    } else {
      return context.json(new ExtractResponse(content.url, content.pageContentHtml, params.includeMetadata ? content.metadata : undefined))
    }
  }
}


