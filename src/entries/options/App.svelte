<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import "flowbite/dist/flowbite.css";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { selectedPackage } from "~/store";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";
  import SidebarTabs from "~/UI/Option/SidebarTabs.svelte";
  import TabWallets from "~/UI/Option/TabWallets.svelte";
  import TabDashboard from "~/UI/Option/TabDashboard.svelte";
  import TabHighlight from "~/UI/Option/TabHighlight.svelte";
  import TabNotification from "~/UI/Option/TabNotification.svelte";
  import TabSettings from "~/UI/Option/TabSettings.svelte";
  import TabNft from "~/UI/Option/TabNFT.svelte";

  const queryClient = new QueryClient();

  let activeTabValue = "wallets";

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });

  onMount(() => {
    getUserInfo();
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

  const getUserInfo = async () => {
    try {
      const response = await nimbus.get("/users/me");
      if (response && response.data) {
        if (
          response.data?.plan?.tier &&
          response.data?.plan?.tier.length !== 0
        ) {
          selectedPackage.update(
            (n) => (n = response.data?.plan?.tier.toUpperCase())
          );
        }
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };
</script>

<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <Mixpanel>
      <div
        class="max-w-[2000px] m-auto w-[100%] h-screen flex gap-1 xl:flex-row flex-col"
      >
        <div class="bg-gray-50 xl:w-64 w-full">
          <SidebarTabs bind:activeTabValue />
        </div>
        <div class="flex-1 px-6 py-4">
          {#if activeTabValue === "wallets"}
            <TabWallets />
            <!-- {:else if activeTabValue === "nft"}
          <TabNft /> -->
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
    </Mixpanel>
  </QueryClientProvider>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
