<script lang="ts">
  import { onMount } from "svelte";
  import { wallet } from "~/store";
  import { isEmpty } from "lodash";
  import { Router, Route, createHistory } from "svelte-navigator";
  import * as browser from "webextension-polyfill";
  import createHashSource from "./hashHistory";

  import Header from "~/components/Header.svelte";
  import Footer from "~/components/Footer.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Mixpanel from "~/components/Mixpanel.svelte";
  import Market from "~/layouts/Market.svelte";
  import Portfolio from "~/layouts/Portfolio.svelte";
  import News from "~/layouts/News.svelte";
  import Analytic from "~/layouts/Analytic.svelte";
  import Transactions from "~/layouts/Transactions.svelte";
  import TokenDetail from "~/layouts/TokenDetail.svelte";
  import NftDetail from "~/layouts/NFTDetail.svelte";

  // TODO: Add Lazyload for each routes
  const hash = createHistory(createHashSource());

  const formatSelectedWallet = async () => {
    const selectedWalletRes = await browser.storage.sync.get("selectedWallet");

    if (
      selectedWalletRes.selectedWallet !== 0 &&
      !isEmpty(JSON.parse(selectedWalletRes.selectedWallet))
    ) {
      const selectedWalletObject = JSON.parse(selectedWalletRes.selectedWallet);
      wallet.update((n) => (n = selectedWalletObject?.value || ""));
    }
  };

  onMount(() => {
    formatSelectedWallet();
  });

  $: {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });
  }
</script>

<ErrorBoundary>
  <Mixpanel>
    <Router history={APP_TYPE.TYPE === "EXT" ? hash : undefined}>
      <div class="flex flex-col pb-10">
        <Header />

        <Route path="news">
          <News />
        </Route>

        <Route path="market">
          <Market />
        </Route>

        <Route path="position-detail">
          <TokenDetail />
        </Route>

        <Route path="nft-detail">
          <NftDetail />
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
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
