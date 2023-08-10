<script lang="ts">
  import { onMount } from "svelte";
  import { wallet, isOpenReport } from "~/store";
  import { isEmpty } from "lodash";
  import { Router, Route, createHistory } from "svelte-navigator";
  import * as browser from "webextension-polyfill";
  import createHashSource from "./hashHistory";
  import { Motion } from "svelte-motion";
  import { showChatAnimationVariants } from "~/utils";
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

  import Comment from "~/assets/comment-bubble-icon.svg";

  // TODO: Add Lazyload for each routes
  const hash = createHistory(createHashSource());

  const formatSelectedWallet = async () => {
    // const selectedWalletRes = await browser.storage.sync.get("selectedWallet");
    // if (
    //   selectedWalletRes.selectedWallet !== 0 &&
    //   !isEmpty(JSON.parse(selectedWalletRes.selectedWallet))
    // ) {
    //   const selectedWalletObject = JSON.parse(selectedWalletRes.selectedWallet);
    //   wallet.update((n) => (n = selectedWalletObject?.value || ""));
    // }
  };

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
</script>

<ErrorBoundary>
  <Mixpanel>
    <Router history={APP_TYPE.TYPE === "EXT" ? hash : undefined}>
      <div
        class={`"flex flex-col ${APP_TYPE.TYPE === "EXT" ? "pb-2" : "pb-14"}`}
      >
        <Header />

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

        {#if APP_TYPE.TYPE === "EXT"}
          <div class="sticky bottom-4 flex justify-end pr-4 z-50">
            <div
              class="p-4 w-[52px] h-[52px] rounded-full bg-[#27326F] cursor-pointer"
              style="box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.15);"
              on:click={() => {
                isOpenReport.update((n) => (n = !n));
              }}
            >
              <img src={Comment} alt="cmt" width="20" height="20" />
            </div>
            <Motion
              initial="hidden"
              animate={isShowChat ? "visible" : "hidden"}
              variants={showChatAnimationVariants}
              let:motion
            >
              <div
                class="h-[630px] w-[430px] absolute right-4 bottom-15 p-4 bg-white rounded-[20px] items-end"
                style="box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.1);"
                use:motion
              >
                <iframe
                  id="feedback-board"
                  src="https://nimbus.featurebase.app"
                  class="h-[580px] w-full"
                />
                <div
                  class="absolute top-3 right-5 cursor-pointer font-medium"
                  on:click={() => {
                    isOpenReport.update((n) => (n = false));
                  }}
                >
                  Close
                </div>
              </div>
            </Motion>
          </div>
        {/if}
      </div>
    </Router>
    <Footer />
  </Mixpanel>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
