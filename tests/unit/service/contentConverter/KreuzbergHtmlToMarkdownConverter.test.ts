import { describe, expect, it } from "bun:test"
import { KreuzbergHtmlToMarkdownConverter } from "../../../../src/service/contentConverter/KreuzbergHtmlToMarkdownConverter"
import { SuccessResult } from "../../../../src/model/SuccessResult"


describe("KreuzbergHtmlToMarkdownConverter", () => {
  const underTest = new KreuzbergHtmlToMarkdownConverter()

  describe("convertToMarkdown", () => {
    it("<h1> -> #", () => {
      assertConversion("<h1>Liebe</h1>", "# Liebe")
    })

    it("<h2> -> ##", () => {
      assertConversion("<h2>Liebe</h2>", "## Liebe")
    })

    it("<h3> -> ###", () => {
      assertConversion("<h3>Liebe</h3>", "### Liebe")
    })

    it("<h4> -> ####", () => {
      assertConversion("<h4>Liebe</h4>", "#### Liebe")
    })

    it("<h5> -> #####", () => {
      assertConversion("<h5>Liebe</h5>", "##### Liebe")
    })

    it("<h6> -> ######", () => {
      assertConversion("<h6>Liebe</h6>", "###### Liebe")
    })


    it("<a> -> [Liebe]", () => {
      assertConversion(`<a href="https://liebe.de">Liebe</a>`, "[Liebe](https://liebe.de)")
    })


    function assertConversion(html: string, expectedMarkdown: string) {
      const result = underTest.convertToMarkdown(html)
      expect(result.success).toBe(true)

      let markdown = (result as SuccessResult<string>).data
      if (markdown.endsWith("\n")) { // strip trailing newline for easier expectation tests
        markdown = markdown.slice(0, -1)
      }

      expect(markdown).toBe(expectedMarkdown)
    }
  })
})