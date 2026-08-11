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
import { validator } from "hono-openapi"
import { ExtractFromHtmlSchema, ExtractFromUrlSchema } from "../model/requestParameter/ValidationSchemas.ts"


export const pageContentExtractionRouter = new Hono()


const extractionService = DI.pageContentExtractionService

const requestValidator = DI.requestValidator



const validationHook = (result: any, context: Context) => {
  if (!result.success) {
    return context.json(new ErrorResponse(result.error[0].message), 400)
  }
}


/**
 * GET /extract?url=...&format=...&includeMetadata=...&timeout=...&userAgent=...
 *
 * Quick, cacheable single-call extraction via query params.
 */
pageContentExtractionRouter.get("/",
  validator("query", ExtractFromUrlSchema, validationHook),
  async (context) => {
  return await extractFromUrl(context, false)
})

/**
 * POST /extract
 * Body: { url, format?, includeMetadata?, timeout?, userAgent? }
 *
 * Preferred when passing long URLs or additional options.
 */
pageContentExtractionRouter.post("/",
  validator("json", ExtractFromUrlSchema, validationHook),
  async (context) => {
    return await extractFromUrl(context, true)
  }
)


/**
 * POST /extract/html
 * Body: { html, url?, format?, includeMetadata? }
 *
 * Extract content from provided HTML.
 */
pageContentExtractionRouter.post("/html",
  validator("json", ExtractFromHtmlSchema, validationHook),
  async (context) => {
  return await extractFromHtml(context)
})



async function extractFromUrl(context: Context, extractFromBody: boolean) {
  const target = extractFromBody ? "json" : "query"
  const data = (context.req as any).valid(target)

  try {
    const params: ExtractFromUrlParams = requestValidator.mapToExtractFromUrlParams(data)

    const result = await extractionService.extractContentFromUrl(params)

    return mapToResponse(params, result, context)
  } catch (error) {
    return context.json<ErrorResponse>(ErrorResponse.from(ErrorResult.forError(error)), 500)
  }
}

async function extractFromHtml(context: Context) {
  const data = (context.req as any).valid("json")

  try {
    const params: ExtractFromHtmlParams = requestValidator.mapToExtractFromHtmlParams(data)

    const result = extractionService.extractContentFromHtml(params.html, params.url)

    return mapToResponse(params, result, context)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return context.json<ErrorResponse>(new ErrorResponse("Extraction failed", message), 500)
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


