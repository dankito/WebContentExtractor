import type {WebClient} from "../clients/web/WebClient"
import {FetchWebClient} from "../clients/web/FetchWebClient"
import {LogService} from "./LogService"

export class DI {

  static readonly log: LogService = new LogService()

  private static readonly webClient: WebClient = new FetchWebClient(DI.getBaseUrl(), DI.log)


  private static getBaseUrl(): string {
    let baseUrl = DI.determineBackendHost()
    const port = import.meta.env.VITE_BACKEND_PORT

    if (port) {
      baseUrl += ":" + port
    }

    baseUrl += ""

    return baseUrl
  }

  private static determineBackendHost(): string {
    const configuredHost = import.meta.env.VITE_BACKEND_HOST
    if (configuredHost) {
      return configuredHost
    }

    const fileUrl = new URL(import.meta.url)

    return `${fileUrl.protocol}//${fileUrl.hostname}`
  }

}