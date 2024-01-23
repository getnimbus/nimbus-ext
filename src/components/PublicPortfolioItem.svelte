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

  let currentTimestamp = dayjs();

  function formatActiveTime(timestamp) {
    const currentTime = dayjs();
    const activityTime = dayjs(timestamp);

    const minutesDiff = currentTime.diff(activityTime, "minute");
    const hoursDiff = currentTime.diff(activityTime, "hour");
    const daysDiff = currentTime.diff(activityTime, "day");
    const monthsDiff = currentTime.diff(activityTime, "month");

    if (minutesDiff < 60) {
      return `${minutesDiff} ${minutesDiff === 1 ? "minute" : "minutes"} ago`;
    } else if (hoursDiff < 24) {
      return `${hoursDiff} ${hoursDiff === 1 ? "hour" : "hours"} ago`;
    } else if (daysDiff < 30) {
      return `${daysDiff} ${daysDiff === 1 ? "day" : "days"} ago`;
    } else if (monthsDiff < 12) {
      return `${monthsDiff} ${monthsDiff === 1 ? "month" : "months"} ago`;
    } else {
      return "More than a year ago";
    }
  }

  function formatAHT(timestamp) {
    const currentTime = dayjs();
    const activityTime = dayjs(Number(currentTime) - timestamp);

    const minutesDiff = currentTime.diff(activityTime, "minute");
    const hoursDiff = currentTime.diff(activityTime, "hour");
    const daysDiff = currentTime.diff(activityTime, "day");
    const monthsDiff = currentTime.diff(activityTime, "month");

    if (minutesDiff < 60) {
      return `${minutesDiff}m`;
    } else if (hoursDiff < 24) {
      return `${hoursDiff}h`;
    } else if (daysDiff < 30) {
      return `${daysDiff}d`;
    } else if (monthsDiff < 12) {
      return `${monthsDiff}mo`;
    } else {
      return "More than a year";
    }
  }
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
    <div class="text-right xl:text-sm text-2xl font-medium flex justify-end">
      $<TooltipNumber number={Number(data?.ethBalance)} type="balance" />
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
          data?.pnl_1d >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.pnl_1d))}
          type={Math.abs(Number(data?.pnl_1d)) > 999999 ? "balance" : "percent"}
        />
        <span>%</span>
        <img
          src={data?.pnl_1d >= 0 ? TrendUp : TrendDown}
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
          data?.pnl_7d >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.pnl_7d))}
          type={Math.abs(Number(data?.pnl_7d)) > 999999 ? "balance" : "percent"}
        />
        <span>%</span>
        <img
          src={data?.pnl_7d >= 0 ? TrendUp : TrendDown}
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
          data?.pnl_30d >= 0 ? "text-[#00A878]" : "text-red-500"
        }`}
      >
        <TooltipNumber
          number={Math.abs(Number(data?.pnl_30d))}
          type={Math.abs(Number(data?.pnl_30d)) > 999999
            ? "balance"
            : "percent"}
        />
        <span>%</span>
        <img
          src={data?.pnl_30d >= 0 ? TrendUp : TrendDown}
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
      <div class="flex items-center">
        $<TooltipNumber
          number={Math.abs(Number(data?.realized_profit))}
          type="balance"
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
      {Number(data?.txs_30d)}
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
      {formatAHT(Number(data?.avg_hold_time * 1000))}
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="xl:text-sm text-2xl text-right font-medium flex justify-end items-center"
    >
      {formatActiveTime(Number(data?.last_active * 1000))}
    </div>
  </td>
</tr>

<style>
</style>
