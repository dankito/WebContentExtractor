import { parseHTML } from "linkedom"

export class DomService {

  parseToDocument(html: string, url?: string): Document {
    const { document } = parseHTML(html)

    if (url && document.querySelector("head > base") === null) {
      this.setBaseUrl(document, url)
    }

    return document
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