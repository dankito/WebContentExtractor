import { describe, expect, it } from "bun:test"
import { DomService } from "../../../src/service/html/DomService"


describe("DomService", () => {
  const underTest = new DomService()

  describe("parseToDocument", () => {
    it("No header -> base URL gets set anyway", () => {
      const result = underTest.parseToDocument("<html><body>Test</body></html>", "https://example.com")
      expect(result.head).not.toBeNull()
      expect(result.querySelector("head > base")).not.toBeNull()
      expect(result.querySelector("head > base")!.getAttribute("href")).toBe("https://example.com")
    })
  })
})