// noinspection HtmlRequiredAltAttribute

import { describe, expect, it } from "bun:test"
import { KreuzbergHtmlToMarkdownConverter } from "../../../../src/service/contentConverter/KreuzbergHtmlToMarkdownConverter"
import { SuccessResult } from "../../../../src/model/SuccessResult"
import { ConvertToMarkdownOptions } from "../../../../src/service/contentConverter/ConvertToMarkdownOptions"


const inlineImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="


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


    it("<img> includeImages: false -> image description", () => {
      assertConversion(`<img src="https://liebe.de/liebe.png">Liebe</img>`, "Liebe", {
        includeImages: false
      })
    })

    it("<img> includeImages: true -> image url and description", () => {
      assertConversion(`<img src="https://liebe.de/liebe.png">Liebe</img>`, "![](https://liebe.de/liebe.png)Liebe", {
        includeImages: true
      })
    })

    it("<img> with alt, includeImages: true -> image alt, url and description", () => {
      assertConversion(`<img alt="Liebesbild" src="https://liebe.de/liebe.png">Liebe</img>`, "![Liebesbild](https://liebe.de/liebe.png)Liebe", {
        includeImages: true
      })
    })

    it("<img> with Base64 inline image, includeImages: true -> image alt, image data and description", () => {
      assertConversion(`<img alt="Liebesbild" src="${inlineImageData}">Liebe</img>`,
        `![Liebesbild](${inlineImageData})Liebe`, {
          includeImages: true
        })
    })


    function assertConversion(html: string, expectedMarkdown: string, options?: ConvertToMarkdownOptions) {
      const result = underTest.convertToMarkdown(html, options)
      expect(result.success).toBe(true)

      let markdown = (result as SuccessResult<string>).data
      if (markdown.endsWith("\n")) { // strip trailing newline for easier expectation tests
        markdown = markdown.slice(0, -1)
      }

      expect(markdown).toBe(expectedMarkdown)
    }
  })
})