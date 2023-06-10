<script>
  import { useNavigate } from "svelte-navigator";
  import { shorterName } from "~/utils";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import Chart from "~/assets/chart.svg";

  export let data;
  export let selectedWallet;

  const navigate = useNavigate();

  let showName = false;

  $: profitAndLoss = data?.current_value + (data?.totalCost || 0);
  $: profitAndLossPercent =
    Math.abs(data?.totalCost || 0) === 0
      ? 0
      : profitAndLoss / Math.abs(data?.totalCost);
</script>

<tr
  class="hover:bg-gray-100 transition-all cursor-pointer"
  on:click={() => {
    navigate(
      `nft-detail?id=${encodeURIComponent(
        data.collectionId
      )}&address=${encodeURIComponent(selectedWallet.value)}`
    );
  }}
>
  <td class="pl-3 py-3">
    <div class="relative">
      <div
        class="text-black text-sm font-medium flex justify-start"
        on:mouseenter={() => (showName = true)}
        on:mouseleave={() => (showName = false)}
      >
        {shorterName(data?.collection?.name)}
      </div>
      {#if showName && data?.collection?.name.length > 10}
        <div class="absolute -top-7 left-0" style="z-index: 2147483648;">
          <tooltip-detail text={data?.collection?.name} />
        </div>
      {/if}
    </div>
  </td>

  <td class="py-3">
    <div class="flex justify-start">
      {#each data?.tokens.slice(0, 5) as token, index}
        <img
          src={token?.image_url}
          alt=""
          class={`w-6 h-6 rounded-md border border-gray-300 overflow-hidden ${
            index > 0 && "-ml-2"
          }`}
        />
      {/each}
      {#if data?.balance > 5}
        <div class="relative w-6 h-6">
          <img
            src={data?.tokens[5].image_url}
            alt=""
            class="w-6 h-6 rounded-md border border-gray-300 overflow-hidden -ml-2"
          />
          <div
            class="absolute top-0 -left-2 w-full h-full bg-[#00000066] text-white text-center flex justify-center items-center pb-2 rounded-md"
          >
            ...
          </div>
        </div>
      {/if}
    </div>
  </td>

  <td class="py-3">
    <div class="text-sm text-[#00000099] font-medium flex justify-end">
      $<TooltipNumber
        number={data?.floorPriceBTC * data?.market_price}
        type="amount"
      />
    </div>
  </td>

  <td class="py-3">
    <div class="text-sm text-[#00000099] font-medium flex justify-end">
      $<TooltipNumber number={data?.totalCost} />
    </div>
  </td>

  <td class="py-3">
    <div class="text-sm text-[#00000099] font-medium flex justify-end">
      $<TooltipNumber number={data?.current_value} type="amount" />
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
          $<TooltipNumber number={Math.abs(profitAndLoss)} />
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
  </td>
</tr>

<style>
</style>
