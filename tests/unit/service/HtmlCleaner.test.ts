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
})