import { ApiTestBase } from "./ApiTestBase"
import { describe, expect, it } from "bun:test"

const app = ApiTestBase.App


describe("/extract", () => {
  it(`Non-http URL returns error`, async () => {
    const response = await app.request(`/extract?url=ftp://google.com`)
    const body = await response.json()

    console.log(body)

    expect(response.status).toBe(400)
    expect(body.error).toInclude("http")
  })

  it(`Local URL returns error`, async () => {
    const response = await app.request(`/extract?url=http://192.168.1.17`)
    const body = await response.json()

    console.log(body)

    expect(response.status).toBe(400)
    expect(body.error).toInclude("Calling local URL is not permitted for security reasons")
  })

  describe("Content Negotiation", () => {
    const validHtml = `
      <html>
        <body>
          <h1>Title</h1>
          <p>Content with a <a href="http://example.com">link</a>.</p>
        </body>
      </html>
    `

    it("Should return HTML when Accept is text/html", async () => {
      const response = await app.request("/extract/html", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "text/html"
        },
        body: JSON.stringify({ html: validHtml })
      })
      
      expect(response.status).toBe(200)
      const text = await response.text()
      expect(text).toInclude("Title")
      expect(text).toInclude("<") // Check it's HTML-ish
    })

    it("Should return plain text when Accept is text/plain", async () => {
      const response = await app.request("/extract/html", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "text/plain"
        },
        body: JSON.stringify({ html: validHtml })
      })
      
      expect(response.status).toBe(200)
      const text = await response.text()
      expect(text).toInclude("Title")
      expect(text).not.toInclude("<")
    })

    it("Should return JSON by default", async () => {
      const response = await app.request("/extract/html", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ html: validHtml })
      })
      
      expect(response.status).toBe(200)
      expect(response.headers.get("Content-Type")).toInclude("application/json")
      const body = await response.json()
      expect(body.pageContentHtml).toBeDefined()
    })

    it("Should respect Accept header quality values", async () => {
      const response = await app.request("/extract/html", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "text/plain;q=0.5, text/html;q=0.8"
        },
        body: JSON.stringify({ html: validHtml })
      })
      
      expect(response.status).toBe(200)
      expect(response.headers.get("Content-Type")).toInclude("text/html")
      const text = await response.text()
      expect(text).toInclude("<")
    })

    it("Should respect plain text options (preserveLinkUrlsInPlainText)", async () => {
      const response = await app.request("/extract/html", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "text/plain"
        },
        body: JSON.stringify({ 
          html: validHtml,
          preserveLinkUrlsInPlainText: true
        })
      })
      
      expect(response.status).toBe(200)
      const text = await response.text()
      expect(text).toInclude("http://example.com")
    })

    it("Should respect plain text options (preserveImageUrlsInPlainText)", async () => {
      const htmlWithImage = `
        <html>
          <body>
            <h1>Article with Image</h1>
            <p>Here is an important image:</p>
            <img src="http://example.com/image.png" alt="Test Image">
          </body>
        </html>
      `
      const response = await app.request("/extract/html", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "text/plain"
        },
        body: JSON.stringify({ 
          html: htmlWithImage,
          preserveImageUrlsInPlainText: true
        })
      })
      
      expect(response.status).toBe(200)
      const text = await response.text()
      expect(text).toInclude("http://example.com/image.png")
    })
  })
})