<svelte:options tag="address-info" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { isEmpty, groupBy } from "lodash";
  import * as echarts from "echarts";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { i18n } from "~/lib/i18n";
  import {
    formatValue,
    formatPercent,
    formatBalance,
    getLocalImg,
    shorterAddress,
    shorterName,
    typePieChart,
  } from "~/utils";
  import { getAddressContext } from "~/lib/chains";
  import { track } from "~/lib/data-tracking";
  import { isSaveAddressLabel } from "../../../store";

  import "~/components/Loading.custom.svelte";
  import "~/components/CoinChart.custom.svelte";
  import "~/components/PriceConvert.custom.svelte";
  import "~/components/CheckSafetyAddress.custom.svelte";
  import "~/components/Tooltip.custom.svelte";
  import Copy from "~/components/Copy.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import Image from "~/components/Image.svelte";
  import tooltip from "~/entries/contentScript/views/tooltip";

  import Edit from "../../../assets/edit.svg";
  import defaultToken from "../../../assets/defaultToken.png";
  import SmartContractIcon from "../assets/smart-contract.png";
  import CoinDefaultIcon from "../assets/coin-default.svg";
  // import MetaMaskIcon from "../assets/metamask-icon.png";
  // import CoinMarketCapIcon from "../assets/CoinMarketCap_logo.png";

  export let address;
  export let popup: boolean = true;
  export let isAddressDetail;

  const MultipleLang = {
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
    empty: i18n("newtabPage.empty", "Empty"),
    collection: i18n("newtabPage.collection", "Collection"),
  };

  // let balance = 0;
  // let tokenList = [];
  // let token = null;

  let isLoading = false;
  let unknownSmartContract = false;
  let type: "ADDRESS" | "ERC20" = "ADDRESS";
  let addressInfo = {
    categories: [],
    networth: 0,
    priceChange: 0,
    symbol: "",
    id: "",
  };
  let dataNfts = [];
  let linkMoreInfo = "";
  let labelBtnMoreInfo = "";
  let openShowCategoryList = false;
  let selectedTokenAllocation: "token" | "chain" = "token";
  let selectedType: "token" | "nft" = "token";
  let chart;
  let chartContainer;
  let option = {
    title: {
      text: "",
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        return `
            <div style="display: flex; flex-direction: column; gap: 12px; min-width: 190px;">
              <div style="display: flex; align-items: centers; gap: 4px">
                <img src=${params.data.logo} 
                  alt="" 
                  width=20 height=20 
                  style="border-radius: 100%" 
                /> 
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                  ${params.name} (${params.data.symbol})
                </div>
              </div>

              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_balance]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatBalance(params.data.value_balance)}
                </div>
              </div>

              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_value]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatValue(params.data.value_value)}
                </div>
              </div>

              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_ratio]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatPercent(params.value)}%
                </div>
              </div>
            </div>`;
      },
    },
    legend: {},
    series: [
      {
        type: "pie",
        radius: ["40%", "60%"],
        center: ["50%", "50%"],
        left: 0,
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: false,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: [],
      },
    ],
  };
  let addressLabel = "";
  let showChangeAddressLabel = false;
  let timer;
  let showTooltipGotoDetailAddress = false;
  let isEmptyTokens = false;
  let listAddressLabel = [];

  const setOption = () => {
    if (chart && !chart.isDisposed()) {
      chart.setOption(option, false, undefined, false);
    }
  };

  const destroyChart = () => {
    if (chart && !chart.isDisposed()) {
      chart.dispose();
    }
  };

  const makeChart = () => {
    destroyChart();
    chart = echarts.init(chartContainer, "white");
  };

  const getPreview = async () => {
    isLoading = true;
    try {
      const response: any = await sendMessage("getPreview", {
        address: address,
        chain: "ALL",
      });

      if (response) {
        type = response?.type;

        if (response?.type === "ADDRESS") {
          const formatListNfts = response?.nfts.map((item) => {
            return {
              ...item,
              collectionName: item?.collectionName
                ? item?.collectionName
                : "Orders",
            };
          });
          const listNft = groupBy(formatListNfts, "collectionName");
          const types = Object.getOwnPropertyNames(listNft);
          dataNfts = types.map((item) => {
            return {
              collectionName: item,
              tokens: listNft[item],
            };
          });

          addressInfo.categories = response?.tags;
          addressInfo.networth = response?.networth;
          addressInfo.priceChange = response?.priceChange;

          switch (response?.chain) {
            case "ETH":
              linkMoreInfo = `https://etherscan.io/address/${address}`;
              labelBtnMoreInfo = "Etherscan";
              break;
            case "BTC":
              linkMoreInfo = `https://mempool.space/address/${address}`;
              labelBtnMoreInfo = "mempool";
              break;
            default:
              linkMoreInfo = "";
              labelBtnMoreInfo = "";
          }

          if (response?.breakdown.length === 0) {
            isEmptyTokens = true;
          }

          const sum = (response?.breakdown || []).reduce(
            (prev, item) => prev + Number(item.value),
            0
          );

          const sortBreakdown = response?.breakdown.sort((a, b) => {
            if (a.value < b.value) {
              return 1;
            }
            if (a.value > b.value) {
              return -1;
            }
            return 0;
          });

          const topFourBreakdown = sortBreakdown.slice(0, 4);
          const orderBreakdown = sortBreakdown.slice(4, sortBreakdown.length);

          const sumOrderBreakdown = (orderBreakdown || []).reduce(
            (prev, item) => prev + Number(item.value),
            0
          );

          const sumAmountOrderBreakdown = (orderBreakdown || []).reduce(
            (prev, item) => prev + Number(item.amount),
            0
          );

          const dataPieChartOrderBreakdown = [
            {
              logo: defaultToken,
              name: "Others",
              symbol: "Other tokens",
              name_ratio: "Ratio",
              value: (sumOrderBreakdown / sum) * 100,
              name_value: "Value",
              value_value: sumOrderBreakdown,
              name_balance: "Balance",
              value_balance: sumAmountOrderBreakdown,
            },
          ];

          const formatDataPieChartTopFour = topFourBreakdown.map((item) => {
            return {
              logo: item.logo,
              name: item.name
                ? shorterName(item.name)
                : item.symbol
                  ? item.symbol
                  : "--",
              symbol: item.symbol,
              name_ratio: "Ratio",
              value: (Number(item.value) / sum) * 100,
              name_value: "Value",
              value_value: Number(item.value),
              name_balance: "Balance",
              value_balance: Number(item.amount || item.balance),
            };
          });

          option = {
            ...option,
            series: [
              {
                ...option.series[0],
                data:
                  sumOrderBreakdown > 0
                    ? formatDataPieChartTopFour.concat(
                        dataPieChartOrderBreakdown
                      )
                    : formatDataPieChartTopFour,
              },
            ],
          };
        }

        if (response?.type === "ERC20") {
          addressInfo.symbol = response?.symbol;
          addressInfo.id = response?.cg_id;
        }
      } else {
        unknownSmartContract = true;
      }
    } catch (e) {
      console.error("e: ", e);
      unknownSmartContract = true;
    } finally {
      isLoading = false;
    }
  };

  const getAddressLabel = async () => {
    const addressLabelRes = await browser.storage.sync.get(
      address.toString().toLowerCase()
    );
    const listAddressLabelRes = (
      await browser.storage.sync.get("ListAddressLabel")
    ).ListAddressLabel;
    if (listAddressLabelRes) {
      listAddressLabel = JSON.parse(listAddressLabelRes);
    }
    if (!isEmpty(addressLabelRes)) {
      addressLabel = addressLabelRes[address.toString().toLowerCase()];
    } else {
      addressLabel = address;
    }
  };

  const debounce = (value: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      addressLabel = value;
    }, 300);
  };

  const handleSaveAddressLabel = () => {
    showChangeAddressLabel = false;
    if (addressLabel) {
      browser.storage.sync.set({
        [address.toString().toLowerCase()]: addressLabel,
      });
      browser.storage.sync.set({
        ListAddressLabel: JSON.stringify([
          ...listAddressLabel,
          {
            address: address.toString().toLowerCase(),
            label: addressLabel,
          },
        ]),
      });
      isSaveAddressLabel.update((n) => (n = true));
    } else {
      addressLabel = address;
      isSaveAddressLabel.update((n) => (n = false));
    }
  };

  onMount(() => {
    track("Address Info", {
      url: window.location.href,
      address,
    });

    setTimeout(() => {
      makeChart();
    }, 200);

    getAddressLabel();
    getPreview();
  });

  onDestroy(() => {
    destroyChart();
  });

  $: option && setOption();
  $: if (chart && "white") {
    makeChart();
    setOption();
  }

  $: {
    if (chartContainer) {
      setTimeout(() => {
        makeChart();
      }, 200);
    }
  }

  $: {
    if (isAddressDetail) {
      option = {
        ...option,
        legend: {
          orient: "vertical",
          right: "right",
          bottom: "center",
        },
        series: [
          {
            ...option.series[0],
            left: -190,
            center: ["50%", "50%"],
          },
        ],
      };
    } else {
      option = {
        ...option,
        legend: {
          top: "5%",
          left: "0%",
        },
        series: [
          {
            ...option.series[0],
            left: 0,
            center: ["50%", "65%"],
          },
        ],
      };
    }
  }
</script>

<reset-style>
  <div
    class={`bg-white font-sans text-sm text-gray-600 transition-all ${
      isAddressDetail ? "w-[450px] rounded-[20px]" : "w-full rounded-[10px]"
    } ${isLoading && popup && "h-[120px]"} ${popup ? "h-full" : ""}`}
    class:shadow={popup && isAddressDetail}
  >
    {#if isLoading}
      <div class="w-full h-[120px] flex justify-center items-center">
        <loading-icon />
      </div>
    {:else}
      <div class="p-4">
        {#if type === "ERC20" && unknownSmartContract === false}
          <div class="m-[-16px]">
            <native-token-info
              name={addressInfo.symbol}
              id={addressInfo.id}
              loaded={true}
              search={false}
              {address}
            />
          </div>
        {/if}

        {#if type === "ADDRESS" && unknownSmartContract === false}
          <div class="flex flex-col gap-4">
            <div class="flex justify-between items-start">
              <div class="flex gap-2">
                <img
                  class="w-[40px] h-[40px] rounded-full"
                  src={getLocalImg(CoinDefaultIcon)}
                  alt={address}
                />
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <div class="relative">
                      <div class="flex-1">
                        {#if showChangeAddressLabel}
                          <input
                            on:keyup={({ target: { value } }) =>
                              debounce(value)}
                            on:blur={handleSaveAddressLabel}
                            on:keydown={(event) => {
                              if (event.which == 13 || event.keyCode == 13) {
                                handleSaveAddressLabel();
                              }
                            }}
                            autofocus={showChangeAddressLabel}
                            bind:value={addressLabel}
                            type="text"
                            class="border-none focus:outline-none focus:ring-0 bg-white"
                          />
                        {:else}
                          <div class="text-black text-sm font-medium">
                            {#if addressLabel}
                              {addressLabel === address
                                ? shorterAddress(addressLabel)
                                : addressLabel}
                            {:else}
                              {shorterAddress(address)}
                            {/if}
                          </div>
                        {/if}
                      </div>
                    </div>
                    <a
                      href={linkMoreInfo}
                      target="_blank"
                      class="h-4 w-4 relative"
                      on:mouseenter={() =>
                        (showTooltipGotoDetailAddress = true)}
                      on:mouseleave={() =>
                        (showTooltipGotoDetailAddress = false)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="w-full h-full object-contain text-[#212121]"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                          clip-rule="evenodd"
                        />
                        <path
                          fill-rule="evenodd"
                          d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      {#if showTooltipGotoDetailAddress}
                        <div
                          class="absolute -top-7 left-1/2 transform -translate-x-1/2"
                          style="z-index: 2147483648;"
                        >
                          <tooltip-detail text={"Go to address detail"} />
                        </div>
                      {/if}
                    </a>
                  </div>
                  <Copy
                    iconSize={12}
                    {address}
                    isShorten
                    iconColor="#212121"
                    color="#00000099"
                  />
                </div>
              </div>
              <div
                class="py-[2px] px-2 flex gap-1 items-center cursor-pointer hover:bg-[#A5D5FE4D] rounded-[1000px]"
                on:click={() => {
                  if (addressLabel !== address) {
                    browser.storage.sync.remove([
                      address.toString().toLowerCase(),
                    ]);
                    const removeAddressLabel = listAddressLabel.filter(
                      (item) =>
                        item.address !== address.toString().toLowerCase()
                    );
                    browser.storage.sync.set({
                      ListAddressLabel: JSON.stringify(removeAddressLabel),
                    });
                    addressLabel = address;
                    isSaveAddressLabel.update((n) => (n = true));
                  } else {
                    showChangeAddressLabel = true;
                  }
                }}
              >
                <img src={getLocalImg(Edit)} alt="" />
                <div class="text-xs font-medium text-[#27326F]">
                  {#if addressLabel !== address}
                    Reset Label
                  {:else}
                    Change Label
                  {/if}
                </div>
              </div>
            </div>
            <div class="flex gap-1 flex-wrap">
              {#each addressInfo?.categories.slice(0, 6) as category}
                <div
                  class="w-max px-1 py-[2px] text-[#27326F] text-[11px] font-normal bg-[#6AC7F533] rounded-[5px]"
                >
                  {category}
                </div>
              {/each}
              {#if addressInfo?.categories.length > 6}
                <div class="relative">
                  <div
                    class="w-max px-1 py-[2px] text-[#27326F] text-[11px] font-normal bg-[#6AC7F533] rounded-[5px] flex items-center gap-1 cursor-pointer"
                    on:click={() => {
                      openShowCategoryList = !openShowCategoryList;
                    }}
                  >
                    More...
                  </div>
                  {#if openShowCategoryList}
                    <div class="content">
                      {#each addressInfo?.categories.slice(6) as category}
                        <div class="content_item" id={category}>
                          {category}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
            <check-safety-address {address} id={"1"} />
            <div class="flex justify-between items-end">
              <div class="flex flex-col gap-1">
                <div class="text-[#00000099] text-sm">Net Worth</div>
                <div class="flex items-end gap-4">
                  <div class="text-2xl font-medium text-black flex">
                    <TooltipNumber number={addressInfo.networth} type="value" />
                  </div>
                  <div class="flex items-center gap-2">
                    {#if addressInfo.priceChange}
                      <div
                        class={`text-lg font-medium flex ${
                          addressInfo.priceChange < 0
                            ? "text-[#EF4444]"
                            : "text-[#00A878]"
                        }`}
                      >
                        {#if addressInfo.priceChange < 0}
                          ↓
                        {:else}
                          ↑
                        {/if}
                        <TooltipNumber
                          number={Math.abs(addressInfo.priceChange)}
                          type="percent"
                        />%
                      </div>
                    {:else}
                      <div class="text-lg font-medium text-black">--</div>
                    {/if}
                    <div class="text-[#00000066] text-base font-medium">
                      24h
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <AnimateSharedLayout>
                  {#each typePieChart as type}
                    <div
                      class="relative cursor-pointer text-base font-medium py-1 px-3 rounded-[100px] transition-all"
                      on:click={() => (selectedType = type.value)}
                    >
                      <div
                        class={`relative z-20 ${
                          selectedType === type.value && "text-white"
                        }`}
                      >
                        {type.label}
                      </div>
                      {#if type.value === selectedType}
                        <Motion
                          let:motion
                          layoutId="active-pill"
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <div
                            class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                            use:motion
                          />
                        </Motion>
                      {/if}
                    </div>
                  {/each}
                </AnimateSharedLayout>
              </div>
            </div>
            <div
              class="border border-[#0000001a] rounded-[20px] overflow-hidden"
            >
              {#if selectedType === "nft"}
                <div class="flex flex-col">
                  <div class="text-lg font-medium text-black pt-4 px-4 pb-2">
                    NFT
                  </div>
                  <table class="table-auto w-full">
                    <thead>
                      <tr class="bg-[#f4f5f8]">
                        <th class="pl-4 py-2 w-[200px]">
                          <div
                            class="text-left text-xs uppercase font-semibold text-black"
                          >
                            {MultipleLang.collection}
                          </div>
                        </th>
                        <th class="pr-4 py-2">
                          <div
                            class="text-left text-xs uppercase font-semibold text-black"
                          >
                            {MultipleLang.Balance}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {#if dataNfts && dataNfts.length === 0}
                        <tr>
                          <td colspan={2}>
                            <div
                              class="flex justify-center items-center py-2 px-4 text-lg text-gray-400"
                            >
                              {MultipleLang.empty}
                            </div>
                          </td>
                        </tr>
                      {:else}
                        {#each dataNfts.slice(0, 5) as item}
                          <tr
                            class="hover:bg-gray-100 transition-all cursor-pointer"
                            on:click={() => {
                              if (getAddressContext(address)?.type === "EVM") {
                                window.open(
                                  `https://app.getnimbus.io/?type=EVM&chain=ALL&address=${address}`,
                                  "_blank"
                                );
                              }
                              if (getAddressContext(address)?.type === "SOL") {
                                window.open(
                                  `https://app.getnimbus.io/?type=SOL&address=${address}`,
                                  "_blank"
                                );
                              }
                              if (getAddressContext(address)?.type === "BTC") {
                                window.open(
                                  `https://app.getnimbus.io/?type=BTC&address=${address}`,
                                  "_blank"
                                );
                              }
                            }}
                          >
                            <td class="pl-4 py-2 w-[200px]">
                              <div class="relative">
                                <div
                                  class="text-sm text-black font-medium flex justify-start"
                                >
                                  {#if item?.collectionName.length > 20}
                                    <span
                                      use:tooltip={{
                                        content: `<tooltip-detail text="${item?.collectionName}" />`,
                                        allowHTML: true,
                                        placement: "top",
                                        interactive: true,
                                      }}
                                    >
                                      {shorterName(item?.collectionName, 20)}
                                    </span>
                                  {:else}
                                    <span>{item?.collectionName}</span>
                                  {/if}
                                </div>
                              </div>
                            </td>

                            <td class="pr-4 py-2">
                              <div class="relative">
                                <div class="flex justify-start w-max">
                                  {#if item?.tokens.length > 5}
                                    {#each item?.tokens.slice(0, 5) as token, index}
                                      <div
                                        class={`w-6 h-6 rounded-md border border-gray-300 overflow-hidden ${
                                          index > 0 && "-ml-2"
                                        }`}
                                      >
                                        <Image
                                          logo={token?.imageUrl}
                                          defaultLogo="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                                        />
                                      </div>
                                    {/each}
                                    <div class="relative w-6 h-6">
                                      <div
                                        class="w-6 h-6 rounded-md border border-gray-300 overflow-hidden -ml-2"
                                      >
                                        <Image
                                          logo={item?.tokens[4].imageUrl}
                                          defaultLogo="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                                        />
                                      </div>
                                      <div
                                        class="absolute top-0 -left-2 w-6 h-6 bg-[#00000066] text-white text-center flex justify-center items-center pb-2 rounded-md"
                                      >
                                        ...
                                      </div>
                                    </div>
                                  {:else}
                                    {#each item?.tokens as token, index}
                                      <div
                                        class={`w-6 h-6 rounded-md border border-gray-300 overflow-hidden ${
                                          index > 0 && "-ml-2"
                                        }`}
                                      >
                                        <Image
                                          logo={token?.imageUrl}
                                          defaultLogo="https://i.seadn.io/gae/TLlpInyXo6n9rzaWHeuXxM6SDoFr0cFA0TWNpFQpv5-oNpXlYKzxsVUynd0XUIYBW2G8eso4-4DSQuDR3LC_2pmzfHCCrLBPcBdU?auto=format&dpr=1&w=384"
                                        />
                                      </div>
                                    {/each}
                                  {/if}
                                </div>
                              </div>
                            </td>
                          </tr>
                        {/each}
                      {/if}
                    </tbody>
                  </table>
                  {#if dataNfts.length !== 0 && dataNfts.length > 5}
                    <div class="mx-auto mt-3 mb-4">
                      <button
                        class="w-max px-3 py-1 rounded-lg cursor-pointer text-xs font-medium border-[1px] border-black bg-white"
                        on:click={() => {
                          if (getAddressContext(address)?.type === "EVM") {
                            window.open(
                              `https://app.getnimbus.io/?type=EVM&chain=ALL&address=${address}`,
                              "_blank"
                            );
                          }
                          if (getAddressContext(address)?.type === "SOL") {
                            window.open(
                              `https://app.getnimbus.io/?type=SOL&address=${address}`,
                              "_blank"
                            );
                          }
                          if (getAddressContext(address)?.type === "BTC") {
                            window.open(
                              `https://app.getnimbus.io/?type=BTC&address=${address}`,
                              "_blank"
                            );
                          }
                        }}
                        >Learn more
                      </button>
                    </div>
                  {/if}
                </div>
              {:else}
                <div class="p-4">
                  <div class="flex justify-between">
                    <div class="text-lg font-medium text-black">
                      Token Allocation
                    </div>
                    <!-- <div class="flex items-center gap-1">
                      <div
                        class={`cursor-pointer text-sm font-medium py-1 px-2 rounded-[100px] transition-all ${
                          selectedTokenAllocation === "token" &&
                          "bg-[#1E96FC] text-white"
                        }`}
                        on:click={() => (selectedTokenAllocation = "token")}
                      >
                        Token
                      </div>
                      <div
                        class={`cursor-pointer text-sm font-medium py-1 px-2 rounded-[100px] transition-all ${
                          selectedTokenAllocation === "chain" &&
                          "bg-[#1E96FC] text-white"
                        }`}
                        on:click={() => (selectedTokenAllocation = "chain")}
                      >
                        Chain
                      </div>
                    </div> -->
                  </div>
                  {#if isEmptyTokens}
                    Empty
                  {:else}
                    <div bind:this={chartContainer} class="h-[300px]" />
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/if}

        {#if unknownSmartContract}
          <div class="flex flex-col items-center gap-4 pt-3">
            <div class="text-center flex flex-col items-center gap-2">
              <img src={getLocalImg(SmartContractIcon)} width={50} alt="" />
              <div class="title-5 text-center font-semibold">
                SmartContract info will be supported soon
              </div>
            </div>
            {#if linkMoreInfo && labelBtnMoreInfo}
              <button
                class="btn-primary"
                on:click={() => window.open(linkMoreInfo, "_blank")}
              >
                {labelBtnMoreInfo}
              </button>
            {/if}
          </div>
        {/if}
      </div>

      <div class="flex justify-between px-4 pb-4">
        <div class="flex items-center gap-1">
          <svg
            width="20"
            height="30"
            viewBox="0 0 508 542"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M315 209H192V227H315V209Z" fill="#27326F" />
            <path
              d="M164.757 190.973C164.757 171.524 180.655 155.789 200.243 155.789C219.831 155.789 235.729 171.551 235.729 190.973H253.486C253.486 172.074 243.442 155.514 228.349 146.189C232.566 131.444 246.106 120.55 262.337 120.55C281.953 120.55 297.851 136.313 297.851 155.761V164.564H315.608C330.313 164.564 342.243 176.393 342.243 190.973H360C360 166.682 340.134 146.986 315.608 146.986C315.33 146.986 315.108 147.041 314.831 147.069C310.614 122.063 288.778 103 262.365 103C238.726 103 218.694 118.295 211.73 139.476C208.039 138.679 204.183 138.211 200.243 138.211C170.833 138.211 147 161.841 147 191H164.757V190.973Z"
              fill="#27326F"
            />
            <path
              d="M253.486 306.503V227H244.672L183 359.497H253.486V439H262.3L324 306.503H253.486ZM210.682 341.823L235.885 287.698V324.177H296.318L271.115 378.302V341.823H210.682Z"
              fill="#27326F"
            />
            <path
              d="M95 493H413V50H95V493ZM112.673 67.72H395.327V475.28H112.673V67.72Z"
              fill="#27326F"
            />
          </svg>
          <div class="text-[#27326F] text-xs font-medium">
            Nimbus - A personalized portfolio
          </div>
        </div>
        <a
          href="https://nimbus.featurebase.app/"
          target="_blank"
          class="inline-flex no-underline cursor-pointer items-center bg-[#6AC7F533] text-[#27326F] w-max px-3 py-1 rounded-[5px]"
        >
          Report
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 ml-1 text-[#27326F]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
      </div>
    {/if}
  </div>
</reset-style>

<style>
  .shadow {
    box-shadow: 0px 0px 40px 0px #0000001a;
  }

  .btn-border {
    border: 1px solid #0ea5e9;
  }

  .border {
    border: 1px solid #e5e7eb;
  }

  .content {
    min-width: 120px;
    width: 120px;
    max-height: 400px;
    overflow-y: overlay;
    position: absolute;
    left: 0;
    margin-top: 6px;
    z-index: 2147483646;
    background: #ffffff;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .content::-webkit-scrollbar {
    display: none;
  }

  .content .content_item {
    padding: 1px 4px;
    border-radius: 5px;
    background: #6ac7f533;
    color: #27326f;
    font-size: 11px;
    line-height: 20px;
    font-weight: 400;
  }
</style>
