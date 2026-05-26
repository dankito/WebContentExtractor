<script lang="ts">
  import ResultError from "./ResultError.svelte"
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"
  import type { ExtractionResult } from "../../ts/model/ExtractionResult"

  let { error, extractionResult, convertResult } =
    $props<{ error?: string, extractionResult?: ExtractionResult, convertResult?: MarkdownConversionResult }>()

  let fetchResult = $derived(extractionResult?.fetch_result)
  let contentExtractionResult = $derived(extractionResult?.extraction_result)
  let convertMarkdownResult = $derived(convertResult?.markdown_conversion_result ?? extractionResult?.conversion_result)

  let extractContentErrors = $derived(Object.entries(contentExtractionResult?.failures ?? {}))
  let markdownConversionErrors = $derived(Object.entries(convertMarkdownResult?.failures ?? {}))
</script>

{#if error}
  <ResultError>
    <span>{error}</span>
  </ResultError>
{/if}

{#if fetchResult?.error}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Fetching failed:</span>
      <span>{fetchResult?.error}</span>
    </div>
  </ResultError>
{/if}

{#if extractContentErrors.length}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Extracting page content errors:</span>
      {#each extractContentErrors as [key, value]}
        <span>{key}: {value}</span>
      {/each}
    </div>
  </ResultError>
{/if}

{#if markdownConversionErrors.length}
  <ResultError>
    <div class="flex flex-col gap-2">
      <span>Markdown conversion errors:</span>
      {#each markdownConversionErrors as [key, value]}
        <span>{key}: {value}</span>
      {/each}
    </div>
  </ResultError>
{/if}