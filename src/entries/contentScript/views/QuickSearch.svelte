<svelte:options tag="quick-search" />

<script>
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { nimbus } from "../views/network";
  import { escapeRegex } from "../views/utils";
  import { get } from "lodash";
  import UrlPattern from "url-pattern";
  import { sendMessage } from "webext-bridge";

  import "./NativeTokenInfo.svelte";

  let listPageConfig = [];
  let coinListData;
  let regexToken;
  let innerTextMatchContext = [];
  let selectedTokenData = [];
  let isChangeURL = false;
  let isShowSideBar = false;
  let search = "";
  let currentUrl = window.location.href;

  onMount(() => {
    getConfigPages();
    getCoinList();
  });

  const getConfigPages = async () => {
    let response;
    try {
      response = await nimbus.get("/config/pages");
    } catch (e) {
      console.error(e);
    }
    listPageConfig = get(response, "data.data");

    const blabla = await sendMessage("configPageList");
    console.log("blabla: ", blabla);
  };

  const getCoinList = async () => {
    const coinList = await sendMessage("coinList", { limit: 500 });
    coinListData = coinList;

    const nameAndSymbolList = [
      // @ts-ignore
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

  const handleDectecUrl = () => {
    const selectedPageFromCurrentUrl = listPageConfig.find((item) => {
      return location.hostname === item.hostname;
    });

    const patternUrl = selectedPageFromCurrentUrl.urlPattern.map((item) => {
      return new UrlPattern(item.path);
    });

    const arrayUrlDetected = patternUrl.map((item) => {
      return item.match(location.pathname);
    });

    isChangeURL = arrayUrlDetected.some((el) => el !== null);
  };

  const observer = new MutationObserver((e) => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;
      handleDectecUrl();
      setTimeout(() => {
        handleDectecUrl();
      }, 3000);
    }
  });
  observer.observe(document, { subtree: true, childList: true });

  $: {
    if (!isChangeURL) {
      isShowSideBar = false;
    } else {
      const selectedPageFromCurrentUrl = listPageConfig.find((item) => {
        return location.hostname === item.hostname;
      });

      selectedPageFromCurrentUrl.urlPattern.forEach((item) => {
        item.selector.map((selectDOM) => {
          const context = document.querySelector(selectDOM);
          innerTextMatchContext = context.innerText.match(regexToken);
        });
      });
    }
  }

  $: {
    if (innerTextMatchContext && innerTextMatchContext.length > 0) {
      selectedTokenData = [
        ...new Set(
          innerTextMatchContext.map((item) => {
            return coinListData.find(
              (data) => data.symbol === item || data.name === item
            );
          })
        ),
      ];
    }
  }
</script>

{#if isChangeURL}
  <div
    style="z-index: 999"
    on:click={() => (isShowSideBar = true)}
    class="fixed top-[140px] right-0 p-2 bg-sky-100 text-sky-400 rounded-tl rounded-bl cursor-pointer flex items-center gap-1"
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
    <div class="font-semibold text-lg">Nimbus 🌩</div>
  </div>
{/if}

{#if isShowSideBar}
  <div
    transition:fly={{ x: 650, opacity: 1 }}
    style="z-index: 999"
    class="fixed top-0 right-0 h-full p-4 bg-sky-100 overflow-y-auto w-[25rem] flex flex-col gap-3"
  >
    <div
      class="cursor-pointer text-sky-500 font-semibold"
      on:click={() => (isShowSideBar = false)}
    >
      Close
    </div>

    <div class="bg-white text-sky-300 p-2 rounded flex items-center gap-1">
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
        placeholder="Search..."
        type="text"
        bind:value={search}
        class="font-base w-full py-2 border-none focus:outline-none"
      />
    </div>

    <div class="text-3xl font-bold">On this page</div>

    {#each selectedTokenData as tokenInfo}
      <native-token-info id={tokenInfo.id} name={tokenInfo.symbol} />
    {/each}
  </div>
{/if}
