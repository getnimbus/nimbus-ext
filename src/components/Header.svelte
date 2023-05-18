<script lang="ts">
  import { Link } from "svelte-navigator";
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";

  import { i18n } from "~/lib/i18n";

  import Auth from "~/components/Auth.svelte";

  import Logo from "~/assets/logo-white.svg";
  import PortfolioIcon from "~/assets/portfolio.svg";
  import MarketIcon from "~/assets/market.svg";
  import NewsIcon from "~/assets/news.svg";
  import AnalyticIcon from "~/assets/analytic.svg";
  import TransactionsIcon from "~/assets/transactions.svg";
  import SettingsIcon from "~/assets/settings.svg";

  import Search from "~/assets/search.svg";
  import Bell from "~/assets/bell.svg";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytic: i18n("newtabPage.analytic", "Analytic"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    market: i18n("newtabPage.market", "Market"),
    settings: i18n("newtabPage.settings", "Settings"),
    overview: i18n("newtabPage.overview", "Overview"),
    empty_wallet: i18n("newtabPage.empty-wallet", "No wallet added yet."),
    Balance: i18n("newtabPage.Balance", "Balance"),
    Ratio: i18n("newtabPage.Ratio", "Ratio"),
    Value: i18n("newtabPage.Value", "Value"),
    data_updated: i18n("newtabPage.data-updated", "Data updated"),
    updating_data: i18n("newtabPage.updating-data", "Updating data"),
    search_placeholder: i18n("newtabPage.search-placeholder", "Search"),
    missed_protocol: i18n(
      "newtabPage.missed-protocol",
      "Missing your protocol?"
    ),
    content: {
      btn_text: i18n(
        "optionsPage.accounts-page-content.address-btn-text",
        "Add Wallet"
      ),
      modal_cancel: i18n(
        "optionsPage.accounts-page-content.modal-cancel",
        "Cancel"
      ),
      modal_add: i18n(
        "optionsPage.accounts-page-content.modal-add-wallet",
        "Add"
      ),
      modal_address_label: i18n(
        "optionsPage.accounts-page-content.modal-address-label",
        "Wallet"
      ),
      modal_label_label: i18n(
        "optionsPage.accounts-page-content.modal-label-label",
        "Label"
      ),
      modal_add_title: i18n(
        "optionsPage.accounts-page-content.modal-add-title",
        "Add Your Wallet"
      ),
      modal_add_sub_title: i18n(
        "optionsPage.accounts-page-content.modal-add-sub-title",
        "Add your wallet will give you more option to see the information at page new tab"
      ),
      address_required: i18n(
        "optionsPage.accounts-page-content.address-required",
        "Address is required"
      ),
      label_required: i18n(
        "optionsPage.accounts-page-content.label-required",
        "Label is required"
      ),
      re_input_address: i18n(
        "optionsPage.accounts-page-content.re-input-address",
        "Please enter your wallet address again!"
      ),
      duplicate_address: i18n(
        "optionsPage.accounts-page-content.duplicate-address",
        "This wallet address is duplicated!"
      ),
    },
  };

  export let selectedWallet;

  let headerScrollY = false;
  let showTooltipAnalytic = false;
  let showTooltipTransactions = false;
  let timerDebounce;
  let search = "";
  let navActive = "portfolio";

  onMount(() => {
    browser.storage.onChanged.addListener((changes) => {
      if (changes?.options?.newValue?.lang) {
        window.location.reload();
      }
    });

    const lastScrollY = window.pageYOffset;
    const handleCheckIsSticky = () => {
      const scrollY = window.pageYOffset;
      headerScrollY = scrollY > lastScrollY;
    };
    window.addEventListener("scroll", handleCheckIsSticky);
    return () => {
      window.removeEventListener("scroll", handleCheckIsSticky);
    };
  });

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      search = value;
    }, 500);
  };

  $: {
    switch (window.location.pathname.substring(1)) {
      case "market":
        navActive = "market";
        break;
      case "news":
        navActive = "news";
        break;
      case "analytic":
        navActive = "analytic";
        break;
      case "transactions":
        navActive = "transactions";
        break;
      default:
        navActive = "portfolio";
    }
  }
</script>

<div
  class="border-header py-1 top-0 bg-[#27326F] sticky"
  style="z-index: 2147483647; {headerScrollY
    ? 'box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);'
    : ''}"
>
  <div class="flex justify-between items-center max-w-[2000px] m-auto w-[90%]">
    <a href="/">
      <img
        src={Logo}
        alt="logo"
        class="-ml-8 xl:w-[177px] xl:h-[60px] w-[167px] h-[50px]"
      />
    </a>
    <div class="flex items-center gap-1">
      <Link to="/">
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "portfolio"}
          on:click={() => (navActive = "portfolio")}
        >
          <img src={PortfolioIcon} alt="" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.portfolio}
          </span>
        </div>
      </Link>

      <Link to="market">
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "market"}
          on:click={() => (navActive = "market")}
        >
          <img src={MarketIcon} alt="" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.market}
          </span>
        </div>
      </Link>

      <!-- <Link to="news">
        <div
          class="flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all"
          class:bg-[#525B8C]={navActive === "news"}
          on:click={() => (navActive = "news")}
        >
          <img src={NewsIcon} alt="" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.news}
          </span>
        </div>
      </Link> -->

      <Link to="analytic">
        <div class="relative">
          <div
            class="flex items-center xl:gap-3 gap-1 py-2 xl:px-4 px-2 rounded-[1000px] transition-all cursor-default"
            class:bg-[#525B8C]={navActive === "analytic"}
            on:click={() => {
              navActive = "analytic";
            }}
            on:mouseenter={() => (showTooltipAnalytic = true)}
            on:mouseleave={() => (showTooltipAnalytic = false)}
          >
            <img src={AnalyticIcon} alt="" />
            <span class="text-[#6B7280] font-semibold xl:text-base text-sm">
              {MultipleLang.analytic}
            </span>
          </div>
          {#if showTooltipAnalytic}
            <div
              class="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
              style="z-index: 2147483648;"
            >
              <tooltip-detail text={"Soon"} />
            </div>
          {/if}
        </div>
      </Link>

      <Link to="transactions">
        <div class="relative">
          <div
            class="flex items-center xl:gap-3 gap-1 py-2 xl:px-4 px-2 rounded-[1000px] transition-all cursor-default"
            class:bg-[#525B8C]={navActive === "transactions"}
            on:click={() => {
              navActive = "transactions";
            }}
            on:mouseenter={() => (showTooltipTransactions = true)}
            on:mouseleave={() => (showTooltipTransactions = false)}
          >
            <img src={TransactionsIcon} alt="" />
            <span class="text-[#6B7280] font-semibold xl:text-base text-sm">
              {MultipleLang.transactions}
            </span>
          </div>
          {#if showTooltipTransactions}
            <div
              class="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
              style="z-index: 2147483648;"
            >
              <tooltip-detail text={"Soon"} />
            </div>
          {/if}
        </div>
      </Link>

      {#if APP_TYPE.TYPE === "EXT"}
        <div
          class={`flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all`}
          on:click={() => {
            browser.tabs.create({ url: "src/entries/options/index.html" });
          }}
        >
          <img src={SettingsIcon} alt="" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.settings}
          </span>
        </div>
      {:else}
        <a
          class={`flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all`}
          href="/entries/options/index.html"
          target="_blank"
        >
          <img src={SettingsIcon} alt="" />
          <span class="text-white font-semibold xl:text-base text-sm">
            {MultipleLang.settings}
          </span>
        </a>
      {/if}
    </div>
    <div class="flex justify-between items-center xl:gap-3 gap-2">
      <div
        class="bg-[#525B8C] xl:pl-4 pl-3 flex items-center gap-1 rounded-[1000px]"
      >
        <img src={Search} alt="" />
        <input
          on:keyup={({ target: { value } }) => debounceSearch(value)}
          on:blur={() => {
            if (search) {
              window.history.replaceState(
                null,
                "",
                window.location.pathname + `?address=${search}`
              );
              selectedWallet = {
                ...selectedWallet,
                value: search,
              };
            }
          }}
          on:keydown={(event) => {
            if (search && (event.which == 13 || event.keyCode == 13)) {
              window.history.replaceState(
                null,
                "",
                window.location.pathname + `?address=${search}`
              );
              selectedWallet = {
                ...selectedWallet,
                value: search,
              };
            }
          }}
          value={search}
          placeholder={MultipleLang.search_placeholder}
          type="text"
          class="bg-[#525B8C] w-full py-2 xl:pr-4 pr-2 rounded-r-[1000px] text-[#ffffff80] placeholder-[#ffffff80] border-none focus:outline-none focus:ring-0"
        />
      </div>
      <div
        class="bg-[#525B8C] rounded-full flex justify-center items-center w-10 h-10"
      >
        <img src={Bell} alt="" />
      </div>
      <!-- <Auth /> -->
    </div>
  </div>
</div>

<style>
</style>
