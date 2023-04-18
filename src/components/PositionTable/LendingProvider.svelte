<script lang="ts">
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";

  import LendingProviderItem from "./TableItem/LendingProviderItem.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

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
          market_price: item?.price?.price || 0,
          initialValue: item?.price?.price || 0 * item?.amount,
        };
      });

      positions.map((item) => {
        priceSubscribe([item?.cmc_id], (data) => {
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
        (prev, item) => prev + item.claimable,
        0
      );

      sum = (defaultDataPositionFormat || []).reduce(
        (prev, item) => prev + (item?.price?.price || 0) * item?.amount,
        0
      );
    }
  }

  $: {
    if (marketPrice !== undefined) {
      const formatDataWithMarketPrice = defaultDataPositionFormat.map(
        (item) => {
          if (marketPrice.id === item?.cmc_id) {
            return {
              ...item,
              market_price: marketPrice.market_price,
              initialValue: marketPrice.market_price * item?.amount,
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

      claimable = (defaultDataPositionFormat || []).reduce(
        (prev, item) => prev + item.claimable,
        0
      );

      sum = (defaultDataPositionFormat || []).reduce(
        (prev, item) => prev + item.market_price * item?.amount,
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
        $<TooltipBalance number={sum} />
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
              Amount
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              Entry ($)
            </div>
          </th>
          <!-- <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              Entry Time
            </div>
          </th>
          <th class="py-3">
            <div class="text-right text-sm font-semibold text-black uppercase">
              APY (%)
            </div>
          </th> -->
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
      <tbody>
        {#each dataPositionFormat as item}
          <LendingProviderItem data={item} />
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
</style>
