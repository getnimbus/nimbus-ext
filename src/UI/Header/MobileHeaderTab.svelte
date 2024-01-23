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
  import { useQueryClient } from "@tanstack/svelte-query";

  import Crown from "~/assets/crown.svg";

  const MultipleLang = {
    portfolio: i18n("newtabPage.portfolio", "Portfolio"),
    analytics: i18n("newtabPage.analytics", "Analytics"),
    transactions: i18n("newtabPage.transactions", "Transactions"),
  };

  const navigate = useNavigate();
  const absoluteMatch = useMatch("/:page");
  const queryClient = useQueryClient();

  $: navActive = $absoluteMatch ? $absoluteMatch.params.page : "portfolio";
</script>

<div class="grid grid-cols-4 justify-center items-center pt-4 pb-8">
  <Link
    to={`${
      $wallet ? `/?type=${$typeWallet}&chain=${$chain}&address=${$wallet}` : "/"
    }`}
  >
    <div
      class={`flex flex-col items-center gap-2 cursor-pointer hover:opacity-100 transition-all ${
        $isDarkMode
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
        width="50"
        height="50"
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
      <span class="font-medium text-2xl">
        {MultipleLang.portfolio}
      </span>
    </div>
  </Link>

  <Link
    to={`${
      $wallet
        ? `/analytic?type=${$typeWallet}&chain=${$chain}&address=${$wallet}`
        : "/"
    }`}
  >
    <div
      class={`flex flex-col items-center gap-2 cursor-pointer hover:opacity-100 transition-all
          ${
            $isDarkMode
              ? navActive === "analytic"
                ? "opacity-100"
                : "opacity-40"
              : navActive === "analytic"
                ? "opacity-100"
                : "opacity-40"
          }
          `}
      on:click={() => {
        if ($user && Object.keys($user).length !== 0) {
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
        width="45"
        height="45"
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
        <span class="font-medium text-2xl">
          {MultipleLang.analytics}
        </span>
        <span class="flex items-center gap-[1px] -mt-2">
          <img src={Crown} alt="" width="19" height="18" />
        </span>
      </span>
    </div>
  </Link>

  <Link
    to={`${
      $wallet
        ? `/transactions?type=${$typeWallet}&chain=${$chain}&address=${$wallet}`
        : "/"
    }`}
  >
    <div
      class={`flex flex-col items-center gap-2 cursor-pointer py-2 hover:opacity-100 transition-all
          ${
            $isDarkMode
              ? navActive === "transactions"
                ? "opacity-100"
                : "opacity-40"
              : navActive === "transactions"
                ? "opacity-100"
                : "opacity-40"
          }
          `}
      on:click={() => {
        navActive = "transactions";
      }}
    >
      <svg
        width="45"
        height="45"
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
      <span class="font-medium text-2xl">
        {MultipleLang.transactions}
      </span>
    </div>
  </Link>

  <div
    class={`flex flex-col items-center gap-2 cursor-pointer py-2 hover:opacity-100 transition-all
          ${
            $isDarkMode
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
      width="50"
      height="50"
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
    <span class="font-medium text-2xl">More</span>
  </div>
</div>

<style global windi:preflights:global windi:safelist:global></style>
