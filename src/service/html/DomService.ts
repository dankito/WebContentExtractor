import { parseHTML } from "linkedom"

// noinspection HtmlRequiredLangAttribute
export class DomService {

  parseToDocument(html: string, url?: string): Document {
    const { document } = parseHTML(html)

    if (url && document.querySelector("head > base") === null) {
      this.setBaseUrl(document, url)
    }

    return document
  }


  ensureHtmlShellAndParseToDocument(html: string, url?: string): Document {
    const validHtml = this.ensureHtmlShell(html)

    return this.parseToDocument(validHtml, url)
  }

  ensureHtmlShell(html: string): string {
    const trimmed = html.trim()

    // Pull out a leading doctype, if present, so we don't nest it inside <body>
    const doctypeMatch = trimmed.match(/^<!DOCTYPE[^>]*>/i)
    const doctype = doctypeMatch ? doctypeMatch[0] : ""
    const rest = doctype ? trimmed.slice(doctype.length).trim() : trimmed

    const hasHtml = /<html[\s>]/i.test(rest)
    const hasBody = /<body[\s>]/i.test(rest)

    let shell
    if (hasHtml && hasBody) {
      // already has <html>, leave structure alone
      shell = rest
    } else if (hasBody) {
      // has <body> but no <html> wrapper — just add the <html>/<head> shell
      console.log("No body found in html, wrapping DOM nodes in body")

      shell = `<html><head></head>${rest}</html>`
    } else if (hasHtml) {
      console.log("<html> is available but <body> is missing, adding body element")

      // TODO: this is not easily handled with string operations, find a better solution
      const htmlStartTagEnd = rest.indexOf(">")
      const htmlCloseTag = rest.indexOf("</html>")
      const withoutHtmlCloseTag = rest.substring(0, htmlCloseTag)
      const headCloseTag = rest.indexOf("</head>")

      if (headCloseTag != -1) {
        shell = `${rest.substring(0, headCloseTag)}</head><body>${withoutHtmlCloseTag}</body></html>`
      } else {
        shell = `<html><head></head><body>${withoutHtmlCloseTag.substring(htmlStartTagEnd + 1)}</body></html>`
      }
    } else {
      // has neither — wrap fully
      console.log("Neither <html> nor <body> found in html, wrapping DOM nodes in html and body")

      shell = `<html><head></head><body>${rest}</body></html>`
    }

    return doctype ? `${doctype}\n${shell}` : shell
  }


  private setBaseUrl(document: Document, url: string) {
    const base = document.createElement("base")
    base.setAttribute("href", url)

    if (document.head) {
      document.head.prepend(base)
    } else {
      const head = document.createElement("head")
      head.prepend(base)
      document.prepend(head)
    }
  }

}