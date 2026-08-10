import { ExtractParamsBase } from "./ExtractParamsBase.ts"

export class ExtractFromHtmlParams extends ExtractParamsBase{

  constructor(
    readonly html: string,
    readonly url?: string,

    readonly includeMetadata?: boolean,
  ) {
    super(url, includeMetadata)
  }

}