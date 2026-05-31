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

    const rawHtml = extractionResult?.fetchResult?.html
    const contentHtml = extractionResult?.extractionResult?.content
    const contentMarkdown = extractionResult?.contentMarkdown?.content

    if (requestedFormat == OutputFormat.Html) {
      content = contentHtml ?? rawHtml
      displayedFormat = RequestedFormat.ContentHtml
    } else if (requestedFormat == OutputFormat.Markdown) {
      content = contentMarkdown ?? contentHtml ?? rawHtml
      displayedFormat = RequestedFormat.ContentMarkdown
    } else if (requestedFormat == OutputFormat.Text) {
      content = extractionResult?.contentText?.content ?? contentMarkdown ?? contentHtml ?? rawHtml
      displayedFormat = RequestedFormat.ContentText
    }
  })

  $effect(() => {
    if (displayedFormat == RequestedFormat.RawHtml) {
      content = extractionResult?.fetchResult?.html
    } else if (displayedFormat == RequestedFormat.ContentHtml) {
      content = extractionResult?.extractionResult?.content
    } else if (displayedFormat == RequestedFormat.ContentMarkdown) {
      content = extractionResult?.contentMarkdown?.content
    } else if (displayedFormat == RequestedFormat.ContentText) {
      content = extractionResult?.contentText?.content
    }
  })

  function getReturnedFormats(extractionResult?: MultiFormatExtractionResult): RequestedFormat[] {
    const returnedFormats: RequestedFormat[] = []

    if (extractionResult) {
      if (extractionResult.fetchResult?.html) returnedFormats.push(RequestedFormat.RawHtml)
      if (extractionResult.extractionResult?.content) returnedFormats.push(RequestedFormat.ContentHtml)
      if (extractionResult.contentMarkdown?.content) returnedFormats.push(RequestedFormat.ContentMarkdown)
      if (extractionResult.contentText?.content) returnedFormats.push(RequestedFormat.ContentText)
    }

    return returnedFormats
  }
</script>


{#if extractionResult}
  {#if extractionResult.metadata}
    <MetadataView metadata={extractionResult.metadata} />
  {/if}

  {#if content}
    <ContentView content={content} format={requestedFormat} fetcher={extractionResult.fetchResult?.fetcher}
                 extractor={extractionResult.extractionResult?.extractor}
                 converter={extractionResult.contentMarkdown?.converter ?? extractionResult?.contentText?.converter}
                 {returnedFormats} bind:displayedFormat
     />
  {/if}
{/if}