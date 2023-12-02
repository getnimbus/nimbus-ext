<script lang="ts">
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { onMount } from "svelte";
  import { Route, Router } from "svelte-navigator";
  import * as browser from "webextension-polyfill";
  import { isDarkMode } from "~/store";

  import "flowbite/dist/flowbite.css";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Footer from "~/components/Footer.svelte";
  import Header from "~/components/Header.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";
  import MobileHeaderTab from "~/components/MobileHeaderTab.svelte";
  import Loading from "~/components/Loading.svelte";
  import MobileAppIntroduce from "~/components/MobileAppIntroduce.svelte";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    },
  });

  let isTouchDevice = false;

  // TODO: Add Lazyload for each routes
  // const hash = createHistory(createHashSource());

  $: {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });
  }

  onMount(() => {
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
  });
</script>

<svelte:head>
  <script src="https://terminal.jup.ag/main-v1.js" data-preload></script>
</svelte:head>

<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <Mixpanel>
      <Router history={undefined}>
        <div class="flex flex-col pb-40 xl:pb-14">
          <Header />

          <!-- Main page -->
          <Route path="*">
            {#await import("~/layouts/Portfolio.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="analytic">
            {#await import("~/layouts/Analytic.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="transactions">
            {#await import("~/layouts/Transactions.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="whales">
            {#await import("~/layouts/WhalesList.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="news">
            {#await import("~/layouts/News.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <!-- Other page -->
          <Route path="settings">
            {#await import("~/layouts/Settings.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="invitation">
            {#await import("~/layouts/Invitation.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="upgrade">
            {#await import("~/layouts/Upgrade.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="payments/success">
            {#await import("~/layouts/PaymentSuccess.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="payments/fail">
            {#await import("~/layouts/PaymentFail.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="performance-summary">
            {#await import("~/layouts/PerformanceSummary.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="personal-token-breakdown">
            {#await import("~/layouts/PersonalTokenBreakdown.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="custom-virtual-portfolio">
            {#await import("~/layouts/CustomVirtualPortfolio.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="virtual-portfolio">
            {#await import("~/layouts/VirtualPortfolio.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="compare">
            {#await import("~/layouts/Compare.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="profile">
            {#await import("~/layouts/Profile.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>

          <Route path="daily-checkin">
            {#await import("~/layouts/DailyCheckin.svelte")}
              <div class="flex items-center justify-center h-screen">
                <Loading />
              </div>
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              <div class="flex items-center justify-center h-screen">
                Something when wrong! Please reload your browser to try again
              </div>
            {/await}
          </Route>
        </div>
        <div class="fixed bottom-0 left-0 z-20 w-full footer xl:relative">
          <div class="hidden xl:block">
            <Footer />
          </div>
          <div class="block xl:hidden">
            <MobileHeaderTab />
          </div>
        </div>
        {#if isTouchDevice}
          <MobileAppIntroduce />
        {/if}
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
