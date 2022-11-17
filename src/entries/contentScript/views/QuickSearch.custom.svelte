<svelte:options tag="quick-search" />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { escapeRegex, getLocalImg } from "../views/utils";
  import UrlPattern from "url-pattern";
  import { sendMessage } from "webext-bridge";
  import * as browser from "webextension-polyfill";
  import Mousetrap from "mousetrap";
  import addGlobalBinds from "bind-mousetrap-global";
  addGlobalBinds(Mousetrap);

  import "~/components/ResetStyle.custom.svelte";
  import "./NativeTokenInfo.custom.svelte";
  import "./CheckSafety.custom.svelte";
  import { track } from "~/lib/data-tracking";
  import FullLogo from "../assets/full-logo.svg";
  import { i18n, setLang } from "~/lib/i18n";

  let listPageConfig = [];
  let listTermData;
  let coinListData;
  let regexToken;
  let regexTerm;
  let selectedTokenData = [];
  let selectedTermData = [];
  let selectedSearchTermData = [];
  let tokenDataSearch = [];
  let isChangeURL = false;
  let isShowSideBar = false;
  let search = "";
  let isFocused = false;
  let currentUrl = window.location.href;
  let timer;
  let isLoading = false;
  let helloText = i18n("appTitle.message", "Xin chao {name}", { name: "Binh" });

  onMount(() => {
    getConfigPages();
    getCoinList();
    getTermList();
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

  const getTermList = async () => {
    const listTerm = (await sendMessage("getListTerm", undefined)) as any[];

    listTermData = listTerm;
    const listTermName = listTerm.map((item) => item.term);

    regexTerm = new RegExp(
      `\\b(${listTermName
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

      if (detectUrlPath === null) return;
      return item.selector.forEach((selectDOM) => {
        const context = document.querySelector(selectDOM);
        innerTextMatchContext = context.innerText.match(regex);
      });
    });

    return innerTextMatchContext;
  };

  const handleGetTermFromPage = () => {
    const innerTextMatch = handleDetectRegex(regexTerm);
    selectedTermData =
      innerTextMatch.length > 0
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
    selectedTokenData =
      innerTextMatch.length > 0
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

  const observer = new MutationObserver((e) => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      // handleDectecSupportUrl();
      handleGetCoinDataFromPage();
      handleGetTermFromPage();
      setTimeout(() => {
        // handleDectecSupportUrl();
        handleGetCoinDataFromPage();
        handleGetTermFromPage();
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
      handleGetCoinDataFromPage();
    }
  }

  $: {
    if (listPageConfig && listTermData) {
      handleGetTermFromPage();
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

  $: selectedSearchTermData =
    search &&
    listTermData
      .filter((item) => item.term.toLowerCase().includes(search))
      .slice(0, 3);

  browser.runtime.onMessage.addListener(function (msg) {
    if (msg.action && msg.action == "toggleSidebar") {
      isShowSideBar = !isShowSideBar;
    }
  });

  Mousetrap.bindGlobal(["command+shift+k", "ctrl+shift+k"], function () {
    isShowSideBar = !isShowSideBar;
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
  </div>

  {#if isShowSideBar}
    <div
      transition:fly={{ x: 650, opacity: 1 }}
      style="z-index: 9999;"
      class="fixed top-0 right-0 h-[98vh] p-4 bg-gray-100 overflow-y-auto w-[350px] flex flex-col text-gray-900 border-0 border-l-1 border-solid border-l-gray-200"
    >
      <div
        class="cursor-pointer text-gray-900 font-semibold absolute top-2 left-0 btn-border border-gray-700 pt-3 pb-1 bg-gray-200 rounded-tr-[8px] rounded-br-[8px]"
        on:click={() => (isShowSideBar = false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-4 rounded"
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

      <div class="text-center">
        <img
          src={getLocalImg(FullLogo)}
          class="w-auto h-16 object-contain"
          alt="Nimbus logo"
        />
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
          class="input-1 text-black"
        />
      </div>

      <check-safety />

      {#if selectedSearchTermData.length === 0}
        {#if selectedTermData.length !== 0}
          {#each selectedTermData as item}
            <div
              class="p-3 max-w-sm bg-white rounded border border-gray-200 shadow mb-4"
            >
              <div class="flex justify-between items-baseline">
                <div class="text-xl font-bold tracking-tight text-gray-900">
                  {item.term}
                </div>
                {#if item.url !== null}
                  <a
                    href={item.url}
                    class="inline-flex items-center text-sm text-sky-600 font-medium no-underline hover:underline"
                  >
                    Read more
                  </a>
                {/if}
              </div>
              {#if item.img !== null}
                <div class="w-full h-[300px] border rounded overflow-hidden">
                  <img
                    src={item.img}
                    alt="img"
                    class="w-full h-full object-contain"
                  />
                </div>
              {/if}
              <p class="mb-1 font-normal leading-6 text-gray-700">
                {item.define}
              </p>
            </div>
          {/each}
        {/if}
      {:else}
        {#each selectedSearchTermData as item}
          <div
            class="p-3 max-w-sm bg-white rounded border border-gray-200 shadow mb-4"
          >
            <div class="flex justify-between items-baseline">
              <div class="text-xl font-bold tracking-tight text-gray-900">
                {item.term}
              </div>
              {#if item.url !== null}
                <a
                  href={item.url}
                  class="inline-flex shrink-0 items-center text-sm text-sky-600 font-medium no-underline hover:underline"
                >
                  Read more
                </a>
              {/if}
            </div>
            {#if item.img !== null}
              <div class="w-full h-[300px] border rounded overflow-hidden">
                <img
                  src={item.img}
                  alt="img"
                  class="w-full h-full object-contain"
                />
              </div>
            {/if}
            <p class="mb-1 font-normal leading-6 text-gray-700">
              {item.define}
            </p>
          </div>
        {/each}
      {/if}

      {#if search !== ""}
        {#if isLoading}
          <div class="text-4 leading-6 font-medium mt-10 text-center">
            Searching...
          </div>
        {:else if !isLoading}
          {#if tokenDataSearch.length !== 0}
            <div class="mb-2">
              <div class="title-2">Results</div>
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
            <div class="title-2">On this page</div>
          </div>
          <div class="flex flex-col gap-y-3">
            {#each selectedTokenData as item}
              <native-token-info
                id={item.id}
                name={item.symbol}
                loaded={true}
              />
            {/each}
          </div>

          <div class="text-xs leading-4 italic text-gray-700 mt-3">
            *Chart data by CoinGekko
          </div>
        {:else}
          <div
            class="text-4 leading-6 font-medium mt-10 text-center"
            on:click={() => setLang("vi")}
          >
            Search for cryptocurrency or token you want to know
            {helloText}
          </div>
        {/if}
      {/if}

      <!-- <a
      href="https://feedback.getnimbus.io/"
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
  }

  /* .border {
    border: 1px solid red;
  } */

  .input-border-focus {
    border: 1px solid #0369a1;
  }

  .input-border-unfocus {
    border: 1px solid transparent;
  }
</style>
