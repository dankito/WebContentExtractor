<script lang="ts">
  import type { ExtractionResult } from "../../ts/model/ExtractionResult"
  import MetadataView from "../result/MetadataView.svelte"
  import ContentView from "../result/ContentView.svelte"

  let { extractionResult }: { extractionResult?: ExtractionResult } = $props()
</script>


{#if extractionResult}
  {#if extractionResult.metadata}
    <MetadataView metadata={extractionResult.metadata} />
  {/if}

  {#if extractionResult.content}
    <ContentView content={extractionResult.content} format={extractionResult.format} fetcher={extractionResult.fetch_result?.fetcher}
                 extractor={extractionResult.extraction_result?.extractor}
                 converter={extractionResult.conversion_result?.converter } />
  {/if}
{/if}