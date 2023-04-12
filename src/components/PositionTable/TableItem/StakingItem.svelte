<script>
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { priceSubscribe } from "~/lib/price-ws";
  import { formatBalance, formatCurrency, formatSmallBalance } from "~/utils";

  import "~/components/Tooltip.custom.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let showTooltipProfit = false;
  let showTooltipValue = false;
  let marketPrice = data?.price.price || 0;

  $: profit = data.amount * marketPrice - Math.abs(data?.avgCost);
  $: value = marketPrice * data?.amount;
  $: profitPercent =
    Math.abs(data?.avgCost || 0) === 0 ? 0 : profit / Math.abs(data?.avgCost);

  onMount(() => {
    priceSubscribe([data?.cmc_id], (data) => {
      marketPrice = data.p;
    });
  });
</script>

<tbody>
  <tr class="hover:bg-gray-100 transition-all">
    <td class="pl-3 py-4">
      <div class="text-left flex items-start gap-2">
        <img src={data.logo} alt="token" width="20" height="20" />
        <div class="flex flex-col gap-1">
          <div class="text-black text-sm font-medium">{data.name}</div>
          <div class="text-[#00000080] text-xs font-medium">ETH</div>
        </div>
      </div>
    </td>
    <td class="py-4">
      <div class="text-right text-sm text-[#00000099] font-medium">
        ${formatBalance(Math.abs(data.avgCost))}
      </div>
    </td>
    <!-- <td class="py-4">
      <div class="text-right text-sm text-[#00000099] font-medium">
        {dayjs(data.inputTime).format("DD/MM/YYYY - HH:mm")}
      </div>
    </td> -->
    <td class="py-4">
      <div class="text-right text-sm text-[#00000099] font-medium">
        {formatBalance(data.claimable)}
      </div>
    </td>
    <td class="pr-3 py-4">
      <div
        class="text-right text-sm text-[#00000099] font-medium relative"
        on:mouseenter={() => (showTooltipValue = true)}
        on:mouseleave={() => (showTooltipValue = false)}
      >
        ${formatBalance(value) === "NaN"
          ? formatSmallBalance(value)
          : formatBalance(value)}
        {#if showTooltipValue && formatBalance(value) === "NaN"}
          <div class="absolute -top-7 right-0" style="z-index: 2147483648;">
            <tooltip-detail text={formatCurrency(value)} />
          </div>
        {/if}
      </div>
    </td>
    <td class="pr-3 py-4">
      <div
        class="text-sm font-medium min-w-[125px] relative"
        on:mouseenter={() => (showTooltipProfit = true)}
        on:mouseleave={() => (showTooltipProfit = false)}
      >
        <div class="flex flex-col">
          <div class="flex items-center justify-end gap-1">
            <div class={`${profit >= 0 ? "text-[#00A878]" : "text-red-500"}`}>
              ${formatBalance(Math.abs(profit)) === "NaN"
                ? formatSmallBalance(Math.abs(profit))
                : formatBalance(Math.abs(profit))}
            </div>
            <img
              src={profit >= 0 ? TrendUp : TrendDown}
              alt="trend"
              class="mb-1"
            />
          </div>
          <div
            class={`${
              profitPercent >= 0 ? "text-[#00A878]" : "text-red-500"
            } text-right`}
          >
            {formatBalance(Math.abs(profitPercent)) === "NaN"
              ? formatSmallBalance(Math.abs(profitPercent))
              : formatBalance(Math.abs(profitPercent))}%
          </div>
        </div>
        {#if showTooltipProfit && formatBalance(Math.abs(profit)) === "NaN"}
          <div class="absolute -top-7 right-0" style="z-index: 2147483648;">
            <tooltip-detail text={formatCurrency(Math.abs(profit))} />
          </div>
        {/if}
      </div>
    </td>
  </tr>
</tbody>

<style>
</style>
