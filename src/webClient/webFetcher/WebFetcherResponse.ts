import type { FetchEngine } from "./FetchEngine.ts"

export enum ContentEncoding {
  /** `content` is the decoded text. */
  Text = "Text",
  /** `content` is the base64 encoded binary data. */
  Base64 = "Base64",
}

export interface ResponseCookie {
  readonly name: string
  readonly value: string
  readonly domain?: string
  readonly path?: string
  readonly expires?: string
  readonly maxAge?: number
  readonly httpOnly?: boolean
  readonly secure?: boolean
  readonly sameSite?: string
}


export interface WebFetcherResponse {

  /**
   * The content of the response, either as text or Base64 encoded binary, see [contentEncoding].
   */
  readonly content: string

  readonly statusCode: number
  readonly contentEncoding: ContentEncoding
  readonly contentType: string
  readonly finalUrl: string

  readonly engine: FetchEngine
  readonly elapsedMs?: number

  readonly headers?: Record<string, string>
  readonly cookies?: string[]
  readonly cookiesParsed?: ResponseCookie[]

}