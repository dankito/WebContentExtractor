<script lang="ts">
  import type { Snippet } from "svelte"

  let { children, classes = undefined }: { children: Snippet, classes?: string } = $props()
</script>

<div class={[ "bg-white rounded-xl shadow-md", classes ]}>
  {@render children()}
</div>
