import { ConvertToPlainTextOptions } from "./ConvertToPlainTextOptions.ts"
import type { HtmlToTextConverter } from "./HtmlToTextConverter.ts"

export class ContentConverterService {

  constructor(
    private readonly htmlToTextConverter: HtmlToTextConverter,
  ) { }

  convertToPlainText(html: string, options?: ConvertToPlainTextOptions): string {
    return this.htmlToTextConverter.convertToPlainText(html, options)
  }

}