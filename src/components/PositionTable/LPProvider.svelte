<script lang="ts">
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";

  import LpProviderItem from "./TableItem/LPProviderItem.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  export let data;
  export let positions;
  export let position;

  const MultipleLang = {
    claimable: i18n("newtabPage.claimable", "Claimable"),
  };

  let defaultDataPositionFormat = [];
  let dataPositionFormat = [];
  let marketPrice;
  let sum = 0;
  let claimable = 0;

  $: {
    if (positions) {
      defaultDataPositionFormat = positions.map((item) => {
        return {
          ...item,
          market_price0: Number(item?.amount0Price?.price) || 0,
          market_price1: Number(item?.amount1Price?.price) || 0,
          initialValue:
            Number(item.amount0out) * (Number(item?.amount0Price?.price) || 0) +
              Number(item.amount1out) * Number(item?.amount1Price?.price) ||
            0 + item.claimable0Amount * Number(item?.amount0Price?.price) ||
            0 + item.claimable1Amount * Number(item?.amount1Price?.price) ||
            0,
        };
      });

      positions.map((item) => {
        const token0 = Number(item?.token0Info?.info?.cmc_id);
        const token1 = Number(item?.token1Info?.info?.cmc_id);
        priceSubscribe([token0, token1], (data) => {
          marketPrice = {
            id: data.id,
            market_price: data.p,
          };
        });
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

      claimable = (defaultDataPositionFormat || []).reduce(
        (prev, item) =>
          prev + item.claimable0Amount * Number(item?.amount0Price?.price) ||
          0 + item.claimable1Amount * Number(item?.amount1Price?.price) ||
          0,
        0
      );

      sum = (defaultDataPositionFormat || []).reduce(
        (prev, item) =>
          prev + Number(item.amount0out) * Number(item?.amount0Price?.price) ||
          0 + Number(item.amount1out) * Number(item?.amount1Price?.price) ||
          0 + item.claimable0Amount * Number(item?.amount0Price?.price) ||
          0 + item.claimable1Amount * Number(item?.amount1Price?.price) ||
          0,
        0
      );
    }
  }

  $: {
    if (marketPrice !== undefined) {
      const formatDataWithMarketPrice = defaultDataPositionFormat.map(
        (item) => {
          if (marketPrice.id === Number(item?.token0Info?.info?.cmc_id)) {
            return {
              ...item,
              market_price0: marketPrice.market_price,
              initialValue:
                Number(item.amount0out) * marketPrice.market_price +
                Number(item.amount1out) * item.market_price1 +
                item.claimable0Amount * marketPrice.market_price +
                item.claimable1Amount * item.market_price1,
            };
          }
          if (marketPrice.id === Number(item?.token1Info?.info?.cmc_id)) {
            return {
              ...item,
              market_price1: marketPrice.market_price,
              initialValue:
                Number(item.amount0out) * item.market_price0 +
                Number(item.amount1out) * marketPrice.market_price +
                item.claimable0Amount * item.market_price0 +
                item.claimable1Amount * marketPrice.market_price,
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
</script>

<div class="flex flex-col gap-5">
  <div class="flex justify-between items-end">
    <div class="text-xl font-semibold">{position}</div>
    <div class="flex flex-col gap-1">
      <div class="text-3xl font-semibold flex justify-end">
        $<TooltipBalance number={sum || data.currentValue} />
      </div>
      <div class="text-lg font-medium text-gray-600 flex justify-end gap-1">
        {MultipleLang.claimable}: $<TooltipBalance number={claimable} />
      </div>
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
