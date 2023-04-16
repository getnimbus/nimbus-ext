<script lang="ts">
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";

  import LpProviderItem from "./TableItem/LPProviderItem.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  export let data;
  export let positions;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };

  let defaultDataPositionFormat = [];
  let dataPositionFormat = [];
  let marketPrice0;
  let marketPrice1;
  let sum = 0;
  let claimable = 0;

  $: {
    if (positions) {
      defaultDataPositionFormat = positions.map((item) => {
        return {
          ...item,
          market_price0: item?.amount0Price?.price || 0,
          market_price1: item?.amount1Price?.price || 0,
          initialValue:
            Number(item.amount0out) * item?.amount0Price?.price ||
            0 + Number(item.amount1out) * item?.amount1Price?.price ||
            0 + item.claimable0Amount * item?.amount0Price?.price ||
            0 + item.claimable1Amount * item?.amount1Price?.price ||
            0,
        };
      });

      positions.map((item) => {
        const token0 = Number(item?.token0Info?.info?.cmc_id);
        const token1 = Number(item?.token1Info?.info?.cmc_id);
        if (token0) {
          priceSubscribe([token0], (data) => {
            marketPrice0 = {
              id: data.id,
              market_price: data.p,
            };
          });
        }
        if (token1) {
          priceSubscribe([token1], (data) => {
            marketPrice1 = {
              id: data.id,
              market_price: data.p,
            };
          });
        }
      });

      dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
        if (a.initialValue < b.initialValue) {
          return 1;
        }
        if (a.initialValue > b.initialValue) {
          return -1;
        }
        return 0;
      });
    }
  }

  $: {
    if (marketPrice0 !== undefined && marketPrice1 !== undefined) {
      const formatDataWithMarketPrice = defaultDataPositionFormat.map(
        (item) => {
          if (marketPrice0.id === Number(item?.token0Info?.info?.cmc_id)) {
            return {
              ...item,
              market_price0: marketPrice0.market_price,
            };
          }
          if (marketPrice1.id === Number(item?.token1Info?.info?.cmc_id)) {
            return {
              ...item,
              market_price1: marketPrice1.market_price,
            };
          }
          if (marketPrice0.market_price && marketPrice1.marketPrice1) {
            return {
              ...item,
              initialValue:
                Number(item.amount0out) * marketPrice0.market_price +
                Number(item.amount1out) * marketPrice1.market_price +
                item.claimable0Amount * marketPrice0.market_price +
                item.claimable1Amount * marketPrice1.market_price,
            };
          }

          return { ...item };
        }
      );
      defaultDataPositionFormat = formatDataWithMarketPrice;
      dataPositionFormat = formatDataWithMarketPrice.sort((a, b) => {
        if (a.initialValue < b.initialValue) {
          return 1;
        }
        if (a.initialValue > b.initialValue) {
          return -1;
        }
        return 0;
      });

      claimable = (formatDataWithMarketPrice || []).reduce(
        (prev, item) =>
          prev +
          item.claimable0Amount * item.market_price0 +
          item.claimable1Amount * item.market_price1,
        0
      );

      sum = (formatDataWithMarketPrice || []).reduce(
        (prev, item) =>
          prev +
          Number(item.amount0out) * item.market_price0 +
          Number(item.amount1out) * item.market_price1 +
          item.claimable0Amount * item.market_price0 +
          item.claimable1Amount * item.market_price1,
        0
      );
    }
  }

  $: console.log({
    defaultDataPositionFormat,
    positions,
  });
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-center">
    <div class="flex items-center gap-3">
      <img src={data.logo} alt="logo" width={40} height={40} />
      <a
        href={data.url}
        target="_blank"
        class="text-lg font-semibold uppercase"
      >
        {data.protocol}
      </a>
    </div>
    <div class="flex flex-col gap-1">
      {#if sum !== 0 && claimable !== 0}
        <div class="text-3xl font-semibold flex justify-end">
          $<TooltipBalance number={sum} />
        </div>
        <div class="text-lg font-medium text-gray-600 flex justify-end gap-1">
          {MultipleLang.claimable}: $<TooltipBalance number={claimable} />
        </div>
      {:else}
        <loading-icon />
      {/if}
    </div>
  </div>
  <div class="border border-[#0000000d] rounded-[10px]">
    <table class="table-auto w-full">
      <thead>
        <tr class="bg-[#f4f5f880]">
          <th class="pl-3 py-3">
            <div class="text-sm font-semibold text-black uppercase text-left">
              Pool
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              Liquidity Range
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              Balance ($)
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              Claimable ($)
            </div>
          </th>
          <th class="py-3">
            <div class="text-sm font-semibold text-black uppercase text-right">
              Value ($)
            </div>
          </th>
          <th class="pr-3 py-3">
            <div class="text-sm font-semibold text-black uppercase text-right">
              Profit & Loss
            </div>
          </th>
        </tr>
      </thead>
      {#each dataPositionFormat as item}
        <LpProviderItem data={item} />
      {/each}
    </table>
  </div>
</div>

<style>
</style>
