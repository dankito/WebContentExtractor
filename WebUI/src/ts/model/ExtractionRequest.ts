import type { OutputFormat } from "./OutputFormat"

export class ExtractionRequest {

  constructor(
    readonly url: string,
    readonly format?: OutputFormat,
    readonly include_metadata?: boolean,
    readonly timeout?: number,
    readonly user_agent?: string,
  ) { }
  
}
