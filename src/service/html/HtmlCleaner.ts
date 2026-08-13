
export class HtmlCleaner {

  // CSS property values that indicate an element is hidden
  private static HIDDEN_STYLE_PATTERNS: Array<[string, RegExp]> = [
    ["display", /^\s*none\s*$/i],
    ["visibility", /^\s*hidden\s*$/i],
    ["opacity", /^\s*0\s*$/],
    ["font-size", /^\s*0(px|em|rem|pt|%)?\s*$/i],
    ["text-indent", /^\s*-\d{4,}px\s*$/],
    ["color", /^\s*transparent\s*$/i],
    ["color", /^\s*rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0(?:\.0+)?\s*\)\s*$/i],
    ["color", /^\s*hsla\s*\(\s*[\d.]+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*0(?:\.0+)?\s*\)\s*$/i],
  ]

  // Class names associated with visually hidden content
  private static HIDDEN_CLASS_NAMES = new Set([
    "sr-only",
    "visually-hidden",
    "d-none",
    "hidden",
    "invisible",
    "screen-reader-only",
    "offscreen",
  ])

  // Zero-width and invisible Unicode characters used in prompt injection attacks
  private static INVISIBLE_UNICODE_RE =
    /[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u206A-\u206F\uFEFF\u{E0000}-\u{E007F}]/gu



  /*        Sanitize output of Readability            */

  stripInvisibleUnicode(text: string): string {
    return text.replace(HtmlCleaner.INVISIBLE_UNICODE_RE, "")
  }

  normalizeWhitespace(html: string): string {
    return html
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }



  /*        Sanitize HTML before parsing with Readability       */

  sanitizeHtml(document: Document): Document {
    const root = document.body ?? document.documentElement
    this.walkAndClean(root)
    return document
  }

  private walkAndClean(node: Node): void {
    // Depth-first, but skip descending into removed nodes
    let child = node.firstChild
    while (child) {
      const next = child.nextSibling // capture before potential removal

      // do not strip comments with regex, that's very error prone like unclosed comments
      // (would strip everything after the comment) or `<div title="a --> b">
      if (child.nodeType === 8 /* COMMENT_NODE */) {
        child.parentNode?.removeChild(child)
      } else if (child.nodeType === 1 /* ELEMENT_NODE */) {
        const el = child as Element
        if (this.shouldRemoveElement(el)) {
          el.parentNode?.removeChild(el)
          // don't recurse into removed subtree
        } else {
          this.walkAndClean(el)
        }
      }

      child = next
    }
  }


  private shouldRemoveElement(element: Element): boolean {
    const tagName = element.tagName.toLowerCase()

    // Always-remove tags
    // original: ["meta", "template", "svg", "canvas", "iframe", "object", "embed"]
    if (["template", "svg", "canvas", "style"].includes(tagName)) {
      return true
    }

    // Remove scripts, except JSON-LD structured data
    if (tagName === "script") {
      const type = element.getAttribute("type")?.toLowerCase().trim() ?? ""
      if (type !== "application/ld+json") {
        return true
      }
      return false // keep JSON-LD, skip remaining checks
    }

    // Tracking pixels: 1x1 (or effectively 0-2px) images
    if (tagName === "img" && this.isTrackingPixel(element)) {
      return true
    }

    // input type=hidden
    if (tagName === "input" && element.getAttribute("type")?.toLowerCase() === "hidden") {
      return true
    }

    // aria-hidden=true
    if (element.getAttribute("aria-hidden") === "true") {
      return true
    }

    // hidden attribute
    if (element.hasAttribute("hidden")) {
      return true
    }

    // class-based hiding
    const className = element.getAttribute("class") ?? ""
    if (this.hasHiddenClass(className)) {
      return true
    }

    // inline style-based hiding
    const style = element.getAttribute("style") ?? ""
    if (style && this.isStyleHidden(style)) {
      return true
    }

    return false
  }

  private isTrackingPixel(element: Element): boolean {
    const parseDim = (val: string | null): number | null => {
      if (!val) return null
      const n = parseFloat(val)
      return Number.isNaN(n) ? null : n
    }

    // width/height attributes (unitless or px)
    const attrWidth = parseDim(element.getAttribute("width"))
    const attrHeight = parseDim(element.getAttribute("height"))

    // inline style width/height, if present, take precedence
    const style = element.getAttribute("style") ?? ""
    const styleWidthMatch = style.match(/(?:^|;)\s*width\s*:\s*([\d.]+)px/i)
    const styleHeightMatch = style.match(/(?:^|;)\s*height\s*:\s*([\d.]+)px/i)
    const styleWidth = styleWidthMatch ? parseFloat(styleWidthMatch[1]) : null
    const styleHeight = styleHeightMatch ? parseFloat(styleHeightMatch[1]) : null

    const w = styleWidth ?? attrWidth
    const h = styleHeight ?? attrHeight

    // Only treat as tracking pixel if both dimensions are known and tiny.
    // Avoid false positives on images missing explicit size (w or h null).
    if (w !== null && h !== null && w <= 1 && h <= 1) {
      return true
    }

    return false
  }

  private hasHiddenClass(className: string): boolean {
    const classes = className.toLowerCase().split(/\s+/)
    return classes.some((cls) => HtmlCleaner.HIDDEN_CLASS_NAMES.has(cls))
  }

  isStyleHidden(style: string): boolean {
    for (const [prop, pattern] of HtmlCleaner.HIDDEN_STYLE_PATTERNS) {
      const escapedProp = prop.replace(/-/g, "\\-")
      const match = style.match(new RegExp(`(?:^|;)\\s*${escapedProp}\\s*:\\s*([^;]+)`, "i"))
      if (match && pattern.test(match[1])) {
        return true
      }
    }

    // clip-path: none is not hidden, but positive percentage inset() clipping hides content.
    const clipPath = style.match(/(?:^|;)\s*clip-path\s*:\s*([^;]+)/i)
    if (clipPath && !/^\s*none\s*$/i.test(clipPath[1])) {
      if (/inset\s*\(\s*(?:0*\.\d+|[1-9]\d*(?:\.\d+)?)%/i.test(clipPath[1])) {
        return true
      }
    }

    // transform: scale(0)
    const transform = style.match(/(?:^|;)\s*transform\s*:\s*([^;]+)/i)
    if (transform) {
      if (/scale\s*\(\s*0\s*\)/i.test(transform[1])) {
        return true
      }
      if (/translateX\s*\(\s*-\d{4,}px\s*\)/i.test(transform[1])) {
        return true
      }
      if (/translateY\s*\(\s*-\d{4,}px\s*\)/i.test(transform[1])) {
        return true
      }
    }

    // width:0 + height:0 + overflow:hidden
    const width = style.match(/(?:^|;)\s*width\s*:\s*([^;]+)/i)
    const height = style.match(/(?:^|;)\s*height\s*:\s*([^;]+)/i)
    const overflow = style.match(/(?:^|;)\s*overflow\s*:\s*([^;]+)/i)
    if (
      width &&
      /^\s*0(px)?\s*$/i.test(width[1]) &&
      height &&
      /^\s*0(px)?\s*$/i.test(height[1]) &&
      overflow &&
      /^\s*hidden\s*$/i.test(overflow[1])
    ) {
      return true
    }

    // Offscreen positioning: left/top far negative
    const left = style.match(/(?:^|;)\s*left\s*:\s*([^;]+)/i)
    const top = style.match(/(?:^|;)\s*top\s*:\s*([^;]+)/i)
    if (left && /^\s*-\d{4,}px\s*$/i.test(left[1])) {
      return true
    }
    if (top && /^\s*-\d{4,}px\s*$/i.test(top[1])) {
      return true
    }

    return false
  }

}