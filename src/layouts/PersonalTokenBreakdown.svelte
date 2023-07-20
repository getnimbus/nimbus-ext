<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";
  import { sendMessage } from "webext-bridge";
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";
  import { detectedChain, getAddressContext, shorterName } from "~/utils";

  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";
  import Button from "~/components/Button.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import "~/components/Loading.custom.svelte";
  import "~/components/Tooltip.custom.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import Edit from "~/assets/edit.svg";

  const MultipleLang = {
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  let selectedWallet: string = "";
  let selectedChain: string = "";

  let holdingTokenData: TokenData = [];
  let marketPriceToken;
  let formatData = [];
  let sumTokens = 0;
  let isLoadingToken = false;
  let tableTokenHeader;
  let isStickyTableToken = false;
  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
  let selectedHover = "";
  let showSetTag = false;

  let formData = {
    category: "",
    tag: {
      name: "",
      tokens: [],
    },
  };
  let selectedTokenList = [];
  let formatDataTokenHolding = [];
  let listTag = ["others", "hello", "hi"];
  let query = "";
  let showSuggestListTag = false;

  const onSubmit = async (e) => {
    const formatSelectedTokenList = selectedTokenList.map((item) => {
      const indexOfDash = item.indexOf("-");
      return indexOfDash >= 0 ? item.slice(indexOfDash + 1) : item;
    });

    formatDataTokenHolding = formatDataTokenHolding.map((item) => {
      const isSelected = formatSelectedTokenList.some(
        (selectedToken) => selectedToken === item.contractAddress
      );

      return {
        ...item,
        tag: isSelected ? query : item.tag,
      };
    });

    formData = {
      ...formData,
      tag: {
        name: query,
        tokens: selectedTokenList,
      },
    };

    e.target.reset();
    query = "";
    showSetTag = false;
    showSuggestListTag = false;
    selectedTokenList = [];

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
      sumTokens = holdingTokenData.reduce(
        (prev, item: any) => prev + item.value,
        0
      );
    }
  }

  $: formatDataTokenHolding = formatData.map((item) => {
    return {
      ...item,
      tag: "others",
    };
  });

  $: filteredListTag = listTag;

  $: {
    if (selectedTokenList.length === 0) {
      showSetTag = false;
    }
  }

  let editTag = "";
  let tag = "";

  const handleEditTag = () => {
    console.log("tag: ", tag);
    editTag = "";
  };
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

        <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-4">
          <div
            class={`flex flex-col gap-1 input-2 w-full py-[6px] px-3 ${
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
            <div class="flex justify-between items-center">
              {#if selectedTokenList?.length !== 0}
                {#if showSetTag}
                  <div class="w-[600px]">
                    <div
                      class={`flex justify-between gap-1 border bg-white focus:outline-none w-full py-[6px] px-3 rounded-t-lg ${
                        formData.category ? "bg-[#F0F2F7]" : ""
                      } ${
                        showSuggestListTag ? "rounded-none" : "rounded-b-lg"
                      }`}
                    >
                      <input
                        type="text"
                        placeholder="Your tag name"
                        class={`flex-1 p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] ${
                          formData.category ? "bg-[#F0F2F7]" : ""
                        }`}
                        on:focus={() => {
                          showSuggestListTag = true;
                        }}
                        on:keyup={({ target: { value } }) => {
                          filteredListTag = listTag.filter((tag) =>
                            tag.toLowerCase().includes(value.toLowerCase())
                          );
                        }}
                        bind:value={query}
                      />

                      {#if query && !showSuggestListTag}
                        <button
                          type="submit"
                          class="xl:text-sm text-lg font-medium w-max text-[#1e96fc] cursor-pointer"
                        >
                          Add Tag
                        </button>
                      {/if}

                      {#if showSuggestListTag}
                        <button
                          class="xl:text-sm text-lg font-medium w-max text-red-500 cursor-pointer"
                          on:click={() => {
                            showSuggestListTag = false;
                            query = "";
                            selectedTokenList = [];
                            filteredListTag = listTag;
                          }}
                        >
                          Cancel
                        </button>
                      {/if}
                    </div>

                    {#if showSuggestListTag}
                      <div class="relative w-full">
                        <div
                          class="absolute top-0 left-0 flex flex-col gap-1 border-b border-x-[1px] w-full bg-white text-[#5E656B] rounded-b-lg py-2 px-3 z-50"
                        >
                          <div class="xl:text-xs text-base">
                            Select an option or create one
                          </div>
                          <div class="flex flex-col gap-2">
                            {#each filteredListTag as item}
                              <div
                                class="xl:text-sm text-lg px-2 py-1 rounded-lg hover:bg-[#F0F2F7] cursor-pointer flex justify-between"
                                class:bg-[#F0F2F7]={editTag && editTag === item}
                              >
                                {#if editTag && editTag === item}
                                  <div class="flex justify-between w-full">
                                    <div class="flex-1">
                                      <input
                                        type="text"
                                        placeholder="Your category name"
                                        class={`bg-[#F0F2F7] p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal text-[#5E656B] placeholder-[#5E656B] w-full`}
                                        bind:value={tag}
                                        on:keyup={({ target: { value } }) =>
                                          (tag = value)}
                                      />
                                    </div>
                                    <div class="flex items-center gap-2">
                                      <div
                                        class="xl:text-sm text-base font-medium w-max text-[#1e96fc] cursor-pointer"
                                        on:click={handleEditTag}
                                      >
                                        Save
                                      </div>
                                      <div
                                        class="xl:text-sm text-base font-medium w-max text-red-500 cursor-pointer"
                                        on:click={() => {
                                          editTag = "";
                                          tag = "";
                                        }}
                                      >
                                        Cancel
                                      </div>
                                    </div>
                                  </div>
                                {:else}
                                  <div
                                    class="w-full"
                                    on:click={() => {
                                      showSuggestListTag = false;
                                      query = item;
                                    }}
                                  >
                                    {item}
                                  </div>
                                  <div
                                    class="flex justify-center items-center px-2 hover:bg-gray-200 rounded"
                                    on:click={() => {
                                      editTag = item;
                                      tag = item;
                                    }}
                                  >
                                    <img src={Edit} alt="" />
                                  </div>
                                {/if}
                              </div>
                            {/each}

                            {#if filteredListTag.length === 0}
                              <div
                                class="flex items-center gap-2 xl:text-sm text-lg"
                              >
                                <div
                                  class="cursor-pointer text-[#1e96fc]"
                                  on:click={() => {
                                    listTag = [...listTag, query];
                                    showSuggestListTag = false;
                                  }}
                                >
                                  Create
                                </div>
                                <div
                                  class="py-1 px-2 rounded-lg hover:bg-[#F0F2F7] flex-1"
                                >
                                  {query}
                                </div>
                              </div>
                            {/if}
                          </div>
                        </div>
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="w-max">
                    <Button
                      variant="tertiary"
                      on:click={() => {
                        showSetTag = true;
                      }}
                    >
                      <div class="xl:text-base text-2xl font-medium text-white">
                        Set Tag
                      </div>
                    </Button>
                  </div>
                {/if}
              {:else}
                <div class="w-10 h-10" />
              {/if}
              <div class="xl:text-3xl text-4xl font-semibold text-right">
                $<TooltipNumber number={sumTokens} type="balance" />
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
                    <th class="py-3 pr-3">
                      <div
                        class="text-right xl:text-xs text-base uppercase font-semibold text-black"
                      >
                        Tag
                      </div>
                    </th>
                  </tr>
                </thead>
                {#if isLoadingToken}
                  <tbody>
                    <tr>
                      <td colspan={7}>
                        <div class="flex justify-center items-center py-3 px-3">
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
                      {#each formatDataTokenHolding as data}
                        <tr class="group transition-all">
                          <td
                            class="py-3 w-10 group-hover:bg-gray-100 xl:static xl:bg-transparent sticky left-0 z-10 bg-white"
                          >
                            <div class="flex justify-center">
                              <input
                                type="checkbox"
                                value={data.chain + "-" + data.contractAddress}
                                bind:group={selectedTokenList}
                                class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
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
                                      selectedHover = data.name;
                                      isShowTooltipName = true;
                                    }
                                  }}
                                  on:mouseleave={() => {
                                    if (data?.name?.length > 20) {
                                      selectedHover = "";
                                      isShowTooltipName = false;
                                    }
                                  }}
                                >
                                  {#if data.name === undefined}
                                    N/A
                                  {:else}
                                    {data?.name?.length > 20
                                      ? shorterName(data.name, 20)
                                      : data.name}
                                  {/if}
                                  {#if isShowTooltipName && selectedHover === data?.name && data?.name?.length > 20}
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
                                      selectedHover = data.symbol;
                                      isShowTooltipSymbol = true;
                                    }
                                  }}
                                  on:mouseleave={() => {
                                    if (data?.symbol?.length > 20) {
                                      selectedHover = "";
                                      isShowTooltipSymbol = false;
                                    }
                                  }}
                                >
                                  {#if data.symbol === undefined}
                                    N/A
                                  {:else}
                                    {shorterName(data.symbol, 20)}
                                  {/if}
                                  {#if isShowTooltipSymbol && selectedHover === data?.symbol && data?.symbol?.length > 20}
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

                          <td class="py-3 pr-3 group-hover:bg-gray-100">
                            <div class="flex justify-end">
                              <div
                                class="bg-[#6AC7F533] text-[#27326F] xl:text-sm text-xl w-max px-3 py-1 rounded-[5px]"
                              >
                                {data.tag}
                              </div>
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
