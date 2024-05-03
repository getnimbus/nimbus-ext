<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import { isDarkMode } from "~/store";

  import Icon from "~/UI/Option/Icon.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import TabAccounts from "~/UI/Option/TabAccounts.svelte";
  import TabReports from "~/UI/Option/TabReports.svelte";
  import TabAlerts from "~/UI/Option/TabAlerts.svelte";
  import TabLinks from "~/UI/Option/TabLinks.svelte";
  import TabSettings from "~/UI/Option/TabSettings.svelte";
  import TabNft from "~/UI/Option/TabNFT.svelte";

  import Logo from "~/assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";
  import wheelIcon from "~/assets/wheel-icon.svg";

  const listSideBar = [
    {
      label: i18n("optionsPage.tab-title-accounts", "Accounts"),
      value: "accounts",
      type: "Accounts",
    },
    {
      label: i18n("optionsPage.tab-title-alerts", "Alerts"),
      value: "alerts",
      type: "Alerts",
    },
    {
      label: i18n("optionsPage.tab-title-report", "Reports"),
      value: "reports",
      type: "Reports",
    },
    {
      label: i18n("optionsPage.tab-title-links", "Links"),
      value: "links",
      type: "Links",
    },
    // {
    //   label: i18n("optionsPage.tab-title-nft", "NFT"),
    //   value: "nft",
    //   type: "NFT",
    // },
    // {
    //   label: i18n("optionsPage.tab-title-settings", "Settings"),
    //   value: "settings",
    //   type: "Settings",
    // },
  ];

  let activeTabValue = "accounts";

  $: {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParams = urlParams.get("tab");
    if (tabParams) {
      activeTabValue = tabParams;
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?tab=${tabParams}`
      );
    } else {
      activeTabValue = "accounts";
      window.history.replaceState(
        null,
        "",
        window.location.pathname + "?tab=accounts"
      );
    }
  });

  const handleClick = (e, tabValue) => {
    e.preventDefault();
    activeTabValue = tabValue;
    window.history.replaceState(
      null,
      "",
      window.location.pathname + `?tab=${tabValue}`
    );
  };
</script>

<ErrorBoundary>
  <div class="relative z-9">
    <div
      class="max-w-[2000px] xl:min-h-screen m-auto xl:w-[90%] w-[90%] py-8 grid xl:grid-cols-6 grid-cols-1 gap-6 relative z-2"
    >
      <div class="col-span-1">
        <div class="w-full flex flex-col gap-4">
          {#each listSideBar as item}
            <div
              on:click={(e) => handleClick(e, item.value)}
              class={`flex items-center gap-2 rounded-[10px] py-2 px-3 cursor-pointer transition-all ${
                $isDarkMode
                  ? activeTabValue === item.value
                    ? "text-blue-500 bg-[#ffffff1c]"
                    : "text-white hover:bg-[#222222]"
                  : activeTabValue === item.value
                    ? "text-blue-500 bg-gray-200"
                    : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Icon
                type={item.type}
                active={activeTabValue === item.value ? true : false}
              />
              <div class="xl:text-base text-lg">{item.label}</div>
            </div>
          {/each}
        </div>
      </div>
      <div class="xl:col-span-5 col-span-1">
        {#if activeTabValue === "accounts"}
          <TabAccounts />
          <!-- {:else if activeTabValue === "nft"}
          <TabNft /> -->
        {:else if activeTabValue === "alerts"}
          <TabAlerts />
        {:else if activeTabValue === "reports"}
          <TabReports />
        {:else if activeTabValue === "links"}
          <TabLinks />
          <!-- {:else if activeTabValue === "settings"}
          <TabSettings /> -->
        {/if}
      </div>
    </div>

    <div
      class="absolute xl:bottom-[-60px] bottom-[-40px] lg:left-[-120px] left-0 z-1"
    >
      <img src={wheelIcon} alt="" class="w-[70%] h-[70%] object-contain" />
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
