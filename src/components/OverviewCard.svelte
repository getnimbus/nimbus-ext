<script lang="ts">
  export let title;
  export let tooltipText = "";
  export let link = "";
  export let isTooltip = false;

  import TooltipTitle from "~/components/TooltipTitle.svelte";
</script>

<div
  class="flex-1 py-4 px-6 rounded-lg flex flex-col items-start gap-1 bg-white"
>
  {#if isTooltip}
    <TooltipTitle {tooltipText} {link}>
      <div class="text-[#00000099] text-base font-medium">
        {title}
      </div>
    </TooltipTitle>
  {:else}
    <div class="text-[#00000099] text-base font-medium">
      {title}
    </div>
  {/if}
  <slot />
</div>

<style></style>
