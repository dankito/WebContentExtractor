import { ConvertToPlainTextOptions } from "../../service/converter/ConvertToPlainTextOptions.ts"

export class ExtractParamsBase {

  constructor(
    readonly url?: string,

    readonly includeMetadata?: boolean,

    readonly convertToPlainTextOptions?: ConvertToPlainTextOptions,
  ) { }

}