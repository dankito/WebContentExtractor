import { Context, Hono } from "hono"
import { DI } from "../service/DI.ts"
import { ErrorResponse } from "@shared/model/responses/ErrorResponse.ts"
import { ExtractResponse } from "@shared/model/responses/ExtractResponse.ts"
import type { ExtractFromHtmlRequest } from "../model/requestParameter/ExtractFromHtmlRequest.ts"
import type { ExtractedContent } from "../model/ExtractedContent.ts"
import type { ExtractFromUrlRequest } from "../model/requestParameter/ExtractFromUrlRequest.ts"
import { ExtractRequestBase } from "../model/requestParameter/ExtractRequestBase.ts"
import type { Result } from "../model/Result.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import { validator } from "hono-openapi"
import { ExtractFromHtmlSchema, ExtractFromUrlSchema, MultiFormatFromHtmlRequestSchema, MultiFormatRequestSchema } from "../model/requestParameter/ValidationSchemas.ts"
import { ResponseFormat } from "../model/responses/ResponseFormat.ts"
import { type StandardSchemaV1 } from "@standard-schema/spec"
import type { MultiFormatRequest } from "@shared/model/requests/MultiFormatRequest.ts"
import { ExtractRoutesOpenApiDescriptions } from "./openApi/ExtractRoutesOpenApiDescriptions.ts"
import type { MultiFormatFromHtmlRequest } from "@shared/model/requests/MultiFormatFromHtmlRequest.ts"
import type { OutputSelection } from "@shared/model/requests/OutputSelection.ts"


export const pageContentExtractionRouter = new Hono()


const extractionService = DI.pageContentExtractionService

const requestValidator = DI.requestValidator

const httpUtil = DI.httpUtil



const validationHook = (result: any, context: Context) => {
  if (!result.success) {
    const errors = result.error as StandardSchemaV1.Issue[]
    console.warn("Validation failed", errors ? errors.map(error => `${(error.path ?? ["<no_path_given>"]).join("/")}: ${error.message}`).join(", ") : "error array not set")
    return context.json(new ErrorResponse(errors?.length ? errors[0].message : ""), 400)
  }
}


/**
 * GET /extract?url=...&format=...&includeMetadata=...&timeout=...&userAgent=...
 *
 * Quick, cacheable single-call extraction via query params.
 */
pageContentExtractionRouter.get("/",
  ExtractRoutesOpenApiDescriptions.ExtractGet,
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
  ExtractRoutesOpenApiDescriptions.ExtractPost,
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
  ExtractRoutesOpenApiDescriptions.ExtractHtmlPost,
  validator("json", ExtractFromHtmlSchema, validationHook),
  async (context) => {
  return await extractFromHtml(context)
})


pageContentExtractionRouter.post("/multi-format",
  ExtractRoutesOpenApiDescriptions.ExtractMultipleFormatsPost,
  validator("json", MultiFormatRequestSchema, validationHook),
  async (context: Context) => {
  return await extractMultipleFormats(context)
})

pageContentExtractionRouter.post("/multi-format/html",
  ExtractRoutesOpenApiDescriptions.ExtractMultipleFormatsFromHtmlPost,
  validator("json", MultiFormatFromHtmlRequestSchema, validationHook),
  async (context: Context) => {
    return await extractMultipleFormatsFromHtml(context)
  })


async function extractFromUrl(context: Context, extractFromBody: boolean) {
  const target = extractFromBody ? "json" : "query"
  const data = (context.req as any).valid(target)

  try {
    const params: ExtractFromUrlRequest = requestValidator.mapToExtractFromUrlParams(data)

    const result = await extractionService.extractContentFromUrl(params)

    return mapToResponse(params, result, context)
  } catch (error) {
    return createErrorResponseFromError(error, context)
  }
}

async function extractFromHtml(context: Context) {
  const data = (context.req as any).valid("json")

  try {
    const params: ExtractFromHtmlRequest = requestValidator.mapToExtractFromHtmlParams(data)

    const result = extractionService.extractContentFromHtml(params.html, params.url)

    return mapToResponse(params, result, context)
  } catch (error) {
    return createErrorResponseFromError(error, context)
  }
}

async function extractMultipleFormats(context: Context) {
  const data = (context.req as any).valid("json")

  try {
    const request: MultiFormatRequest = requestValidator.mapToMultiFormatRequest(data)
    const validationError = isOutputSelectionValid(request.include)
    if (validationError) {
      return returnErrorResponse(validationError, context)
    }

    const result = await extractionService.extractMultipleFormats(request)
    if (result.success === false) {
      return returnErrorResponse(result, context)
    } else {
      return context.json(result.data)
    }
  } catch (error) {
    return createErrorResponseFromError(error, context)
  }
}

async function extractMultipleFormatsFromHtml(context: Context) {
  const data = (context.req as any).valid("json")

  try {
    const request: MultiFormatFromHtmlRequest = requestValidator.mapToMultiFormatFromHtmlRequest(data)
    const validationError = isOutputSelectionValid(request.include)
    if (validationError) {
      return returnErrorResponse(validationError, context)
    }

    const result = await extractionService.extractMultipleFormatsFromHtml(request)
    if (result.success === false) {
      return returnErrorResponse(result, context)
    } else {
      return context.json(result.data)
    }
  } catch (error) {
    return createErrorResponseFromError(error, context)
  }
}

function isOutputSelectionValid(include: OutputSelection): ErrorResult | undefined {
  const isAtLeastOneOutputFormatRequested = include.rawHtml === true || include.rawMarkdown === true || include.rawText === true ||
    include.contentHtml === true || include.contentMarkdown === true || include.contentText === true

  if (isAtLeastOneOutputFormatRequested) {
    return undefined
  } else {
    return ErrorResult.for("One of the output formats (rawHtml, rawMarkdown, rawText, " +
      "contentHtml, contentMarkdown, or contentText) must be requested", true)
  }
}

function mapToResponse(params: ExtractRequestBase, result: Result<ExtractedContent>, context: Context) {
  if (result.success === false) {
    console.warn("Extracting content failed", result.details)
    return returnErrorResponse(result, context)
  } else {
    const content = result.data
    const format = httpUtil.getPreferredResponseFormat(context.req)

    if (format === ResponseFormat.Html) {
      return context.html(content.pageContentHtml)
    } else if (format === ResponseFormat.Markdown) {
      const conversionResult = extractionService.convertToMarkdown(content.pageContentHtml, params.convertToMarkdownOptions)
      if (conversionResult.success) {
        return returnMarkdown(conversionResult.markdown!, context)
      } else {
        return returnErrorResponse(ErrorResult.for(conversionResult.error!), context)
      }
    } else if (format === ResponseFormat.Text) {
      const result = extractionService.convertToPlainText(content.pageContentHtml, params.convertToPlainTextOptions)
      if (result.success === false) {
        return returnErrorResponse(ErrorResult.for(result.error!), context)
      } else {
        return context.text(result.text!)
      }
    } else {
      return context.json(new ExtractResponse(content.url, content.pageContentHtml, params.includeMetadata ? content.metadata : undefined))
    }
  }
}

function returnMarkdown(markdown: string, context: Context): Response {
  return context.body(markdown, 200, {
    "Content-Type": "text/markdown; charset=UTF-8",
  })
}


function createErrorResponseFromError(error: unknown, context: Context): Response {
  return returnErrorResponse(ErrorResult.forError(error), context)
}

function returnErrorResponse(error: ErrorResult, context: Context): Response {
  const response = new ErrorResponse(error.details.errorMessage, error.details.error?.cause?.toString())

  return context.json<ErrorResponse>(response, error.details.isBadRequest ? 400 : 500)
}


