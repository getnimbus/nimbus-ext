<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { SparkLine } from "svelte-spark";
  import { isDarkMode } from "~/store";
  dayjs.extend(relativeTime);

  export let data;

  import TooltipNumber from "./TooltipNumber.svelte";
  import Copy from "./Copy.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-4 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-9 ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left xl:text-sm text-2xl font-medium">
      <Copy
        address={data?.address}
        textTooltip="Copy address to clipboard"
        iconColor={$isDarkMode ? "#fff" : "#000"}
        color={$isDarkMode ? "#fff" : "#000"}
        isShorten={true}
        isLink={true}
        link={`/?type=EVM&chain=ALL&address=${data?.address}`}
      />
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-red-500 font-medium flex flex-col justify-start gap-1"
    >
      <div class="flex space-x-1">
        {#each data?.metadata
          ?.filter((item) => item.logo)
          .sort((a, b) => a.value - b.value)
          .slice(0, 5) || [] as token}
          <img
            class="w-[30px] h-[30px] border-2 border-white rounded-full bg-white dark:border-gray-800"
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-right xl:text-sm text-2xl font-medium flex justify-end">
      $<TooltipNumber number={Number(data?.networth)} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change24H >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change24H))}
          type={Math.abs(Number(data?.change24H)) > 100 ? "balance" : "percent"}
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change7D >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change7D))}
          type={Math.abs(Number(data?.change7D)) > 100 ? "balance" : "percent"}
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change30D >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change30D))}
          type={Math.abs(Number(data?.change30D)) > 100 ? "balance" : "percent"}
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      <div
        class={`flex items-center ${
          data?.change1Y >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change1Y))}
          type={Math.abs(Number(data?.change1Y)) > 100 ? "balance" : "percent"}
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex flex-col items-end gap-1"
    >
      <TooltipNumber
        number={Number(data?.volatility)}
        type={Number(data?.volatility) > 100 ? "balance" : "percent"}
      />
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex justify-end items-center"
    >
      <TooltipNumber
        number={Number(data?.drawDown)}
        type={Number(data?.drawDown) > 100 ? "balance" : "percent"}
      />
      <span>%</span>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex justify-end items-center"
    >
      <TooltipNumber
        number={Number(data?.sharpeRatio)}
        type={Number(data?.sharpeRatio) > 100 ? "balance" : "percent"}
      />
    </div>
  </td>

  <td
    class={`pr-3 py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex items-center justify-end gap-3">
      <SparkLine data={data?.sparkline || []} />
    </div>
  </td>
</tr>

<style>
</style>
