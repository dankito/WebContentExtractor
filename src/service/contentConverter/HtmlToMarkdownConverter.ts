import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult.ts"

export interface HtmlToMarkdownConverter {

  convertToMarkdown(html: string, options?: MarkdownConversionOptions): MarkdownConversionResult

}