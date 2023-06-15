<script lang="ts">
  import { onMount } from "svelte";
  import { wallet } from "~/store";
  import { isEmpty } from "lodash";
  import { Router, Route, createHistory } from "svelte-navigator";
  import * as browser from "webextension-polyfill";
  import createHashSource from "./hashHistory";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Header from "~/components/Header.svelte";
  import Market from "~/components/NewTabUI/Market.svelte";
  import Portfolio from "~/components/NewTabUI/Portfolio.svelte";
  import News from "~/components/NewTabUI/News.svelte";
  import Analytic from "~/components/NewTabUI/Analytic.svelte";
  import Transactions from "~/components/NewTabUI/Transactions.svelte";
  import PositionDetail from "~/components/NewTabUI/PositionDetail.svelte";
  import NftDetail from "~/components/NewTabUI/NFTDetail.svelte";
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
        <PositionDetail />
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
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
