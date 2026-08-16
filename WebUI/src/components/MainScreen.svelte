<script lang="ts">
  import ExtractContentTab from "./extractContent/ExtractContentTab.svelte"
  import InputAndOptionsPanel from "./mainScreen/InputAndOptionsPanel.svelte"
  import ResultErrors from "./result/ResultErrors.svelte"
  import type { MarkdownConversionResult } from "@shared/model/MarkdownConversionResult"
  import { ExtractionAction } from "../ts/ui/ExtractionAction"
  import { SourceMode } from "../ts/ui/SourceMode"
  import ConvertResult from "./result/ConvertResult.svelte"
  import { OutputFormat } from "../ts/model/OutputFormat"
  import { MarkdownConverter } from "@shared/model/MarkdownConverter"
  import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
  import type { Duration } from "@shared/service/utils/Duration"

  let action = $state<ExtractionAction>(ExtractionAction.Extract)
  let sourceMode = $state<SourceMode>(SourceMode.Url)
  let format = $state<OutputFormat>(OutputFormat.Markdown)

  let extractionResults = $state<MultiFormatResponse[]>([])
  let convertResults = $state<Record<MarkdownConverter, MarkdownConversionResult>>({})
  let requestDuration = $state<Duration | undefined>(undefined)
  let error = $state<string | undefined>(undefined)

  let singleResult = $derived( action === ExtractionAction.Extract && extractionResults.filter(it => !!it.contentHtml).length < 2
    || action === ExtractionAction.Convert && Object.keys(convertResults).length < 2)
</script>

<div class="flex flex-col gap-3 w-full h-full min-h-0 mx-auto p-3.5 ">
  <div class="flex flex-col gap-4 w-full h-full min-h-0">

    <div class="flex flex-col gap-4 w-full max-w-100 lg:max-w-200 mx-auto">
      <InputAndOptionsPanel bind:action bind:sourceMode bind:format bind:extractionResults bind:convertResults bind:requestDuration bind:error />

      <!-- Extraction response -->
      <!-- TODO -->
      <ResultErrors {error} extractionResults={action === ExtractionAction.Extract ? extractionResults : []}  />
    </div>

    <!-- Result -->
    <div class={[ "flex flex-col gap-4 w-full h-full min-h-0 mx-auto", singleResult ? "max-w-100 lg:max-w-200" : "" ]}>
      {#if action === ExtractionAction.Extract}
        <ExtractContentTab {extractionResults} requestedFormat={format} {requestDuration} />
      {:else if action === ExtractionAction.Convert}
        <ConvertResult {convertResults} />
      {/if}
    </div>

  </div>
</div>