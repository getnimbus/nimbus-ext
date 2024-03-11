<script>
  import { isDarkMode } from "~/store";
  import { shorterAddress } from "~/utils";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import TooltipNumber from "~/components/TooltipNumber.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";

  export let data;
  export let copyAddress = (address) => {};
  export let closeModal = () => {};
</script>

<tr class="group transition-all">
  <td
    class={`pl-3 py-4 2xl:w-[250px] xl:static xl:bg-transparent sticky left-0 z-9 ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
  >
    <div class="text-left text-sm font-medium">
      {shorterAddress(data?.address)}
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-sm font-medium flex justify-end">
      $<TooltipNumber number={Number(data?.networth)} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="text-sm text-right text-[#00A878] font-medium flex flex-col items-end gap-1"
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="text-sm text-right text-[#00A878] font-medium flex flex-col items-end gap-1"
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="text-sm text-right text-[#00A878] font-medium flex flex-col items-end gap-1"
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="text-sm text-right text-[#00A878] font-medium flex flex-col items-end gap-1"
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
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-sm text-right font-medium flex flex-col items-end gap-1">
      {Number(data?.volatility).toFixed(2)}%
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-sm text-right font-medium flex flex-col items-end gap-1">
      {Number(data?.drawDown).toFixed(2)}%
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="text-sm text-right font-medium flex flex-col items-end gap-1">
      {Number(data?.sharpeRatio).toFixed(2)}
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="text-sm text-right font-medium flex flex-col items-end gap-1 text-blue-500 cursor-pointer"
      on:click={() => {
        copyAddress(data?.address);
        closeModal();
      }}
    >
      Compare
    </div>
  </td>
</tr>

<style>
</style>
