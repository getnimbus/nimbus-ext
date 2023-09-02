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
            : `<tooltip-detail text="${tooltipText}" link="${link}" />`,
          allowHTML: true,
          placement: "top",
          interactive: true,
        }}
      />
    {:else}
      <span
        class={`text-yellow-400 ${isBigIcon ? "w-5 h-5" : "w-3 h-3"}`}
        use:tooltip={{
          content: `<tooltip-detail text="${tooltipText}" link="${link}" />`,
          allowHTML: true,
          placement: "top",
          interactive: true,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          class="w-5 h-5"
        >
          <path
            fill-rule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    {/if}
  </span>
</span>

<style>
</style>
