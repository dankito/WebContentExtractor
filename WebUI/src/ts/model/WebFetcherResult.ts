import type { WebFetcher } from "./WebFetcher"

export interface WebFetcherResult {
  fetcher?: WebFetcher
  error?: string
  html?: string
  status_code?: number
  final_url?: string
  headers?: Record<string, string>
  cookies?: Record<string, string>
  http_version?: string
  elapsed_microseconds?: number
}