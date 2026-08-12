// noinspection HtmlRequiredAltAttribute

import { describe, expect, it } from "bun:test"
import { TurndownHtmlToMarkdownConverter } from "../../../../src/service/contentConverter/TurndownHtmlToMarkdownConverter"
import { MarkdownConversionOptions } from "@shared/model/MarkdownConversionOptions"


const inlineImageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 29.6" width="64" height="64">
  <title>Red heart</title>
  <path fill="#e0245e" d="M23.6,0c-3.4,0-6.3,2.1-7.6,5c-1.3-2.9-4.2-5-7.6-5C3.4,0,0,3.4,0,7.6
    c0,8.4,10.5,13.4,16,20.7c5.5-7.3,16-12.3,16-20.7C32,3.4,28.6,0,23.6,0z"/>
</svg>`

// the Base64 string slightly differs from the one KreuzbergHtmlToMarkdownConverter produces as Turndown removes white spaces and the attribute order differs
const convertedSvg = `![Red heart](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAyOS42IiB3aWR0aD0iNjQiIGhlaWdodD0iNjQiPjx0aXRsZT5SZWQgaGVhcnQ8L3RpdGxlPjxwYXRoIGZpbGw9IiNlMDI0NWUiIGQ9Ik0yMy42LDBjLTMuNCwwLTYuMywyLjEtNy42LDVjLTEuMy0yLjktNC4yLTUtNy42LTVDMy40LDAsMCwzLjQsMCw3LjYKICAgIGMwLDguNCwxMC41LDEzLjQsMTYsMjAuN2M1LjUtNy4zLDE2LTEyLjMsMTYtMjAuN0MzMiwzLjQsMjguNiwwLDIzLjYsMHoiPjwvcGF0aD48L3N2Zz4=)`



describe("TurndownHtmlToMarkdownConverter", () => {
  const underTest = new TurndownHtmlToMarkdownConverter()

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


    it("<svg> includeImages: false -> ''", () => {
      assertConversion(svg, "", {
        includeImages: false
      })
    })

    it("<svg> includeImages: true -> [Red heart]", () => {
      assertConversion(svg, convertedSvg, {
        includeImages: true
      })
    })


    function assertConversion(html: string, expectedMarkdown: string, options?: MarkdownConversionOptions) {
      const result = underTest.convertToMarkdown(html, options)
      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()

      let markdown = result.markdown!
      if (markdown.endsWith("\n")) { // strip trailing newline for easier expectation tests
        markdown = markdown.slice(0, -1)
      }

      expect(markdown).toBe(expectedMarkdown)
    }
  })
})