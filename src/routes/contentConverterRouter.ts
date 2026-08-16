import { Context, Hono } from "hono"
import { DI } from "../service/DI.ts"
import { ErrorResponse } from "@shared/model/responses/ErrorResponse.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import { describeRoute, resolver, validator } from "hono-openapi"
import { ConvertHtmlRequestSchema, ErrorResponseSchema, MarkdownConversionResultSchema } from "../model/requestParameter/ValidationSchemas.ts"
import { ResponseFormat } from "../model/responses/ResponseFormat.ts"
import { type StandardSchemaV1 } from "@standard-schema/spec"
import type { ConvertHtmlRequest } from "@shared/model/requests/ConvertHtmlRequest.ts"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult.ts"
import type { TextConversionResult } from "@shared/model/TextConversionResult.ts"


export const contentConverterRouter = new Hono()


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


const ConvertHtmlPostDescription = describeRoute({
  summary: "Converts HTML to Markdown or text",
  description: "If Accept header is set to 'text/plain', the response will be in plain text. If Accept header is set to 'text/markdown', the response will be in Markdown. " +
    "If textConversionOptions is set and markdownConversionOptions is not set, the response will be a TextConversionResult object as JSON. " +
    "Otherwise, the response will be a MarkdownConversionResult object as JSON.",
  tags: [ "Convert" ],
  responses: {
    200: {
      description: "Successful extraction",
      content: {
        "application/json": { schema: resolver(MarkdownConversionResultSchema) },
        // TODO: multiple response formats for the same media type cannot be specified
        // "application/json": { schema: resolver(TextConversionResultSchema) },
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
})


contentConverterRouter.post("/convert",
  ConvertHtmlPostDescription,
  validator("json", ConvertHtmlRequestSchema, validationHook),
  async (context: Context) => {
    return convertHtml(context)
  })


function convertHtml(context: Context) {
  const data = (context.req as any).valid("json")

  try {
    const request: ConvertHtmlRequest = requestValidator.mapToConvertHtmlRequest(data)
    const format = httpUtil.getPreferredResponseFormat(context.req)

    console.log("request", request.textConversionOptions, !!!request.markdownConversionOptions, request.textConversionOptions && !!!request.markdownConversionOptions, request)

    if (format === ResponseFormat.Text) {
      return convertHtmlToText(request, context, false)
    } else if (format === ResponseFormat.Markdown) {
      return convertHtmlToMarkdown(request, context, false)
    } else if (request.textConversionOptions && !!!request.markdownConversionOptions) {
      return convertHtmlToText(request, context, true)
    } else {
      return convertHtmlToMarkdown(request, context, true)
    }
  } catch (error) {
    return createErrorResponseFromError(error, context)
  }
}

function convertHtmlToMarkdown(request: ConvertHtmlRequest, context: Context, returnAsJson: boolean) {
  const result: MarkdownConversionResult = extractionService.convertHtmlToMarkdown(request.html, request.markdownConversionOptions)
  if (result.success === false) {
    return returnErrorResponse(ErrorResult.for(result.error!), context)
  } else if (returnAsJson) {
    return context.json(result)
  } else {
    return returnMarkdown(result.markdown!, context)
  }
}

function convertHtmlToText(request: ConvertHtmlRequest, context: Context, returnAsJson: boolean) {
  const result: TextConversionResult = extractionService.convertHtmlToText(request.html, request.textConversionOptions)
  if (result.success === false) {
    return returnErrorResponse(ErrorResult.for(result.error!), context)
  } else if (returnAsJson) {
    return context.json(result)
  } else {
    return returnText(result.text!, context)
  }
}


// TODO: this is duplicated code

function returnMarkdown(markdown: string, context: Context): Response {
  return context.body(markdown, 200, {
    "Content-Type": "text/markdown; charset=UTF-8",
  })
}

function returnText(text: string, context: Context): Response {
  return context.text(text)
}


function createErrorResponseFromError(error: unknown, context: Context): Response {
  return returnErrorResponse(ErrorResult.forError(error), context)
}

function returnErrorResponse(error: ErrorResult, context: Context): Response {
  const response = new ErrorResponse(error.details.errorMessage, error.details.error?.cause?.toString())

  return context.json<ErrorResponse>(response, error.details.isBadRequest ? 400 : 500)
}


