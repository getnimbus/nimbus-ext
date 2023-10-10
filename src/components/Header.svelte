<script lang="ts">
  import { onMount } from "svelte";
  import { Link, useMatch, useNavigate } from "svelte-navigator";
  import { i18n } from "~/lib/i18n";
  import {
    chain,
    wallet,
    selectedPackage,
    isDarkMode,
    user,
    typeWallet,
    isShowHeaderMobile,
    userId,
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
  import AppOverlay from "~/components/Overlay.svelte";
  import Button from "~/components/Button.svelte";

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
  import Chat from "~/assets/chat.svg";
  import User from "~/assets/user.png";

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

  let userID = "";

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

  let publicAddress = "";
  let isOpenModalSync = false;
  let code = "";
  let isLoadingSyncMobile = false;
  let errors = {};

  // Handle mobile sign in
  const handleMobileSignIn = async (code) => {
    isLoadingSyncMobile = true;
    try {
      const res = await nimbus.post("/auth/access-code", {
        code: code,
      });
      if (res?.data?.result) {
        localStorage.setItem("evm_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient.invalidateQueries(["users-me"]);
        isOpenModalSync = false;
      }
      errors["code"] = {
        ...errors["code"],
        required: true,
        msg: "Your code is expired",
      };
      isLoadingSyncMobile = false;
    } catch (e) {
      isLoadingSyncMobile = false;
      errors["code"] = {
        ...errors["code"],
        required: true,
        msg: "Your code is expired",
      };
      console.error(e);
    }
  };

  const onSubmitGetCode = async (e) => {
    const formData = new FormData(e.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    if (data.code.length !== 6) {
      errors["code"] = {
        ...errors["code"],
        required: true,
        msg: "Invalid code",
      };
      return;
    }
    handleMobileSignIn(data.code);
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const syncCodeParams = urlParams.get("code");
    if (syncCodeParams) {
      handleMobileSignIn(syncCodeParams);
    }
  });

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
      localStorage.setItem("evm_address", $queryUserInfo.data.publicAddress);
      userId.update((n) => (n = $queryUserInfo.data.id));
      userID = $queryUserInfo.data.id;
      publicAddress = $queryUserInfo.data.publicAddress;
      if (
        $queryUserInfo.data?.plan?.tier &&
        $queryUserInfo.data?.plan?.tier.length !== 0
      ) {
        selectedPackage.update(
          (n) => (n = $queryUserInfo.data?.plan?.tier.toUpperCase())
        );
      }
    }
  }

  $: navActive = $absoluteMatch ? $absoluteMatch.params.page : "portfolio";

  // Prevent layout flick
  $: if (showHeaderMobile) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "unset";
  }

  const goldImg =
    "https://raw.githubusercontent.com/getnimbus/nimbus-ext/c43eb2dd7d132a2686c32939ea36b0e97055abc7/src/assets/Gold4.svg";
</script>

<div class="mobile-header-container py-1 border-b-[1px] border-[#ffffff1a]">
  <div class="flex justify-between items-center max-w-[2000px] m-auto w-[90%]">
    <Link
      to={`/?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`}
    >
      <img
        src={Logo}
        alt="logo"
        class="-ml-6 xl:w-[177px] w-[220px] xl:h-[60px] h-[100px]"
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

      <div
        on:click={() => {
          if (userInfo && Object.keys(userInfo).length !== 0) {
            navActive = "transactions";
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
        <Link
          to={`${
            userInfo && Object.keys(userInfo).length !== 0
              ? "transactions"
              : "/"
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
          >
            <img src={TransactionsIcon} alt="" width="20" height="20" />
            <span class="text-sm font-medium text-white xl:text-base">
              {MultipleLang.transactions}
            </span>
          </div>
        </Link>
      </div>

      <div
        on:click={() => {
          navActive = "whales";
        }}
      >
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
          >
            <img src={WhaleIcon} alt="" width="20" height="20" />
            <span class="text-sm font-medium text-white xl:text-base">
              {MultipleLang.whales}
            </span>
          </div>
        </Link>
      </div>

      <div
        on:click={() => {
          navActive = "news";
        }}
      >
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
          >
            <img src={NewsIcon} alt="" width="20" height="20" />
            <span class="text-sm font-medium text-white xl:text-base">
              {MultipleLang.news}
            </span>
          </div>
        </Link>
      </div>
    </div>

    <div class="flex items-center justify-between gap-6 xl:gap-3">
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
      <!-- <div class="xl:w-10 xl:h-10 w-12 h-12 relative xl:block hidden">
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
      </div> -->

      <!-- Daily Checkin -->
      <Link to="daily-checkin">
        <div class="xl:w-10 xl:h-10 w-12 h-12 relative xl:block hidden">
          <div
            class={`rounded-full flex justify-center items-center w-full h-full ${
              darkMode ? "bg-[#212121]" : "bg-[#525B8C]"
            }`}
          >
            <img src={goldImg} alt="" class="w-[26px] h-[26px]" />
          </div>
        </div>
      </Link>

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
  class={`fixed inset-0 w-full mobile mobile-container ${
    showHeaderMobile
      ? "opacity-100 transform translate-x-[0px]"
      : "opacity-0 transform translate-x-[-100vw]"
  }`}
>
  <div class="max-w-[100vw] m-auto w-[90%] h-full flex flex-col gap-8 relative">
    <div class="flex items-center justify-between py-3 border-b-[1px]">
      <img
        src={Logo}
        alt=""
        class="-ml-6 xl:w-[177px] w-[220px] xl:h-[60px] h-[100px]"
      />
      <div
        class="-mr-1 text-6xl text-white"
        on:click={() => {
          isShowHeaderMobile.update((n) => (n = false));
        }}
      >
        &times;
      </div>
    </div>

    <div class="flex flex-col justify-between h-full">
      <div class="flex flex-col gap-8">
        {#if userInfo && Object.keys(userInfo).length !== 0}
          <div class="flex justify-between items-center px-4 text-white">
            <div class="text-3xl">
              GM 👋, {shorterAddress(
                localStorage.getItem("evm_address") || publicAddress
              )}
            </div>
          </div>
        {/if}

        <div class="flex flex-col gap-3">
          {#if userInfo && Object.keys(userInfo).length !== 0}
            <div
              on:click={() => {
                navActive = "upgrade";
                queryClient.invalidateQueries(["users-me"]);
                isShowHeaderMobile.update((n) => (n = false));
              }}
            >
              <Link to="upgrade">
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
            </div>

            <div
              on:click={() => {
                navActive = "profile";
                queryClient.invalidateQueries(["users-me"]);
                isShowHeaderMobile.update((n) => (n = false));
              }}
            >
              <Link to={`profile?id=${userID}`}>
                <div
                  class={`flex items-center gap-3 text-white px-5 py-6 
            ${
              darkMode
                ? navActive === "profile"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "profile"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }
          `}
                >
                  <svg
                    width="35"
                    height="35"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="currentColor"
                      fill-rule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0a.75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="text-3xl font-medium">My Profile</span>
                </div>
              </Link>
            </div>
          {/if}

          <div
            on:click={() => {
              navActive = "whales";
              isShowHeaderMobile.update((n) => (n = false));
            }}
          >
            <Link to="whales">
              <div
                class={`flex items-center gap-3 text-white px-5 py-6 
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
              >
                <img src={WhaleIcon} alt="" width="40" height="40" />
                <span class="text-3xl font-medium">
                  {MultipleLang.whales}
                </span>
              </div>
            </Link>
          </div>

          <div
            on:click={() => {
              navActive = "news";
              isShowHeaderMobile.update((n) => (n = false));
            }}
          >
            <Link to="news">
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
              >
                <img src={NewsIcon} alt="" width="40" height="40" />
                <span class="text-3xl font-medium">
                  {MultipleLang.news}
                </span>
              </div>
            </Link>
          </div>

          {#if userInfo && Object.keys(userInfo).length !== 0}
            <div
              on:click={() => {
                navActive = "invitation";
                queryClient.invalidateQueries(["users-me"]);
                isShowHeaderMobile.update((n) => (n = false));
              }}
            >
              <Link to="invitation">
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
            </div>
          {/if}

          <div
            on:click={() => {
              isShowHeaderMobile.update((n) => (n = false));
            }}
          >
            <a
              href="https://nimbus.featurebase.app/"
              target="_blank"
              class="flex items-center gap-3 text-white px-5 py-6 opacity-70"
            >
              <img src={Chat} alt="" width="40" height="40" />
              <span class="text-3xl font-medium">Feedback</span>
            </a>
          </div>

          {#if userInfo && Object.keys(userInfo).length !== 0}
            <div
              on:click={() => {
                navActive = "settings";
                isShowHeaderMobile.update((n) => (n = false));
              }}
            >
              <Link to="settings/?tab=accounts">
                <div
                  class={`flex items-center gap-3 text-white px-5 py-6 
            ${
              darkMode
                ? navActive === "settings"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "settings"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }
          `}
                >
                  <img src={SettingsIcon} alt="" width="40" height="40" />
                  <span class="text-3xl font-medium">Settings</span>
                </div>
              </Link>
            </div>
          {/if}

          {#if userInfo && Object.keys(userInfo).length !== 0}
            <div
              on:click={() => {
                navActive = "daily-checkin";
                isShowHeaderMobile.update((n) => (n = false));
              }}
            >
              <Link to="daily-checkin">
                <div
                  class={`flex items-center gap-3 text-white px-5 py-6 
              ${
                darkMode
                  ? navActive === "settings"
                    ? "bg-[#212121] rounded-[1000px] opacity-100"
                    : "opacity-70"
                  : navActive === "settings"
                  ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                  : "opacity-70"
              }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    ><g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      ><path
                        d="M6 5h12l3 5l-8.5 9.5a.7.7 0 0 1-1 0L3 10l3-5"
                      /><path d="M10 12L8 9.8l.6-1" /></g
                    ></svg
                  >
                  <span class="text-3xl font-medium">Daily Checkin</span>
                </div>
              </Link>
            </div>
          {/if}
          {#if userInfo && Object.keys(userInfo).length !== 0}
            <div
              on:click={() => {
                navActive = "daily-checkin";
                isShowHeaderMobile.update((n) => (n = false));
              }}
            >
              <Link to="daily-checkin">
                <div
                  class={`flex items-center gap-3 text-white px-5 py-6 
            ${
              darkMode
                ? navActive === "settings"
                  ? "bg-[#212121] rounded-[1000px] opacity-100"
                  : "opacity-70"
                : navActive === "settings"
                ? "bg-[#525B8C] rounded-[1000px] opacity-100"
                : "opacity-70"
            }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                  >
                    <g
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                    >
                      <path d="M6 5h12l3 5l-8.5 9.5a.7.7 0 0 1-1 0L3 10l3-5" />
                      <path d="M10 12L8 9.8l.6-1" />
                    </g>
                  </svg>
                  <span class="text-3xl font-medium">Daily Checkin</span>
                </div>
              </Link>
            </div>
          {/if}
        </div>
      </div>

      <div class="flex flex-col gap-30 w-full pb-16">
        <div class="flex flex-col gap-7 px-4">
          <DarkModeFooter />
          <div class="w-max flex flex-col gap-6">
            <AuthEvm />
            {#if Object.keys(userInfo).length === 0}
              <div
                class="text-3xl font-semibold text-white cursor-pointer xl:text-base"
                on:click={() => {
                  isOpenModalSync = true;
                }}
              >
                Sync from Desktop
              </div>
            {/if}
          </div>
        </div>
        <div class="w-full flex justify-center gap-16 text-white">
          <a
            href="https://github.com/getnimbus"
            target="_blank"
            class="hover:text-[#3b82f6] transition-all w-14 h-14"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              ><path
                fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z"
              /></svg
            >
          </a>
          <a
            href="https://twitter.com/get_nimbus"
            target="_blank"
            class="hover:text-[#3b82f6] transition-all w-13 h-13"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"
              ><path
                fill="currentColor"
                d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07l-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z"
              /></svg
            >
          </a>
          <a
            href="https://discord.gg/u5b9dTrSTr"
            target="_blank"
            class="hover:text-[#3b82f6] transition-all w-14 h-14"
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
            class="transition-all w-[52px] h-[52px]"
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

<!-- Modal sync user from desktop -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenModalSync}
  on:close={() => {
    isOpenModalSync = false;
  }}
>
  <div class="flex flex-col gap-4">
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">
        Input your code from desktop
      </div>
      <div class="xl:text-sm text-2xl text-gray-500">
        Investment in crypto more convenience with Nimbus anywhere, anytime
      </div>
    </div>
    <form
      on:submit|preventDefault={onSubmitGetCode}
      class="flex flex-col xl:gap-3 gap-10"
    >
      <div class="flex flex-col gap-1">
        <div
          class={`flex flex-col gap-1 input-2 input-border w-full py-[6px] px-3 ${
            code && !darkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
          }`}
          class:input-border-error={errors.code && errors.code.required}
        >
          <div class="xl:text-base text-2xl text-[#666666] font-medium">
            Code
          </div>
          <input
            type="number"
            id="code"
            name="code"
            required
            placeholder="Your code"
            value=""
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
              code && !darkMode ? "bg-[#F0F2F7]" : "bg-transparent"
            }`}
            on:keyup={({ target: { value } }) => (code = value)}
          />
        </div>
        {#if errors.code && errors.code.required}
          <div class="text-red-500">
            {errors.code.msg}
          </div>
        {/if}
      </div>
      <div class="flex justify-end lg:gap-2 gap-6">
        <div class="xl:w-[120px] w-full">
          <Button
            variant="secondary"
            on:click={() => {
              isOpenModalSync = false;
            }}
          >
            Cancel
          </Button>
        </div>
        <div class="xl:w-[120px] w-full">
          <Button
            type="submit"
            isLoading={isLoadingSyncMobile}
            disabled={isLoadingSyncMobile}>Submit</Button
          >
        </div>
      </div>
    </form>
  </div>
</AppOverlay>

<style>
  .mobile {
    height: 100vh;
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

  @supports (height: 100dvh) {
    .mobile {
      height: 100dvh;
    }
  }

  .input-border-error {
    border: 1px solid red;
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
