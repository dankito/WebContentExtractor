import { ExtractParamsBase } from "./ExtractParamsBase.ts"
import { ConvertToPlainTextOptions } from "../../service/contentConverter/ConvertToPlainTextOptions.ts"

export class ExtractFromHtmlParams extends ExtractParamsBase {

  constructor(
    readonly html: string,
    url?: string,

    includeMetadata?: boolean,

    convertToPlainTextOptions?: ConvertToPlainTextOptions,
  ) {
    super(url, includeMetadata, convertToPlainTextOptions)
  }

}