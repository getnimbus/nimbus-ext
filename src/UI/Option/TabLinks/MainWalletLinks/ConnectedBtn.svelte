<script lang="ts">
  import { isDarkMode } from "~/store";
  import { shorterAddress } from "~/utils";

  export let logo;
  export let address;

  import Copy from "~/components/Copy.svelte";
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border py-3 px-6 rounded-[12px] w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
>
  <img src={logo} alt="" width="24" height="24" />
  <Copy
    {address}
    iconColor={$isDarkMode ? "#fff" : "#000"}
    color={$isDarkMode ? "#fff" : "#000"}
    isShorten
  />
</div>

<style windi:preflights:global windi:safelist:global>
</style>
