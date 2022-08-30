<svelte:options tag="quick-search" />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { escapeRegex } from "../views/utils";
  import UrlPattern from "url-pattern";
  import { sendMessage } from "webext-bridge";
  import * as browser from "webextension-polyfill";

  import "~/components/ResetStyle.svelte";
  import "./NativeTokenInfo.svelte";

  let listPageConfig = [];
  let coinListData;
  let regexToken;
  let selectedTokenData = [];
  let tokenDataSearch = [];
  let isChangeURL = false;
  let isShowSideBar = false;
  let search = "";
  let isFocused = false;
  let currentUrl = window.location.href;
  let timer;
  let isLoading = false;

  onMount(() => {
    getConfigPages();
    getCoinList();
  });

  const getConfigPages = async () => {
    listPageConfig = (await sendMessage("configPageList", undefined)) as any[];
  };

  const getCoinList = async () => {
    const coinList = (await sendMessage("coinList", { limit: 500 })) as any[];
    coinListData = coinList;

    const nameAndSymbolList = [
      ...coinList.map((item) => item.symbol.toUpperCase()),
    ];

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

  const getSearchData = async (searchValue) => {
    isLoading = true;
    const data = (await sendMessage("getSearchData", {
      search: searchValue,
    })) as any[];
    if (data) {
      isLoading = false;
      tokenDataSearch = data;
    }
  };

  const handleGetCoinDataFromPage = () => {
    let innerTextMatchContext = [];

    const selectedPageFromCurrentUrl = listPageConfig.find((item) => {
      return location.hostname === item.hostname;
    });

    selectedPageFromCurrentUrl?.urlPattern.map((item) => {
      const patternUrlPath = new UrlPattern(item.path);
      const detectUrlPath = patternUrlPath.match(location.pathname);

      if (detectUrlPath === null) return;
      return item.selector.forEach((selectDOM) => {
        const context = document.querySelector(selectDOM);
        innerTextMatchContext = context.innerText.match(regexToken);
      });
    });

    selectedTokenData =
      innerTextMatchContext.length > 0
        ? [
            ...new Set(
              innerTextMatchContext.map((item) => {
                return coinListData.find(
                  (data) => data.symbol === item || data.name === item
                );
              })
            ),
          ]
        : [];
  };

  // const handleDectecSupportUrl = () => {
  //   isChangeURL = listPageConfig.some((item) => {
  //     return location.hostname === item.hostname;
  //   });
  // };

  const observer = new MutationObserver((e) => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      // handleDectecSupportUrl();
      handleGetCoinDataFromPage();
      setTimeout(() => {
        // handleDectecSupportUrl();
        handleGetCoinDataFromPage();
      }, 3000);
    }
  });
  observer.observe(document, { subtree: true, childList: true });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  const debounce = (value) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      search = value;
    }, 300);
  };

  $: {
    if (listPageConfig && coinListData) {
      // handleDectecSupportUrl();
      handleGetCoinDataFromPage();
    }
  }

  $: {
    if (search) {
      getSearchData(search);
    }
  }

  $: loaded = search && isFocused === false;

  $: {
    if (!isShowSideBar) {
      search = "";
      isFocused = false;
    } else {
      isFocused = true;
    }
  }

  browser.runtime.onMessage.addListener(function (msg) {
    if (msg.action && msg.action == "toggleSidebar") {
      isShowSideBar = !isShowSideBar;
    }
  });
</script>

<reset-style>
  <div
    style="z-index: 9999;"
    on:click={() => (isShowSideBar = true)}
    class="fixed top-[140px] right-0 p-2 bg-sky-100 opacity-80 text-sky-400 rounded-tl rounded-bl cursor-pointer flex items-center gap-1"
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
    <div class="font-semibold">🌩</div>
  </div>

  {#if isShowSideBar}
    <div
      transition:fly={{ x: 650, opacity: 1 }}
      style="z-index: 9999;"
      class="fixed top-0 right-0 h-[98vh] p-4 bg-sky-100 overflow-y-auto w-[350px] flex flex-col text-gray-900 border-0 border-l-1 border-solid border-l-gray-200"
    >
      <div
        class="cursor-pointer text-sky-500 font-semibold absolute top-2 left-0 btn-border pt-3 pb-2 bg-sky-200 rounded-tr-[8px] rounded-br-[8px]"
        on:click={() => (isShowSideBar = false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-4 text-gray-700 rounded"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      <div class="text-center font-bold text-6 leading-[32px] my-2">
        Welcome to <span class="text-sky-400">Nimbus 🌩</span>
      </div>

      <div
        class={`bg-white p-2 rounded flex items-center gap-1 my-3 ${
          isFocused ? "input-border-focus" : "input-border-unfocus"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 text-gray-700"
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
          on:keyup={({ target: { value } }) => debounce(value)}
          on:focus={() => (isFocused = true)}
          on:blur={() => (isFocused = false)}
          autofocus
          value={search}
          placeholder="Search..."
          type="text"
          class="w-full py-2 border-none focus:outline-none bg-white"
        />
      </div>

      {#if search !== ""}
        {#if isLoading}
          <div class="text-4 leading-6 font-medium mt-10 text-center">
            Searching...
          </div>
        {:else if !isLoading}
          {#if tokenDataSearch.length !== 0}
            <div class="mb-2">
              <div class="text-lg leading-[28px] font-bold">Results</div>
            </div>
            <div class="flex flex-col gap-y-3">
              {#each tokenDataSearch as item}
                <native-token-info id={item.id} name={item.symbol} {loaded} />
              {/each}
            </div>
            <div class="text-xs leading-4 italic text-gray-700 mt-3">
              *Chart data by CoinGekko
            </div>
          {:else}
            <div class="text-4 leading-6 font-medium mt-10 text-center">
              No results
            </div>
          {/if}
        {/if}
      {:else if search === ""}
        {#if selectedTokenData.length !== 0}
          <div class="mb-2">
            <div class="text-lg leading-[28px] font-bold">On this page</div>
          </div>
          <div class="flex flex-col gap-y-3">
            {#each selectedTokenData as item}
              <native-token-info id={item.id} name={item.symbol} {loaded} />
            {/each}
          </div>

          <div class="text-xs leading-4 italic text-gray-700 mt-3">
            *Chart data by CoinGekko
          </div>
        {:else}
          <div class="text-4 leading-6 font-medium mt-10 text-center">
            Search for cryptocurrency or token you want to know
          </div>
        {/if}
      {/if}

      <!-- <a
      href="https://feedback.getnimbus.xyz/"
      target="_blank"
      class="flex items-center justify-center border-1 border-solid border-sky-400 px-3 py-2 text-sky-500 rounded cursor-pointer bg-white no-underline mt-auto"
    >
      Feedback
    </a> -->
    </div>
  {/if}
</reset-style>

<style>
  .btn-border {
    border-top: 1px;
    border-bottom: 1px;
    border-right: 1px;
    border-left: 0px;
    border-style: solid;
    border-color: skyblue;
  }

  .input-border-focus {
    border: 1px solid #0369a1;
  }

  .input-border-unfocus {
    border: 1px solid transparent;
  }
</style>
