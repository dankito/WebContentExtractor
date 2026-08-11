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
})