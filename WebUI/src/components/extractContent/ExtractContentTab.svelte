<script lang="ts">
  import MetadataView from "../result/MetadataView.svelte"
  import ContentView from "../result/ContentView.svelte"
  import type { MultiFormatExtractionResult } from "../../ts/model/MultiFormatExtractionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"

  let { extractionResult, format }: { extractionResult?: MultiFormatExtractionResult, format: OutputFormat } = $props()

  let content = $state<string | undefined>(undefined)

  $effect(() => {
    const _ = extractionResult // execute on each change to extractionResult

    if (format == OutputFormat.Html) {
      content = extractionResult?.content_html ?? extractionResult?.raw_html
    } else if (format == OutputFormat.Markdown) {
      content = extractionResult?.content_markdown ?? extractionResult?.content_html ?? extractionResult?.raw_html
    } else if (format == OutputFormat.Text) {
      content = extractionResult?.content_text ?? extractionResult?.content_markdown ?? extractionResult?.content_html ?? extractionResult?.raw_html
    }
  })
</script>


{#if extractionResult}
  {#if extractionResult.metadata}
    <MetadataView metadata={extractionResult.metadata} />
  {/if}

  {#if content}
    <ContentView content={content} format={format} fetcher={extractionResult.fetch_result?.fetcher}
                 extractor={extractionResult.extraction_result?.extractor}
                  />
  {/if}
{/if}