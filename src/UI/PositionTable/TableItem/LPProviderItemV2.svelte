<script lang="ts">
  import { isDarkMode } from "~/store";

  import "~/components/Tooltip.custom.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let showTooltip = false;

  $: balance0 = Number(data.amount0out) * data.market_price0;
  $: balance1 = Number(data.amount1out) * data.market_price1;

  $: value = balance0 + balance1;

  $: profit = data.inputValue + value;
  $: profitPercent =
    Math.abs(data.inputValue || 0) === 0
      ? 0
      : profit / Math.abs(data.inputValue);
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-4 xl:static xl:bg-transparent sticky left-0 z-9 ${
      darkMode
        ? "bg-[#110c2a] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left flex flex-col items-start gap-2">
      <div class="flex space-x-3">
        {#each data.tokens as token, index}
          <img
            src={token.logo}
            alt="token"
            width="30"
            height="30"
            class="rounded-full"
          />
        {/each}
      </div>
      <div class="flex flex-col gap-1">
        <div class=" xl:text-sm text-xl font-medium">{data.name}</div>
        {#if data.tokens && data.tokens.length}
          <div class="flex items-center gap-1">
            {#each data.tokens as token, index}
              <div class="text_00000080 xl:text-xs text-sm font-medium">
                {token.symbol}
              </div>
              {#if index < data.tokens.length - 1}
                <div class="text_00000080 xl:text-xs text-sm font-medium">
                  -
                </div>
              {/if}
            {/each}
          </div>
        {:else}
          <div>None</div>
        {/if}
      </div>
    </div>
  </td>

  <td
    class={`py-3  ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-xl text_00000099 font-medium flex flex-col items-end"
    >
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-1">
          <TooltipNumber number={Number(data.amount0out)} type="balance" />
          {data.amount0Price?.symbol ? data.amount0Price?.symbol : ""} |
        </div>
        <div class="flex">
          $<TooltipNumber number={balance0} type="balance" />
        </div>
      </div>
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-1">
          <TooltipNumber number={Number(data.amount1out)} type="balance" />
          {data.amount1Price?.symbol ? data.amount1Price?.symbol : ""} |
        </div>
        <div class="flex">
          $<TooltipNumber number={balance1} type="balance" />
        </div>
      </div>
    </div>
  </td>

  <td
    class={`py-3  ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end xl:text-sm text-xl text-[#000000] font-medium">
      $<TooltipNumber number={value} type="balance" />
    </div>
  </td>

  <td
    class={`py-3  ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-xl font-medium flex flex-col">
      <div
        class={`flex justify-end ${
          data?.ipLoss?.loss >= 0 ? "text-red-500" : "text-[#00A878]"
        }`}
      >
        $<TooltipNumber number={Math.abs(data?.ipLoss?.loss)} type="balance" />
      </div>
      <div class="flex items-center justify-end gap-1">
        <div
          class={`flex items-center ${
            data?.ipLoss?.loss >= 0 ? "text-red-500" : "text-[#00A878]"
          } text-right`}
        >
          <TooltipNumber
            number={Math.abs(data?.ipLoss?.lossPercent)}
            type="percent"
          />
          <span>%</span>
        </div>
        <img
          src={data?.ipLoss?.loss >= 0 ? TrendDown : TrendUp}
          alt="trend"
          class="mb-1"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="xl:text-sm text-xl font-medium flex flex-col">
      <div
        class={`flex justify-end items-center gap-1 ${
          profit >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        {#if data?.isStaking}
          <span
            class="relative w-max text-yellow-300"
            on:mouseenter={() => (showTooltip = true)}
            on:mouseleave={() => (showTooltip = false)}
          >
            ⚠️
            {#if showTooltip}
              <span
                class="absolute -top-7 left-1/2 transform -translate-x-1/2"
                style="z-index: 2147483648;"
              >
                <tooltip-detail
                  text="This position is in staking so the PnL might inaccuracy"
                />
              </span>
            {/if}
          </span>
        {/if}
        <div class="flex">
          $<TooltipNumber number={Math.abs(profit)} type="balance" />
        </div>
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
        <img src={profit >= 0 ? TrendUp : TrendDown} alt="trend" class="mb-1" />
      </div>
    </div>
  </td>
</tr>

<style>
</style>
