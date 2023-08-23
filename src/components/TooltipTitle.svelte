<script lang="ts">
  import { isDarkMode } from "~/store";
  import tooltip from "~/entries/contentScript/views/tooltip";

  import information from "~/assets/information.svg";
  import information_white from "~/assets/information_white.svg";

  export let tooltipText = "";
  export let link = "";
  export let isBigIcon = false;
  export let type: "warning" | "default" = "default";
  export let isExplainVideo = false;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });
</script>

<span class="inline-flex justify-end items-center gap-1 relative">
  <slot />
  <span class="cursor-pointer">
    {#if type === "default"}
      <img
        src={darkMode ? information_white : information}
        alt=""
        class={`${isBigIcon ? "w-4 h-4" : "w-3 h-3"}`}
        use:tooltip={{
          content: isExplainVideo
            ? tooltipText
            : `<tooltip-detail text="${tooltipText}"  link="${link}" />`,
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
