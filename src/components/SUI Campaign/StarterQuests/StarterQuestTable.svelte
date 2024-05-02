<script lang="ts">
  import { isDarkMode } from "~/store";
</script>

<div
  class={`flex-1 flex flex-col gap-3 rounded-[10px] xl:p-4 py-3 px-2 ${
    $isDarkMode ? "bg-[#222222]" : "bg-[#fff] xl:border border_0000001a"
  }`}
>
  <div class="text-xl font-medium">Quests</div>
  <div
    class={`rounded-[10px] py-1 px-3 ${$isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"}`}
  >
    hello world
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
