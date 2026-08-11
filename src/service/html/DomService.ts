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
    if (hasHtml) {
      // already has <html>, leave structure alone
      shell = rest
    } else if (hasBody) {
      // has <body> but no <html> wrapper — just add the <html>/<head> shell
      console.log("No body found in html, wrapping DOM nodes in body")

      shell = `<html><head></head>${rest}</html>`
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