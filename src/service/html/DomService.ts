import { parseHTML } from "linkedom"

export class DomService {

  parseToDocument(html: string, url?: string): Document {
    const { document } = parseHTML(html)

    if (url && document.querySelector("head > base") === null) {
      const base = document.createElement("base")
      base.setAttribute("href", url)
      document.head.prepend(base)
    }

    return document
  }

}