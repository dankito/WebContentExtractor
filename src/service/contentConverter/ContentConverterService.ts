import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { HtmlToTextConverter } from "./HtmlToTextConverter"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { HtmlToMarkdownConverter } from "./HtmlToMarkdownConverter"
import type { Result } from "../../model/Result"

export class ContentConverterService {

  constructor(
    private readonly htmlToMarkdownConverter: HtmlToMarkdownConverter,
    private readonly htmlToTextConverter: HtmlToTextConverter,
  ) { }


  convertToMarkdown(html: string, options?: MarkdownConversionOptions): Result<string> {
    return this.htmlToMarkdownConverter.convertToMarkdown(html, options)
  }

  convertToPlainText(html: string, options?: TextConversionOptions): string {
    return this.htmlToTextConverter.convertToPlainText(html, options)
  }

}