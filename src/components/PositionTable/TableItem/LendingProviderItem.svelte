<script>
  import { onMount } from "svelte";
  import dayjs from "dayjs";
  import { priceSubscribe } from "~/lib/price-ws";
  import { formatBalance, formatCurrency, formatPercent } from "~/utils";

  import "~/components/Tooltip.custom.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let marketPrice = data?.price.price || 0;

  $: profit = marketPrice * data?.currentValue - Math.abs(data.inputValue || 0);
  $: value = marketPrice * data?.currentValue;
  $: profitPercent =
    Math.abs(data.inputValue || 0) === 0
      ? 0
      : profit / Math.abs(data.inputValue);

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
        {#each data.tokens as token}
          <img src={token.logo} alt={token.symbol} width="20" height="20" />
        {/each}
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
      <div class="flex justify-end text-sm text-[#00000099] font-medium">
        <TooltipBalance
          text={formatBalance(Math.abs(data.inputValue))}
          originalText={formatCurrency(Math.abs(data.inputValue))}
        />
      </div>
    </td>

    <!-- <td class="py-4">
      <div class="text-right text-sm text-[#00000099] font-medium">
        {dayjs(data.inputTime).format("DD/MM/YYYY - HH:mm")}
      </div>
    </td> -->

    <!-- <td class="py-4">
      <div class="text-right text-sm text-[#00000099] font-medium">
        {formatBalance(data.apy)}
      </div>
    </td> -->

    <td class="py-4">
      <div class="flex justify-end text-sm text-[#00000099] font-medium">
        <TooltipBalance
          text={formatBalance(value)}
          originalText={formatCurrency(value)}
        />
      </div>
    </td>

    <td class="pr-3 py-4">
      <div class="text-sm font-medium min-w-[125px]">
        <div class="flex flex-col">
          <div
            class={`flex justify-end ${
              profit >= 0 ? "text-[#00A878]" : "text-red-500"
            }`}
          >
            <TooltipBalance
              text={formatBalance(Math.abs(profit))}
              originalText={formatCurrency(Math.abs(profit))}
            />
          </div>
          <div class="flex items-center justify-end gap-1">
            <div
              class={`${
                profitPercent >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              {formatPercent(Math.abs(profitPercent) * 100)}%
            </div>
            <img
              src={profit >= 0 ? TrendUp : TrendDown}
              alt="trend"
              class="mb-1"
            />
          </div>
        </div>
      </div>
    </td>
  </tr>
</tbody>

<style>
</style>
