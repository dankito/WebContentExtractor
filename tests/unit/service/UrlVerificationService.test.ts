import { describe, expect, it } from "bun:test"
import { UrlVerificationService } from "../../../src/service/UrlVerificationService"


describe("UrlVerificationService", () => {
  const underTest = new UrlVerificationService()

  describe("isLocalUrl", () => {
    it("localhost -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("localhost"))).toBe(true)
    })

    it("localhost:3000 -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("localhost:3000"))).toBe(true)
    })

    it("127.0.0.1 -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("127.0.0.1"))).toBe(true)
    })

    it("127.0.0.1:3000 -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("127.0.0.1:3000"))).toBe(true)
    })

    it("::1 -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("[::1]"))).toBe(true)
    })


    it("10.x.y.z -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("10.0.0.1"))).toBe(true)
    })

    it("172.16.x.y -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("172.16.0.1"))).toBe(true)
    })

    it("192.168.x.y -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("192.168.1.7"))).toBe(true)
    })

    it("192.169.x.y -> returns false", async () => {
      expect(await underTest.isLocalUrl(url("192.169.1.7"))).toBe(false)
    })

    it("169.254.169.254 -> returns true", async () => {
      expect(await underTest.isLocalUrl(url("169.254.169.254/latest/meta-data/"))).toBe(true)
    })


    it("heise.de -> returns false", async () => {
      expect(await underTest.isLocalUrl(url("heise.de"))).toBe(false)
    })
  })
})

function url(hostname: string): URL {
  return new URL(`https://${hostname}`)
}