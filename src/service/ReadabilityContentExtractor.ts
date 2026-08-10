import {Readability} from "@mozilla/readability"
import { ExtractedContent } from "../model/ExtractedContent.ts"
import {DomService} from "./html/DomService"
import {DI} from "./DI"
import type { Result } from "../model/Result.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import { SuccessResult } from "../model/SuccessResult.ts"
import type { HtmlCleaner } from "./html/HtmlCleaner.ts"

// noinspection HtmlRequiredLangAttribute
export class ReadabilityContentExtractor {

  constructor(
    private readonly domService: DomService = DI.domService,
    private readonly htmlCleaner: HtmlCleaner = DI.htmlCleaner,
  ) { }


  cleanAndExtractReadableContent(html: string, url?: string): Result<ExtractedContent> {
    html = this.htmlCleaner.stripComments(html)

    let document = this.domService.parseToDocument(html, url)

    // Readability requires that html is wrapped in <html><body>...</body></html> so ensuring that the html shell is there
    if (!!!document.documentElement.querySelector("body")) {
      console.log("No body found in html, adding html shell")
      const htmlWithHtmlShell = this.ensureHtmlShell(html)
      document = this.domService.parseToDocument(htmlWithHtmlShell, url)
    }

    return this.extractReadableContent(document, url)
  }

  extractReadableContent(document: Document, url?: string): Result<ExtractedContent> {
    try {
      this.htmlCleaner.sanitizeHtml(document)
      if (this.htmlCleaner.isTooLong(document)) {
        console.error(`HTML was too long for ${url}`)
        return ErrorResult.for(`HTML was too long for ${url}`)
      }

      const reader = new Readability(document, { charThreshold: 0 })
      const parsed = reader.parse()

      if (!!parsed && parsed.content) {
        return SuccessResult.for(new ExtractedContent(url, parsed.content, parsed.textContent ?? undefined))
      } else {
        return ErrorResult.for("No content found")
      }
    } catch (error) {
      console.error(`Extracting content failed for ${url}`, error)
      return ErrorResult.for(error instanceof Error ? error.message : `Extracting content failed for ${url} with error: ${error}`, error instanceof Error ? error : undefined)
    }
  }


  private ensureHtmlShell(html: string): string {
    const trimmed = html.trim()

    // Pull out a leading doctype, if present, so we don't nest it inside <body>
    const doctypeMatch = trimmed.match(/^<!DOCTYPE[^>]*>/i)
    const doctype = doctypeMatch ? doctypeMatch[0] : ""
    const rest = doctype ? trimmed.slice(doctype.length).trim() : trimmed

    const hasHtml = /<html[\s>]/i.test(rest)
    const hasBody = /<body[\s>]/i.test(rest)

    let shell
    if (hasHtml) {
      // already has <html>, leave structure alone
      shell = rest
    } else if (hasBody) {
      // has <body> but no <html> wrapper — just add the <html>/<head> shell
      shell = `<html><head></head>${rest}</html>`
    } else {
      // has neither — wrap fully
      shell = `<html><head></head><body>${rest}</body></html>`
    }

    return doctype ? `${doctype}\n${shell}` : shell
  }
}