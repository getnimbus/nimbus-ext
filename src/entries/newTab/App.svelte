<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { onMount, onDestroy } from "svelte";
  import { Router } from "svelte-router-spa";
  import * as browser from "webextension-polyfill";
  import {
    detectParams,
    isDarkMode,
    isAutoDarkMode,
    tonConnector,
    user,
  } from "~/store";
  import { TonConnectUI } from "@tonconnect/ui";

  import "flowbite/dist/flowbite.css";

  import Mixpanel from "~/components/Mixpanel.svelte";
  import MobileIntroModalPWA from "~/UI/MobileIntroModalPWA/MobileIntroModalPWA.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import UpdateParams from "~/components/UpdateParams.svelte";
  import Header from "~/UI/Header/Header.svelte";
  import MobileHeaderTab from "~/UI/Header/MobileHeaderTab.svelte";
  import Footer from "~/UI/Footer/Footer.svelte";

  import Portfolio from "~/layouts/Portfolio.svelte";
  import Analytic from "~/layouts/Analytic.svelte";
  import Recap from "~/layouts/Recap.svelte";
  import Transactions from "~/layouts/Transactions.svelte";
  import WhalesList from "~/layouts/WhalesList.svelte";
  import News from "~/layouts/News.svelte";
  import Settings from "~/layouts/Settings.svelte";
  import Invitation from "~/layouts/Invitation.svelte";
  import Upgrade from "~/layouts/Upgrade.svelte";
  import PaymentSuccess from "~/layouts/PaymentSuccess.svelte";
  import PaymentFail from "~/layouts/PaymentFail.svelte";
  import PersonalTokenBreakdown from "~/layouts/PersonalTokenBreakdown.svelte";
  import CustomVirtualPortfolio from "~/layouts/CustomVirtualPortfolio.svelte";
  import VirtualPortfolio from "~/layouts/VirtualPortfolio.svelte";
  import Compare from "~/layouts/Compare.svelte";
  import Profile from "~/layouts/Profile.svelte";
  import DailyCheckin from "~/layouts/DailyCheckin.svelte";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    },
  });

  let isTouchDevice = false;

  $: {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });
  }

  const checkSystemTheme = (condition: boolean) => {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if ($isAutoDarkMode || condition) {
      if (isDark) {
        window.document.body.classList.add("dark");
        isDarkMode.update((n) => (n = true));
        localStorage.setItem("theme", "dark");
      } else {
        window.document.body.classList.remove("dark");
        isDarkMode.update((n) => (n = false));
        localStorage.setItem("theme", "light");
      }
    }
  };

  const interval = setInterval(checkSystemTheme, 60000);

  onMount(() => {
    if (localStorage.auto_theme === "true") {
      isAutoDarkMode.update((n) => (n = true));
      checkSystemTheme(true);
    } else {
      isAutoDarkMode.update((n) => (n = false));
      checkSystemTheme(false);
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

    // Check for touch device
    if ("ontouchstart" in window || navigator.maxTouchPoints) {
      isTouchDevice = true;
    }

    const introduce = localStorage.getItem("blockShowMobileIntro");
    if (introduce === "false" || introduce === null) {
      localStorage.setItem("blockShowMobileIntro", "false");
    }

    const tonInstance = new TonConnectUI({
      manifestUrl:
        "https://gist.githubusercontent.com/toannhu96/0f9cdecbfa668157a901c76f41ced0f0/raw/0b8e76d86ca3ce0a14db9315c4e03ba3b9caaa60/tonconnect-manifest.json",
    });
    tonConnector.update((n) => (n = tonInstance));
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  const routes = [
    {
      name: "/",
      layout: Portfolio,
    },
    {
      name: "/analytic",
      layout: Analytic,
    },
    {
      name: "/transactions",
      layout: Transactions,
    },
    {
      name: "/whales",
      layout: WhalesList,
    },
    {
      name: "/news",
      layout: News,
    },
    {
      name: "/settings",
      layout: Settings,
    },
    {
      name: "/invitation",
      layout: Invitation,
    },
    {
      name: "/upgrade",
      layout: Upgrade,
    },
    {
      name: "/payments/success",
      layout: PaymentSuccess,
    },
    {
      name: "/payments/fail",
      layout: PaymentFail,
    },
    {
      name: "/personal-token-breakdown",
      layout: PersonalTokenBreakdown,
    },
    {
      name: "/custom-virtual-portfolio",
      layout: CustomVirtualPortfolio,
    },
    {
      name: "/virtual-portfolio",
      layout: VirtualPortfolio,
    },
    {
      name: "/compare",
      layout: Compare,
    },
    {
      name: "/profile",
      layout: Profile,
    },
    {
      name: "/daily-checkin",
      layout: DailyCheckin,
    },
  ];

  const recapRoutes = [
    {
      name: "/recap",
      layout: Recap,
    },
  ];

  $: navActive = $detectParams !== "/" ? $detectParams : "/portfolio";

  const handleUpdateNavActive = (value: string) => {
    navActive = value;
  };
</script>

<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <UpdateParams />
    {#if $detectParams && $detectParams === "/recap"}
      <Router routes={recapRoutes} options={{ gaPageviews: true }} />
    {:else}
      <div
        class={`flex flex-col xl:pb-14 ${$user && Object.keys($user).length !== 0 ? "pb-34" : "pb-64"}`}
      >
        <Header {navActive} {handleUpdateNavActive} />
        <Router {routes} options={{ gaPageviews: true }} />
      </div>

      <div class="fixed bottom-0 left-0 z-7 w-full footer xl:relative">
        <div class="hidden xl:block">
          <Footer />
        </div>
        <div class="block xl:hidden">
          <MobileHeaderTab {navActive} {handleUpdateNavActive} />
        </div>
      </div>
      <!-- {#if isTouchDevice}
        <MobileIntroModalPWA />
      {/if} -->
    {/if}
  </QueryClientProvider>
</ErrorBoundary>

<style global windi:preflights:global windi:safelist:global>
  :root {
    --onboard-modal-z-index: 2147483648;
  }

  :global(body) {
    background: #fff;
    color: black;
    transition: background-color 0.3s;
  }
  :global(body.dark) {
    background-color: #161616;
    color: #fff;
  }

  :global(body) .footer {
    background: #fff;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 40px;
  }
  :global(body.dark) .footer {
    background: #202020;
    box-shadow: rgba(0, 0, 0, 1) 0px 0px 5px;
  }

  :global(body) .bg_f4f5f8 {
    background: #f4f5f8;
  }
  :global(body.dark) .bg_f4f5f8 {
    background: #131313;
  }

  :global(body) .bg_fafafbff {
    background: #fafafbff;
  }
  :global(body.dark) .bg_fafafbff {
    background: #212121;
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

  @media (max-width: 1024px) {
    #mava {
      display: none !important;
    }

    .fb-feedback-widget-feedback-button-container {
      display: none !important;
    }
  }

  :global(body) .driver-popover {
    /* border-radius: 10px; */
    border-radius: 12px;
    padding: 18px 26px 18px 26px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  :global(body) .driver-popover-prev-btn,
  :global(body) .driver-popover-next-btn {
    border-radius: 12px;
    padding: 8px 16px 8px 16px;
    background-color: #1e96fc;
    color: white;
    text-shadow: none;
    border: none;
  }

  :global(body) .driver-popover-prev-btn:hover,
  :global(body) .driver-popover-next-btn:hover {
    background-color: #4fadfd;
  }

  :global(body) .driver-popover-footer {
    gap: 25px;
  }

  :global(body) .driver-popover-close-btn {
    width: 30px;
    height: 30px;
    font-size: 25px;
    color: #6b7280;
  }
</style>
