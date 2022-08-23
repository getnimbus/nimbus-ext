<svelte:options tag="quick-search" />

<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { escapeRegex } from "../views/utils";
  import UrlPattern from "url-pattern";
  import { sendMessage } from "webext-bridge";

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
  let loaded = false;
  let currentUrl = window.location.href;
  let timer;

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
    const data = (await sendMessage("getSearchData", {
      search: searchValue,
    })) as any[];
    tokenDataSearch = data;
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

  $: {
    if (search && isFocused === false) {
      loaded = true;
    } else {
      loaded = false;
    }
  }

  $: {
    if (!isShowSideBar) {
      search = "";
    }
  }
</script>

<div
  style="z-index: 999"
  on:click={() => (isShowSideBar = true)}
  class="fixed top-[140px] right-0 p-2 bg-sky-100 opacity-80 text-sky-400 rounded-tl rounded-bl cursor-pointer flex items-center gap-1"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-5 w-5"
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
  <div class="font-semibold text-lg">🌩</div>
</div>

{#if isShowSideBar}
  <div
    transition:fly={{ x: 650, opacity: 1 }}
    style="z-index: 999"
    class="fixed top-0 right-0 h-screen p-4 bg-sky-100 overflow-y-auto w-[350px] flex flex-col text-gray-900 sidebar-wrapper"
  >
    <div
      class="cursor-pointer text-sky-500 font-semibold absolute top-2 left-0 btn-border pt-3 pb-2 bg-sky-200 rounded-tr-lg rounded-br-lg"
      on:click={() => (isShowSideBar = false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>

    <div class="text-center font-bold text-2xl my-2">
      Welcome to <span class="text-sky-400">Nimbus 🌩</span>
    </div>

    <div class="bg-white text-sky-300 p-2 rounded flex items-center gap-1 my-3">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
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
        placeholder="Search..."
        type="text"
        class="font-base w-full py-2 border-none focus:outline-none"
      />
    </div>

    {#if search !== ""}
      <div class="flex flex-col gap-y-3">
        {#each tokenDataSearch as item}
          <native-token-info id={item.id} name={item.symbol} {loaded} />
        {/each}
      </div>
    {:else if search === ""}
      {#if selectedTokenData.length !== 0}
        <div class="text-2xl font-bold mt-3 mb-2">On this page</div>
        <div class="flex flex-col gap-y-3">
          {#each selectedTokenData as item}
            <native-token-info id={item.id} name={item.symbol} loaded={true} />
          {/each}
        </div>
      {:else}
        <div class="text-base font-semibold">
          Let us help what Token information do you want to known?
        </div>
      {/if}
    {/if}
    {#if tokenDataSearch.length || selectedTokenData.length}
      <div class="text-xs italic mt-3">*Chart data by CoinGekko</div>
    {/if}
    <!-- 
    <a
      href="https://feedback.getnimbus.xyz/"
      target="_blank"
      class="flex items-center justify-center border-1 border-solid border-sky-400 px-3 py-2 text-sky-500 rounded cursor-pointer bg-white no-underline mt-auto"
    >
      Feedback
    </a> -->
  </div>
{/if}

<style>
  .btn-border {
    border-top: 1px;
    border-bottom: 1px;
    border-right: 1px;
    border-left: 0px;
    border-style: solid;
    border-color: skyblue;
  }

  .sidebar-wrapper {
    border-left: 1px solid #e5e7eb;
  }
</style>
