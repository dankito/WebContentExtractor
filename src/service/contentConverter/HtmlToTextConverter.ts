import { convert } from "html-to-text"
import { TextConversionOptions } from "@shared/model/TextConversionOptions"
import { TextConversionResult } from "@shared/model/TextConversionResult.ts"
import { TextConverter } from "@shared/model/TextConverter.ts"
import { ErrorUtil } from "../utils/ErrorUtil.ts"

export class HtmlToTextConverter {

  convertToPlainText(html: string, options?: TextConversionOptions): TextConversionResult {
    const preserveLinkUrls = options?.preserveLinkUrls ?? false
    const preserveImageUrls = options?.preserveImageUrls ?? false

    try {
      const text = convert(html, {
        // see `const DEFAULT_OPTIONS = {` in html-to-text.mjs for available options
        preserveNewlines: true,
        wordwrap: false,
        selectors: [
          { selector: "a", options: { ignoreHref: preserveLinkUrls === false, hideLinkHrefIfSameAsText: true, linkBrackets: ['(', ')'] } },
          { selector: "img", format: preserveImageUrls ? "image" : "skip", options: { linkBrackets: ['(', ')'] } },

          { selector: "h1", options: { uppercase: false } },
          { selector: "h2", options: { uppercase: false } },
          { selector: "h3", options: { uppercase: false } },
          { selector: "h4", options: { uppercase: false } },
          { selector: "h5", options: { uppercase: false } },
          { selector: "h6", options: { uppercase: false } },

          { selector: "table", options: { uppercaseHeaderCells: false } },
        ],
      })

      return TextConversionResult.success(TextConverter.HtmlToText, text)
    } catch (error) {
      return TextConversionResult.error(TextConverter.HtmlToText, ErrorUtil.errorMessageOfError(error))
    }
  }

}