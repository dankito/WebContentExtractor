<script lang="ts">
  import { AlertCircle } from "@lucide/svelte"
  import type { ExtractionResult } from "../../ts/model/ExtractionResult"
  import MetadataView from "../result/MetadataView.svelte"
  import ContentView from "../result/ContentView.svelte"
  import InputAndOptionsPanel from "../mainScreen/InputAndOptionsPanel.svelte"
  import type { MarkdownConversionResult } from "../../ts/model/MarkdownConversionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"

  let extractionResult = $state<ExtractionResult | undefined>(undefined)
  let convertResult = $state<MarkdownConversionResult | undefined>(undefined)
  let error = $state<string | undefined>(undefined)
</script>


<div class="h-full min-h-0">
  <div class="flex flex-col gap-4 w-full h-full min-h-0 max-w-100 lg:max-w-200 mx-auto">

    <InputAndOptionsPanel bind:extractionResult bind:convertResult bind:error />

    <!-- Extraction response -->
    <!-- Error -->
    {#if error}
      <div class="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
        <AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    {/if}

    <!-- Result -->
    {#if extractionResult}
      {#if extractionResult.metadata}
        <MetadataView metadata={extractionResult.metadata} />
      {/if}

      {#if extractionResult.content}
        <ContentView content={extractionResult.content} format={extractionResult.format} fetcher={extractionResult.fetch_result?.fetcher}
                     extractor={extractionResult.extraction_result?.extractor} converter={extractionResult.conversion_result?.converter} />
      {/if}
    {:else if convertResult && convertResult.content}
      <ContentView content={convertResult.content} format={OutputFormat.Markdown} />
    {/if}

  </div>
</div>