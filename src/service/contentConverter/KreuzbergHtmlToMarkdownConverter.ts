import { CodeBlockStyle, type ConversionOptions, convert, HeadingStyle, HighlightStyle, LinkStyle, ListIndentType, NewlineStyle, OutputFormat } from "@kreuzberg/html-to-markdown"
import type { HtmlToMarkdownConverter } from "./HtmlToMarkdownConverter.ts"
import { ConvertToMarkdownOptions } from "./ConvertToMarkdownOptions.ts"
import type { Result } from "../../model/Result.ts"
import { SuccessResult } from "../../model/SuccessResult.ts"
import { ErrorResult } from "../../model/ErrorResult.ts"
import { WhitespaceMode } from "@kreuzberg/html-to-markdown-node"

/**
 * HtmlToMarkdownConverter backed by the Rust-core `@kreuzberg/html-to-markdown`
 * native (NAPI) binding. Works on Node.js >= 18 and Bun.
 */
export class KreuzbergHtmlToMarkdownConverter implements HtmlToMarkdownConverter {

  convertToMarkdown(html: string, options?: ConvertToMarkdownOptions): Result<string> {
    const result = convert(html, this.toConversionOptions(options))

    if (result.content !== undefined) { // keep empty output ("") which may be correct
      return SuccessResult.for(result.content)
    } else {
      console.log("HTML to Markdown conversion failed", result.warnings, result)

      return ErrorResult.for("Could not convert HTML to Markdown" + (result.warnings && result.warnings.length ? ": " + result.warnings.join(", ") : ""))
    }
  }


  private toConversionOptions(options: ConvertToMarkdownOptions | undefined,): ConversionOptions | undefined {
    const conversionOptions: ConversionOptions = {
      outputFormat: OutputFormat.Markdown,

      // default values, that what most people expect
      /**
       * Heading rendering style.
       * - "underlined": Setext-style (===/---) for h1/h2, ATX (#) for h3-h6
       * - "atx":        Always "# Heading"
       * - "atx_closed": Always "# Heading #"
       */
      headingStyle: HeadingStyle.Atx,
      listIndentType: ListIndentType.Spaces, // or "tabs"
      /** How hard line breaks (<br>) are rendered. */
      newlineStyle: NewlineStyle.Backslash, // "spaces"
      codeBlockStyle: CodeBlockStyle.Backticks,
      // percent-encodes every character that is not an RFC 3986
      //   unreserved character or `/`, producing a destination that all Markdown parsers handle
      //   correctly even when the URL contains `<`, `>`, spaces, or parentheses.
      //urlEscapeStyle: UrlEscapeStyle.Angle,

      stripNewlines: false,

      includeDocumentStructure: false,
      extractMetadata: false,
      extractImages: false,
      captureSvg: false, // does not seem to have any effect

      highlightStyle: HighlightStyle.Bold,

      escapeAsterisks: false,
      escapeUnderscores: false,

      // may make configurable
      linkStyle: LinkStyle.Inline,
      strongEmSymbol: "*", // or "_"
      listIndentWidth: 2,
      whitespaceMode: WhitespaceMode.Normalized, // or Preserve
      compactTables: true, // better for LLMs, worse for humans

      maxDepth: undefined, // Maximum DOM traversal depth. undefined means no limit
      wrap: false, // may good for humans but not sure
      wrapWidth: 80, // 80 = default. Only applied if wrap is true

      // more a niche group requires setting these:
      // bullets: "*", // Bullet character(s) to use for unordered list items (e.g. "-", "*").
      // autolinks: false, // Automatically convert bare URLs into Markdown autolinks.
      // codeLanguage: undefined, // Default language annotation for fenced code blocks that have no language hint.
      // inferDimensions: false, // Infer image dimensions from data.
      // maxImageSize: "5MB", Maximum decoded image size in bytes (default 5MB).
    }


    if (options) {
      // @ts-ignore
      conversionOptions.skipImages = !!!options.includeImages
    }

    // Strip undefined keys so we don't override the native binding's own
    // defaults with explicit `undefined` values.
    return Object.fromEntries(
      Object.entries(conversionOptions).filter(([, value]) => value !== undefined),
    ) as ConversionOptions
  }

}