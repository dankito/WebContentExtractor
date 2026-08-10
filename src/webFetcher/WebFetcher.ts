import { WebFetcherOptions } from "./WebFetcherOptions"
import type { Result } from "../model/Result.ts"

export interface WebFetcher {

  fetchHtml(url: string, options?: WebFetcherOptions): Promise<Result<string>>

}