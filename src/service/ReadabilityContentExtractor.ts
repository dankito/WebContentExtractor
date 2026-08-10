import {Readability} from "@mozilla/readability"
import { ExtractResult } from "../model/ExtractResult.ts"
import {DomService} from "./html/DomService"
import {DI} from "./DI"

export class ReadabilityContentExtractor {

  constructor(
    private readonly domService: DomService = DI.domService,
  ) { }


  cleanAndExtractReadableContent(html: string, url?: string): ExtractResult {
    const document = this.domService.parseToDocument(html, url)

    return this.extractReadableContent(document, url)
  }

  extractReadableContent(document: Document, url?: string): ExtractResult {
    try {
      const reader = new Readability(document, { charThreshold: 0 })
      const parsed = reader.parse()

      if (!!parsed && parsed.content) {
        return ExtractResult.successHtml(url, parsed.content, parsed.textContent ?? undefined)
      } else {
        return ExtractResult.error(url, "No content found")
      }
    } catch (error) {
      console.error(`Extracting content failed for ${url}`, error)
      return ExtractResult.error(url, error instanceof Error ? error.message : `Extracting content failed for ${url} with error: ${error}`)
    }
  }
}