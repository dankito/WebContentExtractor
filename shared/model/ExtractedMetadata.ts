export class ExtractedMetadata {

  constructor(
    /** article title */
    public title?: string,

    /** length of an article, in characters */
    readonly length?: number,

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
  ) { }

}