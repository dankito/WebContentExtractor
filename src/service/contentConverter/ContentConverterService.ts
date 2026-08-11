import { convert } from "html-to-text"
import { ConvertToPlainTextOptions } from "./ConvertToPlainTextOptions.ts"

export class ContentConverterService {

  convertToPlainText(html: string, options?: ConvertToPlainTextOptions): string {
    const preserveLinkUrls = options?.preserveLinkUrls ?? false
    const preserveImageUrls = options?.preserveImageUrls ?? false

    return convert(html, {
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
  }

}