import { ConvertToPlainTextOptions } from "./ConvertToPlainTextOptions.ts"
import type { HtmlToTextConverter } from "./HtmlToTextConverter.ts"
import type { ConvertToMarkdownOptions } from "./ConvertToMarkdownOptions.ts"
import type { HtmlToMarkdownConverter } from "./HtmlToMarkdownConverter.ts"
import type { Result } from "../../model/Result.ts"

export class ContentConverterService {

  constructor(
    private readonly htmlToMarkdownConverter: HtmlToMarkdownConverter,
    private readonly htmlToTextConverter: HtmlToTextConverter,
  ) { }


  convertToMarkdown(html: string, options?: ConvertToMarkdownOptions): Result<string> {
    return this.htmlToMarkdownConverter.convertToMarkdown(html, options)
  }

  convertToPlainText(html: string, options?: ConvertToPlainTextOptions): string {
    return this.htmlToTextConverter.convertToPlainText(html, options)
  }

}