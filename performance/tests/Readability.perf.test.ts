import { describe, test } from "bun:test"
import { parseHTML } from "linkedom"
import { Readability } from "@mozilla/readability"
import { PerformanceTestData } from "./PerformanceTestData"

const RUNS = 1000

describe("Readability performance", () => {
  test(`runs ${RUNS} times and reports timing stats`, () => {
    const html = PerformanceTestData.SpiegelArticleHtml

    PerformanceTestData.measureDurations<Document>(RUNS, document => {
      const reader = new Readability(document as unknown as Document)
      return reader.parse()
    }, () => {
      const { document } = parseHTML(html)
      return document
    })
  })
})