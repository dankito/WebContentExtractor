// tests/integration/health.test.ts
import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { app } from "../../src"

let server: ReturnType<typeof Bun.serve>

beforeAll(() => {
  server = Bun.serve({ port: 0, fetch: app.fetch }) // port: 0 = let bun select a free port
})

afterAll(() => {
  server.stop()
})

describe("GET /health", () => {
  it("antwortet mit Status 200 und ok: true", async () => {
    const response = await fetch(`http://localhost:${server.port}/health`)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("ok")
  })
})