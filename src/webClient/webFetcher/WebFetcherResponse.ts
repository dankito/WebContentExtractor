import type { FetchStrategy } from "./FetchStrategy.ts"

export interface WebFetcherResponse {

  readonly html: string

  readonly status_code: number
  readonly final_url: string
  readonly strategy: FetchStrategy

  readonly http_version?: string
  readonly headers?: Record<string, string>
  readonly cookies?: Record<string, string>
  readonly elapsed_microseconds?: number

}