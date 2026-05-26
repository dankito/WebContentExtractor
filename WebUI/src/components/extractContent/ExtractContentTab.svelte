<script lang="ts">
  import MetadataView from "../result/MetadataView.svelte"
  import ContentView from "../result/ContentView.svelte"
  import type { MultiFormatExtractionResult } from "../../ts/model/MultiFormatExtractionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import { RequestedFormat } from "../../ts/model/RequestedFormat"

  let { extractionResult, requestedFormat }: { extractionResult?: MultiFormatExtractionResult, requestedFormat: OutputFormat } = $props()

  let returnedFormats = $derived<RequestedFormat[]>(getReturnedFormats(extractionResult))
  let displayedFormat = $state<RequestedFormat | undefined>(undefined)
  let content = $state<string | undefined>(undefined)

  $effect(() => {
    const _ = extractionResult // execute on each change to extractionResult

    const rawHtml = extractionResult?.fetch_result?.html
    const contentHtml = extractionResult?.extraction_result?.content
    const contentMarkdown = extractionResult?.content_markdown?.content

    if (requestedFormat == OutputFormat.Html) {
      content = contentHtml ?? rawHtml
      displayedFormat = RequestedFormat.ContentHtml
    } else if (requestedFormat == OutputFormat.Markdown) {
      content = contentMarkdown ?? contentHtml ?? rawHtml
      displayedFormat = RequestedFormat.ContentMarkdown
    } else if (requestedFormat == OutputFormat.Text) {
      content = extractionResult?.content_text?.content ?? contentMarkdown ?? contentHtml ?? rawHtml
      displayedFormat = RequestedFormat.ContentText
    }
  })

  $effect(() => {
    if (displayedFormat == RequestedFormat.RawHtml) {
      content = extractionResult?.fetch_result?.html
    } else if (displayedFormat == RequestedFormat.ContentHtml) {
      content = extractionResult?.extraction_result?.content
    } else if (displayedFormat == RequestedFormat.ContentMarkdown) {
      content = extractionResult?.content_markdown?.content
    } else if (displayedFormat == RequestedFormat.ContentText) {
      content = extractionResult?.content_text?.content
    }
  })

  function getReturnedFormats(extractionResult?: MultiFormatExtractionResult): RequestedFormat[] {
    const returnedFormats: RequestedFormat[] = []

    if (extractionResult) {
      if (extractionResult.fetch_result.html) returnedFormats.push(RequestedFormat.RawHtml)
      if (extractionResult.extraction_result?.content) returnedFormats.push(RequestedFormat.ContentHtml)
      if (extractionResult.content_markdown?.content) returnedFormats.push(RequestedFormat.ContentMarkdown)
      if (extractionResult.content_text?.content) returnedFormats.push(RequestedFormat.ContentText)
    }

    return returnedFormats
  }
</script>


{#if extractionResult}
  {#if extractionResult.metadata}
    <MetadataView metadata={extractionResult.metadata} />
  {/if}

  {#if content}
    <ContentView content={content} format={requestedFormat} fetcher={extractionResult.fetch_result?.fetcher}
                 extractor={extractionResult.extraction_result?.extractor}
                 converter={extractionResult.content_markdown?.converter ?? extractionResult?.content_text?.converter}
                 {returnedFormats} bind:displayedFormat
     />
  {/if}
{/if}