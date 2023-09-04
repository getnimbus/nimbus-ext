<script lang="ts">
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import "flowbite/dist/flowbite.css";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { selectedPackage, isDarkMode, user } from "~/store";
  import { Router, Route, createHistory } from "svelte-navigator";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";
  import SidebarTabs from "~/UI/Option/SidebarTabs.svelte";
  import TabWallets from "~/UI/Option/TabWallets.svelte";
  import TabDashboard from "~/UI/Option/TabDashboard.svelte";
  import TabHighlight from "~/UI/Option/TabHighlight.svelte";
  import TabNotification from "~/UI/Option/TabNotification.svelte";
  import TabSettings from "~/UI/Option/TabSettings.svelte";
  import TabNft from "~/UI/Option/TabNFT.svelte";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    },
  });

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let activeTabValue = "wallets";

  browser.storage.onChanged.addListener((changes) => {
    if (changes?.options?.newValue?.lang) {
      window.location.reload();
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
            // (n) => (n = response.data?.plan?.tier.toUpperCase())
            () => "PROFESSIONAL" // TODO: Remove me after integration complete
          );
        }
      } else {
        selectedPackage.update(
          () => "PROFESSIONAL" // TODO: Remove me after integration complete
        );
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  onMount(() => {
    if (userInfo && Object.keys(userInfo).length !== 0) {
      getUserInfo();
    }
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

    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      window.document.body.classList.add("dark");
      isDarkMode.update((n) => (n = true));
    } else {
      window.document.body.classList.remove("dark");
      isDarkMode.update((n) => (n = false));
    }
  });
</script>

<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <Mixpanel>
      <Router history={undefined}>
        <div
          class="max-w-[2000px] m-auto w-[100%] h-screen flex gap-1 xl:flex-row flex-col"
        >
          <div
            class={`xl:w-64 w-full px-4 py-3 ${
              darkMode ? "bg-[#080808]" : "bg-gray-50"
            }`}
          >
            <SidebarTabs bind:activeTabValue {darkMode} />
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
      </Router>
    </Mixpanel>
  </QueryClientProvider>
</ErrorBoundary>

<style global windi:preflights:global windi:safelist:global>
  :global(body) {
    background: #fff;
    color: black;
    transition: background-color 0.3s;
  }
  :global(body.dark) {
    background: #161616;
    color: #fff;
  }

  :global(body) .footer {
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 40px;
  }
  :global(body.dark) .footer {
    background: #080808;
    box-shadow: rgba(0, 0, 0, 1) 0px 0px 5px;
  }

  :global(body) .bg_f4f5f8 {
    background: #f4f5f8;
  }
  :global(body.dark) .bg_f4f5f8 {
    background: #000;
  }

  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #00000033;
  }

  :global(body) .text_00000080 {
    color: #00000080;
  }
  :global(body.dark) .text_00000080 {
    color: #d1d5db;
  }

  :global(body) .text_27326F {
    color: #27326f;
  }
  :global(body.dark) .text_27326F {
    color: #3b82f6;
  }

  :global(body) .text_00000099 {
    color: #00000099;
  }
  :global(body.dark) .text_00000099 {
    color: #ccc;
  }

  :global(body) .text_00000066 {
    color: #00000099;
  }
  :global(body.dark) .text_00000066 {
    color: #cdcdcd;
  }

  :global(body) .border_0000001a {
    border-color: #0000001a;
  }
  :global(body.dark) .border_0000001a {
    border-color: #cdcdcd59;
  }

  :global(body) .border_0000000d {
    border-color: #0000000d;
  }
  :global(body.dark) .border_0000000d {
    border-color: #cdcdcd26;
  }
</style>
