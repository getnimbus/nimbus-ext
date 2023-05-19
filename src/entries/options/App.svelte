<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import "flowbite/dist/flowbite.css";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import SidebarTabs from "~/components/OptionUI/SidebarTabs.svelte";
  import TabWallets from "~/components/OptionUI/TabWallets.svelte";
  import TabDashboard from "~/components/OptionUI/TabDashboard.svelte";
  import TabHighlight from "~/components/OptionUI/TabHighlight.svelte";
  import TabNotification from "~/components/OptionUI/TabNotification.svelte";
  import TabSettings from "~/components/OptionUI/TabSettings.svelte";
  import TabNft from "~/components/OptionUI/TabNFT.svelte";

  let activeTabValue = "wallets";

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParams = urlParams.get("tab");
    activeTabValue = tabParams;
    window.history.replaceState(
      null,
      "",
      window.location.pathname + `?tab=${tabParams}`
    );
  });
</script>

<ErrorBoundary>
  <div class="max-w-[2000px] m-auto w-[100%] h-screen flex gap-1">
    <SidebarTabs bind:activeTabValue />
    <div class="flex-1 px-6 py-4">
      {#if activeTabValue === "wallets"}
        <TabWallets />
      {:else if activeTabValue === "nft"}
        <TabNft />
      {:else if activeTabValue === "dashboard"}
        <TabDashboard />
      {:else if activeTabValue === "highlight"}
        <TabHighlight />
      {:else if activeTabValue === "notification"}
        <TabNotification />
      {:else if activeTabValue === "settings"}
        <TabSettings />
      {/if}
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
