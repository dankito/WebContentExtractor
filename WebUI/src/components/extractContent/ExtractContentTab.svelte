<script lang="ts">
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import ExtractionResultView from "./ExtractionResultView.svelte"
  import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"
  import type { Duration } from "@shared/service/utils/Duration"

  let { extractionResults, requestedFormat, requestDuration }:
    { extractionResults: MultiFormatResponse[], requestedFormat: OutputFormat, requestDuration?: Duration } = $props()

</script>


<div class="h-full flex flex-row justify-evenly gap-2 min-h-0">
  {#each extractionResults as extractionResult}
    <ExtractionResultView {extractionResult} {requestedFormat} {requestDuration} />
  {/each}
</div>