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
import { describeRoute, resolver, validator } from "hono-openapi"
import { ErrorResponseSchema, ExtractFromHtmlSchema, ExtractFromUrlSchema, ExtractResponseSchema } from "../model/requestParameter/ValidationSchemas.ts"
import { ResponseFormat } from "../model/responses/ResponseFormat.ts"
import { type StandardSchemaV1 } from "@standard-schema/spec"


export const pageContentExtractionRouter = new Hono()


const extractionService = DI.pageContentExtractionService

const requestValidator = DI.requestValidator

const httpUtil = DI.httpUtil

const tags: string[] = [ "Extract" ]



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
  describeRoute({
    summary: "Extract web page content from URL via query parameters",
    description: "Quick, cacheable single-call extraction via query params.",
    tags: tags,
    responses: {
      200: {
        description: "Successful extraction",
        content: {
          "application/json": { schema: resolver(ExtractResponseSchema) },
          "text/html": { schema: { type: "string" } },
          "text/markdown": { schema: { type: "string" } },
          "text/plain": { schema: { type: "string" } },
        },
      },
      400: {
        description: "Invalid request parameters",
        content: { "application/json": { schema: resolver(ErrorResponseSchema) } },
      },
      500: {
        description: "Extraction failed",
        content: { "application/json": { schema: resolver(ErrorResponseSchema) } },
      },
    },
  }),
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
  describeRoute({
    summary: "Extract web page content from URL via JSON body",
    description: "Preferred when passing long URLs or additional options.",
    tags: tags,
    responses: {
      200: {
        description: "Successful extraction",
        content: {
          "application/json": { schema: resolver(ExtractResponseSchema) },
          "text/html": { schema: { type: "string" } },
          "text/markdown": { schema: { type: "string" } },
          "text/plain": { schema: { type: "string" } },
        },
      },
      400: {
        description: "Invalid request body",
        content: { "application/json": { schema: resolver(ErrorResponseSchema) } },
      },
      500: {
        description: "Extraction failed",
        content: { "application/json": { schema: resolver(ErrorResponseSchema) } },
      },
    },
  }),
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
  describeRoute({
    summary: "Extract web page content from provided HTML",
    description: "Extract web page content from provided HTML code.",
    tags: tags,
    responses: {
      200: {
        description: "Successful extraction",
        content: {
          "application/json": { schema: resolver(ExtractResponseSchema) },
          "text/html": { schema: { type: "string" } },
          "text/markdown": { schema: { type: "string" } },
          "text/plain": { schema: { type: "string" } },
        },
      },
      400: {
        description: "Invalid request body",
        content: { "application/json": { schema: resolver(ErrorResponseSchema) } },
      },
      500: {
        description: "Extraction failed",
        content: { "application/json": { schema: resolver(ErrorResponseSchema) } },
      },
    },
  }),
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
  } catch (error) {
    return context.json<ErrorResponse>(ErrorResponse.from(ErrorResult.forError(error)), 500)
  }
}

function mapToResponse(params: ExtractParamsBase, result: Result<ExtractedContent>, context: Context) {
  if (result.success === false) {
    console.warn("Extracting content failed", result.details)
    return context.json<ErrorResponse>(ErrorResponse.from(result), result.details.isBadRequest ? 400 : 500)
  } else {
    const content = result.data
    const format = httpUtil.getPreferredResponseFormat(context.req)

    if (format === ResponseFormat.Html) {
      return context.html(content.pageContentHtml)
    } else if (format === ResponseFormat.Markdown) {
      const conversionResult = extractionService.convertToMarkdown(content, params.convertToMarkdownOptions)
      if (conversionResult.success) {
        return returnMarkdown(conversionResult.data, context)
      } else {
        return context.json<ErrorResponse>(ErrorResponse.from(conversionResult), 500)
      }
    } else if (format === ResponseFormat.Text) {
      return context.text(extractionService.convertToPlainText(content, params.convertToPlainTextOptions))
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


