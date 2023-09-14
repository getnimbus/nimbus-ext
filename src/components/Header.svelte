<script lang="ts">
  import { Link, useMatch, useNavigate } from "svelte-navigator";
  import * as browser from "webextension-polyfill";
  import { i18n } from "~/lib/i18n";
  import {
    chain,
    wallet,
    selectedPackage,
    isDarkMode,
    user,
    typeWallet,
    isShowHeaderMobile,
  } from "~/store";
  import { shorterAddress } from "~/utils";
  import mixpanel from "mixpanel-browser";
  import { Motion } from "svelte-motion";
  import { showChangeLogAnimationVariants } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import Auth from "~/UI/Auth/Auth.svelte";
  import AuthEvm from "~/UI/Auth/AuthEVM.svelte";
  import DarkModeFooter from "./DarkModeFooter.svelte";

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
  const absoluteMatch = useMatch("/:page");
  const queryClient = useQueryClient();

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

  let selectedChain: string = "";
  chain.subscribe((value) => {
    selectedChain = value;
  });

  let typeWalletAddress: string = "";
  typeWallet.subscribe((value) => {
    typeWalletAddress = value;
  });

  let showHeaderMobile = false;
  isShowHeaderMobile.subscribe((value) => {
    showHeaderMobile = value;
  });

  let timerDebounce;
  let search = "";

  const debounceSearch = (value) => {
    clearTimeout(timerDebounce);
    timerDebounce = setTimeout(() => {
      search = value;
    }, 300);
  };

  const validateAddress = async (address: string) => {
    try {
      const response = await nimbus.get(`/v2/address/${address}/validate`);
      return response?.data?.type;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    if (response?.status === 401) {
      throw new Error(response?.response?.error);
    }
    return response?.data;
  };

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
    onError(err) {
      localStorage.removeItem("evm_token");
      user.update((n) => (n = {}));
      wallet.update((n) => (n = ""));
      chain.update((n) => (n = ""));
      typeWallet.update((n) => (n = ""));
      queryClient.invalidateQueries(["list-address"]);
    },
  });

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
    } else {
      selectedPackage.update(
        () => "PROFESSIONAL" // TODO: Remove me after integration complete
      );
    }
  }

  $: navActive = $absoluteMatch ? $absoluteMatch.params.page : "portfolio";
</script>

<div class="mobile-header-container py-1 border-b-[1px] border-[#ffffff1a]">
  <div class="flex justify-between items-center max-w-[2000px] m-auto w-[90%]">
    <Link
      to={`/?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`}
    >
      <img
        src={Logo}
        alt="logo"
        class="-ml-8 xl:w-[177px] w-[220px] xl:h-[60px] h-[100px]"
      />
    </Link>

    <div class="items-center hidden gap-1 xl:flex">
      {#if selectedWallet === "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"}
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
            navigate(
              `/?type=EVM&chain=${
                selectedChain || "All"
              }&address=0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0`
            );
          }}
        >
          <img src={PortfolioIcon} alt="" width="20" height="20" />
          <span class="text-sm font-medium text-white xl:text-base">
            {MultipleLang.portfolio}
          </span>
        </div>
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
            navActive = "analytic";
            navigate(
              `/analytic?type=EVM&chain=${
                selectedChain || "All"
              }&address=0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0`
            );
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
      {:else}
        <Link
          to={`/?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`}
        >
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
              } else {
                user.update((n) => (n = {}));
                wallet.update((n) => (n = ""));
                chain.update((n) => (n = ""));
                typeWallet.update((n) => (n = ""));
                queryClient.invalidateQueries(["list-address"]);
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
      {/if}

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
            } else {
              user.update((n) => (n = {}));
              wallet.update((n) => (n = ""));
              chain.update((n) => (n = ""));
              typeWallet.update((n) => (n = ""));
              queryClient.invalidateQueries(["list-address"]);
            }
          }}
        >
          <img src={TransactionsIcon} alt="" width="20" height="20" />
          <span class="text-sm font-medium text-white xl:text-base">
            {MultipleLang.transactions}
          </span>
        </div>
      </Link>

      <Link
        to={`${
          userInfo && Object.keys(userInfo).length !== 0 ? "whales" : "/"
        }`}
      >
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
            if (userInfo && Object.keys(userInfo).length !== 0) {
              navActive = "whales";
              queryClient.invalidateQueries(["users-me"]);
            } else {
              user.update((n) => (n = {}));
              wallet.update((n) => (n = ""));
              chain.update((n) => (n = ""));
              typeWallet.update((n) => (n = ""));
              queryClient.invalidateQueries(["list-address"]);
            }
          }}
        >
          <img src={WhaleIcon} alt="" width="20" height="20" />
          <span class="text-sm font-medium text-white xl:text-base">
            {MultipleLang.whales}
          </span>
        </div>
      </Link>

      <Link
        to={`${userInfo && Object.keys(userInfo).length !== 0 ? "news" : "/"}`}
      >
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
            if (userInfo && Object.keys(userInfo).length !== 0) {
              navActive = "news";
              queryClient.invalidateQueries(["users-me"]);
            } else {
              user.update((n) => (n = {}));
              wallet.update((n) => (n = ""));
              chain.update((n) => (n = ""));
              typeWallet.update((n) => (n = ""));
              queryClient.invalidateQueries(["list-address"]);
            }
          }}
        >
          <img src={NewsIcon} alt="" width="20" height="20" />
          <span class="text-sm font-medium text-white xl:text-base">
            {MultipleLang.news}
          </span>
        </div>
      </Link>
    </div>

    <div
      class="flex items-center justify-between gap-6 xl:gap-3 xl:-mr-0 -mr-8"
    >
      <!-- Search -->
      <div
        class={`pl-4 flex items-center rounded-[1000px] ${
          darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
        }`}
      >
        <img src={Search} alt="" class="xl:w-5 xl:h-5 w-9 h-9" />
        <input
          on:keyup={({ target: { value } }) => debounceSearch(value)}
          on:keydown={async (event) => {
            if (
              search.length !== 0 &&
              (event.which == 13 || event.keyCode == 13)
            ) {
              mixpanel.track("user_search");
              const searchAccountType = await validateAddress(search);
              chain.update((n) => (n = "ALL"));
              wallet.update((n) => (n = search));
              typeWallet.update((n) => (n = searchAccountType));
              if (searchAccountType === "EVM") {
                navigate(
                  `/?type=${searchAccountType}&chain=ALL&address=${search}`
                );
              }
              if (searchAccountType === "BTC" || searchAccountType === "SOL") {
                navigate(
                  `/?type=${searchAccountType}&address=${selectedWallet}`
                );
              }
            }
          }}
          value={search}
          placeholder={MultipleLang.search_placeholder}
          type="text"
          class={`xl:w-full w-[400px] xl:py-2 py-3 rounded-r-[1000px] text-[#ffffff80] xl:text-sm text-2xl placeholder-[#ffffff80] border-none focus:outline-none focus:ring-0 ${
            darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
          }`}
        />
      </div>

      <!-- Change log -->
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
      <div class="xl:block hidden">
        <AuthEvm />
      </div>
    </div>
  </div>
</div>

<!-- Mobile header -->
<div
  class={`fixed inset-0 h-screen w-full mobile mobile-container ${
    showHeaderMobile
      ? "opacity-100 transform translate-x-[0px]"
      : "opacity-0 transform translate-x-[-100vw]"
  }`}
>
  <div
    class="max-w-[100vw] m-auto w-[90%] h-full flex flex-col gap-10 relative"
  >
    <div class="flex items-center justify-between py-3 border-b-[1px]">
      <img
        src={Logo}
        alt=""
        class="-ml-6 xl:w-[177px] w-[220px] xl:h-[60px] h-[100px]"
      />
      <div
        class="-mr-2"
        on:click={() => {
          isShowHeaderMobile.update((n) => (n = false));
        }}
      >
        <img src={Close} alt="" class="w-10 h-10" />
      </div>
    </div>

    <div class="flex justify-between items-center px-4 text-white">
      <div class="text-3xl">
        {#if userInfo && Object.keys(userInfo).length !== 0}
          GM 👋, {shorterAddress(localStorage.getItem("evm_address") || "")}
        {/if}
      </div>
    </div>

    <div class="flex flex-col gap-5">
      <Link
        to={`${
          userInfo && Object.keys(userInfo).length !== 0 ? "upgrade" : "/"
        }`}
      >
        <div
          class={`flex items-center gap-3 text-white px-5 py-6 
            ${
              darkMode
                ? navActive === "upgrade"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "upgrade"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }
          `}
          on:click={() => {
            if (userInfo && Object.keys(userInfo).length !== 0) {
              navActive = "upgrade";
              queryClient.invalidateQueries(["users-me"]);
            } else {
              user.update((n) => (n = {}));
              wallet.update((n) => (n = ""));
              chain.update((n) => (n = ""));
              typeWallet.update((n) => (n = ""));
              queryClient.invalidateQueries(["list-address"]);
            }
            isShowHeaderMobile.update((n) => (n = false));
          }}
        >
          <div class="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 32 32"
              ><path
                fill="currentColor"
                d="M21 24H11a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2zm0 4H11v-2h10zm7.707-13.707l-12-12a1 1 0 0 0-1.414 0l-12 12A1 1 0 0 0 4 16h5v4a2.002 2.002 0 0 0 2 2h10a2.003 2.003 0 0 0 2-2v-4h5a1 1 0 0 0 .707-1.707zM21 14v6H11v-6H6.414L16 4.414L25.586 14z"
              /></svg
            >
            <span class="text-3xl font-medium ml-1">Upgrade</span>
            <svg
              width="26"
              height="26"
              viewBox="0 0 16 16"
              fill="#ffb800"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M14.6629 3.5843C14.7217 3.57771 14.7811 3.58901 14.8339 3.61685C14.8867 3.64495 14.9305 3.68852 14.9599 3.74223C14.9893 3.79594 15.0031 3.85745 14.9994 3.91919L14.4836 12.7921H1.51642L1.00059 3.91919C0.996892 3.85745 1.01055 3.79592 1.0399 3.74216C1.06924 3.68841 1.11299 3.64476 1.16578 3.6166C1.21856 3.58843 1.27808 3.57697 1.33702 3.58362C1.39596 3.59026 1.45175 3.61473 1.49755 3.65401L4.60499 6.30708L7.76082 2.11502C7.79036 2.07895 7.82704 2.04999 7.86833 2.03014C7.90962 2.01028 7.95455 2 8.00001 2C8.04548 2 8.0904 2.01028 8.1317 2.03014C8.17299 2.04999 8.20967 2.07895 8.23921 2.11502L11.395 6.30708L14.5025 3.65401C14.5484 3.61511 14.6041 3.5909 14.6629 3.5843ZM1.55334 13.4273L1.55781 13.5041C1.577 13.827 1.71333 14.1301 1.93906 14.3518C2.1648 14.5735 2.46298 14.6971 2.77297 14.6976H13.2271C13.537 14.6971 13.8352 14.5735 14.061 14.3518C14.2867 14.1301 14.423 13.827 14.4422 13.5041L14.4467 13.4273H1.55334Z"
                fill="#ffb800"
              />
            </svg>
          </div>
        </div>
      </Link>

      <Link
        to={`${userInfo && Object.keys(userInfo).length !== 0 ? "news" : "/"}`}
      >
        <div
          class={`flex items-center gap-3 text-white px-5 py-6 
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
            if (userInfo && Object.keys(userInfo).length !== 0) {
              navActive = "news";
              queryClient.invalidateQueries(["users-me"]);
            } else {
              user.update((n) => (n = {}));
              wallet.update((n) => (n = ""));
              chain.update((n) => (n = ""));
              typeWallet.update((n) => (n = ""));
              queryClient.invalidateQueries(["list-address"]);
            }
            isShowHeaderMobile.update((n) => (n = false));
          }}
        >
          <img src={NewsIcon} alt="" width="40" height="40" />
          <span class="text-3xl font-medium">
            {MultipleLang.news}
          </span>
        </div>
      </Link>

      <Link
        to={`${
          userInfo && Object.keys(userInfo).length !== 0 ? "invitation" : "/"
        }`}
      >
        <div
          class={`flex items-center gap-3 text-white px-5 py-6 
            ${
              darkMode
                ? navActive === "invitation"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "invitation"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }
          `}
          on:click={() => {
            if (userInfo && Object.keys(userInfo).length !== 0) {
              navActive = "invitation";
              queryClient.invalidateQueries(["users-me"]);
            } else {
              user.update((n) => (n = {}));
              wallet.update((n) => (n = ""));
              chain.update((n) => (n = ""));
              typeWallet.update((n) => (n = ""));
              queryClient.invalidateQueries(["list-address"]);
            }
            isShowHeaderMobile.update((n) => (n = false));
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            ><path
              fill="currentColor"
              d="M19 17v2H7v-2s0-4 6-4s6 4 6 4m-3-9a3 3 0 1 0-3 3a3 3 0 0 0 3-3m3.2 5.06A5.6 5.6 0 0 1 21 17v2h3v-2s0-3.45-4.8-3.94M18 5a2.91 2.91 0 0 0-.89.14a5 5 0 0 1 0 5.72A2.91 2.91 0 0 0 18 11a3 3 0 0 0 0-6M8 10H5V7H3v3H0v2h3v3h2v-3h3Z"
            /></svg
          >
          <span class="text-3xl font-medium">Invite</span>
        </div>
      </Link>

      <Link to="options/?tab=wallets">
        <div
          class={`flex items-center gap-3 text-white px-5 py-6 
            ${
              darkMode
                ? navActive === "options"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "options"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }
          `}
          on:click={() => {
            navActive = "options";
            isShowHeaderMobile.update((n) => (n = false));
          }}
        >
          <img src={SettingsIcon} alt="" width="40" height="40" />
          <span class="text-3xl font-medium">Settings</span>
        </div>
      </Link>
    </div>

    <div class="absolute bottom-[200px] left-0">
      <div class="xl:hidden block px-4">
        <AuthEvm />
      </div>
    </div>
    <div class="absolute bottom-[80px] left-0 w-full">
      <div class="w-1/3 mx-auto">
        <div class="xl:hidden grid grid-cols-4 gap-5 mx-auto text-white">
          <a
            href="https://github.com/getnimbus"
            target="_blank"
            class="hover:text-[#3b82f6] transition-all xl:w-6 xl:h-6 w-12 h-12"
          >
            <svg viewBox="0 0 24 24"
              ><title>icon/github</title><desc>Created with Sketch.</desc><g
                id="icon/github"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
                ><path
                  d="M11.999401,2.71614583 C6.70760417,2.71614583 2.41666667,6.97766881 2.41666667,12.2357087 C2.41666667,16.4407129 5.16229167,20.008541 8.97106771,21.2674246 C9.45023437,21.3548801 9.62513021,21.0609819 9.62513021,20.8087293 C9.62513021,20.5826538 9.61674479,19.9841487 9.61195313,19.1899098 C6.94598958,19.7652124 6.38356771,17.9137731 6.38356771,17.9137731 C5.948125,16.8143323 5.31981771,16.5216241 5.31981771,16.5216241 C4.44953125,15.9308531 5.38570312,15.9427518 5.38570312,15.9427518 C6.34703125,16.0099796 6.85315104,16.9238005 6.85315104,16.9238005 C7.70846354,18.3784178 9.09625,17.9583933 9.6425,17.7144698 C9.72934896,17.0993064 9.97731771,16.6798769 10.2510417,16.4419027 C8.12294271,16.2015488 5.88583333,15.3852973 5.88583333,11.7377477 C5.88583333,10.6983954 6.25898437,9.84882753 6.87231771,9.1830947 C6.77348958,8.94214583 6.44466146,7.97478071 6.96575521,6.6641378 C6.96575521,6.6641378 7.77075521,6.40831554 9.60117188,7.63983202 C10.3660417,7.42862992 11.1854167,7.32332633 12.000599,7.31916179 C12.8145833,7.32332633 13.6345573,7.42862992 14.400026,7.63983202 C16.2292448,6.40831554 17.0324479,6.6641378 17.0324479,6.6641378 C17.5553385,7.97478071 17.2265104,8.94214583 17.1276823,9.1830947 C17.7422135,9.84882753 18.1129687,10.6983954 18.1129687,11.7377477 C18.1129687,15.3942213 15.8722656,16.199169 13.7375781,16.4347635 C14.0813802,16.7286616 14.3880469,17.3093187 14.3880469,18.1975574 C14.3880469,19.4701244 14.3760677,20.4963881 14.3760677,20.8087293 C14.3760677,21.0633617 14.5485677,21.3596396 15.0349219,21.2662347 C18.8401042,20.0049714 21.5833333,16.439523 21.5833333,12.2357087 C21.5833333,6.97766881 17.2923958,2.71614583 11.999401,2.71614583"
                  id="icon-github"
                  fill="currentColor"
                /></g
              ></svg
            >
          </a>
          <a
            href="https://twitter.com/get_nimbus"
            target="_blank"
            class="hover:text-[#3b82f6] transition-all xl:w-6 xl:h-6 w-12 h-12"
          >
            <svg viewBox="0 0 24 24"
              ><title>icon/twitter</title><desc>Created with Sketch.</desc><g
                id="icon/twitter"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
                ><path
                  d="M22,5.92338012 C21.264375,6.24956739 20.473125,6.47014997 19.643125,6.56950586 C20.490625,6.06147856 21.14125,5.2578831 21.4475,4.29994232 C20.655,4.76985195 19.77625,5.11103634 18.841875,5.29537589 C18.093125,4.49802923 17.026875,4 15.846875,4 C13.580625,4 11.74375,5.83652182 11.74375,8.10233609 C11.74375,8.42352432 11.78,8.73658912 11.85,9.03715632 C8.439375,8.86593924 5.41625,7.23250336 3.3925,4.75048068 C3.039375,5.35661411 2.836875,6.06147856 2.836875,6.813209 C2.836875,8.23606037 3.56125,9.49206883 4.661875,10.2275524 C3.989375,10.2063065 3.356875,10.0219669 2.80375,9.71452605 C2.803125,9.73202269 2.803125,9.74889444 2.803125,9.76639108 C2.803125,11.7541338 4.2175,13.41194 6.095,13.7887425 C5.750625,13.8824745 5.388125,13.9324649 5.01375,13.9324649 C4.749375,13.9324649 4.4925,13.9068448 4.241875,13.859354 C4.76375,15.4890406 6.279375,16.6750625 8.075,16.7081811 C6.670625,17.8085945 4.90125,18.4640934 2.97875,18.4640934 C2.6475,18.4640934 2.32125,18.4447222 2,18.4072294 C3.815625,19.5707556 5.9725,20.25 8.29,20.25 C15.8375,20.25 19.964375,13.9987022 19.964375,8.57786964 C19.964375,8.39977889 19.960625,8.2229379 19.9525,8.04672178 C20.754375,7.46870794 21.45,6.74634686 22,5.92338012"
                  id="icon-twitter"
                  fill="currentColor"
                /></g
              ></svg
            >
          </a>
          <a
            href="https://discord.gg/u5b9dTrSTr"
            target="_blank"
            class="hover:text-[#3b82f6] transition-all xl:w-6 xl:h-6 w-12 h-12"
          >
            <svg viewBox="0 0 24 24"
              ><title>media/discord</title><desc>Created with Sketch.</desc><g
                id="media/discord"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
                ><path
                  d="M19.3738284,1.30000067 C20.6047838,1.30000067 21.6093118,2.26441332 21.6296842,3.46693408 L21.6299997,3.50420056 L21.6299997,22.6999997 L19.2637712,20.6669997 L17.9320799,19.4685998 L16.5233485,18.1952999 L17.1066513,20.1747998 L4.62617192,20.1747998 C3.39521653,20.1747998 2.39068845,19.2103871 2.37031605,18.0078664 L2.3700006,17.9705999 L2.3700006,3.50420056 C2.3700006,2.29684756 3.36196791,1.32011497 4.58817416,1.30030737 L4.62617192,1.30000067 L19.3738284,1.30000067 Z M10.4261831,6.41460042 L10.3161259,6.28611151 L10.253462,6.28683614 C9.95314869,6.29553045 8.61816442,6.39277243 7.22352037,7.40970038 L7.17914533,7.49134137 C6.92240404,7.97476735 5.63869759,10.5469402 5.63869759,13.6478001 L5.66158768,13.683294 C5.81731702,13.9151096 6.78208119,15.206041 8.99544029,15.2742 L9.31958577,14.8876236 C9.44785509,14.7336464 9.59687017,14.5535236 9.73282311,14.3861 C8.4498449,14.0128802 7.89942129,13.2610193 7.81769324,13.1400854 L7.8068232,13.1235001 L7.8520928,13.1528415 C7.90174748,13.1841892 7.99116891,13.2385251 8.11498319,13.3054001 C8.1259889,13.3161001 8.13699461,13.3268001 8.15900604,13.3375001 C8.19202318,13.3589001 8.22504032,13.3696001 8.25805746,13.3910001 C8.53320031,13.5408001 8.80834315,13.6585001 9.06147457,13.7548001 C9.51270883,13.9260001 10.0519888,14.0972001 10.6793145,14.2149001 C11.4811594,14.36042 12.4180196,14.4150643 13.43945,14.2415094 L13.5297944,14.2256001 C14.0470629,14.1400001 14.5753372,13.9902001 15.1256229,13.7655001 C15.5108228,13.6264001 15.9400457,13.4231001 16.3912799,13.1342001 L16.3732355,13.1608643 C16.2678877,13.3105783 15.6918478,14.0525552 14.3992457,14.4075 L14.5812611,14.6292689 C14.8592141,14.9648288 15.1256229,15.2742 15.1256229,15.2742 C17.5578856,15.1993 18.4933713,13.6478001 18.4933713,13.6478001 C18.4933713,10.2024002 16.9085485,7.40970038 16.9085485,7.40970038 C15.5456009,6.41588442 14.2396321,6.30042559 13.9006746,6.2875759 L13.8159429,6.28611151 L13.6618629,6.45740042 C15.3210186,6.95080946 16.1925853,7.63774998 16.3686631,7.78696529 L16.4022856,7.81630036 C15.2576914,7.20640039 14.1351086,6.9068004 13.0895658,6.78910041 C12.2971544,6.70350041 11.5377602,6.72490041 10.8664116,6.81050041 C10.8003773,6.81050041 10.7453488,6.82120041 10.6793145,6.8319004 L10.6174459,6.83755 C10.1999606,6.8788199 9.29974827,7.0282454 8.18101747,7.50600037 L8.02110602,7.5784953 C7.82117927,7.670492 7.67550736,7.74276561 7.59730018,7.78247321 L7.53168036,7.81630036 C7.53168036,7.81630036 8.42697646,6.98782187 10.3670723,6.43137796 L10.4261831,6.41460042 Z M10.007966,10.2773002 C10.6352916,10.2773002 11.1415545,10.8123002 11.1305488,11.4650002 C11.1305488,12.1177002 10.6352916,12.6527001 10.007966,12.6527001 C9.39164598,12.6527001 8.88538315,12.1177002 8.88538315,11.4650002 C8.88538315,10.8123002 9.38064027,10.2773002 10.007966,10.2773002 Z M14.0250515,10.2773002 C14.6523772,10.2773002 15.1476343,10.8123002 15.1476343,11.4650002 C15.1476343,12.1177002 14.6523772,12.6527001 14.0250515,12.6527001 C13.4087315,12.6527001 12.9024687,12.1177002 12.9024687,11.4650002 C12.9024687,10.8123002 13.3977258,10.2773002 14.0250515,10.2773002 Z"
                  id="Shape"
                  fill="currentColor"
                /></g
              ></svg
            >
          </a>
          <a
            href="https://t.me/getnimbus"
            target="_blank"
            class="transition-all xl:w-5 xl:h-5 w-11 h-11"
          >
            <svg
              fill="#fff"
              viewBox="0 0 20 20"
              class="hover:fill-[#3b82f6]"
              xmlns="http://www.w3.org/2000/svg"
              ><path
                d="M10,0 C15.5228475,0 20,4.4771525 20,10 C20,15.5228475 15.5228475,20 10,20 C4.4771525,20 0,15.5228475 0,10 C0,4.4771525 4.4771525,0 10,0 Z M14.4415206,6 C14.060553,6.00676048 13.476055,6.20741135 10.663148,7.36249773 C9.67796175,7.7670526 7.70897661,8.60437935 4.75619264,9.87447795 C4.27670659,10.0627254 4.02553067,10.2468857 4.00266485,10.4269588 C3.95876487,10.7726802 4.46291296,10.8803081 5.09723696,11.0838761 C5.61440201,11.2498453 6.31007997,11.4440124 6.67173438,11.4517262 C6.99978943,11.4587234 7.36593635,11.3251987 7.77017511,11.051152 C10.5290529,9.21254679 11.9531977,8.28322679 12.0426094,8.26319203 C12.1056879,8.24905787 12.1930992,8.23128593 12.2523244,8.28325656 C12.3115496,8.33522719 12.3057275,8.43364956 12.299454,8.46005377 C12.2492926,8.67117474 9.65764825,10.998457 9.50849738,11.1513987 L9.43697409,11.2233057 C8.88741493,11.7661123 8.33196049,12.1205055 9.290333,12.7440164 C10.155665,13.3069957 10.6592923,13.6661378 11.5507686,14.2430701 C12.1204738,14.6117635 12.5671299,15.0489784 13.1553348,14.9955401 C13.4259939,14.9709508 13.705567,14.7196888 13.8475521,13.9703127 C14.1831052,12.1993135 14.8426779,8.36209709 14.9951103,6.78087197 C15.0084653,6.64233621 14.9916649,6.46503787 14.9781732,6.38720805 C14.9646815,6.30937823 14.9364876,6.19848702 14.8340164,6.11639754 C14.7126597,6.01917896 14.5253109,5.99867765 14.4415206,6 Z"
              /></svg
            >
          </a>
        </div>
      </div>
    </div>
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
