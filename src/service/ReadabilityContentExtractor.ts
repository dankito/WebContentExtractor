import {Readability} from "@mozilla/readability"
import { ExtractedContent } from "../model/ExtractedContent.ts"
import {DomService} from "./html/DomService"
import {DI} from "./DI"
import type { Result } from "../model/Result.ts"
import { ErrorResult } from "../model/ErrorResult.ts"
import { SuccessResult } from "../model/SuccessResult.ts"
import type { HtmlCleaner } from "./html/HtmlCleaner.ts"
import { ExtractedMetadata } from "@shared/model/ExtractedMetadata.ts"

export class ReadabilityContentExtractor {

  constructor(
    private readonly domService: DomService = DI.domService,
    private readonly htmlCleaner: HtmlCleaner = DI.htmlCleaner,
  ) { }


  cleanAndExtractReadableContent(html: string, url?: string): Result<ExtractedContent> {
    html = this.htmlCleaner.stripComments(html)

    // Readability requires that html is wrapped in <html><body>...</body></html> so ensuring that the html shell is there
    const document = this.domService.ensureHtmlShellAndParseToDocument(html, url)

    return this.extractReadableContent(html, document, url)
  }

  private extractReadableContent(html: string, document: Document, url?: string): Result<ExtractedContent> {
    try {
      this.htmlCleaner.sanitizeHtml(document)
      if (this.htmlCleaner.isTooLong(document)) {
        console.error(`HTML was too long for ${url}`)
        return ErrorResult.for(`HTML was too long for ${url}`)
      }

      const reader = new Readability(document, { charThreshold: 0 })
      const parsed = reader.parse()

      if (!!parsed && parsed.content) {
        return SuccessResult.for(new ExtractedContent(url, parsed.content, parsed.textContent ?? undefined, this.mapMetadata(html, parsed)))
      } else {
        return ErrorResult.for("No content found")
      }
    } catch (error) {
      console.error(`Extracting content failed for ${url}`, error)
      return ErrorResult.for(error instanceof Error ? error.message : `Extracting content failed for ${url} with error: ${error}`, false, error instanceof Error ? error : undefined)
    }
  }


  private mapMetadata(html: string, parsed: {
    title: string | null | undefined;
    content: string | null | undefined;
    textContent: string | null | undefined;
    length: number | null | undefined;
    excerpt: string | null | undefined;
    byline: string | null | undefined;
    dir: string | null | undefined;
    siteName: string | null | undefined;
    lang: string | null | undefined;
    publishedTime: string | null | undefined
  }): ExtractedMetadata {
    return new ExtractedMetadata(
      html.length,
      parsed.content?.length ?? undefined,
      parsed.length ?? undefined,

      parsed.title ?? undefined,
      parsed.excerpt ?? undefined,
      parsed.byline ?? undefined,
      parsed.dir ?? undefined,
      parsed.siteName ?? undefined,
      parsed.lang ?? undefined,
      parsed.publishedTime ?? undefined,
    )
  }

}