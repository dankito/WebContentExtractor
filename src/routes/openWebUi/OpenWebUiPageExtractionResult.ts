export class OpenWebUiPageExtractionResult {

  constructor(
    readonly page_content: string,
    readonly metadata?: Record<string, any>,
  ) { }

}