export class ExtractFromHtmlQueryParams {

  constructor(
    readonly html: string,
    readonly url?: string,

    readonly includeMetadata?: boolean,
  ) { }

}