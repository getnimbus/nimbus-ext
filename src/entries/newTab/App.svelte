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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: Infinity,
      },
    },
  });

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
  });
</script>

<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <Mixpanel>
      <Router history={undefined}>
        <div class="flex flex-col pb-14">
          <Header />

          <Route path="options">
            {#await import("~/layouts/Options.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load component
            {/await}
            <!-- <Options /> -->
          </Route>

          <Route path="upgrade">
            {#await import("~/layouts/Upgrade.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load component
            {/await}
          </Route>

          <Route path="payments/success">
            {#await import("~/layouts/PaymentSuccess.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load component
            {/await}
          </Route>

          <Route path="payments/fail">
            {#await import("~/layouts/PaymentFail.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load component
            {/await}
          </Route>

          <Route path="personal-token-breakdown">
            {#await import("~/layouts/PersonalTokenBreakdown.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load component
            {/await}
          </Route>

          <Route path="custom-virtual-portfolio">
            {#await import("~/layouts/CustomVirtualPortfolio.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load component
            {/await}
          </Route>

          <Route path="virtual-portfolio">
            {#await import("~/layouts/VirtualPortfolio.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load component
            {/await}
          </Route>

          <Route path="compare">
            {#await import("~/layouts/Compare.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
          </Route>

          <Route path="news">
            {#await import("~/layouts/News.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load component
            {/await}
          </Route>

          <Route path="invitation">
            {#await import("~/layouts/Invitation.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
            <!-- <Invitation /> -->
          </Route>

          <Route path="whales">
            {#await import("~/layouts/WhalesList.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
            <!-- <WhalesList /> -->
          </Route>

          <Route path="position-detail">
            {#await import("~/layouts/TokenDetail.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
            <!-- <TokenDetail /> -->
          </Route>

          <Route path="nft-detail">
            {#await import("~/layouts/NFTDetail.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
            <!-- <NftDetail /> -->
          </Route>

          <Route path="test-detail">
            {#await import("~/layouts/PositionDetail.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
            <!-- <PositionDetail /> -->
          </Route>

          <Route path="analytic">
            {#await import("~/layouts/Analytic.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
            <!-- <Analytic /> -->
          </Route>

          <Route path="transactions">
            {#await import("~/layouts/Transactions.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
            <!-- <Transactions /> -->
          </Route>

          <Route path="*">
            {#await import("~/layouts/Portfolio.svelte")}
              <loading-icon />
            {:then { default: component }}
              <svelte:component this={component} />
            {:catch error}
              Failed to load
            {/await}
            <!-- <Portfolio /> -->
          </Route>
        </div>
      </Router>
      <div class="footer">
        <Footer />
      </div>
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
    background: #080808;
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

  .zsiq_floatmain.siq_bR {
    bottom: 40px !important;
    right: 20px !important;
  }

  @media (max-width: 1280px) {
    .zsiq_floatmain,
    .fb-feedback-widget-feedback-button {
      display: block !important;
    }
  }

  @media (max-width: 1024px) {
    .zsiq_floatmain,
    .fb-feedback-widget-feedback-button {
      display: none !important;
    }
  }
</style>
