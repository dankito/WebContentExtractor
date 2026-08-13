<script lang="ts">
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import ExtractionResultView from "./ExtractionResultView.svelte"
  import type { MultiFormatResponse } from "@shared/model/responses/MultiFormatResponse"

  let { extractionResults, requestedFormat }: { extractionResults: MultiFormatResponse[], requestedFormat: OutputFormat } = $props()

</script>


<div class="h-full flex flex-row justify-evenly gap-2 min-h-0">
  {#each extractionResults as extractionResult}
    <ExtractionResultView {extractionResult} {requestedFormat} />
  {/each}
</div>