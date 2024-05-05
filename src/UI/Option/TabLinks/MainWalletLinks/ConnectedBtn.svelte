<script lang="ts">
  import { isDarkMode } from "~/store";
  import { shorterAddress } from "~/utils";

  export let logo;
  export let address;
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
>
  <img src={logo} alt="" width="24" height="24" />
  {shorterAddress(address)}
</div>

<style windi:preflights:global windi:safelist:global>
</style>
