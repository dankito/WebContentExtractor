import type { ConvertToMarkdownOptions } from "./ConvertToMarkdownOptions.ts"
import type { Result } from "../../model/Result.ts"

export interface HtmlToMarkdownConverter {

  convertToMarkdown(html: string, options?: ConvertToMarkdownOptions): Result<string>

}