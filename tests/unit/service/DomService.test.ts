// noinspection HtmlRequiredLangAttribute

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


  describe("ensureHtmlShell", () => {
    it("No body, no html -> gets correctly wrapped", () => {
      ensureGetCorrectlyWrapped("<div>hello</div>")
    })

    it("No html -> gets correctly wrapped", () => {
      ensureGetCorrectlyWrapped("<body><div>hello</div></body>")
    })

    it("No body -> gets correctly wrapped", () => {
      ensureGetCorrectlyWrapped("<html><div>hello</div></html>")
    })

    it("No body but head -> gets correctly wrapped", () => {
      ensureGetCorrectlyWrapped("<html><head></head><div>hello</div></html>")
    })


    function ensureGetCorrectlyWrapped(html: string): string {
      const result = underTest.ensureHtmlShell(html)

      expect(result).toStartWith("<html><head></head><body>")
      expect(result).toEndWith("</body></html>")

      return result
    }
  })
})