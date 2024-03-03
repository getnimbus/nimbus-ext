<script lang="ts">
  import { typeWallet, isDarkMode } from "~/store";
  import { detectedChain } from "~/lib/chains";
  import { shorterAddress, shorterName } from "~/utils";
  import dayjs from "dayjs";
  import "dayjs/locale/en";
  import "dayjs/locale/vi";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { wait } from "~/entries/background/utils";

  import "~/components/Tooltip.custom.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import Image from "~/components/Image.svelte";
  import Tooltip from "~/components/Tooltip.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TokenDetailSidebar from "~/UI/TokenDetail/TokenDetailSidebar.svelte";
  import OverlaySidebar from "~/components/OverlaySidebar.svelte";

  import TrendUp from "~/assets/trend-up.svg";
  import TrendDown from "~/assets/trend-down.svg";
  import defaultToken from "~/assets/defaultToken.png";

  export let data;
  export let lastIndex: boolean = false;

  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;

  let showSideTokenDetail = false;
  let selectedTokenDetail = {};
  let isCopied = false;
  let isShowTooltipContractAddress = false;

  $: value = Number(data?.amount) * Number(data?.price?.price);

  $: percentPnL =
    Number(data?.avgCost) === 0
      ? 0
      : data.pnl / Math.abs(Number(data?.avgCost));

  const formatTime = (date: Date) => {
    if (dayjs().diff(date, "days") >= 1) {
      return dayjs(date).format("YYYY-MM-DD");
    }
    return dayjs(date).fromNow();
  };
</script>

<tr
  class="group transition-all cursor-pointer"
  on:click={() => {
    showSideTokenDetail = true;
    selectedTokenDetail = data;
  }}
>
  <td
    class={`pl-3 py-3 xl:static sticky left-0 z-9 w-[250px] ${
      $isDarkMode
        ? "bg-[#131313] group-hover:bg-[#000]"
        : "bg-white group-hover:bg-gray-100"
    }`}
    style={`${lastIndex ? "border-bottom-left-radius: 10px;" : ""}`}
  >
    <div class="relative flex items-center gap-3 text-left">
      <div class="relative">
        <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
          <Image logo={data.logo} defaultLogo={defaultToken} />
        </div>
        {#if ($typeWallet === "EVM" || $typeWallet === "MOVE" || $typeWallet === "BUNDLE") && data?.chain !== "CEX"}
          <div class="absolute -top-2 -right-1">
            <img
              src={detectedChain(data?.chain)?.logo}
              alt=""
              width="15"
              height="15"
              class="rounded-full"
            />
          </div>
        {/if}
      </div>
      <div class="flex flex-col gap-1">
        <div class="flex items-start gap-2">
          <div
            class="relative text-2xl font-medium xl:text-sm"
            on:mouseover={() => {
              isShowTooltipName = true;
            }}
            on:mouseleave={() => (isShowTooltipName = false)}
          >
            {#if data.name === undefined}
              N/A
            {:else}
              <div class="flex">
                {data?.name?.length > 20
                  ? shorterName(data.name, 20)
                  : data.name}
              </div>
            {/if}
            {#if isShowTooltipName && data?.name?.length > 20}
              <div class="absolute left-0 -top-8" style="z-index: 2147483648;">
                <Tooltip text={data.name} />
              </div>
            {/if}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div
            class="relative text-lg font-medium text_00000080 xl:text-xs"
            on:mouseover={() => {
              isShowTooltipSymbol = true;
            }}
            on:mouseleave={() => (isShowTooltipSymbol = false)}
          >
            {#if data.symbol === undefined}
              N/A
            {:else}
              {shorterName(data.symbol, 20)}
            {/if}
            {#if isShowTooltipSymbol && data.symbol.length > 20}
              <div class="absolute left-0 -top-8" style="z-index: 2147483648;">
                <Tooltip text={data.symbol} />
              </div>
            {/if}
          </div>

          {#if data?.positionType === "ERC_404"}
            <span
              class="inline-flex items-center gap-x-1.5 rounded-full bg-yellow-100 px-1 py-0.5 text-[10px] font-medium text-yellow-800"
            >
              <svg
                class="h-1.5 w-1.5 fill-yellow-500"
                viewBox="0 0 6 6"
                aria-hidden="true"
              >
                <circle cx={3} cy={3} r={3} />
              </svg>
              ERC 404
            </span>
          {/if}
        </div>
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end text-2xl font-medium xl:text-sm text_00000099">
      $<TooltipNumber number={data?.price?.price} type="balance" />
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex flex-col gap-1">
      <div
        class="flex items-center justify-end gap-1 text-2xl font-medium xl:text-sm text_00000099"
      >
        {#if dayjs().diff(dayjs(data?.last_transferred_at), "hour") < 24 && dayjs().diff(dayjs(data?.last_transferred_at), "hour") > 0}
          <span
            use:tooltip={{
              content: `<tooltip-detail text="Changed ${dayjs().diff(
                dayjs(data?.last_transferred_at),
                "hour"
              )} hrs ago" />`,
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
            class="cursor-pointer"
          >
            <div class="w-2 h-2 bg-indigo-500 rounded-full" />
          </span>
        {/if}
        <TooltipNumber number={data.amount} type="balance" personalValue />
      </div>

      <div
        class="flex justify-end text-2xl font-medium xl:text-sm text_00000099"
      >
        <TooltipNumber number={value} type="value" personalValue />
      </div>
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div class="flex justify-end text-2xl font-medium xl:text-sm text_00000099">
      ${#if data?.profit}
        <TooltipNumber number={data?.profit?.averageCost} type="balance" />
      {:else}
        0
      {/if}
    </div>
  </td>

  <td
    class={`py-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
  >
    <div
      class="flex items-center justify-end gap-1 text-2xl font-medium xl:text-sm view-token-detail2"
    >
      {#if ["BTC"].includes($typeWallet)}
        N/A
      {:else}
        <div class="flex flex-col">
          <div
            class={`flex justify-end ${
              data.pnl !== 0
                ? data.pnl >= 0
                  ? "text-[#00A878]"
                  : "text-red-500"
                : "text_00000099"
            }`}
          >
            <TooltipNumber
              number={Math.abs(data.pnl)}
              type="value"
              personalValue
            />
          </div>
          <div class="flex items-center justify-end gap-1">
            <div
              class={`flex items-center ${
                data.pnl !== 0
                  ? data.pnl >= 0
                    ? "text-[#00A878]"
                    : "text-red-500"
                  : "text_00000099"
              }`}
            >
              <TooltipNumber
                number={Math.abs(percentPnL) * 100}
                type="percent"
              />
              <span>%</span>
            </div>
            {#if data.pnl !== 0}
              <img
                src={data.pnl >= 0 ? TrendUp : TrendDown}
                alt="trend"
                class="mb-1"
              />
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </td>

  <td
    class={`py-3 pr-3 ${
      $isDarkMode ? "group-hover:bg-[#000]" : "group-hover:bg-gray-100"
    }`}
    style={`${lastIndex ? "border-bottom-right-radius: 10px;" : ""}`}
  >
    <div class="text-right text-2xl font-medium xl:text-sm text_00000099">
      {#if data?.profit}
        {formatTime(data?.profit?.latestTrade)}
      {/if}
    </div>
  </td>
</tr>

<!-- Sidebar Token Detail -->
<OverlaySidebar isOpen={showSideTokenDetail}>
  <div class="flex justify-between items-start">
    <div
      class="xl:text-5xl text-6xl text-gray-500 cursor-pointer"
      on:click|stopPropagation={() => {
        showSideTokenDetail = false;
        selectedTokenDetail = {};
      }}
    >
      &times;
    </div>
    {#if selectedTokenDetail && Object.keys(selectedTokenDetail).length !== 0}
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="rounded-full w-[46px] h-[46px] overflow-hidden">
              <Image logo={data.logo} defaultLogo={defaultToken} />
            </div>
            {#if ($typeWallet === "EVM" || $typeWallet === "MOVE" || $typeWallet === "BUNDLE") && selectedTokenDetail?.chain !== "CEX"}
              <div class="absolute -top-2 -right-1">
                <img
                  src={detectedChain(selectedTokenDetail?.chain)?.logo}
                  alt=""
                  width="26"
                  height="26"
                  class="rounded-full"
                />
              </div>
            {/if}
          </div>
          <div class="flex flex-col">
            <div class="flex items-start gap-2">
              <div
                class="relative font-medium xl:text-xl text-2xl"
                on:mouseover={() => {
                  isShowTooltipName = true;
                }}
                on:mouseleave={() => (isShowTooltipName = false)}
              >
                {#if selectedTokenDetail.name === undefined}
                  N/A
                {:else}
                  {selectedTokenDetail?.name?.length > 20
                    ? shorterName(selectedTokenDetail.name, 20)
                    : selectedTokenDetail.name}
                {/if}
                {#if isShowTooltipName && selectedTokenDetail?.name?.length > 20}
                  <div
                    class="absolute left-0 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <Tooltip text={selectedTokenDetail.name} />
                  </div>
                {/if}
              </div>
            </div>

            <div class="flex items-center gap-2">
              <div
                class="relative font-medium text_00000080 xl:text-base text-lg"
                on:mouseover={() => {
                  isShowTooltipSymbol = true;
                }}
                on:mouseleave={() => (isShowTooltipSymbol = false)}
              >
                {#if selectedTokenDetail.symbol === undefined}
                  N/A
                {:else}
                  {shorterName(selectedTokenDetail.symbol, 20)}
                {/if}
                {#if isShowTooltipSymbol && selectedTokenDetail.symbol.length > 20}
                  <div
                    class="absolute left-0 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <Tooltip text={selectedTokenDetail.symbol} />
                  </div>
                {/if}
              </div>
              <CopyToClipboard
                text={selectedTokenDetail?.contractAddress}
                let:copy
                on:copy={async () => {
                  isCopied = true;
                  await wait(1000);
                  isCopied = false;
                }}
              >
                <div
                  class="cursor-pointer relative"
                  on:mouseover={() => {
                    isShowTooltipContractAddress = true;
                  }}
                  on:mouseleave={() => (isShowTooltipContractAddress = false)}
                  on:click={copy}
                >
                  {#if isCopied}
                    <svg
                      width={20}
                      height={20}
                      id="Layer_1"
                      data-name="Layer 1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 122.88 74.46"
                      fill={$isDarkMode ? "#d1d5db" : "#00000080"}
                      ><path
                        fill-rule="evenodd"
                        d="M1.87,47.2a6.33,6.33,0,1,1,8.92-9c8.88,8.85,17.53,17.66,26.53,26.45l-3.76,4.45-.35.37a6.33,6.33,0,0,1-8.95,0L1.87,47.2ZM30,43.55a6.33,6.33,0,1,1,8.82-9.07l25,24.38L111.64,2.29c5.37-6.35,15,1.84,9.66,8.18L69.07,72.22l-.3.33a6.33,6.33,0,0,1-8.95.12L30,43.55Zm28.76-4.21-.31.33-9.07-8.85L71.67,4.42c5.37-6.35,15,1.83,9.67,8.18L58.74,39.34Z"
                      /></svg
                    >
                  {:else}
                    <svg
                      width={20}
                      height={20}
                      viewBox="0 0 12 11"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.1875 3.3125H10.6875V10.1875H3.8125V7.6875"
                        stroke={$isDarkMode ? "#d1d5db" : "#00000080"}
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M8.1875 0.8125H1.3125V7.6875H8.1875V0.8125Z"
                        stroke={$isDarkMode ? "#d1d5db" : "#00000080"}
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  {/if}

                  {#if isShowTooltipContractAddress}
                    <div
                      class="absolute right-0 -top-8"
                      style="z-index: 2147483648;"
                    >
                      <Tooltip
                        text={shorterAddress(
                          selectedTokenDetail?.contractAddress
                        )}
                      />
                    </div>
                  {/if}
                </div>
              </CopyToClipboard>
            </div>
          </div>
        </div>
        <div class="flex items-center font-medium xl:text-2xl text-3xl">
          $<TooltipNumber
            number={Number(selectedTokenDetail?.price.price)}
            type="balance"
          />
        </div>
      </div>
    {/if}
  </div>
  <TokenDetailSidebar data={selectedTokenDetail} {showSideTokenDetail} />
</OverlaySidebar>

<style windi:preflights:global windi:safelist:global>
  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }
</style>
