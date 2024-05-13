<script>
  import { isDarkMode } from "~/store";
  import { createQuery } from "@tanstack/svelte-query";
  import { getFlipCheck } from "~/lib/queryAPI";
  import dayjs from "dayjs";

  import gmPoints from "~/assets/Gold4.svg";

  let flipHistoryData = [];
  let totalReward = 0;

  $: queryFlipResult = createQuery({
    queryKey: ["check-flip"],
    queryFn: () => getFlipCheck(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryFlipResult.isError &&
      $queryFlipResult.data !== undefined &&
      $queryFlipResult?.data?.history?.length !== 0
    ) {
      flipHistoryData = $queryFlipResult?.data?.history;
      totalReward = flipHistoryData.reduce(
        (prev, item) => prev + Number(item.point),
        0
      );
    }
  }
</script>

<div>
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
      class={`flex flex-col items-center gap-5 w-full px-8 py-8 rounded-[10px] ${$isDarkMode ? "bg-black" : "border border_0000001a"}`}
    >
      <table class="w-full">
        <thead>
          <tr>
            <th class="py-2 text-xs uppercase font-medium">Time</th>
            <th class="py-2 text-xs uppercase font-medium">Reward</th>
          </tr>
        </thead>

        <tbody>
          {#if flipHistoryData.length === 0}
            <tr>
              <td colspan="2">
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
                <td class="text-center py-2 text-sm font-medium uppercase">
                  {dayjs(item?.actualTime).format("YYYY-MM-DD")}</td
                >
                <td class="text-center py-2">
                  <div class="flex justify-center items-center gap-1">
                    <img src={gmPoints} alt="" class="w-3 h-3" />
                    <div class="text-sm font-medium uppercase">
                      {item?.point}
                    </div>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
