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
</script>

<tr class="hover:bg-gray-100 transition-all">
  <td class="pl-3 py-4">
    <div class="text-left flex items-start gap-2">
      <img
        src={data.logo0}
        alt="token"
        width="20"
        height="20"
        class="rounded-full"
      />
      <div class="flex flex-col gap-1">
        <div class="text-black text-sm font-medium">{data.token.name}</div>
        <div class="text-[#00000080] text-xs font-medium">
          {data.token.symbol}
        </div>
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium flex flex-col items-start">
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-1">
          <TooltipBalance number={Number(data?.collateralAmount)} />
          {data.token?.symbol ? data.token?.symbol : ""} |
        </div>
        <TooltipBalance number={data?.collateralAmount * data.market_price} />
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="text-left flex items-start gap-2">
      <img
        src={data.logo1}
        alt="token"
        width="20"
        height="20"
        class="rounded-full"
      />
      <div class="flex flex-col gap-1">
        <div class="text-black text-sm font-medium">DAI</div>
        <div class="text-[#00000080] text-xs font-medium">DAI</div>
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="text-sm text-[#00000099] font-medium flex flex-col items-start">
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-1">
          <TooltipBalance number={Number(data?.debtAmount)} />
          DAI |
        </div>
        <TooltipBalance number={data?.debtAmount * 1} />
      </div>
    </div>
  </td>

  <th class="py-3">
    <div
      class="flex justify-start items-center gap-1 text-sm text-[#000000] font-medium"
    >
      {#if data.healthRate < 2}
        <span class="text-red-500">
          ⚠️ <TooltipBalance number={data.healthRate} isFormatPercent />
        </span>
      {:else}
        <div>>10</div>
      {/if}
    </div>
  </th>

  <td class="py-4 pr-3">
    <div class="flex justify-end text-sm text-[#000000] font-medium">
      <TooltipBalance
        number={Number(
          data?.collateralAmount * data?.market_price - data?.debtAmount * 1
        )}
      />
    </div>
  </td>
</tr>

<style>
</style>
