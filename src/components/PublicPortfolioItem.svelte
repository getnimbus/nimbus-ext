<script>
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  import { SparkLine } from "svelte-spark";
  import { isDarkMode } from "~/store";
  dayjs.extend(relativeTime);

  export let data;

  import Tooltip from "~/components/Tooltip.svelte";
  import TooltipNumber from "./TooltipNumber.svelte";
  import Copy from "./Copy.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  let isShowSymbol = false;
  let selectedToken;
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-4 xl:static xl:bg-transparent sticky left-0 z-9 ${
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
    <div class="xl:flex justify-start hidden">
      {#each data?.metadata
        ?.filter((item) => item.logo)
        .sort((a, b) => a.value - b.value)
        .slice(0, 3) || [] as token, index}
        <div
          class={`relative z-1 ${index > 0 && "-ml-2"}`}
          on:mouseover={() => {
            isShowSymbol = true;
            selectedToken = token;
          }}
          on:mouseleave={() => {
            isShowSymbol = false;
            selectedToken = undefined;
          }}
        >
          <img
            class="xl:w-[30px] xl:h-[30px] w-[50px] h-[50px] border-2 border-white bg-white rounded-full"
            src={token.logo}
            alt=""
          />
          {#if isShowSymbol && selectedToken === token}
            <div
              class="absolute -top-8 left-1/2 transform -translate-x-1/2"
              style="z-index: 2147483648;"
            >
              <Tooltip text={token.symbol.toUpperCase()} />
            </div>
          {/if}
        </div>
      {/each}
      {#if data?.metadata?.length > 3}
        <div
          class="z-2 -ml-2 flex items-center justify-center xl:w-[30px] xl:h-[30px] w-[50px] h-[50px] bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600"
        >
          <div class="xl:text-[10px] text-lg font-medium text-white">
            +{data?.metadata?.length - 3}
          </div>
        </div>
      {/if}
    </div>

    <div class="xl:hidden flex justify-start">
      {#each data?.metadata
        ?.filter((item) => item.logo)
        .sort((a, b) => a.value - b.value)
        .slice(0, 18) || [] as token, index}
        <div
          class={`relative z-1 ${index > 0 && "-ml-2"}`}
          on:mouseover={() => {
            isShowSymbol = true;
            selectedToken = token;
          }}
          on:mouseleave={() => {
            isShowSymbol = false;
            selectedToken = undefined;
          }}
        >
          <img
            class="xl:w-[30px] xl:h-[30px] w-[50px] h-[50px] border-2 border-white bg-white rounded-full"
            src={token.logo}
            alt=""
          />
          {#if isShowSymbol && selectedToken === token}
            <div
              class="absolute -top-8 left-1/2 transform -translate-x-1/2"
              style="z-index: 2147483648;"
            >
              <Tooltip text={token.symbol.toUpperCase()} />
            </div>
          {/if}
        </div>
      {/each}
      {#if data?.metadata?.length > 18}
        <div
          class="z-2 -ml-2 flex items-center justify-center xl:w-[30px] xl:h-[30px] w-[50px] h-[50px] bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600"
        >
          <div class="xl:text-[10px] text-lg font-medium text-white">
            +{data?.metadata?.length - 18}
          </div>
        </div>
      {/if}
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
          data?.change1D >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.change1D))}
          type={Math.abs(Number(data?.change1D)) > 100 ? "balance" : "percent"}
        />
        <span>%</span>
        <img
          src={data?.change1D >= 0 ? TrendUp : TrendDown}
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
      class="xl:text-sm text-2xl text-right font-medium flex justify-end items-center"
    >
      <TooltipNumber
        number={Number(data?.volatility)}
        type={Number(data?.volatility) > 100 ? "balance" : "percent"}
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
