import type { WebFetcher } from "./WebFetcher"

export interface WebFetcherResult {
  fetcher?: WebFetcher
  error?: string
  html?: string
  statusCode?: number
  finalUrl?: string
  headers?: Record<string, string>
  cookies?: Record<string, string>
  httpVersion?: string
  elapsedMicroseconds?: number
}