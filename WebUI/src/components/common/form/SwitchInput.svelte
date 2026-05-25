<script lang="ts">
  let { label, value = $bindable(undefined), labelPlacement = "right", onChange = undefined, disabled = false }:
    { label: string; value: boolean | undefined; labelPlacement?: "left" | "right"; onChange?: (value: boolean) => void; disabled?: boolean } = $props()

  function toggle() {
    if (disabled) return
    value = !value
    onChange?.(value)
  }
</script>

<button
    type="button"
    role="switch"
    aria-checked={value ?? false}
    aria-label={label}
    {disabled}
    onclick={(e) => { e.stopPropagation(); toggle() }}
    class="group flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none"
>
  {#if label && labelPlacement === "left"}
    <span class="select-none text-gray-700">{label}</span>
  {/if}

  <span
      class={[
      "relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-200",
      "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-amber-400",
      value ? "bg-amber-400" : "bg-zinc-300/70"
    ]}
  >
    <span
        class={[
        "absolute top-[3px] inline-block h-[18px] w-[18px] rounded-full bg-white",
        "shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-transform duration-200",
        value ? "translate-x-[19px]" : "translate-x-[3px]"
      ]}
    ></span>
  </span>

  {#if label && labelPlacement !== "left"}
    <span class="select-none text-gray-700">{label}</span>
  {/if}
</button>