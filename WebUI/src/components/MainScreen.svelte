<script lang="ts">
  import ExtractContentTab from "./extractContent/ExtractContentTab.svelte"
  import InputAndOptionsPanel from "./mainScreen/InputAndOptionsPanel.svelte"
  import ResultErrors from "./result/ResultErrors.svelte"
  import type { ExtractionResult } from "../ts/model/ExtractionResult"
  import type { MarkdownConversionResult } from "../ts/model/MarkdownConversionResult"
  import { ExtractionAction } from "../ts/ui/ExtractionAction"
  import { SourceMode } from "../ts/ui/SourceMode"
  import ConvertResult from "./result/ConvertResult.svelte"

  let action = $state<ExtractionAction>(ExtractionAction.Extract)
  let sourceMode = $state<SourceMode>(SourceMode.Url)

  let extractionResult = $state<ExtractionResult | undefined>(undefined)
  let convertResult = $state<MarkdownConversionResult | undefined>(undefined)
  let error = $state<string | undefined>(undefined)
</script>

<div class="flex flex-col gap-3 w-full h-full min-h-0 mx-auto p-3.5 ">
  <div class="flex flex-col gap-4 w-full h-full min-h-0 max-w-100 lg:max-w-200 mx-auto">

    <InputAndOptionsPanel bind:action bind:sourceMode bind:extractionResult bind:convertResult bind:error />

    <!-- Extraction response -->
    <ResultErrors {error} fetchResult={extractionResult?.fetch_result} extractionResult={extractionResult?.extraction_result}
                  convertResult={convertResult ?? extractionResult?.conversion_result} />

    <!-- Result -->
    {#if action === ExtractionAction.Extract}
      <ExtractContentTab {extractionResult} />
    {:else if action === ExtractionAction.Convert}
      <ConvertResult {convertResult} />
    {/if}

  </div>
</div>