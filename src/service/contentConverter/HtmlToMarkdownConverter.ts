import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { Result } from "../../model/Result"

export interface HtmlToMarkdownConverter {

  convertToMarkdown(html: string, options?: MarkdownConversionOptions): Result<string>

}