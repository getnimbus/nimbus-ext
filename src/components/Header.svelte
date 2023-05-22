<script lang="ts">
  import { Link } from "svelte-navigator";
  import { onMount } from "svelte";
  import * as browser from "webextension-polyfill";
  import jwt_decode from "jwt-decode";
  import bs58 from "bs58";
  import { handleGetAccessToken } from "~/utils";
  import { i18n } from "~/lib/i18n";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import { WalletProvider } from "@svelte-on-solana/wallet-adapter-ui";
  import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
  } from "@solana/wallet-adapter-wallets";
  import { user } from "~/store";

  import GoogleAuth from "~/components/GoogleAuth.svelte";
  import SolanaAuth from "./SolanaAuth.svelte";
  import AppOverlay from "~/components/Overlay.svelte";

  import Logo from "~/assets/logo-white.svg";
  import PortfolioIcon from "~/assets/portfolio.svg";
  import MarketIcon from "~/assets/market.svg";
  import NewsIcon from "~/assets/news.svg";
  import AnalyticIcon from "~/assets/analytic.svg";
  import TransactionsIcon from "~/assets/transactions.svg";
  import SettingsIcon from "~/assets/settings.svg";
  import Search from "~/assets/search.svg";
  import Bell from "~/assets/bell.svg";
  import User from "~/assets/user.png";
  import { nimbus } from "~/lib/network";

  const localStorageKey = "walletAdapter";
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  const signatureString = "Hello Nimbus";

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
    modal_login_title: i18n(
      "newtabPage.modal-login-title",
      "Login to enjoy more features"
    ),
  };

  export let selectedWallet;

  let headerScrollY = false;
  let showTooltipAnalytic = false;
  let showTooltipTransactions = false;
  let timerDebounce;
  let search = "";
  let navActive = "portfolio";
  let isOpenAuthModal = false;
  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });
  let showPopover = false;
  let addressWallet = "";
  let signMessageAddress = "";

  onMount(() => {
    const token = localStorage.getItem("token");
    const solanaToken = localStorage.getItem("solana_token");
    if (token || solanaToken) {
      if (token) {
        const { access_token, id_token } = JSON.parse(token);
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        })
          .then((response) => {
            if (response.ok) {
              // User is authenticated and access token is still valid
              user.update((n) => (n = jwt_decode(id_token)));
            } else {
              // Access token is invalid or expired, prompt user to sign in again
              user.update((n) => (n = {}));
              showPopover = false;
              localStorage.removeItem("token");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      if (solanaToken) {
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
      }
    } else {
      user.update((n) => (n = {}));
      showPopover = false;
      localStorage.removeItem("token");
      localStorage.removeItem("solana_address");
      localStorage.removeItem("solana_token");
      addressWallet = "";
      signMessageAddress = "";
      $walletStore.disconnect();
    }

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

  const handleGetGoogleUserInfo = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code && APP_TYPE.TYPE !== "EXT") {
      const userData = await handleGetAccessToken(code);
      user.update((n) => (n = userData));
    }
  };

  const handleSignOut = () => {
    user.update((n) => (n = {}));
    showPopover = false;
    localStorage.removeItem("token");
    localStorage.removeItem("solana_address");
    localStorage.removeItem("solana_token");
    addressWallet = "";
    signMessageAddress = "";
    $walletStore.disconnect();
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
    handleGetGoogleUserInfo();
  }

  const handleSignAddressMessage = async () => {
    if ($walletStore.connected) {
      const res = await $walletStore?.signMessage(
        Uint8Array.from(
          Array.from(signatureString).map((letter) => letter.charCodeAt(0))
        )
      );
      signMessageAddress = bs58.encode(res);
    }
  };

  const handleGetSolanaToken = async (data) => {
    const res = await nimbus
      .post("/auth/solana", data)
      .then((response) => response);
    if (res.data.result) {
      localStorage.setItem("solana_token", res.data.result);
      user.update(
        (n) =>
          (n = {
            picture: User,
          })
      );
    }
  };

  $: {
    addressWallet = $walletStore?.publicKey?.toBase58();
  }

  $: {
    if (addressWallet) {
      const solanaToken = localStorage.getItem("solana_token");
      if (!solanaToken) {
        handleSignAddressMessage();
      }
    }
  }

  $: {
    if (addressWallet && signMessageAddress) {
      const solanaLoginPayload = {
        message: signatureString,
        addressWallet,
        signMessageAddress,
      };
      localStorage.setItem("solana_address", addressWallet);
      handleGetSolanaToken(solanaLoginPayload);
    }
  }

  $: {
    if (Object.keys(userInfo).length !== 0) {
      isOpenAuthModal = false;
    }
  }
</script>

<div
  class="py-1 top-0 bg-[#27326F] sticky"
  style="z-index: 2147483647; {headerScrollY
    ? 'box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);'
    : ''}"
>
  <div class="flex justify-between items-center max-w-[2000px] m-auto w-[90%]">
    <img
      src={Logo}
      alt="logo"
      class="-ml-8 xl:w-[177px] xl:h-[60px] w-[167px] h-[50px]"
    />
    <div class="flex items-center gap-1">
      <Link
        to={`${
          APP_TYPE.TYPE === "EXT" ? "src/entries/newTab/index.html" : "/"
        }`}
      >
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

      <div class="relative">
        <div
          class="flex items-center xl:gap-3 gap-1 py-2 xl:px-4 px-2 rounded-[1000px] transition-all cursor-pointer"
          class:bg-[#525B8C]={navActive === "analytic"}
          on:click={() => {
            // navActive = "analytic";
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

      <div class="relative">
        <div
          class="flex items-center xl:gap-3 gap-1 py-2 xl:px-4 px-2 rounded-[1000px] transition-all cursor-pointer"
          class:bg-[#525B8C]={navActive === "transactions"}
          on:click={() => {
            // navActive = "transactions";
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

      {#if APP_TYPE.TYPE === "EXT"}
        <div
          class={`flex items-center xl:gap-3 gap-1 cursor-pointer py-2 xl:px-4 px-2 rounded-[1000px] hover:bg-[#525B8C] transition-all`}
          on:click={() => {
            browser.tabs.create({
              url: "src/entries/options/index.html?tab=wallets",
            });
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
          href="entries/options/index.html?tab=wallets"
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
      <!-- <div
        class="bg-[#525B8C] rounded-full flex justify-center items-center w-10 h-10"
      >
        <img src={Bell} alt="" />
      </div> -->
      <!-- {#if Object.keys(userInfo).length !== 0}
        <div class="relative">
          <div
            class="w-[40px] h-[40px] rounded-full overflow-hidden cursor-pointer"
            on:click={() => (showPopover = !showPopover)}
          >
            <img
              src={userInfo.picture}
              alt=""
              class="w-full h-full object-cover"
            />
          </div>
          {#if showPopover}
            <div
              class="bg-white py-2 px-3 text-sm rounded-lg absolute -bottom-17 left-1/2 transform -translate-x-1/2 flex flex-col gap-1 w-[80px]"
              style="box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15);"
            >
              {#if APP_TYPE.TYPE === "EXT"}
                <div
                  class="cursor-pointer text-black"
                  on:click={() => {
                    browser.tabs.create({
                      url: "src/entries/options/index.html?tab=nft",
                    });
                    showPopover = false;
                  }}
                >
                  Dashboard
                </div>
              {:else}
                <a
                  class="cursor-pointer text-black"
                  href="/entries/options/index.html?tab=nft"
                  target="_blank"
                  on:click={() => {
                    showPopover = false;
                  }}
                >
                  My NFT
                </a>
              {/if}
              <div
                class="cursor-pointer text-red-500 font-medium"
                on:click={() => handleSignOut()}
              >
                Log out
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div
          on:click={() => {
            isOpenAuthModal = true;
          }}
          class="text-white font-semibold xl:text-base text-sm cursor-pointer"
        >
          Login
        </div>
      {/if} -->
    </div>
    <WalletProvider {localStorageKey} {wallets} autoConnect />
  </div>
</div>
<AppOverlay isOpen={isOpenAuthModal} on:close={() => (isOpenAuthModal = false)}>
  <div class="title-3 text-gray-600 font-semibold max-w-[530px] mb-5">
    {MultipleLang.modal_login_title}
  </div>
  <div class="flex flex-col justify-center items-center gap-2">
    <SolanaAuth />
    <GoogleAuth />
  </div>
</AppOverlay>

<style>
</style>
