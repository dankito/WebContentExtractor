import { describeRoute, resolver } from "hono-openapi"
import { ErrorResponseSchema, ExtractResponseSchema, MultiFormatResponseSchema } from "../../model/requestParameter/ValidationSchemas.ts"

export class ExtractRoutesOpenApiDescriptions {

  static extractTags: string[] = [ "Extract" ]


  static ExtractGet = describeRoute({
    summary: "Extract web page content from URL via query parameters",
    description: "Quick, cacheable single-call extraction via query params.",
    tags: this.extractTags,
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
  })

  static ExtractPost = describeRoute({
    summary: "Extract web page content from URL via JSON body",
    description: "Preferred when passing long URLs or additional options.",
    tags: this.extractTags,
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
  })

  static ExtractHtmlPost = describeRoute({
    summary: "Extract web page content from provided HTML",
    description: "Extract web page content from provided HTML code.",
    tags: this.extractTags,
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
  })


  static ExtractMultipleFormatsFromUrlPost = describeRoute({
    summary: "Retrieve multiple output formats like raw HTML and content Markdown with a single call",
    description: "Choose between raw HTML, raw Markdown, raw text, content HTML, content Markdown, and content text which formats you like to retrieve.",
    tags: [ "Multiple formats" ],
    responses: {
      200: {
        description: "Successful extraction",
        content: {
          "application/json": { schema: resolver(MultiFormatResponseSchema) },
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

  static ExtractMultipleFormatsFromHtmlPost = describeRoute({
    summary: "Retrieve multiple output formats like raw Markdown and content HTML or Text with a single call",
    description: "Choose between raw HTML, raw Markdown, raw text, content HTML, content Markdown, and content text which formats you like to retrieve.",
    tags: [ "Multiple formats" ],
    responses: {
      200: {
        description: "Successful extraction",
        content: {
          "application/json": { schema: resolver(MultiFormatResponseSchema) },
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

}