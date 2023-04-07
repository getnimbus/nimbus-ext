<script>
  import { onMount } from "svelte";
  import { priceSubscribe } from "~/lib/price-ws";
  import { formatBalance, formatCurrency, formatSmallBalance } from "~/utils";

  import "~/components/Tooltip.custom.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let marketPrice = data?.rate || 0;
  let showTooltipValue = false;
  let showTooltipProfit = false;
  let showTooltipAmount = false;
  let showTooltipMarketPrice = false;

  onMount(() => {
    priceSubscribe([data?.cmc_id], (data) => {
      marketPrice = data.p;
    });
  });

  $: price = data?.amount * marketPrice;
  $: profitAndLoss = data?.amount * marketPrice - data?.avgCost;
</script>

<tr class="hover:bg-gray-100 transition-all">
  <td class="pl-3 py-4">
    <div class="text-left flex items-start gap-2 min-w-[220px]">
      <img src={data.logo} alt="token" width="20" height="20" />
      <div class="flex flex-col gap-1">
        <div class="text-black text-sm font-medium">{data.name}</div>
        <div class="text-[#00000080] text-xs font-medium">{data.symbol}</div>
      </div>
      <div class="flex flex-wrap gap-2">
        {#if data.suggest && data.suggest.length}
          {#each data.suggest as item}
            <a
              href={item.url}
              target="_blank"
              class="flex items-center justyfy-center px-2 py-1 text-[#27326F] text-[10px] font-medium bg-[#1e96fc33] rounded-[1000px]"
            >
              {item.tile}
            </a>
          {/each}
        {/if}
      </div>
    </div>
  </td>
  <td class="py-4">
    <div
      class="text-sm text-[#00000099] font-medium text-right min-w-[120px] relative"
      on:mouseenter={() => (showTooltipMarketPrice = true)}
      on:mouseleave={() => (showTooltipMarketPrice = false)}
    >
      ${formatBalance(marketPrice) === "NaN"
        ? formatSmallBalance(marketPrice)
        : formatBalance(marketPrice)}
      {#if showTooltipMarketPrice && formatBalance(marketPrice) === "NaN"}
        <div class="absolute -top-7 right-0" style="z-index: 2147483648;">
          <tooltip-detail text={formatCurrency(marketPrice)} />
        </div>
      {/if}
    </div>
  </td>
  <td class="py-4">
    <div
      class="text-sm text-[#00000099] font-medium text-right min-w-[120px] relative"
      on:mouseenter={() => (showTooltipAmount = true)}
      on:mouseleave={() => (showTooltipAmount = false)}
    >
      {formatBalance(data.amount) === "NaN"
        ? formatSmallBalance(data.amount)
        : formatBalance(data.amount)}
      {#if showTooltipAmount && formatBalance(data.amount) === "NaN"}
        <div class="absolute -top-7 right-0" style="z-index: 2147483648;">
          <tooltip-detail text={formatCurrency(data.amount)} />
        </div>
      {/if}
    </div>
  </td>
  <td class="py-4">
    <div
      class="text-sm text-[#00000099] font-medium text-right min-w-[130px] relative"
      on:mouseenter={() => (showTooltipValue = true)}
      on:mouseleave={() => (showTooltipValue = false)}
    >
      ${formatBalance(price) === "NaN"
        ? formatSmallBalance(price)
        : formatBalance(price)}
      {#if showTooltipValue && formatBalance(price) === "NaN"}
        <div class="absolute -top-7 right-0" style="z-index: 2147483648;">
          <tooltip-detail text={formatCurrency(price)} />
        </div>
      {/if}
    </div>
  </td>
  <td class="pr-3 py-4">
    <div
      class="flex items-center justify-end gap-1 text-sm font-medium min-w-[125px] relative"
    >
      {#if data.symbol === "ETH"}
        <div />
      {:else}
        <div
          class={`${profitAndLoss >= 0 ? "text-[#00A878]" : "text-red-500"}`}
          on:mouseenter={() => (showTooltipProfit = true)}
          on:mouseleave={() => (showTooltipProfit = false)}
        >
          ${formatBalance(Math.abs(profitAndLoss)) === "NaN"
            ? formatSmallBalance(Math.abs(profitAndLoss))
            : formatBalance(Math.abs(profitAndLoss))}
        </div>
        <img
          src={profitAndLoss >= 0 ? TrendUp : TrendDown}
          alt="trend"
          class="mb-1"
        />
      {/if}
      {#if showTooltipProfit && formatBalance(Math.abs(profitAndLoss)) === "NaN"}
        <div class="absolute -top-7 right-0" style="z-index: 2147483648;">
          <tooltip-detail text={formatCurrency(Math.abs(profitAndLoss))} />
        </div>
      {/if}
    </div>
  </td>
</tr>

<style>
</style>
