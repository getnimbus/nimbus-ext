<script lang="ts">
  import { Router, Route } from "svelte-navigator";

  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Header from "~/components/Header.svelte";
  import Market from "~/components/NewTabUI/Market.svelte";
  import Portfolio from "~/components/NewTabUI/Portfolio.svelte";
  import News from "~/components/NewTabUI/News.svelte";
  import Analytic from "~/components/NewTabUI/Analytic.svelte";
  import Transactions from "~/components/NewTabUI/Transactions.svelte";

  let selectedWallet;
</script>

<ErrorBoundary>
  <Router>
    <div class="flex flex-col pb-10">
      <Header bind:selectedWallet />

      <Route
        path={`${
          APP_TYPE.TYPE === "EXT" ? "src/entries/newTab/index.html" : "/"
        }`}
      >
        <Portfolio bind:selectedWallet />
      </Route>

      <Route path="market">
        <Market />
      </Route>

      <!-- <Route path="news">
        <News />
      </Route> -->

      <Route path="analytic">
        <Analytic />
      </Route>

      <Route path="transactions">
        <Transactions />
      </Route>
    </div>
  </Router>
</ErrorBoundary>

<style></style>
