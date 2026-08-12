<script lang="ts">
  import type { ExtractedMetadata } from "@shared/model/ExtractedMetadata"
  import Card from "../common/form/Card.svelte"
  import { ChevronDown, Info } from "@lucide/svelte"

  let { metadata }: { metadata: ExtractedMetadata } = $props()

  let metaOpen = $state(true)
  let entries = $derived(Object.entries(metadata).filter(([, v]) => v != null))
</script>

{#if entries.length > 0}
  <Card classes="p-2">
      <button
          onclick={() => (metaOpen = !metaOpen)}
          class="flex items-center gap-1.5 w-full text-left text-xs font-medium text-zinc-600 hover:text-zinc-800 transition"
      >
        <Info class="w-3.5 h-3.5 text-primary" />
        Metadata
        <ChevronDown class="w-3.5 h-3.5 ml-auto transition-transform {metaOpen ? 'rotate-180' : ''}" />
      </button>
      {#if metaOpen}
        <dl class="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          {#each entries as [key, val]}
            <dt class="text-zinc-400 font-medium">{key}</dt>
            <dd class="text-zinc-700 wrap-break-word">{val}</dd>
          {/each}
        </dl>
      {/if}
  </Card>
{/if}