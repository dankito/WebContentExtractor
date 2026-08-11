// Must be the first import: installs linkedom's DOMParser as the global
// before Turndown's own module body runs and picks its parser.
import "../html/dom-parser-polyfill.ts"

import type { HtmlToMarkdownConverter } from "./HtmlToMarkdownConverter.ts"
import type { ConvertToMarkdownOptions } from "./ConvertToMarkdownOptions.ts"
import type { Result } from "../../model/Result.ts"
import { SuccessResult } from "../../model/SuccessResult.ts"

import TurndownService from "turndown"; // import after patching the global
import { gfm } from "@joplin/turndown-plugin-gfm"


interface TurndownOptions {
  headingStyle: "setext" | "atx"
  hr: string
  bulletListMarker: "-" | "+" | "*"
  codeBlockStyle: "indented" | "fenced"
  fence: "```" | "~~~"
  emDelimiter: "_" | "*"
  strongDelimiter: "__" | "**"
  linkStyle: "inlined" | "referenced"
  linkReferenceStyle: "full" | "collapsed" | "shortcut"
}

/**
 * HtmlToMarkdownConverter backed by Turndown (+ turndown-plugin-gfm for
 * tables/strikethrough/task lists), parsed via linkedom instead of jsdom so
 * it runs on Bun without native dependencies.
 *
 * Secondary/fallback implementation — see KreuzbergHtmlToMarkdownConverter
 * for the primary, higher-fidelity, higher-throughput converter.
 *
 * GFM (GitHub Flavored Markdown) — GitHub's superset of CommonMark that adds tables, strikethrough (~~text~~), task lists (- [ ]),
 * and autolinking of bare URLs. It's the de facto standard most tools target since plain CommonMark alone doesn't support tables.
 */
export class TurndownHtmlToMarkdownConverter implements HtmlToMarkdownConverter {

  convertToMarkdown(html: string, options?: ConvertToMarkdownOptions): Result<string> {
    const turndownService = this.createTurndownService(options)

    const result = turndownService.turndown(html)
    return SuccessResult.for(result)
  }


  private createTurndownService(options?: ConvertToMarkdownOptions): TurndownService {
    const turndownService = new TurndownService(this.toTurndownOptions(options))
    turndownService.use(gfm)

    if (!!!options?.includeImages) {
      turndownService.addRule("skip-images", {
        // @ts-ignore
        filter: [ "img", "svg" ],
        replacement: () => "",
      })
    } else {
      turndownService.addRule("include-images (svg)", {
        // @ts-ignore
        filter: "svg", replacement: (content: string, node: HTMLElement) => {
          return this.svgToMarkdownImage(node)
        }
      })
    }

    return turndownService
  }

  /**
   * Base64-encodes an inline <svg> element's markup into a Markdown image
   * with a `data:image/svg+xml;base64,...` URI, e.g.
   * `![SVG Image](data:image/svg+xml;base64,PHN2ZyB4bWxucz0i...)`.
   */
  private svgToMarkdownImage(svgElement: Element): string {
    const svgMarkup = svgElement.outerHTML
    const base64 = Buffer.from(svgMarkup, "utf-8").toString("base64")
    const alt = this.extractSvgAltText(svgElement) ?? "SVG Image"
    return `![${alt}](data:image/svg+xml;base64,${base64})`
  }

  /** Prefers aria-label, then <title>, falling back to undefined. */
  private extractSvgAltText(svgElement: Element): string | undefined {
    const ariaLabel = svgElement.getAttribute("aria-label")
    if (ariaLabel) {
      return ariaLabel
    }

    const title = svgElement.querySelector("title")
    const titleText = title?.textContent?.trim()
    if (titleText) {
      return titleText
    }

    return undefined
  }


  private toTurndownOptions(
    options: ConvertToMarkdownOptions | undefined,
  ): Partial<TurndownOptions> {
    const turndownOptions: TurndownOptions = {
      // Sensible defaults — chosen to line up with the Kreuzberg converter's
      // defaults so both implementations produce comparable output for the
      // same input.
      headingStyle: "atx",
      hr: "---",
      bulletListMarker: "-",
      codeBlockStyle: "fenced",
      fence: "```",
      emDelimiter: "*",
      strongDelimiter: "**",
      linkStyle: "inlined",
      linkReferenceStyle: "full",
    }

    // options is currently only consulted for `includeImages`, handled via
    // addRule() above (Turndown has no built-in image on/off switch).
    // Left here for parity with the Kreuzberg conversion method and as the
    // place to map any future TurndownOptions-backed fields.
    void options

    // Strip undefined keys so we don't override Turndown's own defaults
    // with explicit `undefined` values.
    return Object.fromEntries(
      Object.entries(turndownOptions).filter(([, value]) => value !== undefined),
    ) as Partial<TurndownOptions>
  }
}