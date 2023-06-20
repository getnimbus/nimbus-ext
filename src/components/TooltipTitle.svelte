<script lang="ts">
  import tooltip from "~/entries/contentScript/views/tooltip";

  import information from "~/assets/information.png";

  export let tooltipText;
  export let link = "";
  export let isBigIcon = false;
</script>

<span class="flex justify-end items-center gap-2">
  <slot />
  <span class="cursor-pointer">
    <img
      src={information}
      alt=""
      class={`${isBigIcon ? "w-4 h-4" : "w-3 h-3"}`}
      use:tooltip={{
        content: `<tooltip-detail text="${tooltipText}"  link="${link}"/>`,
        allowHTML: true,
        placement: "top",
        interactive: true,
      }}
    />
  </span>
</span>

<style>
</style>
