<script lang="ts">
  import "~/components/Tooltip.custom.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  $: balance0 = Number(data.amount0out) * data.market_price0;
  $: balance1 = Number(data.amount1out) * data.market_price1;
  $: claim0 = data.claimable0Amount * data.market_price0;
  $: claim1 = data.claimable1Amount * data.market_price1;

  $: value = balance0 + balance1 + claim0 + claim1;

  $: profit = data.inputValue + value;
  $: profitPercent =
    Math.abs(data.inputValue || 0) === 0
      ? 0
      : profit / Math.abs(data.inputValue);
</script>

<tr class="hover:bg-gray-100 transition-all">
  <td class="pl-3 py-4">
    <div class="text-left flex items-start gap-2">
      <div class="flex space-x-1">
        {#each data.tokens as token, index}
          <img
            src={token.logo}
            alt="token"
            width="20"
            height="20"
            class="rounded-full"
          />
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
      {data.isActive ? "In range" : "No"}
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium flex flex-col items-end">
      <div class="flex flex-col items-end">
        <div class="flex items-center gap-1">
          <div class="flex items-center gap-1">
            <TooltipBalance number={Number(data.amount0out)} />
            {data.amount0Price?.symbol ? data.amount0Price?.symbol : ""} |
          </div>
          <TooltipBalance number={balance0} />
        </div>
        <div class="flex items-center gap-1">
          <div class="flex items-center gap-1">
            <TooltipBalance number={Number(data.amount1out)} />
            {data.amount1Price?.symbol ? data.amount1Price?.symbol : ""} |
          </div>
          <TooltipBalance number={balance1} />
        </div>
      </div>
      <div class="text-black flex items-center gap-1">
        Total:
        <TooltipBalance number={balance0 + balance1} />
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium flex flex-col items-end">
      <div class="flex flex-col items-end">
        <div class="flex items-center gap-1">
          <div class="flex items-center gap-1">
            <TooltipBalance number={Number(data.claimable0Amount)} />
            {data.amount0Price?.symbol ? data.amount0Price?.symbol : ""} |
          </div>
          <TooltipBalance number={claim0} />
        </div>
        <div class="flex items-center gap-1">
          <div class="flex items-center gap-1">
            <TooltipBalance number={Number(data.claimable1Amount)} />
            {data.amount1Price?.symbol ? data.amount1Price?.symbol : ""} |
          </div>
          <TooltipBalance number={claim1} />
        </div>
      </div>
      <div class="text-black flex items-center gap-1">
        Total:
        <TooltipBalance number={claim0 + claim1} />
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="flex justify-end text-sm text-[#000000] font-medium">
      <TooltipBalance number={value} />
    </div>
  </td>

  <td class="pr-3 py-4">
    <div class="text-sm font-medium">
      <div class="flex flex-col">
        <div
          class={`flex justify-end ${
            profit >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          <TooltipBalance number={Math.abs(profit)} />
        </div>
        {#if value > 0}
          <div class="flex items-center justify-end gap-1">
            <div
              class={`flex items-center ${
                profitPercent < 0 ? "text-red-500" : "text-[#00A878]"
              } text-right`}
            >
              <TooltipBalance
                number={Math.abs(profitPercent) * 100}
                isFormatPercent
              />
              <span>%</span>
            </div>
            <img
              src={profit >= 0 ? TrendUp : TrendDown}
              alt="trend"
              class="mb-1"
            />
          </div>
        {/if}
      </div>
    </div>
  </td>
</tr>

<style>
</style>
