<script lang="ts">
  import type { MultiFormatExtractionResult } from "../../ts/model/MultiFormatExtractionResult"
  import { OutputFormat } from "../../ts/model/OutputFormat"
  import ExtractionResultView from "./ExtractionResultView.svelte"

  let { extractionResults, requestedFormat }: { extractionResults: MultiFormatExtractionResult[], requestedFormat: OutputFormat } = $props()

</script>


<div class="h-full flex flex-row justify-evenly gap-2 min-h-0">
  {#each extractionResults as extractionResult}
    <ExtractionResultView {extractionResult} {requestedFormat} />
  {/each}
</div>