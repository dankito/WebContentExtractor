import type { Hono } from "hono"
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPTransport } from '@hono/mcp'
import {
  ConvertHtmlRequestSchema,
  ErrorResponseSchema,
  ExtractFromHtmlSchema,
  ExtractFromUrlRequestBodySchema,
  ExtractResponseSchema,
  MultiFormatFromHtmlRequestSchema,
  MultiFormatFromUrlRequestSchema,
  MultiFormatResponseSchema
} from "../model/requestParameter/ValidationSchemas.ts"
import { DI } from "../service/DI.ts"
import pkg from "../../package.json"
import { ErrorResponse } from "@shared/model/responses/ErrorResponse.ts"
import { ExtractResponse } from "@shared/model/responses/ExtractResponse.ts"
import type { Result } from "../model/Result.ts"
import type { ExtractedContent } from "../model/ExtractedContent.ts"
import type { ExtractRequestBase } from "../model/requestParameter/ExtractRequestBase.ts"
import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse.ts"
import type { ErrorResult } from "../model/ErrorResult.ts"
import type { CallToolResult } from "@modelcontextprotocol/sdk/dist/esm/types.d.ts"
import { ResponseFormat } from "../model/responses/ResponseFormat.ts"

export class McpRouter {

  addMcpServerRoutes(app: Hono) {
    app.all("/mcp", async (c) => {
      const server = this.createMcpServer()
      const transport = new StreamableHTTPTransport()
      await server.connect(transport)
      return transport.handleRequest(c)
    })
  }

  private createMcpServer(): McpServer {
    const mcpServer = new McpServer({
      name: "Web Content Extractor",
      version: pkg.version,
      description: "A web content extraction service combining stealth fetching (anti-bot detection bypass), Readability-based content extraction, " +
        "HTML-to-Markdown/text conversion, and sanitization against prompt-injection payloads hidden in HTML."
    })

    const extractionService = DI.pageContentExtractionService
    const requestValidator = DI.requestValidator

    mcpServer.registerTool(
      "extract_from_url",
      {
        title: "Extract main content from URL",
        description: "Extract web page main content from a URL",
        inputSchema: ExtractFromUrlRequestBodySchema.shape,
      },
      async (args) => {
        const request = requestValidator.mapToExtractFromUrlRequest(args, true)
        const result = await extractionService.extractContentFromUrl(request)

        return this.mapExtractResponse(result, request)
      }
    )

    mcpServer.registerTool(
      "extract_from_html",
      {
        title: "Extract main content from HTML",
        description: "Extract web page main content from provided HTML",
        inputSchema: ExtractFromHtmlSchema.shape,
      },
      async (args) => {
        const request = requestValidator.mapToExtractFromHtmlRequest(args)
        const result = extractionService.extractContentFromHtml(request.html, request.url)

        return this.mapExtractResponse(result, request)
      }
    )

    mcpServer.registerTool(
      "multi_format_from_url",
      {
        title: "Retrieve multiple output formats from URL",
        description: "Retrieve multiple output formats like raw HTML and content Markdown with a single call from a URL",
        inputSchema: MultiFormatFromUrlRequestSchema.shape,
        outputSchema: MultiFormatResponseSchema.shape,
      },
      async (args) => {
        const request = requestValidator.mapToMultiFormatFromUrlRequest(args)
        const result = await extractionService.extractMultipleFormatsFromUrl(request)

        return this.mapMultiFormatResponse(result)
      }
    )

    mcpServer.registerTool(
      "multi_format_from_html",
      {
        title: "Retrieve multiple output formats from HTML",
        description: "Retrieve multiple output formats from provided HTML",
        inputSchema: MultiFormatFromHtmlRequestSchema.shape,
        outputSchema: MultiFormatResponseSchema.shape,
      },
      async (args) => {
        const request = requestValidator.mapToMultiFormatFromHtmlRequest(args)
        const result = await extractionService.extractMultipleFormatsFromHtml(request)

        return this.mapMultiFormatResponse(result)
      }
    )

    mcpServer.registerTool(
      "convert_html",
      {
        title: "Convert HTML",
        description: "Converts HTML to Markdown or text",
        inputSchema: ConvertHtmlRequestSchema.shape,
      },
      async (args) => {
        const request = requestValidator.mapToConvertHtmlRequest(args)
        const markdownResult = extractionService.convertHtmlToMarkdown(request.html, request.markdownConversionOptions)
        return {
          content: [{ type: "text", text: JSON.stringify(markdownResult) }]
        }
      }
    )

    return mcpServer
  }


  private mapExtractResponse(result: Result<ExtractedContent>, request: ExtractRequestBase): CallToolResult {
    if (result.success) {
      if (request.outputFormat === ResponseFormat.Html) {
        return {
          content: [{ type: "text", text: result.data.pageContentHtml }]
        }
      } else if (request.outputFormat === ResponseFormat.Markdown) {
        const markdown = DI.pageContentExtractionService.convertHtmlToMarkdown(result.data.pageContentHtml, request.markdownConversionOptions)
        return {
          content: [{ type: "text", text: markdown.markdown }]
        }
      } else if (request.outputFormat === ResponseFormat.Text) {
        const text = DI.pageContentExtractionService.convertHtmlToText(result.data.pageContentHtml, request.textConversionOptions)
        return {
          content: [{ type: "text", text: text.text }]
        }
      } else {
        return {
          structuredContent: ExtractResponseSchema.parse(result.data),
          content: [{ type: "text", text: JSON.stringify(new ExtractResponse(result.data.url, result.data.pageContentHtml, request.includeMetadata ? result.data.metadata : undefined)) }]
        }
      }
    } else {
      return this.mapErrorResponse(result)
    }
  }

  private mapMultiFormatResponse(result: Result<MultiFormatResponse>): CallToolResult {
    if (result.success) {
      return {
        structuredContent: MultiFormatResponseSchema.parse(result.data),
        content: [{ type: "text", text: JSON.stringify(result.data) }]
      }
    } else {
      return this.mapErrorResponse(result)
    }
  }

  private mapErrorResponse(result: ErrorResult): CallToolResult {
    const errorResponse = new ErrorResponse(result.details.errorMessage, result.details.error?.cause?.toString())

    return {
      isError: true,
      structuredContent: ErrorResponseSchema.parse(errorResponse),
      content: [{ type: "text", text: JSON.stringify(errorResponse) }]
    }
  }

}