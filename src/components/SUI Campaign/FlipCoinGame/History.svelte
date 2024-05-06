<script>
  import { isDarkMode } from "~/store";

  import gmPoints from "~/assets/Gold4.svg";

  const fakeData = [{}, {}, {}, {}, {}, {}];
</script>

<div
  class={`flex flex-col items-center gap-4 rounded-[20px] py-10 px-8 ${$isDarkMode ? "bg-[#222222] text-white" : "border text-[#666666]"}`}
>
  <div
    class={`text-3xl font-semibold ${$isDarkMode ? "text-white" : "text-black"}`}
  >
    History
  </div>

  <div
    class={`flex flex-col items-center gap-2 w-full rounded-md py-4 px-8 ${$isDarkMode ? "bg-black" : "border text-[#666666]"}`}
  >
    <div class="text-sm font-medium">Rewards</div>
    <div class="flex items-center gap-2">
      <img src={gmPoints} alt="" class="object-contain w-6 h-6" />
      <div class="font-medium text-3xl">450</div>
    </div>
  </div>
  <div
    class={`flex flex-col items-center gap-5 w-full px-8 py-8 rounded-md ${$isDarkMode ? "bg-black" : "border text-[#666666]"}`}
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
                <div>1000</div>
                <div><img src={gmPoints} alt="" class="w-3 h-3" /></div>
              </div>
            </td>
          </tr>
        </tbody>
      {/each}
    </table>
  </div>

  <button
    class="bg-[#1E96FC] text-white shadow-bottom shadow-blue-700 rounded-md uppercase py-2 px-4"
  >
    Copy All
  </button>
</div>

<style>
  .shadow-bottom:hover {
    box-shadow: 2px 4px 0 0 var(--tw-shadow-color);
  }
</style>
