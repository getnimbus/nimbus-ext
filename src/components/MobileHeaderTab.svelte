<script lang="ts">
  import { Link, useMatch, useNavigate } from "svelte-navigator";
  import {
    chain,
    wallet,
    isShowHeaderMobile,
    isDarkMode,
    user,
    typeWallet,
  } from "~/store";
  import { i18n } from "~/lib/i18n";
  import { nimbus } from "~/lib/network";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import Crown from "~/assets/crown.svg";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytics: i18n("newtabPage.analytics", "Analytics"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
    news: i18n("newtabPage.news", "News"),
    whales: i18n("newtabPage.whales", "Whales"),
    search_placeholder: i18n("newtabPage.search-placeholder", "Search address"),
  };

  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const absoluteMatch = useMatch("/:page");

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

  $: navActive = $absoluteMatch ? $absoluteMatch.params.page : "portfolio";
</script>

<div class="flex items-center justify-evenly py-2">
  {#if selectedWallet === "0xc02ad7b9a9121fc849196e844dc869d2250df3a6"}
    <div
      class={`flex items-center gap-2 cursor-pointer hover:opacity-100 transition-all ${
        darkMode
          ? navActive === "portfolio"
            ? "opacity-100"
            : "opacity-40"
          : navActive === "portfolio"
          ? "opacity-100"
          : "opacity-40"
      }`}
      on:click={() => {
        navActive = "portfolio";
        navigate(
          `/?type=EVM&chain=${
            selectedChain || "All"
          }&address=0xc02ad7b9a9121fc849196e844dc869d2250df3a6`
        );
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 10.8333L7.5 5.83333L13.3333 10L18.3333 2.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M1.66666 17.5L3.53832 13.7567"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M1.66666 10.8334H4.99999L13.3333 15L18.3333 11.6667"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="font-medium text-xl">
        {MultipleLang.portfolio}
      </span>
    </div>
    <div
      class={`flex items-center gap-2 cursor-pointer py-2 hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "analytic"
                ? "opacity-100"
                : "opacity-40"
              : navActive === "analytic"
              ? "opacity-100"
              : "opacity-40"
          }
          `}
      on:click={() => {
        navActive = "analytic";
        navigate(
          `/analytic?type=EVM&chain=${
            selectedChain || "All"
          }&address=0xc02ad7b9a9121fc849196e844dc869d2250df3a6`
        );
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_101_68)">
          <path
            d="M0.833328 10H5.83333L8.33333 5.83337L11.6667 14.1667L14.1667 10H19.1667"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M10 19.1667C15.0626 19.1667 19.1667 15.0627 19.1667 10C19.1667 4.93743 15.0626 0.833374 10 0.833374C4.93738 0.833374 0.833328 4.93743 0.833328 10C0.833328 15.0627 4.93738 19.1667 10 19.1667Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_101_68">
            <rect width="20" height="20" fill="currentColor" />
          </clipPath>
        </defs>
      </svg>
      <span class="flex gap-[1px]">
        <span class="font-medium text-xl">
          {MultipleLang.analytics}
        </span>
        <span class="flex items-center gap-[1px] -mt-2">
          <img src={Crown} alt="" width="17" height="16" />
          <span class="text-sm font-medium text-[#FFB800] -mt-[1px]">Pro</span>
        </span>
      </span>
    </div>
  {:else}
    <Link
      to={`/?type=${typeWalletAddress}&chain=${selectedChain}&address=${selectedWallet}`}
    >
      <div
        class={`flex flex-col items-center gap-2 cursor-pointer hover:opacity-100 transition-all ${
          darkMode
            ? navActive === "portfolio"
              ? "opacity-100"
              : "opacity-40"
            : navActive === "portfolio"
            ? "opacity-100"
            : "opacity-40"
        }`}
        on:click={() => {
          navActive = "portfolio";
          queryClient.invalidateQueries(["users-me"]);
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 10.8333L7.5 5.83333L13.3333 10L18.3333 2.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M1.66666 17.5L3.53832 13.7567"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M1.66666 10.8334H4.99999L13.3333 15L18.3333 11.6667"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="font-medium text-xl">
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
        class={`flex flex-col items-center gap-2 cursor-pointer hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "analytic"
                ? "opacity-100"
                : "opacity-40"
              : navActive === "analytic"
              ? "opacity-100"
              : "opacity-40"
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
        <svg
          width="40"
          height="40"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clip-path="url(#clip0_101_68)">
            <path
              d="M0.833328 10H5.83333L8.33333 5.83337L11.6667 14.1667L14.1667 10H19.1667"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10 19.1667C15.0626 19.1667 19.1667 15.0627 19.1667 10C19.1667 4.93743 15.0626 0.833374 10 0.833374C4.93738 0.833374 0.833328 4.93743 0.833328 10C0.833328 15.0627 4.93738 19.1667 10 19.1667Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_101_68">
              <rect width="20" height="20" fill="currentColor" />
            </clipPath>
          </defs>
        </svg>
        <span class="flex gap-[1px]">
          <span class="font-medium text-xl">
            {MultipleLang.analytics}
          </span>
          <span class="flex items-center gap-[1px] -mt-2">
            <img src={Crown} alt="" width="17" height="16" />
            <span class="text-sm font-medium text-[#FFB800] -mt-[1px]">Pro</span
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
      class={`flex flex-col items-center gap-2 cursor-pointer py-2 hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "transactions"
                ? "opacity-100"
                : "opacity-40"
              : navActive === "transactions"
              ? "opacity-100"
              : "opacity-40"
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
      <svg
        width="40"
        height="40"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clip-path="url(#clip0_101_74)">
          <path
            d="M10 4.16671C10.9205 4.16671 11.6667 3.42052 11.6667 2.50004C11.6667 1.57957 10.9205 0.833374 10 0.833374C9.07953 0.833374 8.33334 1.57957 8.33334 2.50004C8.33334 3.42052 9.07953 4.16671 10 4.16671Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M2.78334 16.6667C3.70381 16.6667 4.45 15.9205 4.45 15C4.45 14.0796 3.70381 13.3334 2.78334 13.3334C1.86286 13.3334 1.11667 14.0796 1.11667 15C1.11667 15.9205 1.86286 16.6667 2.78334 16.6667Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M17.2167 16.6667C18.1371 16.6667 18.8833 15.9205 18.8833 15C18.8833 14.0796 18.1371 13.3334 17.2167 13.3334C16.2962 13.3334 15.55 14.0796 15.55 15C15.55 15.9205 16.2962 16.6667 17.2167 16.6667Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M5.2325 4.005C3.75358 5.03259 2.64879 6.5131 2.08467 8.22333C1.52056 9.93357 1.52769 11.7808 2.105 13.4867"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M16.2417 16.3417C15.0519 17.698 13.4524 18.6294 11.6856 18.9948C9.91879 19.3602 8.08102 19.1397 6.45084 18.3667"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M18.3025 10.1292C18.1499 8.33323 17.419 6.63511 16.2196 5.28963C15.0201 3.94415 13.4168 3.02384 11.65 2.66675"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_101_74">
            <rect width="20" height="20" fill="currentColor" />
          </clipPath>
        </defs>
      </svg>
      <span class="font-medium text-xl">
        {MultipleLang.transactions}
      </span>
    </div>
  </Link>

  <Link
    to={`${userInfo && Object.keys(userInfo).length !== 0 ? "whales" : "/"}`}
  >
    <div
      class={`flex flex-col items-center gap-2 cursor-pointer py-2 hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "whales"
                ? "opacity-100"
                : "opacity-40"
              : navActive === "whales"
              ? "opacity-100"
              : "opacity-40"
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
      <svg
        width="40"
        height="40"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M31.238 26.684c0-1.062-.836-1.917-1.867-1.917s-1.865.855-1.865 1.917c0 .452.159.864.416 1.193c.975-.339 2.396-.775 3.275-.796c.027-.128.041-.261.041-.397m-1.867 1.936c.799.235 1.994.212 2.242 1.913c.473-1.344-.115-2.687-2.242-1.913"
        />
        <path
          fill="currentColor"
          d="M59.639 7c-.947 0-1.622.537-2.404 1.159c-1.077.856-2.553 2.029-4.65 2.029c-1.164 0-2.439-.834-3.465-1.504c-.978-.64-1.822-1.191-2.814-1.191c-.924 0-2.123.553-2.461 2.112c-.459 2.115.977 4.295 1.872 5.406c.347.431.75.868 1.193 1.281c-4.957 1.642-16.24 4.134-39.056 4.134c-4.005 0-5.453 3.882-5.664 5.959c-.043.359-.411 3.573.012 6.266C3.664 42.004 11.051 52 27.398 52c.623 0 1.213-.006 1.781-.017c.952 1.877 2.227 3.214 3.41 2.947c1.01-.229 1.75-1.584 2.17-3.326a23.886 23.886 0 0 0 1.537-.262C37.664 54.383 39.783 57 42.41 57c.281 0 .561-.031.833-.093c3.888-.878 5.198-7.426 4.77-12.405c6.587-6.497 8.327-21.283 8.707-25.76c4.649-2.179 5.28-5.747 5.28-8.684C62 7.221 60.193 7 59.639 7M27.398 50C11.166 50 5.357 39.887 4.177 32.341c-.4-2.548 0-5.734 0-5.734v-.002c.443-.01.886-.021 1.328-.029c.026 3.039.545 6.152 1.669 9.002c1.126 2.904 2.897 5.549 5.153 7.639c2.246 2.105 4.93 3.657 7.749 4.725c2.824 1.076 5.783 1.704 8.753 2.047c-.463.005-.929.011-1.431.011m1.432-.013c-2.951-.489-5.861-1.26-8.588-2.456c-2.725-1.188-5.256-2.831-7.306-4.95a19.537 19.537 0 0 1-4.531-7.463c-.929-2.752-1.273-5.645-1.156-8.569a77.605 77.605 0 0 1 3.014.028c-.117 3.452.689 6.883 2.222 9.906a21.276 21.276 0 0 0 6.703 7.739c2.789 1.98 5.996 3.272 9.289 3.943c2.264.47 4.566.633 6.862.602c.067.225.141.45.217.676c-1.743.323-3.879.501-6.726.544M17.884 36.615c1.736 2.972 4.233 5.43 7.118 7.173c2.885 1.748 6.17 2.786 9.496 2.983c.117.007.234.003.353.008c.114.596.263 1.217.447 1.85c-2.272-.072-4.532-.337-6.726-.894c-3.211-.804-6.273-2.207-8.866-4.226c-2.597-2.009-4.697-4.638-6.041-7.606c-1.314-2.898-1.91-6.113-1.665-9.244c1.116.069 2.227.172 3.33.322a18.558 18.558 0 0 0 2.554 9.634m-.827-9.349c.18.033.361.06.54.098c.9.178 1.78.423 2.649.703c.014 4.618 2.783 9.595 7.238 12.994a20.029 20.029 0 0 0 7.099 3.473c.022.479.063.979.142 1.518c.014.097.035.199.051.298c-.08-.008-.162-.009-.243-.018a20.165 20.165 0 0 1-9.065-3.291c-2.689-1.795-4.945-4.238-6.439-7.075a16.992 16.992 0 0 1-1.972-8.7m37.757-9.898c-.086 2.465-1.46 17.51-7.213 24.599v-.001a11.977 11.977 0 0 1-1.691 1.727c.668 4.582-.564 10.689-3.106 11.264c-.13.028-.261.043-.394.043c-2.439 0-5.072-4.892-5.707-9.239c-.1-.679-.139-1.301-.135-1.879c-.422-.041-.799-.1-1.132-.164a19.064 19.064 0 0 1-7.346-3.452c-4.101-3.13-6.685-7.639-6.831-11.855c.908.332 1.808.701 2.696 1.114c1.036.444 2.081 1.023 3.298 1.133c1.236.076 2.331-.546 3.188-1.277c-.973.576-2.068 1.059-3.141.846c-1.065-.173-2.041-.785-3.049-1.313a22.98 22.98 0 0 0-6.479-2.413a30.648 30.648 0 0 0-6.868-.582c-2.261.048-4.511.27-6.727.675c.017-.158.468-4.165 3.674-4.165c35.545 0 43.586-5.932 43.586-5.932c-2.357 0-6.121-4.254-5.642-6.465c.083-.383.257-.537.507-.537c1.049 0 3.449 2.695 6.279 2.695c4.045 0 6.248-3.188 7.055-3.188c.249-.002.364.292.364 1.057c0 3.237-.863 5.736-5.186 7.309"
        />
      </svg>
      <span class="font-medium text-xl">
        {MultipleLang.whales}
      </span>
    </div>
  </Link>

  <div
    class={`flex flex-col items-center gap-2 cursor-pointer py-2 hover:opacity-100 transition-all
          ${
            darkMode
              ? navActive === "more"
                ? "opacity-100"
                : "opacity-40"
              : navActive === "more"
              ? "opacity-100"
              : "opacity-40"
          }
          `}
    on:click={() => {
      navActive = "more";
      isShowHeaderMobile.update((n) => (n = true));
    }}
  >
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.0038 21.7929C17.4124 21.7929 21.7968 17.4084 21.7968 11.9999C21.7968 6.59144 17.4124 2.20703 12.0038 2.20703C6.59535 2.20703 2.21094 6.59144 2.21094 11.9999C2.21094 17.4084 6.59535 21.7929 12.0038 21.7929Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <circle cx="16.6196" cy="12.0025" r="1.40871" fill="currentColor" />
      <circle cx="12.0025" cy="12.0025" r="1.40871" fill="currentColor" />
      <circle cx="7.38527" cy="12.0025" r="1.40871" fill="currentColor" />
    </svg>
    <span class="font-medium text-xl"> More </span>
  </div>
</div>

<style global windi:preflights:global windi:safelist:global></style>
