import { describe, test } from "bun:test"
import { parseHTML } from "linkedom"
import { PerformanceTestData } from "./PerformanceTestData"
import { HtmlCleaner } from "../../src/service/html/HtmlCleaner"

const RUNS = 1000
const htmlCleaner = new HtmlCleaner()
const html = PerformanceTestData.SpiegelArticleHtml

describe("HtmlCleaner performance", () => {
  test(`runs ${RUNS} times and reports timing stats`, () => {

    PerformanceTestData.measureDurations<Document>(RUNS, document => {
      htmlCleaner.sanitizeHtml(document)
    }, () => {
      const { document } = parseHTML(html)
      return document
    })
  })
})