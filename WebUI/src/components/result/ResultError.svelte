<script lang="ts">
  import { AlertCircle } from "@lucide/svelte"
  import type { WebFetcherResult } from "../../ts/model/WebFetcherResult"

  let { error, fetchResult }:
    { error?: string, fetchResult?: WebFetcherResult } = $props()
</script>

{#if error}
  <div class="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-md">
    <AlertCircle class="w-4 h-4 mt-0.5 shrink-0" />
    <span>{error}</span>
  </div>
{/if}