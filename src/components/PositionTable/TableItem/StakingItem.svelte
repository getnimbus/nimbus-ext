<script>
  import dayjs from "dayjs";

  import "~/components/Tooltip.custom.svelte";
  import TooltipBalance from "~/components/TooltipBalance.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  $: profit = data.amount * data.market_price - Math.abs(data?.avgCost);
  $: value = data.market_price * data?.amount;
  $: profitPercent =
    Math.abs(data?.avgCost || 0) === 0 ? 0 : profit / Math.abs(data?.avgCost);
</script>

<tr class="hover:bg-gray-100 transition-all">
  <td class="pl-3 py-4">
    <div class="text-left flex items-start gap-2">
      <img
        src={data.logo}
        alt="token"
        width="20"
        height="20"
        class="rounded-full"
      />
      <div class="flex flex-col gap-1">
        <div class="text-black text-sm font-medium">{data.name}</div>
        <div class="text-[#00000080] text-xs font-medium">{data.symbol}</div>
      </div>
    </div>
  </td>

  <td class="py-4">
    <div class="flex justify-end text-sm text-[#00000099] font-medium">
      <TooltipBalance number={Math.abs(data.avgCost)} />
    </div>
  </td>

  <!-- <td class="py-4">
    <div class="text-right text-sm text-[#00000099] font-medium">
      {dayjs(data.inputTime).format("DD/MM/YYYY - HH:mm")}
    </div>
  </td> -->

  <td class="py-4">
    <div class="flex justify-end text-sm text-[#00000099] font-medium">
      <TooltipBalance number={data.claimable} />
    </div>
  </td>

  <td class="py-4">
    <div class="flex justify-end text-sm text-[#00000099] font-medium">
      <TooltipBalance number={value} />
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
          <TooltipBalance number={Math.abs(profit)} />
        </div>
        <div class="flex items-center justify-end gap-1">
          <div
            class={`flex items-center ${
              profitPercent > 0 ? "text-[#00A878]" : "text-red-500"
            }`}
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
      </div>
    </div>
  </td>
</tr>

<style>
</style>
