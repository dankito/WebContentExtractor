<script lang="ts">
  import { CircleAlert } from "@lucide/svelte"
  import type { Snippet } from "svelte"

  let { children }: { children: Snippet } = $props()
</script>

<div class="flex items-center justify-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm shadow-md">
  <CircleAlert class="w-4 h-4 mt-0.5 shrink-0" />
  {@render children()}
</div>