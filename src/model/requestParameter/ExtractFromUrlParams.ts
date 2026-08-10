import { ExtractParamsBase } from "./ExtractParamsBase.ts"
import { WebFetcherOptions } from "../../webFetcher/WebFetcherOptions.ts"
import { ConvertToPlainTextOptions } from "../../service/converter/ConvertToPlainTextOptions.ts"

export class ExtractFromUrlParams extends ExtractParamsBase {

  constructor(
    url: string,

    includeMetadata?: boolean,

    convertToPlainTextOptions?: ConvertToPlainTextOptions,

    readonly webFetcherOptions?: WebFetcherOptions,
  ) {
    super(url, includeMetadata, convertToPlainTextOptions)
  }

}