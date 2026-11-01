import type { Context, Hono } from "hono"
import { ErrorResponse } from "./ErrorResponse"
import { OpenWebUiPageExtractionResult } from "./OpenWebUiPageExtractionResult"
import { PageContentExtractionService } from "../../service/PageContentExtractionService.ts"
import { ExtractFromUrlRequest } from "../../model/requestParameter/ExtractFromUrlRequest.ts"
import { ResponseFormat } from "../../model/responses/ResponseFormat.ts"
import { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions.ts"
import { WebRequestOptions } from "@shared/model/WebRequestOptions.ts"
import { ErrorUtil } from "../../service/utils/ErrorUtil.ts"
import type { ExtractedMetadata } from "@shared/model/ExtractedMetadata.ts"

export class OpenWebUiRouter {

  constructor(private readonly extractionService: PageContentExtractionService) { }


  addRoutes(router: Hono) {
    router.post("/openwebui", async context => {
      return this.handleWebLoaderRequest(context)
    })
  }

  private async handleWebLoaderRequest(context: Context): Promise<Response> {
    let body: Record<string, string>

    try {
      body = await context.req.json()
    } catch {
      return context.json<ErrorResponse>(new ErrorResponse("Invalid JSON body"), 400)
    }

    const urls = body.urls
    if (!urls || !Array.isArray(urls)) {
      return context.json(new ErrorResponse("Missing required parameter which has to be an array of strings: urls"))
    }

    try {
      const results = await this.extractPageContents(urls)
      return context.json(results)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      return context.json<ErrorResponse>({ error: "Extraction failed", details: message }, 500)
    }
  }


  private async extractPageContents(urls: string[]): Promise<OpenWebUiPageExtractionResult[]> {
    const markdownConversionOptions = new MarkdownConversionOptions(undefined, true, false)
    // by default, we timeout a single request after 15 seconds
    const webRequestOptions = new WebRequestOptions(undefined, undefined, 15_000, true)

    return await Promise.all(urls.map(async url =>
      this.extractPageContent(url, markdownConversionOptions, webRequestOptions)
    ))
  }

  private async extractPageContent(url: string, markdownConversionOptions: MarkdownConversionOptions, webRequestOptions: WebRequestOptions): Promise<OpenWebUiPageExtractionResult> {
    if (this.isValidHttpUrl(url) == false) {
      return this.pageErrorResult(url, `Only http and https URLs are supported: ${url}`)
    }

    try {
      const result = await this.extractionService.extractContentFromUrl(new ExtractFromUrlRequest(url, ResponseFormat.Markdown, true, markdownConversionOptions, undefined, webRequestOptions))
      if (result.success == false) {
        return this.pageErrorResult(url, result.details.errorMessage)
      } else {
        const markdownConversionResult = this.extractionService.convertHtmlToMarkdown(result.data.pageContentHtml, markdownConversionOptions)
        if (markdownConversionResult.success == false) {
          return this.pageErrorResult(url, markdownConversionResult.error!)
        } else {
          return this.pageSuccessResult(url, markdownConversionResult.markdown!, result.data.metadata)
        }
      }
    } catch (error) {
      console.error(`Failed to extract content for ${url}:`, error)

      return this.pageErrorResult(url, ErrorUtil.errorMessageOfError(error))
    }
  }

  private pageSuccessResult(url: string, markdown: string, metadata?: ExtractedMetadata): OpenWebUiPageExtractionResult {
    return new OpenWebUiPageExtractionResult(
      markdown,
      { "source": url, title: metadata?.title, author: metadata?.byline, summary: metadata?.excerpt, siteName: metadata?.siteName }
    )
  }

  private pageErrorResult(url: string, errorMessage: string): OpenWebUiPageExtractionResult {
    return new OpenWebUiPageExtractionResult(
      `Error loading url ${url}`,
      { "source": url, error: true, error_message: errorMessage }
    )
  }


  private isValidHttpUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }

}