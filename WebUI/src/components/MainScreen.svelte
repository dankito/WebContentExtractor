<script lang="ts">
  import ExtractContentTab from "./extractContent/ExtractContentTab.svelte"
  import InputAndOptionsPanel from "./mainScreen/InputAndOptionsPanel.svelte"
  import ResultErrors from "./result/ResultErrors.svelte"
  import type { MarkdownConversionResult } from "../ts/model/MarkdownConversionResult"
  import { ExtractionAction } from "../ts/ui/ExtractionAction"
  import { SourceMode } from "../ts/ui/SourceMode"
  import ConvertResult from "./result/ConvertResult.svelte"
  import type { MultiFormatExtractionResult } from "../ts/model/MultiFormatExtractionResult"
  import { OutputFormat } from "../ts/model/OutputFormat"
  import { MarkdownConverter } from "../ts/model/MarkdownConverter"

  let action = $state<ExtractionAction>(ExtractionAction.Extract)
  let sourceMode = $state<SourceMode>(SourceMode.Url)
  let format = $state<OutputFormat>(OutputFormat.Markdown)

  let extractionResult = $state<MultiFormatExtractionResult | undefined>(undefined)
  let convertResults = $state<Record<MarkdownConverter, MarkdownConversionResult>>({})
  let error = $state<string | undefined>(undefined)

  let singleResult = $derived(action !== ExtractionAction.Convert || Object.keys(convertResults).length < 2)
</script>

<div class="flex flex-col gap-3 w-full h-full min-h-0 mx-auto p-3.5 ">
  <div class="flex flex-col gap-4 w-full h-full min-h-0">

    <div class="flex flex-col gap-4 w-full max-w-100 lg:max-w-200 mx-auto">
      <InputAndOptionsPanel bind:action bind:sourceMode bind:format bind:extractionResult bind:convertResults bind:error />

      <!-- Extraction response -->
      <!-- TODO -->
      <ResultErrors {error} extractionResult={action === ExtractionAction.Extract ? extractionResult : undefined}  />
    </div>

    <!-- Result -->
    <div class={[ "flex flex-col gap-4 w-full h-full min-h-0 mx-auto", singleResult ? "max-w-100 lg:max-w-200" : "" ]}>
      {#if action === ExtractionAction.Extract}
        <ExtractContentTab {extractionResult} requestedFormat={format} />
      {:else if action === ExtractionAction.Convert}
        <ConvertResult {convertResults} />
      {/if}
    </div>

  </div>
</div>