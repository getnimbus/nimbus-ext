<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { formatBalance, shorterAddress } from "~/utils";
  import { SparkLine } from "svelte-spark";
  dayjs.extend(relativeTime);

  export let data;

  import TooltipNumber from "./TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  import Copy from "./Copy.svelte";
</script>

<tr class="group transition-all">
  <td
    class="pl-3 py-4 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-9 bg-white group-hover:bg-gray-100"
  >
    <div class="text-left text-black xl:text-sm text-xl font-medium">
      <Copy
        address={data?.address}
        textTooltip="Copy transaction to clipboard"
        iconColor="#000"
        isShorten={true}
        isLink={true}
        link={`https://app.getnimbus.io/?chain=ALL&address=${data?.address}`}
      />
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-xl text-red-500 font-medium flex flex-col justify-start gap-1"
    >
      <div class="flex -space-x-4">
        {#each data?.metadata
          ?.sort((a, b) => a.value - b.value)
          .slice(0, 5) || [] as token}
          <img
            class="w-[30px] h-[30px] border-2 border-white rounded-full dark:border-gray-800"
            src={token.logo}
            alt=""
          />
        {/each}
        {#if data?.metadata?.length > 5}
          <span
            class="flex items-center justify-center w-[30px] h-[30px] text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800"
            >+{data?.metadata?.length - 5}
          </span>
        {/if}
      </div>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div class="text-right text-black xl:text-sm text-xl font-medium">
      $<TooltipNumber number={Number(data?.networth)} type="balance" />
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-right text-xl text-[#00A878] font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change24H >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber number={Number(data?.change24H)} type="percent" />
        <span>%</span>
        <img
          src={data?.change24H >= 0 ? TrendUp : TrendDown}
          alt="trend"
          class="ml-1 mb-1 w-4 h-4"
        />
      </div>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-right text-xl text-[#00A878] font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change7D >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber number={Number(data?.change7D)} type="percent" />
        <span>%</span>
        <img
          src={data?.change7D >= 0 ? TrendUp : TrendDown}
          alt="trend"
          class="ml-1 mb-1 w-4 h-4"
        />
      </div>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-right text-xl text-[#00A878] font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change30D >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber number={Number(data?.change30D)} type="percent" />
        <span>%</span>
        <img
          src={data?.change30D >= 0 ? TrendUp : TrendDown}
          alt="trend"
          class="ml-1 mb-1 w-4 h-4"
        />
      </div>
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-right text-xl text-[#00A878] font-medium flex flex-col items-end gap-1"
    >
      {Number(data?.volatility).toFixed(2)}
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-right text-xl text-[#00A878] font-medium flex flex-col items-end gap-1"
    >
      {Number(data?.drawDown).toFixed(2)}
    </div>
  </td>

  <td class="py-4 group-hover:bg-gray-100">
    <div
      class="xl:text-sm text-right text-xl text-[#00A878] font-medium flex flex-col items-end gap-1"
    >
      {Number(data?.sharpeRatio).toFixed(2)}
    </div>
  </td>

  <td class="pr-3 py-4 w-[190px] group-hover:bg-gray-100">
    <div class="flex items-center justify-end gap-3">
      <SparkLine data={data?.sparkline || []} />
    </div>
  </td>
</tr>

<style>
</style>
