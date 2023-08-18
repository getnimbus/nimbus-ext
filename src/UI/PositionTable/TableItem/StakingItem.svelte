<script>
  import dayjs from "dayjs";

  import "~/components/Tooltip.custom.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;

  $: profit = data.amount * data.market_price - Math.abs(data?.avgCost);
  $: value = data.market_price * data?.amount;
  $: profitPercent =
    Math.abs(data?.avgCost || 0) === 0 ? 0 : profit / Math.abs(data?.avgCost);
</script>

<tr class="group transition-all">
  <td
    class="pl-3 py-4 xl:static xl:bg-transparent sticky left-0 z-9 bg-white group-hover:bg-gray-100"
  >
    <div class="text-left flex items-center gap-2">
      <img
        src={data.logo}
        alt="token"
        width="30"
        height="30"
        class="rounded-full"
      />
      <div class="flex flex-col gap-1">
        <div class="text-black xl:text-sm text-xl font-medium">{data.name}</div>
        <div class="text-[#00000080] xl:text-xs text-sm font-medium">
          {data.symbol}
        </div>
      </div>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="flex justify-end xl:text-sm text-xl text-[#00000099] font-medium"
    >
      $<TooltipNumber number={Math.abs(data.avgCost)} type="balance" />
    </div>
  </td>

  <!-- <td class="py-4 group-hover:bg-gray-100">
    <div class="text-right xl:text-sm text-xl text-[#00000099] font-medium">
      {dayjs(data.inputTime).format("YYYY-MM-DD, hh:mm A")}
    </div>
  </td> -->

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="flex justify-end xl:text-sm text-xl text-[#00000099] font-medium"
    >
      <TooltipNumber number={data.claimable} type="amount" />
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="flex justify-end xl:text-sm text-xl text-[#00000099] font-medium"
    >
      $<TooltipNumber number={value} type="balance" />
    </div>
  </td>

  <td class="pr-3 py-4 group-hover:bg-gray-100">
    <div class="xl:text-sm text-xl font-medium flex flex-col">
      <div
        class={`flex justify-end ${
          profit >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        $<TooltipNumber number={Math.abs(profit)} type="balance" />
      </div>
      <div class="flex items-center justify-end gap-1">
        <div
          class={`flex items-center ${
            profit >= 0 ? "text-[#00A878]" : "text-red-500"
          }`}
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
