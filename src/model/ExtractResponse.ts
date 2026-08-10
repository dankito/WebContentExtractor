export class ExtractResponse {

  constructor(
    readonly url: string | undefined = undefined,
    readonly pageContentHtml: string,
  ) { }

}