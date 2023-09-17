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

  $: balance0 = Number(data.amount0out) * data.market_price0;
  $: balance1 = Number(data.amount1out) * data.market_price1;
  $: claim0 = data.claimable0Amount * data.market_price0;
  $: claim1 = data.claimable1Amount * data.market_price1;

  $: value = balance0 + balance1 + claim0 + claim1;
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-4 xl:static xl:bg-transparent sticky left-0 z-9 ${
      darkMode
        ? "bg-[#110c2a] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left flex items-center gap-2">
      <img
        src={data.logo0}
        alt="token"
        width="30"
        height="30"
        class="rounded-full"
      />
      <div class="flex flex-col gap-1">
        <div class=" xl:text-sm text-2xl font-medium">
          {data.token.name}
        </div>
        <div class="text_00000080 xl:text-xs text-sm font-medium">
          {data.token.symbol}
        </div>
      </div>
    </div>
  </td>

  <td
    class={`py-3  ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text_00000099 font-medium flex flex-col items-start"
    >
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-1">
          <TooltipNumber
            number={Number(data?.collateralAmount)}
            type="balance"
          />
          {data.token?.symbol ? data.token?.symbol : ""} |
        </div>
        <div class="flex">
          $<TooltipNumber
            number={data?.collateralAmount * data.market_price}
            type="balance"
          />
        </div>
      </div>
    </div>
  </td>

  <td
    class={`py-3  ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left flex items-start gap-2">
      <img
        src={data.logo1}
        alt="token"
        width="20"
        height="20"
        class="rounded-full"
      />
      <div class="flex flex-col gap-1">
        <div class="xl:text-sm text-2xl font-medium">DAI</div>
        <div class="text_00000080 text-xs font-medium">DAI</div>
      </div>
    </div>
  </td>

  <td
    class={`py-3  ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text_00000099 font-medium flex flex-col items-start"
    >
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-1">
          <TooltipNumber number={Number(data?.debtAmount)} type="balance" />
          DAI |
        </div>
        <div class="flex">
          $<TooltipNumber number={data?.debtAmount * 1} type="balance" />
        </div>
      </div>
    </div>
  </td>

  <th
    class={`py-3  ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="flex justify-start items-center gap-1 xl:text-sm text-2xl text-[#000000] font-medium"
    >
      {#if data.healthRate < 2}
        <span class="text-yellow-300">
          ⚠️ <TooltipNumber number={data.healthRate} type="percent" />
        </span>
      {:else}
        <div>>10</div>
      {/if}
    </div>
  </th>

  <td
    class={`py-3 pr-3 ${
      darkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="flex justify-end xl:text-sm text-2xl text-[#000000] font-medium"
    >
      $<TooltipNumber
        number={Number(
          data?.collateralAmount * data?.market_price - data?.debtAmount * 1
        )}
        type="balance"
      />
    </div>
  </td>
</tr>

<style>
</style>
