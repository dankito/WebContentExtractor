import { describe, expect, it } from "bun:test"
import { ApiTestBase } from "./ApiTestBase"


const app = ApiTestBase.App


describe("GET /health", () => {
  it(`Responds with status 200 and {"ok": true}`, async () => {
    const response = await app.request(`/health`)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("ok")
  })
})