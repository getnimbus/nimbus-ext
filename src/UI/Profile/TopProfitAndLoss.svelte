<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import dayjs from "dayjs";
  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";
  import type { HoldingTokenRes } from "~/types/HoldingTokenData";

  export let selectedAddress;

  let closedHoldingPosition = [];

  let top5ProfitToken = [];
  let top5LossToken = [];

  const getHoldingToken = async (address) => {
    const response: HoldingTokenRes = await nimbus
      .get(`/v2/address/${address}/holding?chain=ALL`)
      .then((response) => response.data);
    return response;
  };

  const handleFilter30Day = (item) => {
    const date = dayjs(item?.last_transferred_at);
    const thirtyDaysInMilliseconds = 30 * 24 * 60 * 60 * 1000;
    return (
      thirtyDaysInMilliseconds - dayjs(dayjs()).diff(date, "millisecond") > 0
    );
  };

  const formatDataHoldingToken = (dataTokenHolding) => {
    const formatData = dataTokenHolding
      .map((item) => {
        return {
          ...item,
          value:
            Number(item?.amount) * Number(item?.price?.price || item?.rate),
        };
      })
      .sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });

    closedHoldingPosition = formatData
      .filter((item) => item?.profit?.realizedProfit)
      .filter(handleFilter30Day)
      .map((item) => {
        return {
          ...item,
          realizedProfit: item?.profit?.realizedProfit,
          percentRealizedProfit:
            (item?.avgCost || 0) === 0
              ? 0
              : (Number(item?.profit?.realizedProfit) /
                  Number(Math.abs(item?.avgCost))) *
                100,
        };
      });

    const listProfitToken = [];
    const listLossToken = [];

    closedHoldingPosition.map((item) => {
      if (item.realizedProfit < 0) {
        listLossToken.push(item);
      } else {
        listProfitToken.push(item);
      }
    });

    top5ProfitToken = listProfitToken
      .sort((a, b) => b.realizedProfit - a.realizedProfit)
      .slice(0, 5);
    top5LossToken = listLossToken
      .sort((a, b) => a.realizedProfit - b.realizedProfit)
      .slice(0, 5);
  };

  $: queryTokenHolding = createQuery({
    queryKey: ["token-holding", selectedAddress],
    queryFn: () => getHoldingToken(selectedAddress),
    staleTime: Infinity,
    enabled: selectedAddress?.length !== 0 && Object.keys($user).length !== 0,
  });

  $: {
    if (
      !$queryTokenHolding.isError &&
      $queryTokenHolding.data &&
      $queryTokenHolding.data !== undefined
    ) {
      formatDataHoldingToken($queryTokenHolding.data);
    }
  }
</script>

<div class="col-span-4 grid grid-cols-2 flex flex-col gap-5">
  <div class="flex flex-col border border_0000001a rounded-xl px-6 py-6">
    <div class="flex justify-start xl:text-xl text-3xl font-medium mb-5">
      Top 5 Profit (30D)
    </div>
    <div class="flex flex-col gap-4">
      {#if $queryTokenHolding.isLoading}
        <div class="flex justify-center items-center">
          <Loading />
        </div>
      {:else if top5ProfitToken.length === 0}
        <div class="flex items-center justify-center">
          There is no closed holding position in the last 30 day
        </div>
      {:else}
        {#each top5ProfitToken as item}
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <img
                src={item.logo}
                alt=""
                width="30"
                height="30"
                on:error={({ target }) => {
                  target.src =
                    "https://raw.githubusercontent.com/getnimbus/assets/main/token.png";
                }}
                class="rounded-full"
              />
              <span class="text-lg xl:text-xs font-medium">
                {item.name}
              </span>
            </div>
            <span class="text-green-400 xl:text-base text-lg">
              <TooltipNumber number={item.realizedProfit} type="value" />
              <!-- (+<TooltipNumber number={32} type="percent" />X) -->
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
  <div class="flex flex-col border border_0000001a rounded-xl px-6 py-6">
    <div class="flex justify-start xl:text-xl text-3xl font-medium mb-5">
      Top 5 Loss (30D)
    </div>
    <div class="flex flex-col gap-4">
      {#if $queryTokenHolding.isLoading}
        <div class="flex justify-center items-center">
          <Loading />
        </div>
      {:else if top5LossToken.length === 0}
        <div class="flex items-center justify-center">
          There is no closed holding position in the last 30 day
        </div>
      {:else}
        {#each top5LossToken as item}
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <img
                src={item.logo}
                alt=""
                width="30"
                height="30"
                on:error={({ target }) => {
                  target.src =
                    "https://raw.githubusercontent.com/getnimbus/assets/main/token.png";
                }}
                class="rounded-full"
              />
              <span class="text-lg xl:text-xs font-medium">
                {item.name}
              </span>
            </div>
            <span class="text-red-500 xl:text-base text-lg">
              <TooltipNumber number={item.realizedProfit} type="value" />
              <!-- (-<TooltipNumber number={32} type="percent" />X) -->
            </span>
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style windi:preflights:global windi:safelist:global></style>
