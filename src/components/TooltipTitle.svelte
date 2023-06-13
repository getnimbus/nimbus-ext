<script lang="ts">
  import tooltip from "~/entries/contentScript/views/tooltip";

  import information from "~/assets/information.png";

  export let tooltipText;
</script>

<span class="flex justify-end items-center gap-1">
  <slot />
  <img
    src={information}
    alt=""
    class="w-3 h-3 cursor-pointer"
    use:tooltip={{
      content: `<tooltip-detail text="${tooltipText}" />`,
      allowHTML: true,
      placement: "top",
    }}
  />
</span>

<style>
</style>
