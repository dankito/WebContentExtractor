import { HttpUtil } from "../../../../src/service/utils/HttpUtil"
import { describe, expect, it } from "bun:test"
import { ResponseFormat } from "../../../../src/model/responses/ResponseFormat"


describe("HttpUtil", () => {
  const underTest = new HttpUtil()

  describe("getPreferredResponseFormat", () => {
    it("'' -> Json", () => {
      expect(underTest.getPreferredResponseFormatForAcceptHeader("")).toBe(ResponseFormat.Json)
    })

    it("*/* -> Json", () => {
      expect(underTest.getPreferredResponseFormatForAcceptHeader("*/*")).toBe(ResponseFormat.Json)
    })

    it("application/json, text/plain;q=0.5 -> Json", () => {
      expect(underTest.getPreferredResponseFormatForAcceptHeader("application/json, text/plain;q=0.5")).toBe(ResponseFormat.Json)
    })

    it("text/plain;q=0.5, text/html;q=1.0 -> Html", () => {
      expect(underTest.getPreferredResponseFormatForAcceptHeader("text/plain;q=0.5, text/html;q=1.0")).toBe(ResponseFormat.Html)
    })

    it("text/html;q=0.1, text/plain;q=0.9 -> Text", () => {
      expect(underTest.getPreferredResponseFormatForAcceptHeader("text/html;q=0.1, text/plain;q=0.9")).toBe(ResponseFormat.Text)
    })
  })
})