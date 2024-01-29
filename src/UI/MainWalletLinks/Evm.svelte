<script lang="ts">
  import { isDarkMode } from "~/store";

  import Evm from "~/assets/chains/evm.png";
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={() => {
    console.log("connect EVM");
  }}
>
  <img src={Evm} alt="" width="24" height="24" />
  <div class="font-semibold text-[15px]">Connect EVM</div>
</div>

<style></style>
