<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";
  import { v4 as uuidv4 } from "uuid";
  import { sendMessage } from "webext-bridge";
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";

  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";
  import Button from "~/components/Button.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import "~/components/Loading.custom.svelte";
  import "~/components/Tooltip.custom.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import { detectedChain, getAddressContext, shorterName } from "~/utils";

  const MultipleLang = {
    token: i18n("newtabPage.token", "Tokens"),
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),

    profit: i18n("newtabPage.profit", "Profit & Loss"),

    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let selectedWallet: string = "";
  let selectedChain: string = "";

  let holdingTokenData: TokenData = [];
  let marketPriceToken;
  let formatData = [];
  let sumTokens = 0;
  let filteredHoldingToken = true;
  let filteredHoldingDataToken = [];
  let isLoadingToken = false;
  let tableTokenHeader;
  let isStickyTableToken = false;
  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
  let typeTag = "";

  let formData = {
    category: "",
    tagData: [
      {
        id: uuidv4(),
        tagName: "",
        token: [],
      },
    ],
  };
  let selectedTokenList = [];

  const onSubmit = async () => {
    console.log("formData: ", formData);
  };

  const getHoldingToken = async (isReload: boolean = false) => {
    isLoadingToken = true;
    try {
      const response: HoldingTokenRes = await sendMessage("getHoldingToken", {
        address: selectedWallet,
        reload: isReload,
        chain: selectedChain,
      });

      if (selectedWallet === response?.address) {
        const formatData = response.result.map((item) => {
          return {
            ...item,
            value: item.amount * item.rate,
          };
        });
        holdingTokenData = formatData.sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });
        isLoadingToken = false;
      } else {
        // console.log("response: ", response)
      }
    } catch (e) {
      console.log("error: ", e);
      isLoadingToken = false;
    }
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let chainParams = urlParams.get("chain");
    let addressParams = urlParams.get("address");

    if (APP_TYPE.TYPE === "EXT") {
      const params = decodeURIComponent(window.location.hash)
        .split("?")[1]
        .split("&")
        .reduce(function (result, param) {
          var [key, value] = param.split("=");
          result[key] = value;
          return result;
        }, {});

      chainParams = params.chain;
      addressParams = params.address;
    }

    if (chainParams && addressParams) {
      selectedWallet = addressParams;
      selectedChain = chainParams;
    }

    const handleScroll = () => {
      const clientRectTokenHeader = tableTokenHeader?.getBoundingClientRect();
      isStickyTableToken = clientRectTokenHeader.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: {
    if (selectedWallet || selectedChain) {
      if (selectedWallet.length !== 0 && selectedChain.length !== 0) {
        getHoldingToken();
      }
    }
  }

  $: {
    if (holdingTokenData) {
      holdingTokenData.map((item: any) => {
        priceSubscribe([item?.cmc_id], (data) => {
          marketPriceToken = {
            id: data.id,
            market_price: data.p,
          };
        });
      });
    }
  }

  $: {
    if (holdingTokenData) {
      formatData = holdingTokenData.map((item) => {
        return {
          ...item,
          market_price: item?.rate || 0,
        };
      });
      filteredHoldingDataToken = formatData.filter((item) => item.value > 1);
      sumTokens = holdingTokenData.reduce(
        (prev, item: any) => prev + item.value,
        0
      );
    }
  }

  $: {
    if (filteredHoldingToken) {
      filteredHoldingDataToken = formatData.filter(
        (item) => item?.amount * item.market_price > 1
      );
    } else {
      filteredHoldingDataToken = formatData;
    }
  }

  let formatDataTokenHolding = [];
  $: {
    if (filteredHoldingDataToken) {
      console.log("filteredHoldingDataToken: ", filteredHoldingDataToken);
      formatDataTokenHolding = filteredHoldingDataToken.map((item) => {
        return {
          ...item,
          tags: ["orders", "hello mấy cưng"],
        };
      });
    }
  }

  $: {
    if (selectedTokenList.length === 0) {
      typeTag = "";
    }
  }
</script>

<ErrorBoundary>
  <div class="header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col mb-5 gap-14">
        <div class="flex items-center justify-between">
          <Link to="/analytic" class="cusor-pointer">
            <div class="flex items-center gap-1 text-white">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="xl:text-sm text-xl font-semibold">
                Back to Analytics
              </div>
            </div>
          </Link>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-white">
              <div class="xl:text-5xl text-7xl font-semibold">
                Personal Token Breakdown
              </div>
            </div>
            {#if selectedWallet}
              <div class="text-base">
                <Copy address={selectedWallet} iconColor="#fff" color="#fff" />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="max-w-[2000px] m-auto xl:w-[90%] w-[96%] -mt-26">
    <div class="bg-white rounded-[20px] xl:p-8 xl:shadow-md">
      <div
        class="border border-[#0000001a] rounded-[20px] p-6 flex flex-col gap-4"
      >
        <div class="xl:text-2xl text-4xl font-medium text-black">
          Custom Token Breakdown
        </div>
        <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-6">
          <div
            class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
              formData.category ? "bg-[#F0F2F7]" : ""
            }`}
          >
            <div class="xl:text-base text-xl text-[#666666] font-medium">
              Category
            </div>
            <input
              type="text"
              placeholder="Your category name"
              class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
                formData.category ? "bg-[#F0F2F7]" : ""
              }`}
              on:keyup={({ target: { value } }) => (formData.category = value)}
            />
          </div>

          <div class="flex flex-col gap-2">
            {#each formData.tagData as tagData (tagData.id)}
              <div id={tagData.id} class="flex gap-4 items-center">
                <div
                  class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
                    tagData.tagName ? "bg-[#F0F2F7]" : ""
                  }`}
                >
                  <div class="xl:text-base text-xl text-[#666666] font-medium">
                    Tag
                  </div>
                  <input
                    type="text"
                    placeholder="Your tag name"
                    class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
                      tagData.tagName ? "bg-[#F0F2F7]" : ""
                    }`}
                    on:keyup={({ target: { value } }) =>
                      (tagData.tagName = value)}
                  />
                </div>
                <button
                  on:click={() => {
                    formData = {
                      category: formData.category,
                      tagData: formData.tagData.filter(
                        (item) => item.id !== tagData.id
                      ),
                    };
                  }}
                >
                  X
                </button>
              </div>
            {/each}
            {#if formData.tagData.length === 0}
              <div class="text-red-500 text-base">Please add tag</div>
            {/if}
            <Button
              on:click={() => {
                formData = {
                  category: formData.category,
                  tagData: [
                    ...formData.tagData,
                    {
                      id: uuidv4(),
                      tagName: "",
                      token: [],
                    },
                  ],
                };
              }}>Add</Button
            >
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <div class="xl:text-xl text-3xl font-medium text-black">
                {MultipleLang.token}
              </div>
              <div class="xl:text-3xl text-4xl font-semibold text-right">
                $<TooltipNumber number={sumTokens} type="balance" />
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex justify-between">
                {#if selectedTokenList?.length !== 0}
                  {#if typeTag}
                    <div class="relative w-[300px] border border-red-500">
                      {#if typeTag === "add"}
                        <div>add</div>
                      {:else}
                        <div>edit</div>
                      {/if}
                    </div>
                  {:else}
                    <div class="flex gap-2">
                      <div class="w-max">
                        <Button
                          variant="tertiary"
                          on:click={() => {
                            typeTag = "add";
                          }}
                        >
                          <div
                            class="xl:text-base text-2xl font-medium text-white"
                          >
                            Add Tag
                          </div>
                        </Button>
                      </div>
                      <div class="w-max">
                        <Button
                          variant="tertiary"
                          on:click={() => {
                            typeTag = "edit";
                          }}
                        >
                          <div
                            class="xl:text-base text-2xl font-medium text-white"
                          >
                            Edit Tag
                          </div>
                        </Button>
                      </div>
                    </div>
                  {/if}
                {:else}
                  <div class="w-10" />
                {/if}
                <div class="flex items-center gap-2">
                  <label
                    class="xl:text-sm text-lg font-regular text-gray-400"
                    for="filter-value"
                    >{MultipleLang.hide}
                  </label>
                  <input
                    type="checkbox"
                    id="filter-value"
                    bind:checked={filteredHoldingToken}
                    class="cursor-pointer xl:w-4 xl:h-4 w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>
              <div
                class="border border-[#0000000d] rounded-[10px] xl:overflow-visible overflow-x-auto"
              >
                <table class="table-auto xl:w-full w-[1400px]">
                  <thead
                    class={isStickyTableToken ? "sticky top-0 z-10" : ""}
                    bind:this={tableTokenHeader}
                  >
                    <tr class="bg-[#f4f5f8]">
                      <th
                        class="py-3 w-10 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg-[#f4f5f8]"
                      />
                      <th
                        class="py-3 xl:static xl:bg-transparent sticky left-10 z-10 bg-[#f4f5f8] xl:w-[230px] w-[280px]"
                      >
                        <div
                          class="text-left xl:text-xs text-base uppercase font-semibold text-black"
                        >
                          {MultipleLang.assets}
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                        >
                          {MultipleLang.price}
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                        >
                          {MultipleLang.amount}
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                        >
                          {MultipleLang.value}
                        </div>
                      </th>
                      <th class="py-3">
                        <div
                          class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                        >
                          <TooltipTitle
                            tooltipText="Ratio based on token holding"
                          >
                            Ratio
                          </TooltipTitle>
                        </div>
                      </th>
                      <th class="py-3 pr-3 w-[300px]">
                        <div
                          class="text-center xl:text-xs text-base uppercase font-semibold text-black"
                        >
                          Tags
                        </div>
                      </th>
                    </tr>
                  </thead>
                  {#if isLoadingToken}
                    <tbody>
                      <tr>
                        <td colspan={7}>
                          <div
                            class="flex justify-center items-center py-3 px-3"
                          >
                            <loading-icon />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  {:else}
                    <tbody>
                      {#if formatDataTokenHolding && formatDataTokenHolding.length === 0}
                        <tr>
                          <td colspan={7}>
                            <div
                              class="flex justify-center items-center py-3 px-3 xl:text-lg text-xl text-gray-400"
                            >
                              {MultipleLang.empty}
                            </div>
                          </td>
                        </tr>
                      {:else}
                        {#each formatDataTokenHolding as data (data.contractAddress)}
                          <tr
                            id={data.contractAddress}
                            class="group transition-all"
                          >
                            <td
                              class="py-3 w-10 group-hover:bg-gray-100 xl:static xl:bg-transparent sticky left-0 z-10 bg-white"
                            >
                              <div class="flex justify-center">
                                <input
                                  type="checkbox"
                                  bind:value={data.contractAddress}
                                  on:change={(event) => {
                                    const { value, checked } = event.target;
                                    if (checked) {
                                      selectedTokenList = [
                                        ...selectedTokenList,
                                        {
                                          chain: data.chain,
                                          contractAddress: data.contractAddress,
                                        },
                                      ];
                                    } else {
                                      selectedTokenList =
                                        selectedTokenList.filter(
                                          (item) =>
                                            item.contractAddress !== value
                                        );
                                    }
                                  }}
                                  class="cursor-pointer xl:w-4 xl:h-4 w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:outline-none focus:ring-0 dark:focus:outline-none dark:focus:ring-0 dark:bg-gray-700 dark:border-gray-600"
                                />
                              </div>
                            </td>

                            <td
                              class="py-3 xl:static xl:bg-transparent sticky left-10 z-9 bg-white xl:w-[230px] w-[280px] group-hover:bg-gray-100"
                            >
                              <div class="text-left flex items-center gap-3">
                                <div class="relative">
                                  <img
                                    src={data.logo}
                                    alt=""
                                    width="30"
                                    height="30"
                                    class="rounded-full"
                                  />
                                  {#if getAddressContext(selectedWallet)?.type !== "BTC"}
                                    <div class="absolute -top-2 -right-1">
                                      <img
                                        src={detectedChain(data.chain)}
                                        alt=""
                                        width="15"
                                        height="15"
                                        class="rounded-full"
                                      />
                                    </div>
                                  {/if}
                                </div>
                                <div class="flex flex-col gap-1">
                                  <div
                                    class="text-black xl:text-sm text-xl font-medium relative"
                                    on:mouseover={() => {
                                      if (data?.name?.length > 20) {
                                        isShowTooltipName = true;
                                      }
                                    }}
                                    on:mouseleave={() => {
                                      if (data?.name?.length > 20) {
                                        isShowTooltipName = false;
                                      }
                                    }}
                                  >
                                    {#if data.name === undefined}
                                      N/A
                                    {:else}
                                      {data.name.length > 20
                                        ? shorterName(data.name, 20)
                                        : data.name}
                                    {/if}
                                    {#if isShowTooltipName && data?.name?.length > 20}
                                      <div
                                        class="absolute -top-8 left-0"
                                        style="z-index: 2147483648;"
                                      >
                                        <tooltip-detail text={data.name} />
                                      </div>
                                    {/if}
                                  </div>
                                  <div
                                    class="text-[#00000080] text-xs font-medium relative"
                                    on:mouseover={() => {
                                      if (data?.symbol?.length > 20) {
                                        isShowTooltipSymbol = true;
                                      }
                                    }}
                                    on:mouseleave={() => {
                                      if (data?.symbol?.length > 20) {
                                        isShowTooltipSymbol = false;
                                      }
                                    }}
                                  >
                                    {#if data.symbol === undefined}
                                      N/A
                                    {:else}
                                      {shorterName(data.symbol, 20)}
                                    {/if}
                                    {#if isShowTooltipSymbol && data?.symbol?.length > 20}
                                      <div
                                        class="absolute -top-8 left-0"
                                        style="z-index: 2147483648;"
                                      >
                                        <tooltip-detail text={data.symbol} />
                                      </div>
                                    {/if}
                                  </div>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                  {#if data.suggest && data.suggest.length}
                                    {#each data.suggest as item}
                                      <a
                                        href={item.url}
                                        target="_blank"
                                        class="flex items-center justyfy-center px-2 py-1 text-[#27326F] text-[10px] font-medium bg-[#1e96fc33] rounded-[1000px]"
                                      >
                                        {item.tile}
                                      </a>
                                    {/each}
                                  {/if}
                                </div>
                              </div>
                            </td>

                            <td class="py-3 group-hover:bg-gray-100">
                              <div
                                class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
                              >
                                $<TooltipNumber
                                  number={data.market_price}
                                  type="balance"
                                />
                              </div>
                            </td>

                            <td class="py-3 group-hover:bg-gray-100">
                              <div
                                class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
                              >
                                <TooltipNumber
                                  number={data.amount}
                                  type="amount"
                                />
                              </div>
                            </td>

                            <td class="py-3 group-hover:bg-gray-100">
                              <div
                                class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
                              >
                                $<TooltipNumber
                                  number={data?.amount * data?.market_price}
                                  type="balance"
                                />
                              </div>
                            </td>

                            <td class="py-3 group-hover:bg-gray-100">
                              <div
                                class="xl:text-sm text-xl text-[#00000099] font-medium flex justify-end"
                              >
                                <TooltipNumber
                                  number={((data?.amount * data?.market_price) /
                                    sumTokens) *
                                    100}
                                  type="percent"
                                />%
                              </div>
                            </td>

                            <td
                              class="py-3 pr-3 group-hover:bg-gray-100 w-[300px]"
                            >
                              <div
                                class="flex items-center justify-end gap-2 flex-wrap"
                              >
                                {#each data.tags as tag}
                                  <div
                                    class="bg-[#6AC7F533] text-[#27326F] xl:text-sm text-xl w-max px-3 py-1 rounded-[5px]"
                                  >
                                    {tag}
                                  </div>
                                {/each}
                              </div>
                            </td>
                          </tr>
                        {/each}
                      {/if}
                    </tbody>
                  {/if}
                </table>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <div class="w-[180px]">
              <Button type="submit">
                <div class="xl:text-base text-2xl font-medium text-white">
                  Submit
                </div>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style>
  .header-container {
    background-image: url("~/assets/capa.svg");
    background-color: #27326f;
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }
</style>
