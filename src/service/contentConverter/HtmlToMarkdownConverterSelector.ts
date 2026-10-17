import type { HtmlToMarkdownConverter } from "./HtmlToMarkdownConverter.ts"
import type { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions.ts"
import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult.ts"
import { KreuzbergHtmlToMarkdownConverter } from "./KreuzbergHtmlToMarkdownConverter.ts"
import { TurndownHtmlToMarkdownConverter } from "./TurndownHtmlToMarkdownConverter.ts"
import { MarkdownConverter } from "@shared/model/MarkdownConverter.ts"

export class HtmlToMarkdownConverterSelector implements HtmlToMarkdownConverter {

  constructor(readonly converters: HtmlToMarkdownConverter[]) { }


  convertToMarkdown(html: string, options?: MarkdownConversionOptions): MarkdownConversionResult {
    const convertersToTry = options?.converters && options?.converters?.length ? this.getConvertersToTry(options.converters) : this.converters
    let lastResult: MarkdownConversionResult

    for (const converter of convertersToTry) {
      lastResult = converter.convertToMarkdown(html, options)
      if (lastResult.success) {
        return lastResult
      }
    }

    return lastResult!
  }

  private getConvertersToTry(converters: MarkdownConverter[]): HtmlToMarkdownConverter[] {
    return converters.map(converter => {
      if (converter === MarkdownConverter.Kreuzberg) {
        return this.converters.find(it => it instanceof KreuzbergHtmlToMarkdownConverter)
      } else if (converter === MarkdownConverter.Turndown) {
        return this.converters.find(it => it instanceof TurndownHtmlToMarkdownConverter)
      }
    }).filter(it => it !== undefined)
  }

}