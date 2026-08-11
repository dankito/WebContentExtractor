import { describe, expect, it } from "bun:test"
import { HtmlCleaner } from "../../../src/service/html/HtmlCleaner"

describe("HtmlCleaner", () => {
  const cleaner = new HtmlCleaner()

  describe("isStyleHidden", () => {
    it("No hidden style -> returns false", () => {
      expect(cleaner.isStyleHidden("color: red; font-size: 12px")).toBe(false)
    })

    it("Hidden style -> returns true", () => {
      expect(cleaner.isStyleHidden("display: none")).toBe(true)
    })

    it("Hidden style followed by other styles -> returns true", () => {
      expect(cleaner.isStyleHidden("display: none; color: red")).toBe(true)
    })
  })


  describe("exceedsEstimatedHtmlNestingDepth", () => {
    it("'>' in attribute", () => {
      expect(cleaner.exceedsEstimatedHtmlNestingDepth('<div data-info=">"><div></div></div>', 1)).toBe(true)
    })

    it("'/>' in attribute", () => {
      expect(cleaner.exceedsEstimatedHtmlNestingDepth('<div data-info="/>"><div></div></div>', 1)).toBe(true)
    })

    it("Deep HTML -> returns true", () => {
      const deepHtml = '<div>'.repeat(20) + '</div>'.repeat(20)
      expect(cleaner.exceedsEstimatedHtmlNestingDepth(deepHtml, 15)).toBe(true)
    })

    it("Deep HTML with fake self close -> returns true", () => {
      const deepHtml = '<div data-attr="/>">'.repeat(20) + '</div>'.repeat(20)
      expect(cleaner.exceedsEstimatedHtmlNestingDepth(deepHtml, 15)).toBe(true)
    })
  })
})