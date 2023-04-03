<script lang="ts">
  import * as browser from "webextension-polyfill";
  import "flowbite/dist/flowbite.css";

  import SidebarTabs from "~/components/TabUI/SidebarTabs.svelte";
  import TabWallets from "~/components/TabUI/TabWallets.svelte";
  import TabDashboard from "~/components/TabUI/TabDashboard.svelte";
  import TabHighlight from "~/components/TabUI/TabHighlight.svelte";
  import TabNotification from "~/components/TabUI/TabNotification.svelte";
  import TabSettings from "~/components/TabUI/TabSettings.svelte";

  let activeTabValue;

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
    }
  });
</script>

<div class="max-w-[2000px] m-auto w-[100%] h-screen flex gap-1">
  <SidebarTabs bind:activeTabValue />
  <div class="flex-1 px-6 py-4">
    {#if activeTabValue === 1}
      <TabWallets />
    {:else if activeTabValue === 2}
      <TabDashboard />
    {:else if activeTabValue === 3}
      <TabHighlight />
    {:else if activeTabValue === 4}
      <TabNotification />
    {:else if activeTabValue === 5}
      <TabSettings />
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
