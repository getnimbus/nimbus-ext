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
  $: console.log("selectedWallet: ", selectedWallet);
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

<<<<<<< HEAD
    <div class="flex justify-between items-center px-4 text-white">
      <div class="text-3xl">
        {#if userInfo && Object.keys(userInfo).length !== 0}
          GM 👋, {shorterAddress(localStorage.getItem("evm_address") || "")}
        {/if}
      </div>
      <DarkModeFooter />
    </div>

    <div class="flex flex-col gap-5">
      <Link
        to={`${
          userInfo && Object.keys(userInfo).length !== 0 ? "upgrade" : "/"
        }`}
      >
        <div
          class={`flex items-center gap-3 text-white px-5 py-6 
=======
      {#if selectedWallet === "0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0"}
        <div
          class={`flex items-center gap-3 text-white px-4 py-3 ${
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
            navigate(
              `/analytic?type=EVM&chain=ALL&address=0x9b4f0d1c648b6b754186e35ef57fa6936deb61f0`
            );
            isShowHeaderMobile = false;
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
      {:else}
        <Link
          to={`${
            userInfo && Object.keys(userInfo).length !== 0 ? "analytic" : "/"
          }`}
        >
          <div
            class={`flex items-center gap-3 text-white px-4 py-3 
>>>>>>> main
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
            <span class="text-3xl font-medium">Upgrade</span>
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
