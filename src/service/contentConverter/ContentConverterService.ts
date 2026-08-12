import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import type { HtmlToTextConverter } from "./HtmlToTextConverter"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"
import type { HtmlToMarkdownConverter } from "./HtmlToMarkdownConverter"
import { TextConversionResult } from "@shared/model/TextConversionResult.ts"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult.ts"

export class ContentConverterService {

  constructor(
    private readonly htmlToMarkdownConverter: HtmlToMarkdownConverter,
    private readonly htmlToTextConverter: HtmlToTextConverter,
  ) { }


  convertToMarkdown(html: string, options?: MarkdownConversionOptions): MarkdownConversionResult {
    return this.htmlToMarkdownConverter.convertToMarkdown(html, options)
  }

  convertToPlainText(html: string, options?: TextConversionOptions): TextConversionResult {
    return this.htmlToTextConverter.convertToPlainText(html, options)
  }

}