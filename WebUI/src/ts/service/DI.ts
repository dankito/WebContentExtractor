import type {WebClient} from "../clients/web/WebClient"
import {FetchWebClient} from "../clients/web/FetchWebClient"
import {LogService} from "./LogService"
import { WebExtractionClient } from "../clients/webExtraction/WebExtractionClient"
import { WebExtractionService } from "./WebExtractionService"

export class DI {

  static readonly log: LogService = new LogService()

  private static readonly webClient: WebClient = new FetchWebClient(DI.getBaseUrl(), DI.log)

  private static readonly client = new WebExtractionClient(DI.webClient)

  static readonly service = new WebExtractionService(DI.client)


  private static getBaseUrl(): string {
    let baseUrl = DI.determineBackendHost()
    const port = import.meta.env.VITE_BACKEND_PORT

    if (port) {
      baseUrl += ":" + port
    }

    baseUrl += DI.determineBasePath()

    return baseUrl
  }

  private static determineBackendHost(): string {
    const configuredHost = import.meta.env.VITE_BACKEND_HOST
    if (configuredHost) {
      return configuredHost
    }

    const fileUrl = new URL(import.meta.url)

    const isNonDefaultPort = fileUrl.port !== "80" && fileUrl.port !== "443"

    return `${fileUrl.protocol}//${fileUrl.hostname}${isNonDefaultPort ? ":" + fileUrl.port : ""}`
  }

  private static determineBasePath(): string {
    const { pathname } = new URL(document.baseURI)
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
  }

}