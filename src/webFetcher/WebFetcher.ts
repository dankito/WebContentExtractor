import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { WebFetcherResponse } from "./WebFetcherResponse.ts"

export interface WebFetcher {

  fetch(url: string, options?: WebRequestOptions): Promise<WebFetcherResponse>

}