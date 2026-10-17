import { WebRequestOptions } from "@shared/model/WebRequestOptions"
import { WebClientResponse } from "./WebClientResponse.ts"

export interface WebClient {

  fetch(url: string, options?: WebRequestOptions): Promise<WebClientResponse>

}