<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { formatBalance, shorterAddress } from "~/utils";
  import { SparkLine } from "svelte-spark";
  import { isDarkMode } from "~/store";
  dayjs.extend(relativeTime);

  export let data;

  import TooltipNumber from "./TooltipNumber.svelte";
  import Copy from "./Copy.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-4 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-9 ${
      darkMode
        ? "bg-[#131313] group-hover:bg-[#00000033]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left xl:text-sm text-xl font-medium">
      <Copy
        address={data?.address}
        textTooltip="Copy transaction to clipboard"
        iconColor={darkMode ? "#fff" : "#000"}
        color={darkMode ? "#fff" : "#000"}
        isShorten={true}
        isLink={true}
        link={`/?chain=ALL&address=${data?.address}`}
      />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-xl text-red-500 font-medium flex flex-col justify-start gap-1"
    >
      <div class="flex -space-x-4">
        {#each data?.metadata
          ?.filter((item) => item.logo)
          .sort((a, b) => a.value - b.value)
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

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-right xl:text-sm text-xl font-medium flex justify-end">
      $<TooltipNumber number={Number(data?.networth)} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-right text-xl font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change24H >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change24H))}
          type="percent"
        />
        <span>%</span>
        <img
          src={data?.change24H >= 0 ? TrendUp : TrendDown}
          alt="trend"
          class="ml-1 mb-1 w-4 h-4"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-right text-xl font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change7D >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change7D))}
          type="percent"
        />
        <span>%</span>
        <img
          src={data?.change7D >= 0 ? TrendUp : TrendDown}
          alt="trend"
          class="ml-1 mb-1 w-4 h-4"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-right text-xl font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change30D >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change30D))}
          type="percent"
        />
        <span>%</span>
        <img
          src={data?.change30D >= 0 ? TrendUp : TrendDown}
          alt="trend"
          class="ml-1 mb-1 w-4 h-4"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-right text-xl font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change1Y >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change1Y))}
          type="percent"
        />
        <span>%</span>
        <img
          src={data?.change1Y >= 0 ? TrendUp : TrendDown}
          alt="trend"
          class="ml-1 mb-1 w-4 h-4"
        />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-right text-xl font-medium flex flex-col items-end gap-1"
    >
      {Number(data?.volatility).toFixed(2)}
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-right text-xl font-medium flex flex-col items-end gap-1"
    >
      {Number(data?.drawDown).toFixed(2)}%
    </div>
  </td>

  <td
    class={`py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-right text-xl font-medium flex flex-col items-end gap-1"
    >
      {Number(data?.sharpeRatio).toFixed(2)}
    </div>
  </td>

  <td
    class={`pr-3 py-3 ${
      darkMode ? "group-hover:bg-[#00000033]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex items-center justify-end gap-3">
      <SparkLine data={data?.sparkline || []} />
    </div>
  </td>
</tr>

<style>
</style>
