<script lang="ts">
  import { isOpenReport } from "~/store";
  import { Router, Route, createHistory } from "svelte-navigator";
  import * as browser from "webextension-polyfill";
  import createHashSource from "./hashHistory";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { selectedPackage } from "~/store";

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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

  // TODO: Add Lazyload for each routes
  const hash = createHistory(createHashSource());

  let isShowChat = false;
  isOpenReport.subscribe((value) => {
    isShowChat = value;
  });

  $: {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });
  }

  const getUserInfo = async () => {
    try {
      const response = await nimbus.get("/users/me");
      if (response && response.data) {
        if (
          response.data?.plan?.tier &&
          response.data?.plan?.tier.length !== 0
        ) {
          // selectedPackage.update(
          //   (n) => (n = response.data?.plan?.tier.toUpperCase())
          // );
        }
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  onMount(() => {
    getUserInfo();
  });
</script>

<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <Mixpanel>
      <Router history={undefined}>
        <div class="flex flex-col pb-14">
          <Header />

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
      </Router>
      <Footer />
    </Mixpanel>
  </QueryClientProvider>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
