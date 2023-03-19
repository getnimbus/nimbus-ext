<svelte:options tag="quick-search" />

<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { escapeRegex, getLocalImg } from "~/utils";
  import UrlPattern from "url-pattern";
  import { sendMessage } from "webext-bridge";
  import * as browser from "webextension-polyfill";
  import Mousetrap from "mousetrap";
  import addGlobalBinds from "bind-mousetrap-global";
  addGlobalBinds(Mousetrap);
  import System from "svelte-system-info";
  import { i18n } from "~/lib/i18n";
  import { track } from "~/lib/data-tracking";

  import "./NativeTokenInfo.custom.svelte";
  import "~/components/ResetStyle.custom.svelte";
  import "~/components/CheckSafety.custom.svelte";

  import Logo from "~/assets/logo-white.svg";
  import More from "../../../assets/more.svg";
  import Close from "../../../assets/close.svg";
  import Line from "../../../assets/line.svg";

  const MultipleLang = {
    title: i18n(
      "quickSearchLang.title",
      "Search for cryptocurrency or token you want to know"
    ),
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
  let tabSelected = "all";

  let DraggableY = parseInt(localStorage.getItem("DraggableY")) || 140;
  let moving = false;

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
    selectedTermData =
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
    selectedTokenData =
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

  onMount(() => {
    getConfigPages();
    getCoinList();
    getTermList();
  });

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
    if (DraggableY >= 0 && DraggableY <= window.innerHeight - 50) {
      localStorage.setItem("DraggableY", DraggableY.toString());
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
    style="z-index: 2147483647; top:{DraggableY}px;"
    class="transform translate-x-[80%] transition-transform ease-in-out fixed right-0 pr-2 pl-1 h-10 bg-[#27326f] opacity-80 text-white rounded-tl-[5px] rounded-bl-[5px] cursor-pointer flex items-center gap-1 shadow-lg"
    class:hover:translate-x-0={!isShowSideBar}
    on:mousedown={() => (moving = true)}
    on:mouseup={() => (moving = false)}
    on:mouseleave={() => (moving = false)}
    on:click={() => (isShowSideBar = true)}
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
      style="z-index: 2147483647; border-left: 1px solid #27326F;"
      class="fixed top-0 right-0 h-screen bg-[#F8F8F8] overflow-y-auto w-[350px] flex flex-col text-gray-900 border-0 border-l-1 border-solid border-l-gray-200"
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
            on:keyup={({ target: { value } }) => debounce(value)}
            on:focus={() => (isFocused = true)}
            on:blur={() => (isFocused = false)}
            autofocus
            value={search}
            placeholder={MultipleLang.input_placeholder}
            type="text"
            class="input-1 text-white bg-[#38427B]"
          />
        </div>
      </div>

      <div class="px-3 pb-3 pt-2">
        <check-safety />

        {#if search}
          <div class="flex items-center gap-2 mt-4 mb-3">
            <div
              class="text-[#27326F] text-sm font-medium cursor-pointer py-1 px-3 rounded-lg"
              class:bg-[#E1F4FD]={tabSelected === "all"}
              on:click={() => (tabSelected = "all")}
            >
              All
            </div>
            <div
              class="text-[#27326F] text-sm font-medium cursor-pointer py-1 px-3 rounded-lg"
              class:bg-[#E1F4FD]={tabSelected === "term"}
              on:click={() => (tabSelected = "term")}
            >
              Term Explain
            </div>
            <div
              class="text-[#27326F] text-sm font-medium cursor-pointer py-1 px-3 rounded-lg"
              class:bg-[#E1F4FD]={tabSelected === "search"}
              on:click={() => (tabSelected = "search")}
            >
              Chart
            </div>
          </div>
        {/if}

        {#if tabSelected === "all"}
          {#if selectedSearchTermData.length === 0}
            {#if selectedTermData.length !== 0}
              {#each selectedTermData as item}
                <div class="p-4 max-w-sm bg-white rounded-[10px] mb-4">
                  <div class="flex justify-between items-center">
                    <a
                      href={item.url}
                      class="text-xl font-medium text-black no-underline"
                    >
                      {item.term}
                    </a>
                    <div class="cursor-pointer mt-1">
                      <img src={getLocalImg(More)} alt="more" />
                    </div>
                  </div>
                  {#if item.img !== null}
                    <div
                      class="w-full h-[300px] border rounded overflow-hidden"
                    >
                      <img
                        src={item.img}
                        alt="img"
                        class="w-full h-full object-contain"
                      />
                    </div>
                  {/if}
                  <div class="text-sm font-normal text-[#00000099] mt-[10px]">
                    {item.define}
                  </div>
                </div>
              {/each}
            {/if}
          {:else}
            {#each selectedSearchTermData as item}
              <div class="p-4 max-w-sm bg-white rounded-[10px] mb-4">
                <div class="flex justify-between items-center">
                  <a
                    href={item.url}
                    class="text-xl font-medium text-black no-underline"
                  >
                    {item.term}
                  </a>
                  <div class="cursor-pointer mt-1">
                    <img src={getLocalImg(More)} alt="more" />
                  </div>
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
                <div class="text-sm font-normal text-[#00000099] mt-[10px]">
                  {item.define}
                </div>
              </div>
            {/each}
          {/if}

          {#if search !== ""}
            {#if isLoading}
              <div class="text-4 leading-6 font-medium mt-10 text-center">
                {MultipleLang.status}
              </div>
            {:else if !isLoading}
              {#if tokenDataSearch.length !== 0}
                <div class="flex flex-col gap-y-3">
                  {#each tokenDataSearch as item}
                    <native-token-info
                      id={item.id}
                      name={item.symbol}
                      {loaded}
                    />
                  {/each}
                </div>
                <div class="text-xs leading-4 italic text-gray-700 mt-3">
                  {MultipleLang.sources}
                </div>
              {:else}
                <div class="text-4 leading-6 font-medium mt-10 text-center">
                  {MultipleLang.empty}
                </div>
              {/if}
            {/if}
          {:else if search === ""}
            {#if selectedTokenData.length !== 0}
              <div class="mb-2">
                <div class="title-2">{MultipleLang.second_title}</div>
              </div>
              <div class="flex flex-col gap-y-3">
                {#each selectedTokenData as item}
                  <native-token-info id={item.id} name={item.symbol} />
                {/each}
              </div>
              <div class="text-xs leading-4 italic text-gray-700 mt-3">
                {MultipleLang.sources}
              </div>
            {:else}
              <div class="text-4 leading-6 font-medium mt-10 text-center">
                {MultipleLang.title}
              </div>
            {/if}
          {/if}
        {:else if tabSelected === "term"}
          {#if selectedSearchTermData.length === 0}
            {#if selectedTermData.length !== 0}
              {#each selectedTermData as item}
                <div class="p-4 max-w-sm bg-white rounded-[10px] mb-4">
                  <div class="flex justify-between items-center">
                    <a
                      href={item.url}
                      class="text-xl font-medium text-black no-underline"
                    >
                      {item.term}
                    </a>
                    <div class="cursor-pointer mt-1">
                      <img src={getLocalImg(More)} alt="more" />
                    </div>
                  </div>
                  {#if item.img !== null}
                    <div
                      class="w-full h-[300px] border rounded overflow-hidden"
                    >
                      <img
                        src={item.img}
                        alt="img"
                        class="w-full h-full object-contain"
                      />
                    </div>
                  {/if}
                  <div class="text-sm font-normal text-[#00000099] mt-[10px]">
                    {item.define}
                  </div>
                </div>
              {/each}
            {/if}
          {:else}
            {#each selectedSearchTermData as item}
              <div class="p-4 max-w-sm bg-white rounded-[10px] mb-4">
                <div class="flex justify-between items-center">
                  <a
                    href={item.url}
                    class="text-xl font-medium text-black no-underline"
                  >
                    {item.term}
                  </a>
                  <div class="cursor-pointer mt-1">
                    <img src={getLocalImg(More)} alt="more" />
                  </div>
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
                <div class="text-sm font-normal text-[#00000099] mt-[10px]">
                  {item.define}
                </div>
              </div>
            {/each}
          {/if}
        {:else if tabSelected === "search"}
          {#if search !== ""}
            {#if isLoading}
              <div class="text-4 leading-6 font-medium mt-10 text-center">
                {MultipleLang.status}
              </div>
            {:else if !isLoading}
              {#if tokenDataSearch.length !== 0}
                <div class="flex flex-col gap-y-3">
                  {#each tokenDataSearch as item}
                    <native-token-info
                      id={item.id}
                      name={item.symbol}
                      {loaded}
                    />
                  {/each}
                </div>
                <div class="text-xs leading-4 italic text-gray-700 mt-3">
                  {MultipleLang.sources}
                </div>
              {:else}
                <div class="text-4 leading-6 font-medium mt-10 text-center">
                  {MultipleLang.empty}
                </div>
              {/if}
            {/if}
          {:else if search === ""}
            {#if selectedTokenData.length !== 0}
              <div class="mb-2">
                <div class="title-2">{MultipleLang.second_title}</div>
              </div>
              <div class="flex flex-col gap-y-3">
                {#each selectedTokenData as item}
                  <native-token-info id={item.id} name={item.symbol} />
                {/each}
              </div>
              <div class="text-xs leading-4 italic text-gray-700 mt-3">
                {MultipleLang.sources}
              </div>
            {:else}
              <div class="text-4 leading-6 font-medium mt-10 text-center">
                {MultipleLang.title}
              </div>
            {/if}
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
    </div>
  {/if}
</reset-style>

<svelte:window
  on:mouseup={() => (moving = false)}
  on:mousemove={(e) => {
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
