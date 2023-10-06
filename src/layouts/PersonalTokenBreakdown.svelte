<script lang="ts">
  import { onMount } from "svelte";
  import { Link } from "svelte-navigator";
  import { sendMessage } from "webext-bridge";
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";
  import { detectedChain, shorterName } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { groupBy, flatten, omit } from "lodash";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { Toast, Progressbar } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { isDarkMode, typeWallet, wallet, chain } from "~/store";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import type { TokenData, HoldingTokenRes } from "~/types/HoldingTokenData";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Copy from "~/components/Copy.svelte";
  import Button from "~/components/Button.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TokenHoldingTable from "~/UI/PersonalTokenBreakdown/TokenHoldingTable.svelte";
  import Loading from "~/components/Loading.svelte";
  import "~/components/Tooltip.custom.svelte";

  import LeftArrow from "~/assets/left-arrow.svg";
  import Edit from "~/assets/edit.svg";
  import Plus from "~/assets/plus.svg";
  import PlusBlack from "~/assets/plus-black.svg";

  const MultipleLang = {
    assets: i18n("newtabPage.assets", "Assets"),
    price: i18n("newtabPage.price", "Price"),
    amount: i18n("newtabPage.amount", "Amount"),
    value: i18n("newtabPage.value", "Value"),
    hide: i18n("newtabPage.hide-less-than-1", "Hide tokens less than $1"),
    empty: i18n("newtabPage.empty", "Empty"),
  };

  const queryClient = useQueryClient();

  let selectedWallet: string = "";
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let holdingTokenData: TokenData = [];
  let marketPriceToken;
  let formatData = [];
  let sumTokens = 0;
  let tableTokenHeader;
  let isStickyTableToken = false;
  let isShowTooltipName = false;
  let isShowTooltipSymbol = false;
  let selectedHover = "";
  let showSetTag = false;
  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  let scrollContainer;
  let isScrollStart = true;
  let isScrollEnd = false;
  let container;

  let isOpenConfirmDelete = false;
  let isLoadingDelete = false;

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
    isScrollStart = scrollLeft === 0;
    isScrollEnd = scrollLeft + clientWidth >= scrollWidth - 1;
  };

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  let formData = {
    category: "",
    tag: {
      name: "",
      tokens: [],
    },
  };
  let selectedTokenList = [];
  let listTag = ["Other"];
  let query = "";
  let showSuggestListTag = false;

  let listCustom = [];
  let selectedCustom = {};
  let isAddCustom = false;

  let editTag = "";
  let tag = "";
  let showDisableAddBtn = false;

  let searchValue = "";
  let sortTag = "default";

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let chainParams = urlParams.get("chain");
    let addressParams = urlParams.get("address");

    if (chainParams && addressParams) {
      selectedWallet = addressParams;
      selectedChain = chainParams;
    }

    const handleScroll = () => {
      const clientRectTokenHeader = tableTokenHeader?.getBoundingClientRect();
      isStickyTableToken = clientRectTokenHeader?.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  const getPersonalizeTag = async (address) => {
    const response = await nimbus
      .get(`/address/${address}/personalize/tag`)
      .then((response) => response.data);
    return response;
  };

  const formatDataTag = (data) => {
    const categoriesData = Object.getOwnPropertyNames(data);
    const categoriesDataList = categoriesData.map((item) => {
      return {
        category: item,
        dataTag: groupBy(data[item], "tag"),
      };
    });
    const formatDataCategory = categoriesDataList.map((item) => {
      return {
        category: item.category,
        dataTag: Object.getOwnPropertyNames(item.dataTag).map((tag) => {
          return {
            name: tag,
            tokens: item.dataTag[tag],
          };
        }),
      };
    });

    if (formatDataCategory.length !== 0) {
      listCustom = formatDataCategory;

      if (listCustom.length === 1) {
        selectedCustom = listCustom[0];
        handleSelectCategory(listCustom[0]);
      }
      if (listCustom.length > 1) {
        if (
          selectedCustom &&
          selectedCustom !== null &&
          Object.keys(selectedCustom).length !== 0
        ) {
          const selected = listCustom.filter(
            (item) => item.category === selectedCustom.category
          );
          selectedCustom = selected[0];
          handleSelectCategory(selected[0]);
        } else {
          selectedCustom = listCustom[listCustom.length - 1];
          handleSelectCategory(listCustom[listCustom.length - 1]);
        }
      }
    }
  };

  const getHoldingToken = async (address, chain) => {
    const response: HoldingTokenRes = await nimbus
      .get(`/v2/address/${address}/holding?chain=${chain}`)
      .then((response) => response.data);
    return response;
  };

  const formatDataHoldingToken = (data) => {
    const formatData = data.map((item) => {
      return {
        ...item,
        tag: "Other",
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
  };

  const onSubmit = async () => {
    formData = {
      ...formData,
      tag: {
        name: query,
        tokens: selectedTokenList,
      },
    };

    try {
      const response = await nimbus.post(
        `/address/${selectedWallet}/personalize/tag`,
        {
          category: formData.category,
          tagName: formData.tag.name,
          data: formData.tag.tokens,
        }
      );
      if (response) {
        handleUpdateTable();
        query = "";
        showSetTag = false;
        showSuggestListTag = false;
        selectedTokenList = [];
        isAddCustom = false;
        queryClient.invalidateQueries(["personalize-tag"]);

        toastMsg = "Successfully add tag to your custom category!";
        isSuccessToast = true;
        trigger();
      }
    } catch (e) {
      console.error("e: ", e);
      toastMsg =
        "Something wrong when add tag to your custom category. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };

  const updatePersonalizeTag = async (
    address: string,
    category: string,
    tagName: string,
    oldTag: string
  ) => {
    try {
      let body = {
        category: category,
        oldTag: oldTag,
        tagName: tagName,
      };

      if (oldTag.length === 0 && tagName.length === 0) {
        body = omit(body, ["oldTag", "tagName"]);
      }

      const response = await nimbus.put(
        `/address/${address}/personalize/tag?category=${selectedCustom.category}`,
        body
      );

      editTag = "";
      queryClient.invalidateQueries(["personalize-tag"]);

      if (!body.hasOwnProperty("tagName")) {
        selectedCustom = {
          ...selectedCustom,
          category: body.category,
        };
      }

      toastMsg = `Successfully edit your ${
        body.hasOwnProperty("tagName") ? "tag name" : "category name"
      }!`;
      isSuccessToast = true;
      trigger();
    } catch (e) {
      console.error("e: ", e);
      toastMsg =
        "Something wrong when edit your custom category. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };

  const handleResetState = () => {
    selectedCustom = {};
    listTag = ["Other"];
    formData = {
      category: "",
      tag: {
        name: "",
        tokens: [],
      },
    };
    formatData = formatData.map((item) => {
      return {
        ...item,
        tag: "Other",
      };
    });
  };

  const handleUpdateTable = () => {
    const formatSelectedTokenList = selectedTokenList.map((item) => {
      const indexOfDash = item.indexOf("-");
      return indexOfDash >= 0 ? item.slice(indexOfDash + 1) : item;
    });

    formatData = formatData.map((item) => {
      const isSelected = formatSelectedTokenList.some(
        (selectedToken) => selectedToken === item.contractAddress
      );

      return {
        ...item,
        tag: isSelected ? query : item.tag,
      };
    });
  };

  const deleteCustomCategory = async () => {
    isLoadingDelete = true;
    try {
      const response = await nimbus.delete(
        `/address/${selectedWallet}/personalize/tag?category=${selectedCustom.category}`,
        {}
      );

      isAddCustom = false;
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
      listCustom = [];
      selectedTokenList = [];
      handleResetState();
      queryClient.invalidateQueries(["personalize-tag"]);

      toastMsg = "Successfully delete your custom category!";
      isSuccessToast = true;
      trigger();
    } catch (e) {
      console.error("e:", e);
      toastMsg =
        "Something wrong when delete your custom category. Please try again!";
      isSuccessToast = false;
      trigger();
      isLoadingDelete = false;
      isOpenConfirmDelete = false;
    }
  };

  // query token holding
  $: queryTokenHolding = createQuery({
    queryKey: ["holding-token", selectedWallet, selectedChain],
    enabled: !!selectedWallet,
    queryFn: () => getHoldingToken(selectedWallet, selectedChain),
    staleTime: Infinity,
  });

  $: {
    if (!$queryTokenHolding.isError && $queryTokenHolding.data !== undefined) {
      formatDataHoldingToken($queryTokenHolding.data);
    }
  }

  // query tag
  $: queryTag = createQuery({
    queryKey: ["personalize-tag", selectedWallet],
    enabled: !!selectedWallet,
    queryFn: () => getPersonalizeTag(selectedWallet),
    staleTime: Infinity,
  });

  $: {
    if (!$queryTag.isError && $queryTag.data !== undefined) {
      formatDataTag($queryTag.data);
    }
  }

  $: {
    if (holdingTokenData) {
      holdingTokenData
        ?.filter((item) => item?.cmc_id)
        ?.map((item: any) => {
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

  $: {
    if (marketPriceToken) {
      formatData = formatData.map((item) => {
        if (marketPriceToken.id === item.cmc_id) {
          return {
            ...item,
            market_price: marketPriceToken.market_price,
          };
        }
        return { ...item };
      });
      sumTokens = formatData.reduce((prev, item: any) => prev + item.value, 0);
    }
  }

  const handleSelectCategory = (data) => {
    formData = {
      ...formData,
      category: data?.category,
    };

    listTag = [
      "Other",
      ...data?.dataTag
        ?.filter((item) => item.name !== "Other")
        .map((item) => item.name),
    ];

    formatData = formatData.map((item) => {
      const isSelected = flatten(data?.dataTag?.map((item) => item.tokens))
        .filter((item) => item.name !== "Other")
        .some(
          (selectedToken) =>
            selectedToken.contractAddress === item.contractAddress &&
            selectedToken.chain === item.chain
        );

      return {
        ...item,
        tag: isSelected
          ? flatten(data?.dataTag?.map((item) => item.tokens)).filter(
              (selectedToken) =>
                selectedToken.contractAddress === item.contractAddress &&
                selectedToken.chain === item.chain
            )[0].tag
          : "Other",
      };
    });
  };

  $: filteredListTag = listTag;

  $: {
    if (selectedTokenList.length === 0) {
      showSetTag = false;
    }
  }

  $: searchDataResult = searchValue
    ? formatData.filter(
        (item) =>
          item.name.toLowerCase() === searchValue.toLowerCase() ||
          item.name.toLowerCase().includes(searchValue.toLowerCase())
      )
    : formatData;

  const toggleSortOrderTag = () => {
    switch (sortTag) {
      case "default":
        sortTag = "ascend";
        break;
      case "ascend":
        sortTag = "descend";
        break;
      case "descend":
        sortTag = "default";
        break;
      default:
        sortTag = "default";
    }

    if (sortTag === "ascend") {
      searchDataResult = searchDataResult.sort((a, b) =>
        a.tag.localeCompare(b.tag)
      );
    }
    if (sortTag === "descend") {
      searchDataResult = searchDataResult.sort((a, b) =>
        b.tag.localeCompare(a.tag)
      );
    }
    if (sortTag === "default") {
      searchDataResult = searchDataResult.sort((a, b) => {
        if (a.value < b.value) {
          return 1;
        }
        if (a.value > b.value) {
          return -1;
        }
        return 0;
      });
    }
  };
</script>

<ErrorBoundary>
  <div class="header header-container">
    <div class="flex flex-col max-w-[2000px] m-auto xl:w-[82%] w-[90%]">
      <div class="flex flex-col mb-5 gap-14">
        <div class="flex items-center justify-between">
          <Link to="/analytic" class="cusor-pointer">
            <div class="flex items-center gap-1 text-white">
              <img src={LeftArrow} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
              <div class="xl:text-sm text-2xl font-medium">
                Back to Analytics
              </div>
            </div>
          </Link>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-2 text-white">
              <div class="xl:text-5xl text-7xl font-medium">
                Custom Token Breakdown
              </div>
            </div>
            {#if selectedWallet && selectedWallet.length !== 0}
              <div class="text-base">
                <Copy address={selectedWallet} iconColor="#fff" color="#fff" />
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] -mt-26">
    <div
      class="custom_token_breakdown_container rounded-[20px] xl:p-8 p-6 xl:shadow-md"
    >
      <div
        class={`rounded-[20px] p-6 flex flex-col gap-4 bg-red-500 ${
          darkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"
        }`}
      >
        <div class="xl:text-2xl text-4xl font-medium">
          Custom Token Breakdown
        </div>

        {#if listCustom.length === 0}
          <div class="flex justify-between items-center gap-10">
            <div class="xl:text-lg text-2xl flex-1">
              Add your custom token breakdown to keep track of investments by
              your way.
            </div>
            <div class="w-max">
              <Button
                variant="tertiary"
                on:click={() => {
                  isAddCustom = true;
                  handleResetState();
                }}
              >
                <img src={Plus} alt="" width="12" height="12" />
                <div class="xl:text-base text-2xl font-medium text-white">
                  Add Category
                </div>
              </Button>
            </div>
          </div>
        {:else}
          <div class="flex justify-between gap-6">
            <div
              class="relative overflow-hidden w-full flex gap-3 justify-between items-center"
              bind:this={container}
            >
              <div
                class={`text-white absolute left-0 py-2 rounded-tl-lg rounded-bl-lg ${
                  isScrollStart ? "hidden" : "block"
                }`}
                style="background-image: linear-gradient(to right, rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100% );"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  height="24px"
                  width="24px"
                  viewBox="0 0 24 24"
                  class="sc-aef7b723-0 fKbUaI"
                  ><path
                    d="M15 6L9 12L15 18"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-miterlimit="10"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  /></svg
                >
              </div>
              <div
                class="w-max flex gap-3 overflow-x-auto whitespace-nowrap px-2"
                bind:this={scrollContainer}
                on:scroll={handleScroll}
              >
                <AnimateSharedLayout>
                  {#each listCustom as item (item.category)}
                    <div
                      id={item.category}
                      class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
                      on:click={() => {
                        showSuggestListTag = false;
                        query = "";
                        selectedTokenList = [];
                        filteredListTag = listTag;
                        selectedCustom = item;
                        handleSelectCategory(item);
                      }}
                    >
                      <div
                        class={`relative ${
                          selectedCustom === item && "text-white"
                        }`}
                        style="z-index: 2"
                      >
                        {item.category}
                      </div>
                      {#if item === selectedCustom}
                        <Motion
                          let:motion
                          layoutId="active-pill"
                          transition={{ type: "spring", duration: 0.6 }}
                        >
                          <div
                            class="absolute inset-0 rounded-full bg-[#1E96FC]"
                            style="z-index: 1"
                            use:motion
                          />
                        </Motion>
                      {/if}
                    </div>
                  {/each}
                </AnimateSharedLayout>
              </div>
              {#if scrollContainer?.scrollWidth >= container?.offsetWidth}
                <div
                  class={`text-white absolute right-0 py-2 rounded-tr-lg rounded-br-lg ${
                    isScrollEnd ? "hidden" : "block"
                  }`}
                  style="background-image: linear-gradient(to left,rgba(156, 163, 175, 0.5) 0%, rgba(255,255,255,0) 100%);"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    height="24px"
                    width="24px"
                    viewBox="0 0 24 24"
                    class="sc-aef7b723-0 fKbUaI"
                    ><path
                      d="M9 6L15 12L9 18"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-miterlimit="10"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    /></svg
                  >
                </div>
              {/if}
            </div>
            <div class="flex items-center gap-4 w-max">
              {#if selectedCustom && selectedCustom !== null && Object.keys(selectedCustom).length !== 0}
                <div
                  class="text-red-500 font-semibold cursor-pointer xl:text-base text-2xl"
                  on:click={() => {
                    isOpenConfirmDelete = true;
                  }}
                >
                  Delete
                </div>
              {/if}
              <div
                class="relative w-max"
                on:mouseenter={() => {
                  if (listCustom.length > 2) {
                    showDisableAddBtn = true;
                  }
                }}
                on:mouseleave={() => {
                  if (listCustom.length > 2) {
                    showDisableAddBtn = false;
                  }
                }}
              >
                <div class="w-max">
                  {#if listCustom.length > 2}
                    <Button variant="disabled" disabled>
                      <img
                        src={darkMode ? PlusBlack : Plus}
                        alt=""
                        width="12"
                        height="12"
                      />
                      <div
                        class={` font-medium ${
                          darkMode ? "text-gray-400" : "text-white"
                        }`}
                      >
                        Add Category
                      </div>
                    </Button>
                  {:else}
                    <Button
                      variant="tertiary"
                      on:click={() => {
                        isAddCustom = true;
                        handleResetState();
                      }}
                    >
                      <img src={Plus} alt="" width="12" height="12" />
                      <div class="font-medium text-white">Add Category</div>
                    </Button>
                  {/if}
                </div>
                {#if showDisableAddBtn}
                  <div
                    class="absolute transform -translate-x-1/2 -top-8 left-1/2 max"
                    style="z-index: 2147483648;"
                  >
                    <tooltip-detail text={"Maximum 3 custom categories"} />
                  </div>
                {/if}
              </div>
            </div>
          </div>
        {/if}

        {#if isAddCustom || (selectedCustom && selectedCustom !== null && Object.keys(selectedCustom).length !== 0)}
          <form on:submit|preventDefault={onSubmit} class="flex flex-col gap-6">
            <div
              class={`flex flex-col gap-1 input-2 w-full py-[6px] px-3 ${
                formData.category && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
              }`}
            >
              <div class="xl:text-base text-2xl text-[#666666] font-medium">
                Category
              </div>
              <input
                type="text"
                placeholder="Your category name"
                required
                class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                  formData.category && !darkMode
                    ? "bg-[#F0F2F7]"
                    : "bg-transparent"
                }`}
                bind:value={formData.category}
                on:blur={() => {
                  if (isAddCustom) {
                    return;
                  }
                  updatePersonalizeTag(
                    selectedWallet,
                    formData.category,
                    "",
                    ""
                  );
                }}
              />
            </div>

            <div class="flex flex-col gap-6">
              <div class="flex justify-between items-center gap-8">
                {#if selectedTokenList?.length !== 0}
                  {#if showSetTag}
                    <div class="w-[600px]">
                      <div
                        class={`flex justify-between gap-1 border bg-white focus:outline-none w-full py-[6px] px-3 rounded-t-lg ${
                          query && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
                        } ${
                          showSuggestListTag ? "rounded-none" : "rounded-b-lg"
                        }`}
                      >
                        <input
                          type="text"
                          placeholder="Your tag name"
                          class={`flex-1 p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                            query && !darkMode
                              ? "bg-[#F0F2F7]"
                              : "bg-transparent"
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
                            class="xl:text-sm text-2xl font-medium w-max text-[#1e96fc] cursor-pointer"
                          >
                            Add Tag
                          </button>
                        {/if}

                        {#if showSuggestListTag}
                          <button
                            class="xl:text-sm text-2xl font-medium w-max text-red-500 cursor-pointer"
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
                            class={`absolute top-0 left-0 flex flex-col gap-1 border-b border-x-[1px] w-full ${
                              darkMode ? "bg-[#212121]" : "bg-white"
                            } text-[#5E656B] rounded-b-lg py-2 px-3 z-50`}
                          >
                            <div class="xl:text-xs text-xl">
                              Select an option or create one
                            </div>
                            <div class="flex flex-col gap-2">
                              {#each filteredListTag as item}
                                <div
                                  class={`rounded-lg ${
                                    editTag && editTag === item
                                      ? darkMode
                                        ? "bg-[#00000033]"
                                        : "bg-[#F0F2F7]"
                                      : ""
                                  }`}
                                >
                                  <div
                                    class={`xl:text-sm text-2xl px-2 py-1 rounded-lg cursor-pointer flex justify-between ${
                                      darkMode
                                        ? "hover:bg-[#00000033]"
                                        : "hover:bg-[#F0F2F7]"
                                    }`}
                                  >
                                    {#if editTag && editTag === item}
                                      <div class="flex justify-between w-full">
                                        <div class="flex-1">
                                          <input
                                            type="text"
                                            placeholder="Your category name"
                                            class={`bg-transparent p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] w-full`}
                                            bind:value={tag}
                                            on:keyup={({ target: { value } }) =>
                                              (tag = value)}
                                          />
                                        </div>
                                        <div class="flex items-center gap-2">
                                          <div
                                            class="xl:text-sm text-base font-medium w-max text-[#1e96fc] cursor-pointer"
                                            on:click={() => {
                                              updatePersonalizeTag(
                                                selectedWallet,
                                                formData.category,
                                                tag,
                                                editTag
                                              );
                                            }}
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
                                        class={`flex justify-center items-center px-2 rounded ${
                                          darkMode
                                            ? "hover:bg-[#222222]"
                                            : "hover:bg-gray-200"
                                        }`}
                                        on:click={() => {
                                          editTag = item;
                                          tag = item;
                                        }}
                                      >
                                        <img src={Edit} alt="" />
                                      </div>
                                    {/if}
                                  </div>
                                </div>
                              {/each}

                              {#if filteredListTag.length === 0}
                                <div
                                  class="flex items-center gap-2 xl:text-sm text-2xl"
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
                                    class={`py-1 px-2 rounded-lg flex-1 ${
                                      darkMode
                                        ? "hover:bg-[#00000066]"
                                        : "hover:bg-[#F0F2F7]"
                                    }`}
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
                        <div class="text-white">Set Tag</div>
                      </Button>
                    </div>
                  {/if}
                {:else}
                  <div class="w-10" />
                {/if}
                <div class="w-max">
                  <div
                    class={`border focus:outline-none w-full py-[6px] px-3 rounded-lg ${
                      searchValue && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
                    }`}
                  >
                    <input
                      bind:value={searchValue}
                      placeholder={"Find by token name"}
                      type="text"
                      class={`w-full p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
                        searchValue && !darkMode
                          ? "bg-[#F0F2F7]"
                          : "bg-transparent"
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div
                class={`${
                  $queryTokenHolding.isFetching ||
                  searchDataResult?.length === 0
                    ? "h-[800px]"
                    : ""
                }`}
              >
                <div
                  class={`rounded-[10px] xl:overflow-hidden overflow-x-auto h-full ${
                    darkMode
                      ? "bg-[#131313]"
                      : "bg-[#fff] border border_0000000d"
                  }`}
                >
                  <table class="table-auto xl:w-full w-[1400px] h-full">
                    <thead
                      class={isStickyTableToken ? "sticky top-0 z-10" : ""}
                      bind:this={tableTokenHeader}
                    >
                      <tr class="bg_f4f5f8">
                        <th
                          class="py-3 w-10 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8"
                        />
                        <th
                          class="py-3 xl:static xl:bg-transparent sticky left-10 z-10 bg_f4f5f8 xl:w-[230px] w-[280px]"
                        >
                          <div
                            class="text-left xl:text-xs text-xl uppercase font-medium"
                          >
                            {MultipleLang.assets}
                          </div>
                        </th>
                        <th class="py-3">
                          <div
                            class="text-right xl:text-xs text-xl uppercase font-medium"
                          >
                            {MultipleLang.price}
                          </div>
                        </th>
                        <th class="py-3">
                          <div
                            class="text-right xl:text-xs text-xl uppercase font-medium"
                          >
                            {MultipleLang.amount}
                          </div>
                        </th>
                        <th class="py-3">
                          <div
                            class="text-right xl:text-xs text-xl uppercase font-medium"
                          >
                            {MultipleLang.value}
                          </div>
                        </th>
                        <th class="py-3">
                          <div
                            class="text-right xl:text-xs text-xl uppercase font-medium"
                          >
                            <TooltipTitle
                              tooltipText="Ratio based on total token holding"
                            >
                              Ratio
                            </TooltipTitle>
                          </div>
                        </th>
                        <th class="py-3 pr-3 rounded-tr-[10px]">
                          <div
                            class="text-right xl:text-xs text-xl uppercase font-medium flex items-center justify-end gap-2"
                          >
                            Tag
                            <div
                              on:click={toggleSortOrderTag}
                              class="cursor-pointer"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="1.2em"
                                viewBox="0 0 320 512"
                                fill={darkMode ? "#fff" : "#000"}
                                ><path
                                  d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"
                                /></svg
                              >
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    {#if $queryTokenHolding.isFetching}
                      <tbody>
                        <tr>
                          <td colspan={7}>
                            <div
                              class="flex justify-center items-center h-full py-3 px-3"
                            >
                              <Loading />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    {:else}
                      <tbody>
                        {#if searchDataResult && searchDataResult.length === 0}
                          <tr>
                            <td colspan={7}>
                              <div
                                class="flex justify-center items-center h-full py-3 px-3 xl:text-lg text-xl text-gray-400"
                              >
                                {MultipleLang.empty}
                              </div>
                            </td>
                          </tr>
                        {:else}
                          {#each searchDataResult as data}
                            <tr class="group transition-all">
                              <td
                                class={`py-3 w-10 xl:static xl:bg-transparent sticky left-0 z-9 ${
                                  darkMode
                                    ? "bg-[#131313] group-hover:bg-[#000]"
                                    : "bg-white group-hover:bg-gray-100"
                                }`}
                              >
                                <div class="flex justify-center">
                                  <input
                                    type="checkbox"
                                    value={data.chain +
                                      "-" +
                                      data.contractAddress}
                                    bind:group={selectedTokenList}
                                    class="cursor-pointer relative xl:w-4 xl:h-4 w-6 h-6 appearance-none rounded-[0.25rem] border outline-none before:pointer-events-none before:absolute before:h-[0.875rem] before:w-[0.875rem] before:scale-0 before:rounded-full before:bg-transparent before:opacity-0 before:shadow-[0px_0px_0px_13px_transparent] before:content-[''] checked:border-primary checked:bg-primary checked:before:opacity-[0.16] checked:after:absolute checked:after:-mt-px checked:after:ml-[0.25rem] checked:after:block checked:after:h-[0.8125rem] checked:after:w-[0.375rem] checked:after:rotate-45 checked:after:border-[0.125rem] checked:after:border-l-0 checked:after:border-t-0 checked:after:border-solid checked:after:border-white checked:after:bg-transparent checked:after:content-[''] hover:cursor-pointer hover:before:opacity-[0.04] hover:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:shadow-none focus:transition-[border-color_0.2s] focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[0px_0px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-[0.875rem] focus:after:w-[0.875rem] focus:after:rounded-[0.125rem] focus:after:content-[''] checked:focus:before:scale-100 checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] checked:focus:after:-mt-px checked:focus:after:ml-[0.25rem] checked:focus:after:h-[0.8125rem] checked:focus:after:w-[0.375rem] checked:focus:after:rotate-45 checked:focus:after:rounded-none checked:focus:after:border-[0.125rem] checked:focus:after:border-l-0 checked:focus:after:border-t-0 checked:focus:after:border-solid checked:focus:after:border-white checked:focus:after:bg-transparent dark:border-neutral-600 dark:checked:border-primary dark:checked:bg-primary dark:focus:before:shadow-[0px_0px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[0px_0px_0px_13px_#3b71ca]"
                                  />
                                </div>
                              </td>

                              <td
                                class={`py-3 xl:static xl:bg-transparent sticky left-10 z-9 xl:w-[230px] w-[280px] ${
                                  darkMode
                                    ? "bg-[#131313] group-hover:bg-[#000]"
                                    : "bg-white group-hover:bg-gray-100"
                                }`}
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
                                    {#if typeWalletAddress === "EVM"}
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
                                      class="xl:text-sm text-2xl font-medium relative"
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
                                      class="text_00000080 xl:text-xs text-lg font-medium relative"
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
                                </div>
                              </td>

                              <td
                                class={`py-3 ${
                                  darkMode
                                    ? "group-hover:bg-[#000]"
                                    : "group-hover:bg-gray-100"
                                }`}
                              >
                                <div
                                  class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end"
                                >
                                  $<TooltipNumber
                                    number={data.market_price}
                                    type="balance"
                                  />
                                </div>
                              </td>

                              <td
                                class={`py-3 ${
                                  darkMode
                                    ? "group-hover:bg-[#000]"
                                    : "group-hover:bg-gray-100"
                                }`}
                              >
                                <div
                                  class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end"
                                >
                                  <TooltipNumber
                                    number={data.amount}
                                    type="balance"
                                  />
                                </div>
                              </td>

                              <td
                                class={`py-3 ${
                                  darkMode
                                    ? "group-hover:bg-[#000]"
                                    : "group-hover:bg-gray-100"
                                }`}
                              >
                                <div
                                  class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end"
                                >
                                  <TooltipNumber
                                    number={data?.amount * data?.market_price}
                                    type="value"
                                  />
                                </div>
                              </td>

                              <td
                                class={`py-3 ${
                                  darkMode
                                    ? "group-hover:bg-[#000]"
                                    : "group-hover:bg-gray-100"
                                }`}
                              >
                                <div
                                  class="flex flex-col gap-1 justify-end items-end"
                                >
                                  <div
                                    class="xl:text-sm text-2xl text_00000099 font-medium flex justify-end"
                                  >
                                    <TooltipNumber
                                      number={((data?.amount *
                                        data?.market_price) /
                                        sumTokens) *
                                        100}
                                      type="percent"
                                    />%
                                  </div>
                                  <div class="w-3/4 max-w-20">
                                    <Progressbar
                                      progress={Number(
                                        ((data?.amount * data?.market_price) /
                                          sumTokens) *
                                          100
                                      )}
                                      size="h-1"
                                    />
                                  </div>
                                </div>
                              </td>

                              <td
                                class={`pr-3 py-3 ${
                                  darkMode
                                    ? "group-hover:bg-[#000]"
                                    : "group-hover:bg-gray-100"
                                }`}
                              >
                                <div class="flex justify-end">
                                  <div
                                    class="bg-[#6AC7F533] text_27326F xl:text-sm text-2xl w-max px-3 py-1 rounded-[5px]"
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
            </div>
          </form>
        {:else}
          <TokenHoldingTable
            {toggleSortOrderTag}
            isLoadingToken={$queryTokenHolding.isFetching}
            {searchDataResult}
            {selectedWallet}
            {sumTokens}
          />
        {/if}
      </div>
    </div>
  </div>
</ErrorBoundary>

<!-- Modal confirm delete custom token breakdown -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenConfirmDelete}
  on:close={() => (isOpenConfirmDelete = false)}
>
  <div class="flex flex-col xl:gap-4 gap-10">
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">Are you sure?</div>
      <div class="xl:text-sm text-2xl text-gray-500">
        Do you really want to delete this custom token breakdown? This process
        cannot revert
      </div>
    </div>
    <div class="flex justify-end lg:gap-2 gap-6">
      <div class="lg:w-[120px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenConfirmDelete = false;
          }}
        >
          Cancel
        </Button>
      </div>
      <div class="lg:w-[120px] w-full">
        <Button
          variant="delete"
          isLoading={isLoadingDelete}
          on:click={() => {
            deleteCustomCategory();
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-10">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            s
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style>
  .header {
    background-repeat: no-repeat;
    background-size: auto;
    background-position: top right;
    padding-bottom: 144px;
    padding-top: 24px;
  }

  :global(body) .header-container {
    background-color: #27326f;
    background-image: url("~/assets/capa.svg");
  }
  :global(body.dark) .header-container {
    background-color: #080808;
    background-image: url("~/assets/capa-dark.svg");
  }

  :global(body) .custom_token_breakdown_container {
    background: #fff;
    box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.1);
  }
  :global(body.dark) .custom_token_breakdown_container {
    background: #0f0f0f;
    box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 1);
  }

  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
  }
</style>
