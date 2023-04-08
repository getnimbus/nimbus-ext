<svelte:options tag="address-info" />

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as browser from "webextension-polyfill";
  import { sendMessage } from "webext-bridge";
  import { isEmpty } from "lodash";
  import detectEthereumProvider from "@metamask/detect-provider";
  import * as echarts from "echarts";
  import numeral from "numeral";
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import { i18n } from "~/lib/i18n";
  import { wait } from "~/entries/background/utils";
  import {
    formatBalance,
    formatCurrency,
    getLocalImg,
    shorterAddress,
  } from "../../../utils";
  import { track } from "~/lib/data-tracking";
  import { nimbus } from "../../../lib/network";
  import { isSaveAddressLabel } from "../../../store";

  import "~/components/Loading.custom.svelte";
  import "~/components/CoinChart.custom.svelte";
  import "~/components/PriceConvert.custom.svelte";
  import "~/components/CheckSafetyAddress.custom.svelte";

  import SmartContractIcon from "../assets/smart-contract.png";
  // import MetaMaskIcon from "../assets/metamask-icon.png";
  // import CoinMarketCapIcon from "../assets/CoinMarketCap_logo.png";
  // import CoinGekoIcon from "../assets/coingecko-logo.png";
  import CoinDefaultIcon from "../assets/coin-default.svg";
  import Edit from "../../../assets/edit.svg";

  export let address;
  export let popup: boolean = true;

  const MultipleLang = {
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
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
  let openShowCategoryList = false;
  let selectedTokenAllocation = "token";
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
                <img src=${params.data.logo} alt="" width=20 height=20 /> 
                <div style="font-weight: 500; font-size: 16px; line-height: 19px; color: black;">
                  ${params.name} (${params.data.symbol})
                </div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_balance]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatCurrency(params.data.value_balance)}</div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_value]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  $${formatCurrency(params.data.value_value)}</div>
              </div>
              <div style="display: flex; align-items: centers; justify-content: space-between; gap: 4px">
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: black;">
                  ${MultipleLang[params.data.name_ratio]}
                </div>
                <div style="flex: 1; font-weight: 500; font-size: 14px; line-height: 17px; color: rgba(0, 0, 0, 0.7);">
                  ${formatCurrency(params.value)}%
                </div>
              </div>
            </div>`;
      },
    },
    legend: {
      orient: "vertical",
      right: "right",
      bottom: "center",
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "60%"],
        left: -190,
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
  let isCopied = false;

  // const loadUserAddressInfo = async () => {
  //   isLoading = true;
  //   // TODO: What if this is a smart contract or ERC20 a address
  //   const addressPortfolio = await nimbus
  //     .get(`/portfolio/${address}`)
  //     .then((response) => response.data.data);

  //   if (addressPortfolio) {
  //     balance = addressPortfolio.totalBalanceUsd;
  //     tokenList = addressPortfolio.assets;
  //   }
  //   isLoading = false;
  // };

  // const handleAddToken = async () => {
  //   if (!token) {
  //     // No token info
  //     return;
  //   }
  //   const provider = await detectEthereumProvider();
  //   if (provider && window.ethereum) {
  //     const wasAdded = await ethereum.request({
  //       method: "wallet_watchAsset",
  //       params: {
  //         type: "ERC20",
  //         options: {
  //           address: address,
  //           symbol: token.symbol,
  //           decimals: token.decimals,
  //           image: token.logo_url,
  //         },
  //       },
  //     });
  //     console.log(wasAdded);
  //   } else {
  //     // TODO: Show some toast to user
  //     console.log("Please install MetaMask!");
  //   }
  // };

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
      });

      if (response) {
        type = response?.type;

        if (response?.type === "ADDRESS") {
          addressInfo.categories = response?.tags;
          addressInfo.networth = response?.networth;
          addressInfo.priceChange = response?.priceChange;

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
              logo: "https://raw.githubusercontent.com/getnimbus/assets/main/token.png",
              name: "Order",
              symbol: "Order tokens",
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
              name: item.name || item.symbol,
              symbol: item.symbol,
              name_ratio: "Ratio",
              value: (Number(item.value) / sum) * 100,
              name_value: "Value",
              value_value: Number(item.value),
              name_balance: "Balance",
              value_balance: Number(item.amount),
            };
          });

          option = {
            ...option,
            series: [
              {
                ...option.series[0],
                data: formatDataPieChartTopFour.concat(
                  dataPieChartOrderBreakdown
                ),
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
      console.log("e: ", e);
      unknownSmartContract = true;
    } finally {
      isLoading = false;
    }
  };

  const getAddressLabel = async () => {
    const addressLabelRes = await browser.storage.sync.get(address);
    if (!isEmpty(addressLabelRes)) {
      addressLabel = addressLabelRes[address];
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
        [address]: addressLabel,
      });
      isSaveAddressLabel.update((n) => (n = true));
    } else {
      addressLabel = address;
      isSaveAddressLabel.update((n) => (n = false));
    }
  };

  onMount(() => {
    // loadUserAddressInfo();
    // track("Address Info", {
    //   url: window.location.href,
    //   address,
    // });

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
</script>

<reset-style>
  <div
    class={`rounded-[20px] bg-white font-sans text-sm text-gray-600 transition-all overflow-hidden w-[450px] ${
      isLoading && popup && "max-h-[120px]"
    } ${popup ? "max-h-[680px]" : ""}`}
    class:shadow={popup}
  >
    {#if isLoading}
      <div class="w-full h-[120px] flex justify-center items-center">
        <loading-icon />
      </div>
    {:else}
      <div class="p-4">
        <!-- {#if balance}
          <div>
            {#if balance}
              <div class="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-[32px] h-[32px] mr-3 text-sky-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                    clip-rule="evenodd"
                  />
                </svg>

                <div class="flex flex-col">
                  <div>Balance (Including all tokens in all chains)</div>
                  <div class="font-bold">
                    ${formatCurrency(balance)}
                  </div>
                </div>
              </div>
            {/if}

            {#if tokenList.length}
              <div>
                <div class="font-bold my-1">Top assets</div>
                <div class="grid grid-cols-3 mb-1">
                  <div class="p-1 border">Asset</div>
                  <div class="p-1 text-right border">Balance</div>
                  <div class="p-1 text-right border">Value</div>
                </div>
                <div class="grid grid-cols-3 gap-2">
                  {#each tokenList
                    .sort((a, b) => Number(b.balanceUsd) - Number(a.balanceUsd))
                    .slice(0, 5) as item}
                    <div class="flex items-center px-1">
                      <img
                        src={item.thumbnail || getLocalImg(CoinDefaultIcon)}
                        alt=""
                        class="w-[20px] h-[20px] rounded-full mr-1"
                      />
                      {item.tokenSymbol}
                    </div>
                    <div class="text-right px-1">
                      {formatBalance(item.balance)}
                    </div>
                    <div class="text-right px-1">
                      <strong>
                        ${formatCurrency(item.balanceUsd)}
                      </strong>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <div class="flex justify-between gap-4 my-2">
              <div class="flex-1">
                <button
                  class="btn-primary"
                  on:click={() =>
                    window.open(
                      `https://debank.com/profile/${address}`,
                      "_blank"
                    )}
                >
                  DeBank
                </button>
              </div>
              <div class="flex-1">
                <button
                  class="btn-primary"
                  on:click={() =>
                    window.open(
                      `https://etherscan.io/address/${address}`,
                      "_blank"
                    )}
                >
                  Etherscan
                </button>
              </div>
            </div>
          </div>
        {/if}

        {#if token}
          <div>
            <coin-chart symbol={token.symbol} loaded={true} />
            <div class="text-center mt-2">
              <img
                class="w-[72px] h-[72px] rounded-full"
                src={token.logo_url || getLocalImg(CoinDefaultIcon)}
                alt={token.name}
              />
              <div>
                {token.name} - <span class="text-gray-400">{token.symbol}</span>
              </div>
              <div>
                Price: <strong>${formatCurrency(token.price)}</strong>
              </div>

              <price-convert symbol={token.symbol} price={token.price} />

              <div class="flex gap-4 justify-between items-center my-2">
                <div
                  on:click={handleAddToken}
                  class="flex items-center justyfy-center gap-1 btn-border px-3 py-1 text-sky-500 cursor-pointer"
                >
                  <img
                    src={getLocalImg(MetaMaskIcon)}
                    width={14}
                    height={14}
                    alt=""
                  /> Add to MetaMask
                </div>
                <div class="flex gap-2">
                  <a
                    href="https://coinmarketcap.com/currencies/bitcoin"
                    target="blank"
                  >
                    <img
                      src={getLocalImg(CoinMarketCapIcon)}
                      width={22}
                      height={22}
                      alt=""
                    />
                  </a>
                  <a
                    href="https://www.coingecko.com/en/coins/bitcoin"
                    target="blank"
                  >
                    <img
                      src={getLocalImg(CoinGekoIcon)}
                      width={22}
                      height={22}
                      alt=""
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        {/if} -->

        {#if type === "ERC20" && unknownSmartContract === false}
          <div class="m-[-16px]">
            <native-token-info
              id={addressInfo.id}
              name={addressInfo.symbol}
              loaded={true}
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
                            autofocus={showChangeAddressLabel}
                            bind:value={addressLabel}
                            type="text"
                            class="border-none focus:outline-none focus:ring-0"
                          />
                        {:else}
                          <div class="text-sm font-medium text-black">
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
                      href={`https://etherscan.io/address/${address}`}
                      target="_blank"
                      class="h-4 w-4"
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
                    </a>
                  </div>
                  <CopyToClipboard
                    text={address}
                    let:copy
                    on:copy={async () => {
                      isCopied = true;
                      await wait(1000);
                      isCopied = false;
                    }}
                  >
                    <div class="flex items-center gap-2">
                      <div class="text-sm text-[#00000099] font-normal">
                        {shorterAddress(address)}
                      </div>
                      <div class="cursor-pointer" on:click={copy}>
                        {#if isCopied}
                          <svg
                            id="Layer_1"
                            data-name="Layer 1"
                            class="w-3 h-3 object-contain text-[#212121]"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 457.57"
                            ><defs
                              ><style>
                                .cls-1 {
                                  fill-rule: evenodd;
                                }
                              </style></defs
                            ><path
                              class="cls-1"
                              d="M0,220.57c100.43-1.33,121-5.2,191.79,81.5,54.29-90,114.62-167.9,179.92-235.86C436-.72,436.5-.89,512,.24,383.54,143,278.71,295.74,194.87,457.57,150,361.45,87.33,280.53,0,220.57Z"
                            /></svg
                          >
                        {:else}
                          <svg
                            width="12"
                            height="11"
                            viewBox="0 0 12 11"
                            fill="none"
                            class="w-full h-full object-contain text-[#212121]"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.1875 3.3125H10.6875V10.1875H3.8125V7.6875"
                              stroke="#212121"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M8.1875 0.8125H1.3125V7.6875H8.1875V0.8125Z"
                              stroke="#212121"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                          </svg>
                        {/if}
                      </div>
                    </div>
                  </CopyToClipboard>
                </div>
              </div>
              <div
                class="py-[2px] px-2 flex gap-1 items-center cursor-pointer hover:bg-[#A5D5FE4D] rounded-[1000px]"
                on:click={() => {
                  if (addressLabel !== address) {
                    browser.storage.sync.remove([address]);
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
              {#each addressInfo.categories.slice(0, 2) as category}
                <div
                  class="w-max px-1 py-[2px] text-[#27326F] text-[11px] font-normal bg-[#6AC7F533] rounded-[5px]"
                >
                  {category}
                </div>
              {/each}
              {#if addressInfo.categories.length > 2}
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
                      {#each addressInfo.categories.slice(2) as category}
                        <div class="content_item" id={category}>
                          {category}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
            <!-- <check-safety-address {address} chainId={"1"} /> -->
            <div class="flex flex-col gap-2">
              <div class="text-[#00000099] text-sm">Networth</div>
              <div class="flex items-end gap-4">
                <div class="text-2xl font-medium text-black">
                  ${numeral(addressInfo.networth).format("0,0.00")}
                </div>
                <div class="flex items-center gap-2">
                  {#if addressInfo.priceChange}
                    <div
                      class={`text-lg font-medium ${
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
                      {numeral(Math.abs(addressInfo.priceChange)).format(
                        "0,0.00"
                      )}%
                    </div>
                  {:else}
                    <div class="text-lg font-medium text-black">--</div>
                  {/if}
                  <div class="text-[#00000066] text-base font-medium">24h</div>
                </div>
              </div>
            </div>
            <div class="border border-[#0000001a] rounded-[20px] p-4">
              <div class="flex justify-between">
                <div class="text-lg font-medium text-black">
                  Token Allocation
                </div>
                <!-- <div class="flex items-center gap-2">
                  <div
                    class={`cursor-pointer text-base font-medium py-[6px] px-4 rounded-[100px] transition-all ${
                      selectedTokenAllocation === "token" &&
                      "bg-[#1E96FC] text-white"
                    }`}
                    on:click={() => (selectedTokenAllocation = "token")}
                  >
                    Token
                  </div>
                  <div
                    class={`cursor-pointer text-base font-medium py-[6px] px-4 rounded-[100px] transition-all ${
                      selectedTokenAllocation === "chain" &&
                      "bg-[#1E96FC] text-white"
                    }`}
                    on:click={() => (selectedTokenAllocation = "chain")}
                  >
                    Chain
                  </div>
                </div> -->
              </div>
              <div bind:this={chartContainer} class="h-[300px]" />
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
            <button
              class="btn-primary"
              on:click={() =>
                window.open(
                  `https://etherscan.io/address/${address}`,
                  "_blank"
                )}
            >
              Etherscan
            </button>
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
          href="https://nimbus.sleekplan.app/"
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
