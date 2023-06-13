<script lang="ts">
  import "~/components/Tooltip.custom.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  // import TrendUp from "~/assets/trend-up.svg";
  // import TrendDown from "~/assets/trend-down.svg";

  export let data;

  $: balance0 = Number(data.amount0out) * data.market_price0;
  $: balance1 = Number(data.amount1out) * data.market_price1;
  $: rewardToken0 =
    Number(data?.rewardTokens[0]?.rewardOut) * data.rewardToken0;

  $: value = balance0 + balance1 + rewardToken0;

  // $: profit = data.inputValue + value;
  // $: profitPercent =
  //   Math.abs(data.inputValue || 0) === 0
  //     ? 0
  //     : profit / Math.abs(data.inputValue);
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
    <div class="text-sm text-[#00000099] font-medium flex flex-col items-end">
      <div class="flex flex-col items-end">
        <div class="flex items-center gap-1">
          <div class="flex items-center gap-1">
            <TooltipNumber number={Number(data.amount0out)} type="amount" />
            {data.amount0Price?.symbol ? data.amount0Price?.symbol : ""} |
          </div>
          <div class="flex">
            $<TooltipNumber number={balance0} type="balance" />
          </div>
        </div>
        <div class="flex items-center gap-1">
          <div class="flex items-center gap-1">
            <TooltipNumber number={Number(data.amount1out)} type="amount" />
            {data.amount1Price?.symbol ? data.amount1Price?.symbol : ""} |
          </div>
          <div class="flex">
            $<TooltipNumber number={balance1} type="balance" />
          </div>
        </div>
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium flex flex-col items-end">
      <div class="flex flex-col items-end">
        <div class="flex items-center gap-1">
          <div class="flex items-center gap-1">
            <TooltipNumber
              number={Number(data?.rewardTokens[0]?.rewardOut)}
              type="amount"
            />
            {data.rewardTokens[0]?.symbol ? data.rewardTokens[0]?.symbol : ""} |
          </div>
          <div class="flex">
            $<TooltipNumber number={rewardToken0} type="balance" />
          </div>
        </div>
      </div>
    </div>
  </td>

  <td class="pr-3 py-4">
    <div class="flex justify-end text-sm text-[#000000] font-medium">
      $<TooltipNumber number={value} type="balance" />
    </div>
  </td>

  <!-- <td class="pr-3 py-4">
    <div class="text-sm font-medium">
      <div class="flex flex-col">
        <div
          class={`flex justify-end ${
            profit >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          $<TooltipNumber number={Math.abs(profit)} />
        </div>
        <div class="flex items-center justify-end gap-1">
          <div
            class={`flex items-center ${
              profit >= 0 ? "text-[#00A878]" : "text-red-500"
            } text-right`}
          >
            <TooltipNumber
              number={Math.abs(profitPercent) * 100}
              type="percent"
            />
            <span>%</span>
          </div>
          <img
            src={profit >= 0 ? TrendUp : TrendDown}
            alt="trend"
            class="mb-1"
          />
        </div>
      </div>
    </div>
  </td> -->
</tr>

<style>
</style>
