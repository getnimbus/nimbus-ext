<script lang="ts">
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
  // TODO: Add Lazyload for each routes

  const hash = createHistory(createHashSource());

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

      <Route path="market">
        <Market />
      </Route>

      <!-- <Route path="news">
        <News />
      </Route> -->

      <Route path="position-detail">
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
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
