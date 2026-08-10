import { ExtractFromHtmlParams } from "../model/requestParameter/ExtractFromHtmlParams.ts"
import { ExtractFromUrlParams } from "../model/requestParameter/ExtractFromUrlParams.ts"
import { type HonoRequest } from "hono"
import type { Result } from "../model/Result.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import { SuccessResult } from "../model/SuccessResult.ts"
import { WebFetcherOptions } from "../webFetcher/WebFetcherOptions.ts"

export class RequestValidator {

  async parseExtractFromUrlParams(request: HonoRequest, extractFromBody: boolean): Promise<Result<ExtractFromUrlParams>> {
    let params: Record<string, string>

    try {
      params = extractFromBody ? await request.json() : request.query()
    } catch {
      return ErrorResult.for("Invalid JSON body")
    }

    const { url, includeMetadata } = params

    if (!url) {
      return ErrorResult.for("Missing required parameter: url")
    }

    if (!this.isValidHttpUrl(url)) {
      return ErrorResult.for(`Only http and https URLs are supported, ${url} is invalid`)
    }

    return SuccessResult.for(new ExtractFromUrlParams(url, this.parseBoolean(includeMetadata), this.parseWebFetcherOptions(params)))
  }


  async parseExtractFromHtmlParams(request: HonoRequest): Promise<Result<ExtractFromHtmlParams>> {
    let body: Record<string, string>

    try {
      body = await request.json()
    } catch {
      return ErrorResult.for("Invalid JSON body")
    }

    const { html, url, includeMetadata } = body

    if (!html) {
      return ErrorResult.for("Missing required parameter: html")
    }

    return SuccessResult.for(new ExtractFromHtmlParams(html, url, this.parseBoolean(includeMetadata)))
  }


  private isValidHttpUrl(url: string): boolean {
    try {
      const parsed = new URL(url)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }


  private parseWebFetcherOptions(params: Record<string, string>): WebFetcherOptions | undefined {
    const { timeout, userAgent, followRedirects } = params

    if (!!!timeout && !!!userAgent && !!!followRedirects) {
      return undefined
    }

    return new WebFetcherOptions(userAgent, this.parseInt(timeout), this.parseBoolean(followRedirects))
  }

  private parseInt(value?: string | number): number | undefined {
    if (!!!value) {
      return undefined
    }

    if (typeof value === "number") {
      return value
    }

    return Number.parseInt(value.trim())
  }

  private parseBoolean(value?: string | boolean): boolean {
    if (!!!value) {
      return false
    }

    if (typeof value === "boolean") {
      return value
    }

    const normalized = value.trim().toLowerCase()
    return normalized === "true" // may use: ['true', '1', 'yes', 'on'].includes(normalized)
  }

}