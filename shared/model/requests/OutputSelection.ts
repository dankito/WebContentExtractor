export class OutputSelection { // or ContentSelection

  constructor(
    readonly rawHtml?: boolean,
    readonly rawMarkdown?: boolean,
    readonly rawText?: boolean,

    readonly contentHtml?: boolean,
    readonly contentMarkdown?: boolean,
    readonly contentText?: boolean,

    readonly metadata?: boolean,
  ) { }


  requiresExtractingContent(): boolean {
    return this.contentHtml === true || this.contentMarkdown === true || this.contentText === true
  }

}