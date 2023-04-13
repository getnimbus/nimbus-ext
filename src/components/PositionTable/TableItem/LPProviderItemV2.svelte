<script lang="typescript">
  import { onMount } from "svelte";
  import { priceSubscribe } from "~/lib/price-ws";
  import { formatBalance, formatCurrency, formatSmallBalance } from "~/utils";

  import "~/components/Tooltip.custom.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let showTooltipProfit = false;
  let showTooltipValue = false;
  let price0 = data?.amount0Price?.price || 0;
  let price1 = data?.amount1Price?.price || 0;

  $: balance0 = Number(data.amount0out) * price0;
  $: balance1 = Number(data.amount1out) * price1;

  $: value = balance0 + balance1;

  $: profit = data.inputValue + value;
  $: profitPercent =
    Math.abs(data.inputValue || 0) === 0
      ? 0
      : profit / Math.abs(data.inputValue);

  onMount(() => {
    const token0 = Number(data?.token0Info?.info?.cmc_id);
    const token1 = Number(data?.token1Info?.info?.cmc_id);
    if (token0) {
      priceSubscribe([token0], (data) => {
        price0 = data.p;
      });
    }
    if (token1) {
      priceSubscribe([token1], (data) => {
        price1 = data.p;
      });
    }
  });
</script>

<tbody>
  <tr class="hover:bg-gray-100 transition-all">
    <td class="pl-3 py-4">
      <div class="text-left flex items-start gap-2">
        <div class="flex space-x-1">
          {#each data.tokens as token, index}
            <img src={token.logo} alt="token" width="20" height="20" />
          {/each}
        </div>
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
        <div class="flex flex-col">
          <div>
            {formatBalance(Number(data.amount0out))}
            {data.amount0Price.symbol} | ${formatBalance(balance0)}
          </div>
          <div>
            {formatBalance(Number(data.amount1out))}
            {data.amount1Price.symbol} | ${formatBalance(balance1)}
          </div>
        </div>
      </div>
    </td>
    <td class="pr-3 py-4">
      <div
        class="text-right text-sm text-[#000000] font-medium relative"
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
