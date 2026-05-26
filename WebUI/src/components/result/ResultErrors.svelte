<script lang="ts">
  import type { WebFetcherResult } from "../../ts/model/WebFetcherResult"
  import ResultError from "./ResultError.svelte"
  import type { WebContentExtractionResult } from "../../ts/model/WebContentExtractionResult"
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"

  let { error, fetchResult, extractionResult, convertResult }:
    { error?: string, fetchResult?: WebFetcherResult, extractionResult?: WebContentExtractionResult, convertResult?: MarkdownConversionResult } = $props()

  let extractContentErrors = $derived(Object.entries(extractionResult?.failures ?? {}))
  let markdownConversionErrors = $derived(Object.entries(convertResult?.failures ?? {}))
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