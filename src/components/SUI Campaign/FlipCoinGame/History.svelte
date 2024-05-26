<script>
  import { isDarkMode } from "~/store";
  import dayjs from "dayjs";
  import dayjsUTC from "dayjs/plugin/utc";
  dayjs.extend(dayjsUTC);

  import gmPoints from "~/assets/Gold4.svg";

  import Copy from "~/components/Copy.svelte";

  export let flipHistoryData = [];
  export let totalReward = 0;
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
      <div class="font-medium text-3xl">{totalReward}</div>
    </div>
  </div>

  <div
    class={`w-full px-4 py-6 rounded-[10px] ${$isDarkMode ? "bg-black" : "border border_0000001a"}`}
  >
    <div class="md:block hidden h-[305px] overflow-y-auto">
      <table class="w-full h-full">
        <thead>
          <tr>
            <th
              class={`py-2 pl-3 text-xs uppercase font-medium text-left sticky top-0 ${$isDarkMode ? "bg-black" : "bg-white"}`}
              >Time</th
            >
            <th
              class={`py-2 text-xs uppercase font-medium text-left sticky top-0 ${$isDarkMode ? "bg-black" : "bg-white"}`}
            >
              Status
            </th>
            <th
              class={`py-2 text-xs uppercase font-medium text-center sticky top-0 ${$isDarkMode ? "bg-black" : "bg-white"}`}
            >
              Reward
            </th>
            <th
              class={`py-2 pr-3 text-xs uppercase font-medium text-right sticky top-0 ${$isDarkMode ? "bg-black" : "bg-white"}`}
            >
              Trx
            </th>
          </tr>
        </thead>

        <tbody>
          {#if flipHistoryData && flipHistoryData?.length === 0}
            <tr>
              <td colspan="4">
                <div
                  class="flex justify-center items-center h-full py-4 px-3 text-base text-gray-400"
                >
                  Empty
                </div>
              </td>
            </tr>
          {:else}
            {#each flipHistoryData as item}
              <tr>
                <td class="text-left py-2 pl-3 text-sm uppercase">
                  {dayjs(item?.createdAt).utc().format("YYYY-MM-DD hh:mm:ss A")}
                </td>

                <td class="text-left py-2 text-sm uppercase">
                  {#if Number(item?.point) >= 1000}
                    Win
                  {:else}
                    Lose
                  {/if}
                </td>

                <td class="py-2">
                  <div class="flex justify-center items-center gap-1">
                    <img src={gmPoints} alt="" class="w-3 h-3" />
                    <div class="text-sm uppercase">
                      {item?.point}
                    </div>
                  </div>
                </td>

                <td class="flex justify-end py-2 pr-3 text-sm uppercase">
                  <div class="w-max">
                    <Copy
                      address={item?.description}
                      textTooltip="Copy transaction to clipboard"
                      iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                      color={`${$isDarkMode ? "#fff" : "#000"}`}
                      isShorten={true}
                      isLink={true}
                      link={`https://suiscan.xyz/mainnet/tx/${item?.description}`}
                    />
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <div class="md:hidden block">
      {#if flipHistoryData && flipHistoryData?.length === 0}
        <div
          class="flex justify-center items-center h-full py-3 px-3 text-lg text-gray-400"
        >
          Empty
        </div>
      {:else}
        {#each flipHistoryData as item}
          <div
            class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-4"
          >
            <div class="flex justify-between items-center">
              <div class="text-right text-sm uppercase font-medium">Time</div>

              <div
                class="flex items-center justify-end gap-2 font-medium text-sm text_00000099"
              >
                {dayjs(item?.createdAt).format("YYYY-MM-DD hh:mm:ss A")}
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="text-right text-sm uppercase font-medium">Status</div>

              <div
                class="flex items-center justify-end gap-2 font-medium text-sm text_00000099"
              >
                {#if Number(item?.point) >= 1000}
                  Win
                {:else}
                  Lose
                {/if}
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="text-right text-sm uppercase font-medium">Reward</div>

              <div
                class="flex items-center justify-end gap-1 font-medium text-sm text_00000099"
              >
                <img src={gmPoints} alt="" class="w-3 h-3" />
                <div class="text-sm uppercase">
                  {item?.point}
                </div>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <div class="text-right text-sm uppercase font-medium">Trx</div>

              <div
                class="flex items-center justify-end font-medium text-sm text_00000099"
              >
                <div class="w-max">
                  <Copy
                    address={item?.description}
                    textTooltip="Copy transaction to clipboard"
                    iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                    color={`${$isDarkMode ? "#fff" : "#000"}`}
                    isShorten={true}
                    isLink={true}
                    link={`https://suiscan.xyz/mainnet/tx/${item?.description}`}
                  />
                </div>
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
</style>
