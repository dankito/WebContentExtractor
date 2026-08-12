import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import type { Result } from "../model/Result"

export interface WebFetcher {

  fetchHtml(url: string, options?: WebRequestOptions): Promise<Result<string>>

}