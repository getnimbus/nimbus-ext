<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import { isDarkMode } from "~/store";
  import { i18n } from "~/lib/i18n";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";
  import SidebarTabs from "~/UI/Option/SidebarTabs.svelte";
  import TabAccounts from "~/UI/Option/TabAccounts.svelte";
  import TabReports from "~/UI/Option/TabReports.svelte";
  import TabAlerts from "~/UI/Option/TabAlerts.svelte";
  import TabSettings from "~/UI/Option/TabSettings.svelte";
  import TabNotification from "~/UI/Option/TabNotification.svelte";
  import TabNft from "~/UI/Option/TabNFT.svelte";

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
    // {
    //   label: i18n("optionsPage.tab-title-nft", "NFT"),
    //   value: "nft",
    //   type: "NFT",
    // },
    // {
    //   label: i18n("optionsPage.tab-title-notification", "Notification"),
    //   value: "notification",
    //   type: "Notification",
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
      activeTabValue = "settings";
      window.history.replaceState(
        null,
        "",
        window.location.pathname + `?tab=settings`
      );
    }
  });
</script>

<ErrorBoundary>
  <Mixpanel>
    <div
      class="max-w-[2000px] xl:min-h-screen m-auto xl:w-[90%] w-[90%] py-8 grid xl:grid-cols-6 grid-cols-1 gap-6"
    >
      <div class="col-span-1">
        <SidebarTabs bind:activeTabValue darkMode={$isDarkMode} {listSideBar} />
      </div>
      <div class="xl:col-span-5 col-span-1">
        {#if activeTabValue === "accounts"}
          <TabAccounts />
          <!-- {:else if activeTabValue === "nft"}
          <TabNft />
        {:else if activeTabValue === "notification"}
          <TabNotification /> -->
        {:else if activeTabValue === "alerts"}
          <TabAlerts />
        {:else if activeTabValue === "reports"}
          <TabReports />
          <!-- {:else if activeTabValue === "settings"}
          <TabSettings /> -->
        {/if}
      </div>
    </div>
  </Mixpanel>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
