<script lang="ts">
  import { Router, Route, createHistory } from "svelte-navigator";
  import * as browser from "webextension-polyfill";
  import createHashSource from "./hashHistory";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { onMount } from "svelte";
  import { isDarkMode } from "~/store";
  import * as Sentry from "@sentry/svelte";

  import "flowbite/dist/flowbite.css";

  import Header from "~/components/Header.svelte";
  import Footer from "~/components/Footer.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";
  import WhalesList from "~/layouts/WhalesList.svelte";
  import Portfolio from "~/layouts/Portfolio.svelte";
  import News from "~/layouts/News.svelte";
  import Analytic from "~/layouts/Analytic.svelte";
  import Transactions from "~/layouts/Transactions.svelte";
  import TokenDetail from "~/layouts/TokenDetail.svelte";
  import NftDetail from "~/layouts/NFTDetail.svelte";
  import PositionDetail from "~/layouts/PositionDetail.svelte";
  import PersonalTokenBreakdown from "~/layouts/PersonalTokenBreakdown.svelte";
  import CustomVirtualPortfolio from "~/layouts/CustomVirtualPortfolio.svelte";
  import VirtualPortfolio from "~/layouts/VirtualPortfolio.svelte";
  import Compare from "~/layouts/Compare.svelte";
  import Invitation from "~/layouts/Invitation.svelte";
  import PaymentSuccess from "~/layouts/PaymentSuccess.svelte";
  import PaymentFail from "~/layouts/PaymentFail.svelte";
  import Upgrade from "~/layouts/Upgrade.svelte";
  import Options from "~/layouts/Options.svelte";
  import MobileHeaderTab from "~/components/MobileHeaderTab.svelte";

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
        <div class="flex flex-col xl:pb-14 pb-40">
          <Header />

          <Route path="options">
            <Options />
          </Route>

          <Route path="upgrade">
            <Upgrade />
          </Route>

          <Route path="payments/success">
            <PaymentSuccess />
          </Route>

          <Route path="payments/fail">
            <PaymentFail />
          </Route>

          <Route path="personal-token-breakdown">
            <PersonalTokenBreakdown />
          </Route>

          <Route path="custom-virtual-portfolio">
            <CustomVirtualPortfolio />
          </Route>

          <Route path="virtual-portfolio">
            <VirtualPortfolio />
          </Route>

          <Route path="compare">
            <Compare />
          </Route>

          <Route path="news">
            <News />
          </Route>

          <Route path="invitation">
            <Invitation />
          </Route>

          <Route path="whales">
            <WhalesList />
          </Route>

          <Route path="position-detail">
            <TokenDetail />
          </Route>

          <Route path="nft-detail">
            <NftDetail />
          </Route>

          <Route path="test-detail">
            <PositionDetail />
          </Route>

          <Route path="analytic">
            <Analytic />
          </Route>

          <Route path="transactions">
            <Transactions />
          </Route>

          <Route path="*">
            <Portfolio />
          </Route>
        </div>
        <div class="footer xl:relative fixed bottom-0 left-0 z-30 w-full">
          <div class="xl:block hidden">
            <Footer />
          </div>
          <div class="xl:hidden block">
            <MobileHeaderTab />
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
