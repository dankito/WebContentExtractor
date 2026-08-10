export class ExtractedContent {

  constructor(
    readonly url: string | undefined,

    readonly pageContentHtml: string,
    readonly pageContentAsText?: string,
  ) { }


}