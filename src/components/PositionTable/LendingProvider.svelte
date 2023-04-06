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

  onMount(() => {
    priceSubscribe([data?.cmc_id], (data) => {
      marketPrice = data.p;
    });
  });

  $: profit = marketPrice * data?.currentValue - data?.avgCost;
  $: value = marketPrice * data?.currentValue;
</script>

<tbody>
  <tr>
    <td class="pl-3 py-4">
      <div class="text-left flex items-start gap-2">
        <img src={data.logo} alt="token" width="20" height="20" />
        <div class="flex flex-col gap-1">
          <div class="text-black text-sm font-medium">{data.name}</div>
          {#if data.tokens && data.tokens.length}
            <div class="flex items-center gap-1">
              {#each data.tokens as token, index}
                <div class="text-[#00000080] text-xs font-medium">
                  {token.symbol}
                </div>
                {#if index < data.tokens.length - 1}
                  <div class="text-[#00000080] text-xs font-medium">-</div>
                {/if}
              {/each}
            </div>
          {:else}
            <div>None</div>
          {/if}
        </div>
      </div>
    </td>
    <td class="py-4">
      <div class="text-right text-sm text-[#00000099] font-medium">
        {formatBalance(data.inputValue)}
      </div>
    </td>
    <td class="py-4">
      <div class="text-right text-sm text-[#00000099] font-medium">
        {dayjs(data.inputTime).format("DD/MM/YYYY - HH:mm")}
      </div>
    </td>
    <td class="py-4">
      <div class="text-right text-sm text-[#00000099] font-medium">
        {formatBalance(data.apy)}
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
        class="flex items-center justify-end gap-1 text-sm font-medium min-w-[125px] relative"
        on:mouseenter={() => (showTooltipProfit = true)}
        on:mouseleave={() => (showTooltipProfit = false)}
      >
        <div class={`${profit >= 0 ? "text-[#00A878]" : "text-red-500"}`}>
          ${formatBalance(Math.abs(profit)) === "NaN"
            ? formatSmallBalance(Math.abs(profit))
            : formatBalance(Math.abs(profit))}
        </div>
        <img src={profit >= 0 ? TrendUp : TrendDown} alt="trend" class="mb-1" />
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
