<script lang="ts">
  import { isDarkMode } from "~/store";
  import dayjs from "dayjs";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { timeFrame } from "~/utils";

  import Loading from "~/components/Loading.svelte";
  import TokenHoldingTradeItem from "./TokenHoldingTradeItem.svelte";

  export let holdingTokenData;
  export let isLoading;

  let sortTypePnl = "default";
  let sortTypeLastActivity = "asc";
  let selectedTimeFrame: "7D" | "30D" | "3M" | "1Y" | "ALL" = "30D";

  $: formatData = holdingTokenData
    .map((item) => {
      return {
        ...item,
        pnl:
          Number(item?.balance || 0) * Number(item?.price?.price || 0) +
          Number(item?.profit?.totalGain || 0) -
          Number(item?.profit?.cost || 0),
      };
    })
    .sort(
      (a, b) =>
        dayjs(b?.profit?.latestTrade).valueOf() -
        dayjs(a?.profit?.latestTrade).valueOf()
    )
    .filter((element) => {
      switch (selectedTimeFrame) {
        case "7D":
          return (
            dayjs().subtract(8, "day").valueOf() <
            dayjs(element?.profit?.latestTrade).valueOf()
          );
        case "30D":
          return (
            dayjs().subtract(1, "month").valueOf() <
            dayjs(element?.profit?.latestTrade).valueOf()
          );
        case "3M":
          return (
            dayjs().subtract(3, "month").valueOf() <
            dayjs(element?.profit?.latestTrade).valueOf()
          );
        case "1Y":
          return (
            dayjs().subtract(1, "year").valueOf() <
            dayjs(element?.profit?.latestTrade).valueOf()
          );
        case "ALL":
          return element;
      }
    });

  const toggleSortPnl = () => {
    sortTypeLastActivity = "default";
    switch (sortTypePnl) {
      case "default":
        sortTypePnl = "asc";
        break;
      case "asc":
        sortTypePnl = "desc";
        break;
      case "desc":
        sortTypePnl = "default";
        break;
      default:
        sortTypePnl = "default";
    }

    if (sortTypePnl === "asc") {
      formatData = formatData.sort((a, b) => b.pnl - a.pnl);
    }
    if (sortTypePnl === "desc") {
      formatData = formatData.sort((a, b) => a.pnl - b.pnl);
    }
    if (sortTypePnl === "default") {
      formatData = holdingTokenData.map((item) => {
        return {
          ...item,
          realizedProfit: item?.profit?.realizedProfit
            ? Number(item?.profit?.realizedProfit)
            : 0,
        };
      });
    }
  };

  const toggleSortLastActivity = () => {
    sortTypePnl = "default";
    switch (sortTypeLastActivity) {
      case "default":
        sortTypeLastActivity = "asc";
        break;
      case "asc":
        sortTypeLastActivity = "desc";
        break;
      case "desc":
        sortTypeLastActivity = "default";
        break;
      default:
        sortTypeLastActivity = "default";
    }

    if (sortTypeLastActivity === "asc") {
      formatData = formatData.sort(
        (a, b) =>
          dayjs(b?.profit?.latestTrade).valueOf() -
          dayjs(a?.profit?.latestTrade).valueOf()
      );
    }
    if (sortTypeLastActivity === "desc") {
      formatData = formatData.sort(
        (a, b) =>
          dayjs(a?.profit?.latestTrade).valueOf() -
          dayjs(b?.profit?.latestTrade).valueOf()
      );
    }
    if (sortTypeLastActivity === "default") {
      formatData = holdingTokenData.map((item) => {
        return {
          ...item,
          realizedProfit: item?.profit?.realizedProfit
            ? Number(item?.profit?.realizedProfit)
            : 0,
        };
      });
    }
  };

  $: sortIcon = (sortType) => {
    return `<svg
                    height="0.9rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g id="SVGRepo_bgCarrier" stroke-width="0" /><g
                      id="SVGRepo_tracerCarrier"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <g id="SVGRepo_iconCarrier">
                      <path
                        d="M16.0686 15H7.9313C7.32548 15 7.02257 15 6.88231 15.1198C6.76061 15.2238 6.69602 15.3797 6.70858 15.5393C6.72305 15.7232 6.93724 15.9374 7.36561 16.3657L11.4342 20.4344C11.6323 20.6324 11.7313 20.7314 11.8454 20.7685C11.9458 20.8011 12.054 20.8011 12.1544 20.7685C12.2686 20.7314 12.3676 20.6324 12.5656 20.4344L16.6342 16.3657C17.0626 15.9374 17.2768 15.7232 17.2913 15.5393C17.3038 15.3797 17.2392 15.2238 17.1175 15.1198C16.9773 15 16.6744 15 16.0686 15Z"
                        stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "desc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M7.9313 9.00005H16.0686C16.6744 9.00005 16.9773 9.00005 17.1175 8.88025C17.2393 8.7763 17.3038 8.62038 17.2913 8.46082C17.2768 8.27693 17.0626 8.06274 16.6342 7.63436L12.5656 3.56573C12.3676 3.36772 12.2686 3.26872 12.1544 3.23163C12.054 3.199 11.9458 3.199 11.8454 3.23163C11.7313 3.26872 11.6323 3.36772 11.4342 3.56573L7.36561 7.63436C6.93724 8.06273 6.72305 8.27693 6.70858 8.46082C6.69602 8.62038 6.76061 8.7763 6.88231 8.88025C7.02257 9.00005 7.32548 9.00005 7.9313 9.00005Z"
                         stroke="${$isDarkMode ? "#ffffff" : "#000000"}"
                        fill="${
                          sortType === "default" || sortType === "asc"
                            ? $isDarkMode
                              ? "#ffffff"
                              : "#000000"
                            : ""
                        }"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                  </svg>`;
  };
</script>

<div
  class="col-span-4 border border_0000001a rounded-xl flex flex-col gap-3 p-6"
>
  <div class="flex justify-between text-3xl font-medium xl:text-xl">
    <div class="text-3xl font-medium xl:text-xl">Holding Trades</div>
    <div class="flex justify-between">
      <AnimateSharedLayout>
        {#each timeFrame as type}
          <div
            class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
            on:click={() => {
              if (formatData && formatData.length === 0) {
                return;
              }
              selectedTimeFrame = type.value;
            }}
          >
            <div
              class={`relative z-2 ${
                type.value === selectedTimeFrame && "text-white"
              }`}
            >
              {type.label}
            </div>
            {#if type.value === selectedTimeFrame}
              <Motion
                let:motion
                layoutId="active-pill"
                transition={{ type: "spring", duration: 0.6 }}
              >
                <div
                  class={`absolute inset-0 rounded-full z-1 ${
                    formatData && formatData.length === 0
                      ? "bg-[#dddddd]"
                      : "bg-[#1E96FC]"
                  }`}
                  use:motion
                />
              </Motion>
            {/if}
          </div>
        {/each}
      </AnimateSharedLayout>
    </div>
  </div>

  <div
    class={`rounded-[10px] xl:overflow-y-auto overflow-auto max-h-[405px] ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    <table class="table-auto xl:w-full w-[2000px] h-full">
      <thead class="sticky top-0 z-9">
        <tr class="bg_f4f5f8">
          <th
            class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[250px]"
          >
            <div class="text-left xl:text-xs text-xl uppercase font-medium">
              Assets
            </div>
          </th>
          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Price
            </div>
          </th>
          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Amount
            </div>
          </th>
          <th class="py-3">
            <div class="text-right xl:text-xs text-xl uppercase font-medium">
              Avg Cost
            </div>
          </th>
          <th class="py-3">
            <div
              class="flex items-center justify-end gap-2 cursor-pointer"
              on:click={toggleSortPnl}
            >
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                Pnl
              </div>
              <div>
                {@html sortIcon(sortTypePnl)}
              </div>
            </div>
          </th>
          <th class="py-3 pr-3 rounded-tr-[10px]">
            <div
              class="flex items-center justify-end gap-2 cursor-pointer"
              on:click={toggleSortLastActivity}
            >
              <div class="text-right xl:text-xs text-xl uppercase font-medium">
                Last activity
              </div>
              <div>
                {@html sortIcon(sortTypeLastActivity)}
              </div>
            </div>
          </th>
        </tr>
      </thead>

      {#if isLoading}
        <tbody>
          <tr>
            <td colspan={6}>
              <div class="flex justify-center items-center h-full py-3 px-3">
                <Loading />
              </div>
            </td>
          </tr>
        </tbody>
      {:else}
        <tbody>
          {#if formatData && formatData.length === 0}
            <tr>
              <td colspan={6}>
                <div
                  class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                >
                  Empty
                </div>
              </td>
            </tr>
          {:else}
            {#each formatData.filter((item) => Number(item?.amount) * Number(item?.price?.price) > 0) as data, index}
              <TokenHoldingTradeItem
                {data}
                lastIndex={formatData.length - 1 === index}
              />
            {/each}
          {/if}
        </tbody>
      {/if}
    </table>
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
