<script>
  import { Link } from "svelte-navigator";
  import { formatCurrency, shorterName } from "~/utils";

  import "~/components/Tooltip.custom.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
  export let selectedWallet;

  let showTooltipName = false;
  let showTooltipSymbol = false;

  $: price = data?.amount * data?.market_price;
  $: profitAndLoss = data?.amount * data?.market_price + (data?.avgCost || 0);
  $: profitAndLossPercent =
    Math.abs(data?.avgCost || 0) === 0
      ? 0
      : profitAndLoss / Math.abs(data?.avgCost);
</script>

<tr class="hover:bg-gray-100 transition-all">
  <td class="pl-3 py-4 w-[200px]">
    <Link
      to={`${
        data.positionId
          ? `position-detail?positionId=${data.positionId}&positionType=${data.positionType}&address=${selectedWallet.value}`
          : "/"
      }`}
    >
      <div class="text-left flex items-start gap-2">
        <img
          src={data.logo}
          alt="token"
          width="20"
          height="20"
          class="rounded-full"
        />
        <div class="flex flex-col gap-1 relative">
          <div class="relative">
            <div
              class="text-black text-sm font-medium"
              on:mouseenter={() => (showTooltipName = true)}
              on:mouseleave={() => (showTooltipName = false)}
            >
              {#if data.name === undefined}
                N/A
              {:else}
                {shorterName(data.name)}
              {/if}
            </div>
            {#if showTooltipName && data?.name?.length > 16}
              <div
                class="absolute -top-7 left-1/2 transform -translate-x-1/2"
                style="z-index: 2147483648;"
              >
                <tooltip-detail text={data.name} />
              </div>
            {/if}
          </div>
          <div class="relative">
            <div
              class="text-[#00000080] text-xs font-medium"
              on:mouseenter={() => (showTooltipSymbol = true)}
              on:mouseleave={() => (showTooltipSymbol = false)}
            >
              {#if data.symbol === undefined}
                N/A
              {:else}
                {shorterName(data.symbol)}
              {/if}
            </div>
            {#if showTooltipSymbol && data.symbol.length > 16}
              <div
                class="absolute -top-7 left-1/2 transform -translate-x-1/2"
                style="z-index: 2147483648;"
              >
                <tooltip-detail text={data.symbol} />
              </div>
            {/if}
          </div>
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
    </Link>
  </td>

  <td class="py-4">
    <Link
      to={`${
        data.positionId
          ? `position-detail?positionId=${data.positionId}&positionType=${data.positionType}&address=${selectedWallet.value}`
          : "/"
      }`}
    >
      <div class="text-sm text-[#00000099] font-medium flex justify-start">
        {#if formatCurrency(data.market_price).toString().length > 9}
          <TooltipNumber number={data.market_price} type="amount" />
        {:else}
          {formatCurrency(data.market_price)}
        {/if}
      </div>
    </Link>
  </td>

  <td class="py-4">
    <Link
      to={`${
        data.positionId
          ? `position-detail?positionId=${data.positionId}&positionType=${data.positionType}&address=${selectedWallet.value}`
          : "/"
      }`}
    >
      <div class="text-sm text-[#00000099] font-medium flex justify-end">
        <TooltipNumber number={data.amount} type="amount" />
      </div>
    </Link>
  </td>

  <td class="py-4">
    <Link
      to={`${
        data.positionId
          ? `position-detail?positionId=${data.positionId}&positionType=${data.positionType}&address=${selectedWallet.value}`
          : "/"
      }`}
    >
      <div class="text-sm text-[#00000099] font-medium flex justify-end">
        <TooltipNumber number={price} />
      </div>
    </Link>
  </td>

  <td class="pr-3 py-4 w-[170px]">
    <Link
      to={`${
        data.positionId
          ? `position-detail?positionId=${data.positionId}&positionType=${data.positionType}&address=${selectedWallet.value}`
          : "/"
      }`}
    >
      <div class="flex items-center justify-end gap-1 text-sm font-medium">
        <div class="flex flex-col">
          <div
            class={`flex justify-end ${
              profitAndLoss >= 0 ? "text-[#00A878]" : "text-red-500"
            }`}
          >
            <TooltipNumber number={Math.abs(profitAndLoss)} />
          </div>
          <div class="flex items-center justify-end gap-1">
            <div
              class={`flex items-center ${
                profitAndLossPercent >= 0 ? "text-[#00A878]" : "text-red-500"
              }`}
            >
              <TooltipNumber
                number={Math.abs(profitAndLossPercent) * 100}
                type="percent"
              />
              <span>%</span>
            </div>
            <img
              src={profitAndLoss >= 0 ? TrendUp : TrendDown}
              alt="trend"
              class="mb-1"
            />
          </div>
        </div>
      </div>
    </Link>
  </td>
</tr>

<style>
</style>
