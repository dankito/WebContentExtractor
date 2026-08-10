import { convert } from "html-to-text"

export class ContentConverter {

  convertToPlainText(html: string): string {
    return convert(html, {
      // see `const DEFAULT_OPTIONS = {` in html-to-text.mjs for available options
      preserveNewlines: true,
      wordwrap: false,
      selectors: [
        { selector: "img", format: "skip" },
        { selector: "a", options: { ignoreHref: true } },

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