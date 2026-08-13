export class ExtractedMetadata {

  constructor(
    readonly rawHtmlLength: number,
    readonly contentHtmlLength?: number,

    /** length of an article, in characters */
    readonly textLength?: number,

    /** article title */
    readonly title?: string,

    /** article description, or short excerpt from the content */
    readonly excerpt?: string,

    /** author metadata */
    readonly byline?: string,

    /** content direction */
    readonly contentDirection?: string,

    /** name of the site */
    readonly siteName?: string,

    /** content language */
    readonly contentLanguage?: string,

    /** published time */
    readonly publishedTime?: string,

    readonly extractionDurationMs?: number, // does not really fit here, but to have a place for this to transport it to the caller
  ) { }

}