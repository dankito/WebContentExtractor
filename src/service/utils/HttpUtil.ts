import type { HonoRequest } from "hono"
import { ResponseFormat } from "../../model/responses/ResponseFormat.ts"

export class HttpUtil {

  getPreferredResponseFormat(request: HonoRequest): ResponseFormat {
    const acceptHeader = request.header("Accept") ?? ""

    return this.getPreferredResponseFormatForAcceptHeader(acceptHeader)
  }

  getPreferredResponseFormatForAcceptHeader(acceptHeader: string): ResponseFormat {
    // Parse Accept header with quality values (q=...)
    const preferredFormatsSorted = acceptHeader.split(",")
      .map(part => {
        const [type, ...params] = part.split(";").map(s => s.trim().toLowerCase())
        let q = 1.0
        for (const param of params) {
          if (param.startsWith("q=")) {
            q = parseFloat(param.substring(2)) || 0
          }
        }
        return { type, q }
      })
      .sort((a, b) => b.q - a.q)

    for (const format of preferredFormatsSorted) {
      if (format.type === "text/html") {
        return ResponseFormat.Html
      }
      if (format.type === "text/plain") {
        return ResponseFormat.Text
      }
      if (format.type === "application/json") {
        return ResponseFormat.Json
      }
    }

    return ResponseFormat.Json // fallback
  }

}