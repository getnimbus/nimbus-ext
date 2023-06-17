<script>
  import { useNavigate } from "svelte-navigator";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import Chart from "~/assets/chart.svg";
  import { chain } from "~/store";

  export let data;
  export let selectedWallet;

  $: selectedChain = $chain;

  const navigate = useNavigate();

  $: price = data?.amount * data?.market_price;
  $: profitAndLoss = price + (data?.avgCost || 0);
  $: profitAndLossPercent =
    Math.abs(data?.avgCost || 0) === 0
      ? 0
      : profitAndLoss / Math.abs(data?.avgCost);

  $: clickable =
    data.name !== "Bitcoin" &&
    data.name !== "Ethereum" &&
    selectedChain !== "GNOSIS";
</script>

<tr
  class={`hover:bg-gray-100 transition-all ${clickable && "cursor-pointer"}`}
  on:click={() => {
    if (clickable) {
      navigate(
        `position-detail?id=${encodeURIComponent(
          data.positionId
        )}&type=${encodeURIComponent(
          data.positionType
        )}&address=${encodeURIComponent(selectedWallet)}`
      );
    }
  }}
>
  <td class="pl-3 py-3">
    <div class="text-left flex items-start gap-2">
      <img
        src={data.logo}
        alt="token"
        width="20"
        height="20"
        class="rounded-full"
      />
      <div class="flex flex-col gap-1">
        <div class="text-black text-sm font-medium">
          {#if data.name === undefined}
            N/A
          {:else}
            {data.name}
          {/if}
        </div>
        <div class="text-[#00000080] text-xs font-medium">
          {#if data.symbol === undefined}
            N/A
          {:else}
            {data.symbol}
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
  </td>

  <td class="py-3">
    <div class="text-sm text-[#00000099] font-medium flex justify-end">
      $<TooltipNumber number={data.market_price} type="balance" />
    </div>
  </td>

  <td class="py-3">
    <div class="text-sm text-[#00000099] font-medium flex justify-end">
      <TooltipNumber number={data.amount} type="amount" />
    </div>
  </td>

  <td class="py-3">
    <div class="text-sm text-[#00000099] font-medium flex justify-end">
      $<TooltipNumber number={price} type="balance" />
    </div>
  </td>

  <td class="py-3">
    <div class="flex items-center justify-end gap-1 text-sm font-medium">
      <div class="flex flex-col">
        <div
          class={`flex justify-end ${
            profitAndLoss >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
        >
          $<TooltipNumber number={Math.abs(profitAndLoss)} type="balance" />
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
  </td>

  <td class="py-3 w-10">
    {#if clickable}
      <div class="flex justify-center">
        <div
          use:tooltip={{
            content: `<tooltip-detail text="Show detail" />`,
            allowHTML: true,
            placement: "top",
          }}
        >
          <img src={Chart} alt="" width={14} height={14} />
        </div>
      </div>
    {/if}
  </td>
</tr>

<style>
</style>
