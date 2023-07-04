<svelte:options tag="quick-search" />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { escapeRegex, getLocalImg, flattenArray } from "~/utils";
  import UrlPattern from "url-pattern";
  import { sendMessage } from "webext-bridge";
  import * as browser from "webextension-polyfill";
  import Mousetrap from "mousetrap";
  import addGlobalBinds from "bind-mousetrap-global";
  addGlobalBinds(Mousetrap);
  import System from "svelte-system-info";
  import { i18n } from "~/lib/i18n";
  import { track } from "~/lib/data-tracking";
  import { shorterAddress } from "~/utils";
  import mixpanel from "mixpanel-browser";

  import "./AddressInfo.custom.svelte";
  import "./TrxInfo.custom.svelte";
  import "./NativeTokenInfo.custom.svelte";
  import "~/components/ResetStyle.custom.svelte";
  import "~/components/CheckSafetyDApp.custom.svelte";
  import "~/components/TermInfo.custom.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";

  import Logo from "~/assets/logo-white.svg";
  import Close from "../../../assets/close.svg";
  import Line from "../../../assets/line.svg";
  import Coin from "../../../assets/coin.svg";

  const MultipleLang = {
    title: i18n(
      "quickSearchLang.title",
      "Search for cryptocurrency or token you want to know"
    ),
    suggest_keyword: i18n(
      "quickSearchLang.suggest-keyword",
      "Suggest keyword:"
    ),
    recent_search: i18n("quickSearchLang.recent-search", "Recent search:"),
    second_title: i18n("quickSearchLang.second-title", "On this page"),
    input_placeholder: i18n("quickSearchLang.input-placeholder", "Search..."),
    status: i18n("quickSearchLang.status", "Searching..."),
    results: i18n("quickSearchLang.results", "Results"),
    empty: i18n("quickSearchLang.no-results", "No results"),
    sources: i18n(
      "quickSearchLang.source-data-charts",
      "*Chart data by CoinGecko"
    ),
    read_more: i18n("quickSearchLang.read-more", "Read more"),
  };

  const defaultSuggestList = ["bitcoin", "ethereum", "bnb"];

  let listPageConfig = [];
  let listTermData;
  let coinListData;
  let regexToken;
  let regexTerm;
  let dataTokenDetectResult = [];
  let termDetectResult = [];
  let data = [];
  let termSearchResult = [];
  let dataTokenSearchResult = [];
  let isChangeURL = false;
  let isShowSideBar = false;
  let search = "";
  let isFocused = false;
  let currentUrl = window.location.href;
  let timer;
  let isLoading = false;
  let tabSelected: "all" | "term" | "token" = "all";
  let suggestList = ["bitcoin", "ethereum", "bnb"];
  let DraggableY = 140;
  let moving = false;
  let startTime = null;
  let endTime = null;
  let timeHold = 0;

  const getDraggableY = async () => {
    const draggableYRes = (await browser.storage.local.get("DraggableY"))
      .DraggableY;
    if (draggableYRes) {
      DraggableY = draggableYRes;
    }
  };

  const getTabSelected = async () => {
    const tabSelectedRes = (await browser.storage.local.get("TabSelected"))
      .TabSelected;
    if (tabSelectedRes) {
      tabSelected = tabSelectedRes;
    }
  };

  const getSuggestList = async () => {
    const suggestListRes = (await browser.storage.local.get("SuggestList"))
      .SuggestList;
    if (suggestListRes) {
      suggestList = JSON.parse(suggestListRes);
    }
  };

  const getConfigPages = async () => {
    listPageConfig = (await sendMessage("configPageList", undefined)) as any[];
  };

  const getCoinList = async () => {
    const res = (await sendMessage("coinList", { limit: 500 })) as any[];
    coinListData = res;

    const nameAndSymbolList = [...res.map((item) => item.symbol.toUpperCase())];

    regexToken = new RegExp(
      `\\b(${nameAndSymbolList
        .slice(0, 500)
        .map(function (w) {
          return escapeRegex(w);
        })
        .join("|")})\\b`,
      "g"
    );
  };

  const getTermList = async () => {
    const res = (await sendMessage("getListTerm", undefined)) as any[];
    listTermData = res;

    const listTermName = res.map((item) => item.term);

    regexTerm = new RegExp(
      `\\b(${listTermName
        .map(function (w) {
          return escapeRegex(w);
        })
        .join("|")})\\b`,
      "g"
    );
  };

  const handleDetectRegex = (regex) => {
    let innerTextMatchContext = [];

    const selectedPageFromCurrentUrl = listPageConfig.find((item) => {
      return location.hostname === item.hostname;
    });

    if (!selectedPageFromCurrentUrl) {
      // Fallback as article tag on any page
      const context = document.querySelector("article");
      if (context) {
        innerTextMatchContext = context.innerText.match(regex);
      }
    }

    selectedPageFromCurrentUrl?.urlPattern.map((item) => {
      const patternUrlPath = new UrlPattern(item.path);
      const detectUrlPath = patternUrlPath.match(location.pathname);
      // if (detectUrlPath === null) return;
      return item.selector.forEach((selectDOM) => {
        const context = selectDOM && document.querySelector(selectDOM);
        innerTextMatchContext = context && context.innerText.match(regex);
      });
    });

    return innerTextMatchContext;
  };

  const handleGetTermFromPage = () => {
    const innerTextMatch = handleDetectRegex(regexTerm);
    termDetectResult =
      innerTextMatch && innerTextMatch.length > 0
        ? [
            ...new Set(
              innerTextMatch.map((item) => {
                return listTermData.find((data) => data.term === item);
              })
            ),
          ]
        : [];
  };

  const handleGetCoinDataFromPage = () => {
    const innerTextMatch = handleDetectRegex(regexToken);
    dataTokenDetectResult =
      innerTextMatch && innerTextMatch.length > 0
        ? [
            ...new Set(
              innerTextMatch.map((item) => {
                return coinListData.find(
                  (data) => data.symbol === item || data.name === item
                );
              })
            ),
          ]
        : [];
  };

  const generateListConfig = (keyword: string) => {
    return [
      { type: "term", keyword },
      { type: "token", keyword },
      {
        type: "address",
        keyword,
        regex: {
          eth: /^0x([a-fA-F0-9]{40})$/,
        },
      },
      {
        type: "tx",
        keyword,
        regex: {
          eth: /^0x([A-Fa-f0-9]{64})$/,
        },
      },
    ];
  };

  const getSearchResult = async (keyword: string) => {
    mixpanel.track("user_search_sidebar");
    const configSearch = generateListConfig(keyword);
    const searchResultByType = await Promise.all(
      configSearch.map(async (item) => {
        if (item.type === "term") {
          return listTermData
            .filter((item) => item.term.toLowerCase().includes(keyword))
            .slice(0, 3)
            .map((row) => ({ ...row, type: item.type }));
        }

        if (item.type === "token") {
          isLoading = true;
          const data = (await sendMessage("getSearchData", {
            search: keyword,
          })) as any[];
          if (data) {
            isLoading = false;
            return data.map((row) => ({ ...row, type: item.type }));
          }
          return [];
        }

        if (item.type === "address") {
          if (keyword.match(item.regex.eth)) {
            return [{ type: item.type, keyword }];
          } else {
            return [];
          }
        }

        if (item.type === "tx") {
          if (keyword.match(item.regex.eth)) {
            return [{ type: item.type, keyword }];
          } else {
            return [];
          }
        }
      })
    );
    data = flattenArray(searchResultByType);
  };

  const observer = new MutationObserver((e) => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      handleGetCoinDataFromPage();
      handleGetTermFromPage();
      setTimeout(() => {
        handleGetCoinDataFromPage();
        handleGetTermFromPage();
      }, 3000);
    }
  });
  observer.observe(document, { subtree: true, childList: true });

  onMount(() => {
    getConfigPages();
    getCoinList();
    getTermList();
    getSuggestList();
    getTabSelected();
    getDraggableY();
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  const debounceSearchInput = (value: string) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      search = value;
    }, 300);
  };

  const handleSetSearch = (value: string) => {
    search = value;
  };

  $: {
    if (search && !suggestList.includes(search)) {
      if (JSON.stringify(suggestList) === JSON.stringify(defaultSuggestList)) {
        suggestList = [search];
      } else {
        if (suggestList.length < 3) {
          suggestList = [...suggestList, search];
        } else {
          suggestList = [...suggestList.slice(1), search];
        }
      }
    }
  }

  $: {
    if (
      JSON.stringify(suggestList) !== JSON.stringify(defaultSuggestList) &&
      search &&
      isFocused === false
    ) {
      browser.storage.local.set({ SuggestList: JSON.stringify(suggestList) });
    }
  }

  $: {
    if (DraggableY >= 0 && DraggableY <= window.innerHeight - 50) {
      setTimeout(() => {
        browser.storage.local.set({ DraggableY: DraggableY });
      }, 200);
    }
  }

  $: {
    if (listPageConfig && coinListData) {
      handleGetCoinDataFromPage();
    }
  }

  $: {
    if (listPageConfig && listTermData) {
      handleGetTermFromPage();
    }
  }

  $: loaded = search && isFocused === false;

  $: {
    if (!isShowSideBar) {
      isFocused = false;
    } else {
      isFocused = true;
    }
  }

  $: {
    if (isShowSideBar) {
      track("Sidebar status", {
        url: window.location.href,
        isShowSideBar,
      });
    }
  }

  browser.runtime.onMessage.addListener(function (msg) {
    if (msg.action && msg.action == "toggleSidebar") {
      isShowSideBar = !isShowSideBar;
    }
  });

  Mousetrap.bindGlobal(["command+shift+k", "ctrl+shift+k"], function () {
    isShowSideBar = !isShowSideBar;
  });

  $: {
    if (startTime && endTime) {
      let timeDiff = endTime - startTime;
      timeDiff /= 1;
      timeHold = Math.round(timeDiff % 100000000);
    }
  }

  $: {
    if (timeHold > 50) {
      moving = true;
    }
  }

  $: {
    if (search) {
      getSearchResult(search);
    } else {
      data = [];
      termSearchResult = [];
      dataTokenSearchResult = [];
    }
  }

  $: {
    if (data.length && (data[0].type !== "address" || data[0].type !== "tx")) {
      termSearchResult = data.filter((item) => item.type === "term");
      dataTokenSearchResult = data.filter((item) => item.type === "token");
    }
  }
</script>

<reset-style>
  <Mixpanel>
    <div
      style="z-index: 9998; top:{DraggableY}px;"
      class="transform translate-x-[80%] transition-transform ease-in-out fixed right-0 pr-2 pl-1 h-10 bg-[#27326f] opacity-80 text-white rounded-tl-[5px] rounded-bl-[5px] cursor-pointer flex items-center gap-1 shadow-lg"
      class:hover:translate-x-0={!isShowSideBar}
      on:mousedown={() => {
        startTime = new Date();
      }}
      on:mouseup={() => {
        moving = false;
        if (timeHold < 50) {
          isShowSideBar = true;
          mixpanel.track("user_interactive_sidebar");
        }
        timeHold = 0;
        startTime = null;
      }}
      on:mouseleave={() => {
        moving = false;
        timeHold = 0;
        startTime = null;
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
        />
      </svg>
      <div class="font-bold flex justify-center items-center">
        {System.OSName === "macOS" ? "⌘" : "Ctrl"}
        <span class="text-sm"> + Shift + K</span>
      </div>
    </div>

    {#if isShowSideBar}
      <div
        transition:fly={{ x: 650, opacity: 1 }}
        style="z-index: 9999;"
        class="fixed top-0 right-0 h-screen bg-[#F8F8F8] overflow-y-auto w-[500px] flex flex-col"
      >
        <div
          class="cursor-pointer text-white font-semibold absolute top-7 left-0 border-gray-700 pt-[3px] pb-1 px-2 bg-[#38427B] rounded-tr-[5px] rounded-br-[5px]"
          on:click={() => (isShowSideBar = false)}
        >
          <img src={getLocalImg(Close)} alt="" />
        </div>
        <div
          class="p-4 bg-[#27326f] bg-auto bg-no-repeat"
          style="
          background-image: url({getLocalImg(Line)});
          background-position: right 80%;
        "
        >
          <div class="text-center">
            <img
              src={getLocalImg(Logo)}
              class="w-auto h-14 object-contain"
              alt="Nimbus"
            />
          </div>
          <div
            class={`bg-[#38427B] py-1 px-3 rounded-[1000px] flex items-center gap-1 ${
              isFocused ? "input-border-focus" : "input-border-unfocus"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              on:keyup={(e) => {
                debounceSearchInput(e.target?.value || "");
              }}
              on:keydown={(e) => {
                e.stopImmediatePropagation();
                e.stopPropagation();
              }}
              on:focus={() => (isFocused = true)}
              on:blur={() => (isFocused = false)}
              autofocus
              value={search}
              placeholder={MultipleLang.input_placeholder}
              type="text"
              class="input-1 text-white bg-[#38427B] placeholder-white"
            />
          </div>
        </div>

        <div class="px-3 pb-3 pt-2">
          <check-safety-dapp />

          {#if data.length === 1 && (data[0].type === "address" || data[0].type === "tx")}
            <div>
              {#if data[0].type === "address"}
                {#if search}
                  <div class="mt-3">
                    <address-info address={search} isAddressDetail={false} />
                  </div>
                {:else}
                  <div
                    class="flex flex-col items-center justify-center gap-4 mt-16"
                  >
                    <img
                      src={getLocalImg(Coin)}
                      width={48}
                      height="48"
                      alt="coin"
                    />
                    <div
                      class="text-sm text-[#00000099] font-medium text-center px-12"
                    >
                      {MultipleLang.title}
                    </div>
                    <div
                      class="flex justify-center items-center gap-2 text-xs font-medium mt-8 w-full"
                    >
                      <div class="text-black">
                        {JSON.stringify(suggestList) ===
                        JSON.stringify(defaultSuggestList)
                          ? MultipleLang.suggest_keyword
                          : MultipleLang.recent_search}
                      </div>
                      {#each suggestList as suggest}
                        <div
                          class="text-[#1E96FC] cursor-pointer"
                          on:click={() => handleSetSearch(suggest)}
                        >
                          {suggest.length > 9
                            ? shorterAddress(suggest)
                            : suggest}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
              {/if}
              {#if data[0].type === "tx"}
                {#if search}
                  <div class="mt-3">
                    <trx-info hash={search} isTrxDetail={false} />
                  </div>
                {:else}
                  <div
                    class="flex flex-col items-center justify-center gap-4 mt-16"
                  >
                    <img
                      src={getLocalImg(Coin)}
                      width={48}
                      height="48"
                      alt="coin"
                    />
                    <div
                      class="text-sm text-[#00000099] font-medium text-center px-12"
                    >
                      {MultipleLang.title}
                    </div>
                    <div
                      class="flex justify-center items-center gap-2 text-xs font-medium mt-8 w-full"
                    >
                      <div class="text-black">
                        {JSON.stringify(suggestList) ===
                        JSON.stringify(defaultSuggestList)
                          ? MultipleLang.suggest_keyword
                          : MultipleLang.recent_search}
                      </div>
                      {#each suggestList as suggest}
                        <div
                          class="text-[#1E96FC] cursor-pointer"
                          on:click={() => handleSetSearch(suggest)}
                        >
                          {suggest.length > 9
                            ? shorterAddress(suggest)
                            : suggest}
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
              {/if}
            </div>
          {:else}
            <div>
              {#if search}
                <div class="flex items-center gap-2 mt-4 mb-3">
                  <div
                    class="text-[#27326F] text-sm font-medium cursor-pointer py-1 px-3 rounded-lg"
                    class:bg-[#E1F4FD]={tabSelected === "all"}
                    on:click={() => {
                      tabSelected = "all";
                      browser.storage.local.set({ TabSelected: "all" });
                    }}
                  >
                    All
                  </div>
                  <div
                    class="text-[#27326F] text-sm font-medium cursor-pointer py-1 px-3 rounded-lg"
                    class:bg-[#E1F4FD]={tabSelected === "term"}
                    on:click={() => {
                      tabSelected = "term";
                      browser.storage.local.set({ TabSelected: "term" });
                    }}
                  >
                    Terms
                  </div>
                  <div
                    class="text-[#27326F] text-sm font-medium cursor-pointer py-1 px-3 rounded-lg"
                    class:bg-[#E1F4FD]={tabSelected === "token"}
                    on:click={() => {
                      tabSelected = "token";
                      browser.storage.local.set({ TabSelected: "token" });
                    }}
                  >
                    Tokens
                  </div>
                </div>
              {/if}

              {#if tabSelected === "all"}
                {#if termSearchResult.length === 0}
                  {#if termDetectResult.length !== 0}
                    {#each termDetectResult as item}
                      <div class="my-4">
                        <term-info data={item} />
                      </div>
                    {/each}
                  {/if}
                {:else}
                  {#each termSearchResult as item}
                    <div class="mb-4">
                      <term-info data={item} />
                    </div>
                  {/each}
                {/if}

                {#if search !== ""}
                  {#if isLoading}
                    <div class="text-4 leading-6 font-medium mt-10 text-center">
                      {MultipleLang.status}
                    </div>
                  {:else if !isLoading}
                    {#if dataTokenSearchResult.length !== 0}
                      <div class="flex flex-col gap-y-3">
                        {#each dataTokenSearchResult as item}
                          <native-token-info
                            name={item.symbol}
                            id={item.id}
                            {loaded}
                            search={true}
                            address={""}
                          />
                        {/each}
                      </div>
                      <div class="text-xs leading-4 italic text-gray-700 mt-3">
                        {MultipleLang.sources}
                      </div>
                    {:else}
                      <div
                        class="text-4 leading-6 font-medium mt-10 text-center text-black"
                      >
                        {MultipleLang.empty}
                      </div>
                    {/if}
                  {/if}
                {:else if search === ""}
                  {#if dataTokenDetectResult.length !== 0}
                    <div class="mb-2">
                      <div class="title-2 text-black">
                        {MultipleLang.second_title}
                      </div>
                    </div>
                    <div class="flex flex-col gap-y-3">
                      {#each dataTokenDetectResult as item}
                        <native-token-info
                          name={item.symbol}
                          id={item.id}
                          loaded={true}
                          search={true}
                          address={""}
                        />
                      {/each}
                    </div>
                    <div class="text-xs leading-4 italic text-gray-700 mt-3">
                      {MultipleLang.sources}
                    </div>
                  {:else}
                    <div
                      class="flex flex-col items-center justify-center gap-4 mt-16"
                    >
                      <img
                        src={getLocalImg(Coin)}
                        width={48}
                        height="48"
                        alt="coin"
                      />
                      <div
                        class="text-sm text-[#00000099] font-medium text-center px-12"
                      >
                        {MultipleLang.title}
                      </div>
                      <div
                        class="flex justify-center items-center gap-2 text-xs font-medium mt-8 w-full"
                      >
                        <div class="text-black">
                          {JSON.stringify(suggestList) ===
                          JSON.stringify(defaultSuggestList)
                            ? MultipleLang.suggest_keyword
                            : MultipleLang.recent_search}
                        </div>
                        {#each suggestList as suggest}
                          <div
                            class="text-[#1E96FC] cursor-pointer"
                            on:click={() => handleSetSearch(suggest)}
                          >
                            {suggest.length > 9
                              ? shorterAddress(suggest)
                              : suggest}
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}
                {/if}
              {/if}

              {#if tabSelected === "term"}
                {#if termSearchResult.length === 0}
                  {#if termDetectResult.length !== 0}
                    {#each termDetectResult as item}
                      <div class="mb-4">
                        <term-info data={item} />
                      </div>
                    {/each}
                  {:else}
                    <div>
                      {#if search === ""}
                        <div
                          class="flex flex-col items-center justify-center gap-4 mt-16"
                        >
                          <img
                            src={getLocalImg(Coin)}
                            width={48}
                            height="48"
                            alt="coin"
                          />
                          <div
                            class="text-sm text-[#00000099] font-medium text-center px-12"
                          >
                            {MultipleLang.title}
                          </div>
                          <div
                            class="flex justify-center items-center gap-2 text-xs font-medium mt-8 w-full"
                          >
                            <div class="text-black">
                              {JSON.stringify(suggestList) ===
                              JSON.stringify(defaultSuggestList)
                                ? MultipleLang.suggest_keyword
                                : MultipleLang.recent_search}
                            </div>
                            {#each suggestList as suggest}
                              <div
                                class="text-[#1E96FC] cursor-pointer"
                                on:click={() => (search = suggest)}
                              >
                                {suggest.length > 9
                                  ? shorterAddress(suggest)
                                  : suggest}
                              </div>
                            {/each}
                          </div>
                        </div>
                      {:else}
                        <div
                          class="text-4 leading-6 font-medium mt-10 text-center text-black"
                        >
                          No terms
                        </div>
                      {/if}
                    </div>
                  {/if}
                {:else}
                  {#each termSearchResult as item}
                    <div class="mb-4">
                      <term-info data={item} />
                    </div>
                  {/each}
                {/if}
              {/if}

              {#if tabSelected === "token"}
                {#if search !== ""}
                  {#if isLoading}
                    <div class="text-4 leading-6 font-medium mt-10 text-center">
                      {MultipleLang.status}
                    </div>
                  {:else if !isLoading}
                    {#if dataTokenSearchResult.length !== 0}
                      <div class="flex flex-col gap-y-3">
                        {#each dataTokenSearchResult as item}
                          <native-token-info
                            name={item.symbol}
                            id={item.id}
                            {loaded}
                            search={true}
                            address={""}
                          />
                        {/each}
                      </div>
                      <div class="text-xs leading-4 italic text-gray-700 mt-3">
                        {MultipleLang.sources}
                      </div>
                    {:else}
                      <div
                        class="text-4 leading-6 font-medium mt-10 text-center text-black"
                      >
                        No tokens
                      </div>
                    {/if}
                  {/if}
                {:else if search === ""}
                  {#if dataTokenDetectResult.length !== 0}
                    <div class="mb-2">
                      <div class="title-2">{MultipleLang.second_title}</div>
                    </div>
                    <div class="flex flex-col gap-y-3">
                      {#each dataTokenDetectResult as item}
                        <native-token-info
                          name={item.symbol}
                          id={item.id}
                          loaded={true}
                          search={true}
                          address={""}
                        />
                      {/each}
                    </div>
                    <div class="text-xs leading-4 italic text-gray-700 mt-3">
                      {MultipleLang.sources}
                    </div>
                  {:else}
                    <div
                      class="flex flex-col items-center justify-center gap-4 mt-16"
                    >
                      <img
                        src={getLocalImg(Coin)}
                        width={48}
                        height="48"
                        alt="coin"
                      />
                      <div
                        class="text-sm text-[#00000099] font-medium text-center px-12"
                      >
                        {MultipleLang.title}
                      </div>
                      <div
                        class="flex justify-center items-center gap-2 text-xs font-medium mt-8 w-full"
                      >
                        <div class="text-black">
                          {JSON.stringify(suggestList) ===
                          JSON.stringify(defaultSuggestList)
                            ? MultipleLang.suggest_keyword
                            : MultipleLang.recent_search}
                        </div>
                        {#each suggestList as suggest}
                          <div
                            class="text-[#1E96FC] cursor-pointer"
                            on:click={() => handleSetSearch(suggest)}
                          >
                            {suggest.length > 9
                              ? shorterAddress(suggest)
                              : suggest}
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}
                {/if}
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </Mixpanel>
</reset-style>

<svelte:window
  on:mouseup={() => {
    moving = false;
    timeHold = 0;
    startTime = null;
  }}
  on:mousemove={(e) => {
    if (startTime) {
      endTime = new Date();
    }
    if (moving) {
      if (DraggableY < 0) {
        DraggableY = 0;
      }
      if (DraggableY >= window.innerHeight - 50) {
        DraggableY = window.innerHeight - 50;
      }
      DraggableY += e.movementY;
    }
  }}
/>

<style>
  .input-border-focus {
    border: 0.5px solid white;
  }

  .input-border-unfocus {
    border: 0.5px solid transparent;
  }
</style>
