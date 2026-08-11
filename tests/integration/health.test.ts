import { describe, expect, it } from "bun:test"
import * as process from "bun"

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3030"

describe("GET /health", () => {
  it(`Responds with status 200 and {"ok": true}`, async () => {
    const response = await fetch(`${BASE_URL}/health`)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.status).toBe("ok")
  })
})