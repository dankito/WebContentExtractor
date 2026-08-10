import { ExtractParamsBase } from "./ExtractParamsBase.ts"
import { WebFetcherOptions } from "../../webFetcher/WebFetcherOptions.ts"

export class ExtractFromUrlParams extends ExtractParamsBase{

  constructor(
    readonly url: string,

    readonly includeMetadata?: boolean,

    readonly webFetcherOptions?: WebFetcherOptions,
  ) {
    super(url, includeMetadata)
  }

}