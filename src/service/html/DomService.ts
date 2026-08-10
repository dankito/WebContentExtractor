import { parseHTML } from "linkedom"

export class DomService {

  parseToDocument(html: string): Document {
    return parseHTML(html).document
  }

}