<script lang="ts">
  import tooltip from "~/entries/contentScript/views/tooltip";

  import information from "~/assets/information.png";

  export let tooltipText = "";
  export let link = "";
  export let isBigIcon = false;
  export let type: "warning" | "default" = "default";
</script>

<span class="inline-flex justify-end items-center gap-1 relative">
  <slot />
  <span class="cursor-pointer">
    {#if type === "default"}
      <img
        src={information}
        alt=""
        class={`${isBigIcon ? "w-4 h-4" : "w-3 h-3"}`}
        use:tooltip={{
          content: `<tooltip-detail text="${tooltipText}"  link="${link}" />`,
          allowHTML: true,
          placement: "top",
          interactive: true,
        }}
      />
    {:else}
      <span
        class={`text-red-500 ${isBigIcon ? "w-4 h-4" : "w-3 h-3"}`}
        use:tooltip={{
          content: `<tooltip-detail text="${tooltipText}"  link="${link}" />`,
          allowHTML: true,
          placement: "top",
          interactive: true,
        }}
      >
        ⚠︎
      </span>
    {/if}
  </span>
</span>

<style>
</style>
