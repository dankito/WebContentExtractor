import type { Hono } from "hono"
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPTransport } from '@hono/mcp'
import {
  ConvertHtmlRequestSchema,
  ExtractFromHtmlSchema,
  ExtractFromUrlRequestBodySchema, MultiFormatFromHtmlRequestSchema,
  MultiFormatFromUrlRequestSchema
} from "../model/requestParameter/ValidationSchemas.ts"
import { DI } from "../service/DI.ts"
import pkg from "../../package.json"

export class McpRouter {

  addMcpServerRoutes(app: Hono) {
    app.all("/mcp", async (c) => {
      const sessionId = c.req.header('mcp-session-id')
      console.log(`sessionId: `, sessionId)

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
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        }
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
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        }
      }
    )

    mcpServer.registerTool(
      "multi_format_from_url",
      {
        title: "Retrieve multiple output formats from URL",
        description: "Retrieve multiple output formats like raw HTML and content Markdown with a single call from a URL",
        inputSchema: MultiFormatFromUrlRequestSchema.shape,
      },
      async (args) => {
        const request = requestValidator.mapToMultiFormatFromUrlRequest(args)
        const result = await extractionService.extractMultipleFormatsFromUrl(request)
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        }
      }
    )

    mcpServer.registerTool(
      "multi_format_from_html",
      {
        title: "Retrieve multiple output formats from HTML",
        description: "Retrieve multiple output formats from provided HTML",
        inputSchema: MultiFormatFromHtmlRequestSchema.shape,
      },
      async (args) => {
        const request = requestValidator.mapToMultiFormatFromHtmlRequest(args)
        const result = await extractionService.extractMultipleFormatsFromHtml(request)
        return {
          content: [{ type: "text", text: JSON.stringify(result) }]
        }
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
        const textResult = extractionService.convertHtmlToText(request.html, request.textConversionOptions)
        return {
          content: [{ type: "text", text: JSON.stringify({ markdown: markdownResult, text: textResult }) }]
        }
      }
    )

    return mcpServer
  }

}