<script>
  import { isDarkMode } from "~/store";

  import Button from "~/components/Button.svelte";

  import gmPoints from "~/assets/Gold4.svg";

  const fakeData = [{}, {}, {}, {}, {}, {}];
</script>

<div
  class={`flex flex-col items-center gap-4 rounded-[10px] py-10 px-8 ${$isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"}`}
>
  <div class="text-3xl font-semibold">History</div>

  <div
    class={`flex flex-col items-center gap-2 w-full rounded-[10px] py-4 px-8 ${$isDarkMode ? "bg-black" : "border border_0000001a"}`}
  >
    <div class="text-base font-medium">Rewards</div>
    <div class="flex items-center gap-2">
      <img src={gmPoints} alt="" class="object-contain w-6 h-6" />
      <div class="font-medium text-3xl">450</div>
    </div>
  </div>

  <div
    class={`flex flex-col items-center gap-5 w-full px-8 py-8 rounded-[10px] ${$isDarkMode ? "bg-black" : "border border_0000001a"}`}
  >
    <table class="w-full">
      <thead>
        <tr>
          <th class="py-2">Time</th>
          <th class="py-2">Reward</th>
        </tr>
      </thead>
      {#each fakeData as item}
        <tbody>
          <tr>
            <td class="text-center py-2">1st April 2024</td>
            <td class="text-center py-2">
              <div class="flex justify-center items-center gap-1">
                <img src={gmPoints} alt="" class="w-3 h-3" />
                <div>1000</div>
              </div>
            </td>
          </tr>
        </tbody>
      {/each}
    </table>
  </div>

  <div class="w-max">
    <Button variant="tertiary">
      <div class="uppercase py-2 px-4">Copy All</div>
    </Button>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
