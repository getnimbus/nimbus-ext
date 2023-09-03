<script lang="ts">
  import { Link, useMatch, useNavigate } from "svelte-navigator";
  import * as browser from "webextension-polyfill";
  import { getAddressContext } from "~/utils";
  import { i18n } from "~/lib/i18n";
  import { chain, wallet, selectedPackage, isDarkMode, user } from "~/store";
  import mixpanel from "mixpanel-browser";
  import { Motion } from "svelte-motion";
  import { showChangeLogAnimationVariants } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import Auth from "~/UI/Auth/Auth.svelte";
  import AuthEvm from "~/UI/Auth/AuthEVM.svelte";

  import Logo from "~/assets/logo-white.svg";
  import PortfolioIcon from "~/assets/portfolio.svg";
  import MarketIcon from "~/assets/market.svg";
  import WhaleIcon from "~/assets/whale.svg";
  import NewsIcon from "~/assets/news.svg";
  import AnalyticIcon from "~/assets/analytic.svg";
  import TransactionsIcon from "~/assets/transactions.svg";
  import SettingsIcon from "~/assets/settings.svg";
  import ChangeLogIcon from "~/assets/change-log.svg";
  import Search from "~/assets/search.svg";
  import Bell from "~/assets/bell.svg";
  import Crown from "~/assets/crown.svg";
  import MenuBar from "~/assets/menu-bar.svg";
  import Close from "~/assets/close-menu-bar.svg";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytics: i18n("newtabPage.analytics", "Analytics"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    whales: i18n("newtabPage.whales", "Whales"),
    search_placeholder: i18n("newtabPage.search-placeholder", "Search address"),
  };

  const navigate = useNavigate();

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let selectedWallet;
  wallet.subscribe((value) => {
    selectedWallet = value;
  });

  let timerDebounce;
  let search = "";
  let isShowHeaderMobile = false;

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      search = value;
    }, 300);
  };

  const absoluteMatch = useMatch("/:page");

  const queryClient = useQueryClient();
  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
    },
  });

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  $: {
    if (!$queryUserInfo.isError && $queryUserInfo.data !== undefined) {
      if (
        $queryUserInfo.data?.plan?.tier &&
        $queryUserInfo.data?.plan?.tier.length !== 0
      ) {
        selectedPackage.update(
          // (n) => (n = $queryUserInfo.data?.plan?.tier.toUpperCase())
          () => "PROFESSIONAL" // TODO: Remove me after integration complete
        );
      }
    }
  }

  $: navActive = $absoluteMatch ? $absoluteMatch.params.page : "portfolio";
</script>

<div class="mobile-header-container py-1 border-b-[1px] border-[#ffffff1a]">
  <div class="flex justify-between items-center max-w-[2000px] m-auto w-[90%]">
    <Link to="/">
      <img
        src={Logo}
        alt="logo"
        class="-ml-8 xl:w-[177px] w-[197px] xl:h-[60px] h-[80px]"
      />
    </Link>

    <div class="items-center hidden gap-1 xl:flex">
      <Link to="/">
        <div
          class={`flex items-center gap-2 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:opacity-100 transition-all ${
            darkMode
              ? navActive === "portfolio"
                ? "bg-[#212121] opacity-100"
                : "opacity-70 hover:bg-[#212121]"
              : navActive === "portfolio"
              ? "bg-[#525B8C] opacity-100"
              : "opacity-70 hover:bg-[#525B8C]"
          }`}
          on:click={() => {
            navActive = "portfolio";
            queryClient.invalidateQueries(["users-me"]);
          }}
        >
          <img src={PortfolioIcon} alt="" width="20" height="20" />
          <span class="text-sm font-medium text-white xl:text-base">
            {MultipleLang.portfolio}
          </span>
        </div>
      </Link>

      <Link
        to={`${
          userInfo && Object.keys(userInfo).length !== 0 ? "analytic" : "/"
        }`}
      >
        <div
          class={`flex items-center gap-2 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "analytic"
                ? "bg-[#212121] opacity-100"
                : "opacity-70 hover:bg-[#212121]"
              : navActive === "analytic"
              ? "bg-[#525B8C] opacity-100"
              : "opacity-70 hover:bg-[#525B8C]"
          }
          `}
          on:click={() => {
            if (userInfo && Object.keys(userInfo).length !== 0) {
              navActive = "analytic";
              queryClient.invalidateQueries(["users-me"]);
            }
          }}
        >
          <img src={AnalyticIcon} alt="" width="20" height="20" />
          <span class="flex gap-[1px]">
            <span class="text-sm font-medium text-white xl:text-base">
              {MultipleLang.analytics}
            </span>
            <span class="flex items-center gap-[1px] -mt-2">
              <img src={Crown} alt="" width="13" height="12" />
              <span class="text-xs font-medium text-[#FFB800] -mt-[1px]"
                >Pro</span
              >
            </span>
          </span>
        </div>
      </Link>

      <Link
        to={`${
          userInfo && Object.keys(userInfo).length !== 0 ? "transactions" : "/"
        }`}
      >
        <div
          class={`flex items-center gap-2 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "transactions"
                ? "bg-[#212121] opacity-100"
                : "opacity-70 hover:bg-[#212121]"
              : navActive === "transactions"
              ? "bg-[#525B8C] opacity-100"
              : "opacity-70 hover:bg-[#525B8C]"
          }
          `}
          on:click={() => {
            if (userInfo && Object.keys(userInfo).length !== 0) {
              navActive = "transactions";
              chain.update((n) => (n = "ETH"));
              queryClient.invalidateQueries(["users-me"]);
            }
          }}
        >
          <img src={TransactionsIcon} alt="" width="20" height="20" />
          <span class="text-sm font-medium text-white xl:text-base">
            {MultipleLang.transactions}
          </span>
        </div>
      </Link>

      <Link to="whales">
        <div
          class={`flex items-center gap-2 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "whales"
                ? "bg-[#212121] opacity-100"
                : "opacity-70 hover:bg-[#212121]"
              : navActive === "whales"
              ? "bg-[#525B8C] opacity-100"
              : "opacity-70 hover:bg-[#525B8C]"
          }
          `}
          on:click={() => {
            navActive = "whales";
            queryClient.invalidateQueries(["users-me"]);
          }}
        >
          <img src={WhaleIcon} alt="" width="20" height="20" />
          <span class="text-sm font-medium text-white xl:text-base">
            {MultipleLang.whales}
          </span>
        </div>
      </Link>

      <Link to="news">
        <div
          class={`flex items-center gap-2 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "news"
                ? "bg-[#212121] opacity-100"
                : "opacity-70 hover:bg-[#212121]"
              : navActive === "news"
              ? "bg-[#525B8C] opacity-100"
              : "opacity-70 hover:bg-[#525B8C]"
          }
          `}
          on:click={() => {
            navActive = "news";
            queryClient.invalidateQueries(["users-me"]);
          }}
        >
          <img src={NewsIcon} alt="" width="20" height="20" />
          <span class="text-sm font-medium text-white xl:text-base">
            {MultipleLang.news}
          </span>
        </div>
      </Link>
    </div>

    <div class="flex items-center justify-between gap-6 xl:gap-3">
      <div
        class={`xl:pl-4 pl-3 flex items-center rounded-[1000px] ${
          darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
        }`}
      >
        <img src={Search} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
        <input
          on:keyup={({ target: { value } }) => debounceSearch(value)}
          on:keydown={(event) => {
            if (
              search.length !== 0 &&
              (event.which == 13 || event.keyCode == 13)
            ) {
              mixpanel.track("user_search");
              chain.update((n) => (n = "ALL"));
              wallet.update((n) => (n = search));
              if (getAddressContext(search)?.type === "EVM") {
                navigate(`/?type=DEX&chain=ALL&address=${search}`);
              }
              if (getAddressContext(selectedWallet)?.type === "BTC") {
                navigate(`/?type=DEX&address=${selectedWallet}`);
              }
            }
          }}
          value={search}
          placeholder={MultipleLang.search_placeholder}
          type="text"
          class={`xl:w-full w-[400px] xl:py-2 py-3 rounded-r-[1000px] text-[#ffffff80] xl:text-sm text-xl placeholder-[#ffffff80] border-none focus:outline-none focus:ring-0 ${
            darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
          }`}
        />
      </div>

      <div class="xl:w-10 xl:h-10 w-12 h-12 relative xl:block hidden">
        <div
          class={`rounded-full flex justify-center items-center w-full h-full ${
            darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
          }`}
        >
          <img src={ChangeLogIcon} alt="" class="w-[26px] h-[26px]" />
        </div>
        <button
          data-featurebase-changelog
          class="w-full h-full absolute inset-0 z-10"
        />
      </div>

      <!-- <div
        class={`cursor-pointer rounded-full flex justify-center items-center xl:w-10 xl:h-10 w-12 h-12 ${
          darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
        }`}
      >
        <img src={Bell} alt="" class="xl:w-5 xl:h-5 w-7 h-7" />
      </div> -->

      <!-- <Auth /> -->
      <AuthEvm />

      <div
        class="block text-white xl:hidden"
        on:click={() => (isShowHeaderMobile = true)}
      >
        <img src={MenuBar} alt="" class="w-10 h-10" />
      </div>
    </div>
  </div>
</div>

<!-- Mobile header -->
<div
  class={`fixed inset-0 h-screen w-full mobile mobile-container ${
    isShowHeaderMobile
      ? "opacity-100 transform translate-x-[0px]"
      : "opacity-0 transform translate-x-[-100vw]"
  }`}
>
  <div class="max-w-[100vw] m-auto w-[90%] h-full flex flex-col gap-10">
    <div class="flex items-center justify-between py-3">
      <img
        src={Logo}
        alt=""
        class="-ml-8 xl:w-[177px] w-[197px] xl:h-[60px] h-[80px]"
      />
      <div on:click={() => (isShowHeaderMobile = false)}>
        <img src={Close} alt="" class="w-10 h-10" />
      </div>
    </div>
    <div
      class="flex flex-col justify-between gap-6 border-b-[0.5px] border-white pb-6"
    >
      <Link to="/">
        <div
          class={`flex items-center gap-3 text-white px-4 py-3
            ${
              darkMode
                ? navActive === "portfolio"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "portfolio"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }
          `}
          on:click={() => {
            isShowHeaderMobile = false;
            navActive = "portfolio";
          }}
        >
          <img src={PortfolioIcon} alt="" width="32" height="32" />
          <span class="text-4xl font-medium">
            {MultipleLang.portfolio}
          </span>
        </div>
      </Link>

      <Link
        to={`${
          userInfo && Object.keys(userInfo).length !== 0 ? "analytic" : "/"
        }`}
      >
        <div
          class={`flex items-center gap-3 text-white px-4 py-3 
            ${
              darkMode
                ? navActive === "analytic"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "analytic"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }
          `}
          on:click={() => {
            if (userInfo && Object.keys(userInfo).length !== 0) {
              isShowHeaderMobile = false;
              navActive = "analytic";
            }
          }}
        >
          <img src={AnalyticIcon} alt="" width="32" height="32" />
          <span class="flex gap-[2px]">
            <span class="text-4xl font-medium">
              {MultipleLang.analytics}
            </span>
            <span class="flex items-center gap-[1px] -mt-2">
              <img src={Crown} alt="" width="16" height="16" />
              <span class="text-base font-medium text-[#FFB800] -mt-[1px]"
                >Pro</span
              >
            </span>
          </span>
        </div>
      </Link>

      <Link
        to={`${
          userInfo && Object.keys(userInfo).length !== 0 ? "transactions" : "/"
        }`}
      >
        <div
          class={`flex items-center gap-3 text-white px-4 py-3
             ${
               darkMode
                 ? navActive === "transactions"
                   ? "bg-[#212121] rounded-[1000px] opacity-100"
                   : "opacity-70"
                 : navActive === "transactions"
                 ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                 : "opacity-70"
             }
          `}
          on:click={() => {
            if (userInfo && Object.keys(userInfo).length !== 0) {
              isShowHeaderMobile = false;
              navActive = "transactions";
            }
          }}
        >
          <img src={TransactionsIcon} alt="" width="32" height="32" />
          <span class="text-4xl font-medium">
            {MultipleLang.transactions}
          </span>
        </div>
      </Link>

      <Link to="whales">
        <div
          class={`flex items-center gap-3 text-white px-4 py-3
             ${
               darkMode
                 ? navActive === "whales"
                   ? "bg-[#212121] rounded-[1000px] opacity-100"
                   : "opacity-70"
                 : navActive === "whales"
                 ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                 : "opacity-70"
             }
          `}
          on:click={() => {
            isShowHeaderMobile = false;
            navActive = "whales";
          }}
        >
          <img src={WhaleIcon} alt="" width="32" height="32" />
          <span class="text-4xl font-medium">
            {MultipleLang.whales}
          </span>
        </div>
      </Link>

      <Link to="news">
        <div
          class={`flex items-center gap-3 text-white px-4 py-3 
            ${
              darkMode
                ? navActive === "news"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "news"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }
          `}
          on:click={() => {
            isShowHeaderMobile = false;
            navActive = "news";
          }}
        >
          <img src={NewsIcon} alt="" width="32" height="32" />
          <span class="text-4xl font-medium">
            {MultipleLang.news}
          </span>
        </div>
      </Link>
    </div>

    <a
      href="entries/options/index.html?tab=wallets"
      target="_blank"
      class="flex items-center gap-3 text-white px-4"
      on:click={() => {
        isShowHeaderMobile = false;
      }}
    >
      <img src={SettingsIcon} alt="" width="32" height="32" />
      <span class="text-4xl font-medium">Settings</span>
    </a>
  </div>
</div>

<style>
  .mobile {
    z-index: 2147483649;
    backdrop-filter: blur(12px);

    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

    --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
      0 8px 10px -6px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
      var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }

  :global(body) .mobile-container {
    background: rgba(39, 50, 111, 0.98);
  }
  :global(body.dark) .mobile-container {
    background: rgba(8, 8, 8, 0.98);
  }

  :global(body) .mobile-header-container {
    background-color: #27326f;
  }
  :global(body.dark) .mobile-header-container {
    background: #080808;
  }
</style>
