<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { isDarkMode } from "~/store";

  import PricePackage from "~/UI/PricePackage/PricePackage.svelte";
  import Button from "~/components/Button.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Copy from "~/components/Copy.svelte";

  import Bnb from "~/assets/bnb.png";
  import Ethereum from "~/assets/ethereum.png";
  import Matic from "~/assets/matic.png";
  import Solana from "~/assets/solana.png";

  const listChain = [
    {
      logo: Solana,
      label: "Solana",
      value: "sol",
    },
    // {
    //   logo: Ethereum,
    //   label: "Ethereum",
    //   value: "eth",
    // },
    // {
    //   logo: Bnb,
    //   label: "Binance",
    //   value: "bsc",
    // },
    // {
    //   logo: Matic,
    //   label: "Polygon",
    //   value: "pol",
    // },
  ];

  let isLoadingBuy = false;
  let selectedPackage;

  const handleSelectedPackage = (item) => {
    selectedPackage = item;
    console.log("this is selectedPackage : ", item);
  };

  const handleBuy = async (chainValue: string) => {
    const formatData = {
      plan: selectedPackage.plan,
      interval: selectedPackage.selectedTypePackage,
      chain: chainValue,
      isTrial: selectedPackage.isNewUser,
    };
    isLoadingBuy = true;
    try {
      const response = await nimbus.post(
        "/v2/payments/create-session",
        formatData
      );
      if (response && response?.data) {
        isLoadingBuy = false;
        window.location.replace(response?.data?.url);
      }
    } catch (e) {
      console.error(e);
      isLoadingBuy = false;
    }
  };
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-2"
  >
    <div class="xl:text-5xl text-7xl font-semibold text-center">
      Upgrade Plan
    </div>
    {#if selectedPackage && Object.keys(selectedPackage).length !== 0}
      <div class="flex flex-col justify-center min-h-[70vh]">
        <!-- remove me -->
        <div class="xl:text-lg text-2xl mb-3">
          Please follow this payment steps:
        </div>
        <ul class="xl:text-lg text-2xl flex flex-col gap-5">
          <li>
            <span class="xl:text-xl text-3xl font-medium">Step 1:</span> Send
            <span class="xl:text-lg text-2xl font-medium"
              >{selectedPackage.selectedTypePackage === "year"
                ? selectedPackage.plan === "Professional"
                  ? "$990"
                  : "$99"
                : selectedPackage.price}</span
            >

            USDT or USDC to this address
            <span class="font-medium"
              >0x6aedbe81435bbd67e2223eadd256992dc64fc90b
            </span>on Ethereum, BNB or Polygon.
          </li>

          <li>
            <span class="xl:text-xl text-3xl font-medium">Step 2:</span> After
            transfer success, Dm TG
            <a
              href="https://t.me/thanhle27"
              target="_blank"
              class="font-medium text-[#1E96FC] hover:text-[#27326f]"
              >@thanhle27</a
            >
            or send email to
            <a
              href="mailto:thanhle@getnimbus.io"
              target="_blank"
              class="font-medium text-[#1E96FC] hover:text-[#27326f]"
              >thanhle@getnimbus.io</a
            >
            including your <span class="font-medium">wallet address</span> you
            want to upgrade, the
            <span class="font-medium">transaction hash</span>
            and the <span class="font-medium">coupon code</span> you want to apply.
          </li>

          <li>
            <span class="xl:text-xl text-3xl font-medium">Step 3:</span> We will
            check and upgrade your account after we receive your information.
          </li>
        </ul>
        <div
          class="text-[#1E96FC] cursor-pointer flex items-center gap-2 mt-2 xl:text-base text-2xl mt-6"
          on:click={() => {
            selectedPackage = undefined;
          }}
        >
          <div class="transform -rotate-180">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="#1E96FC"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                fill=""
              />
            </svg>
          </div>
          Choose other Plan
        </div>

        <!-- <div class="flex flex-col items-center gap-1">
          <div class="flex items-center gap-1 xl:text-lg text-xl">
            You're going to upgrade to plan <span class="font-medium uppercase"
              >{selectedPackage.plan}</span
            >
            with
            <span class="flex items-end gap-1 font-semibold">
              <span>{selectedPackage.price}</span><span
                class="xl:text-base text-lg text-gray-400 mb-[2px]">/month</span
              >
            </span>
          </div>
        </div>
        {#if selectedPackage.isNewUser}
          <div class="flex items-center justify-center gap-2 mt-2">
            Promotion Code:
            <span class="text-xl">
              <Copy
                address="TRIAL"
                textTooltip="Copy coupon to clipboard"
                iconColor={`${$isDarkMode ? "#fff" : "#000"}`}
                color={`${$isDarkMode ? "#fff" : "#000"}`}
              />
            </span>
          </div>
        {/if}
        <div class="flex flex-col gap-3 items-center mt-5">
          <div class="my-3 xl:text-base text-lg">
            Choose your prefer payment method
          </div>
          {#each listChain as chain}
            <div class="w-62 xl:text-lg text-xl">
              <Button
                variant="secondary"
                isLoading={isLoadingBuy}
                on:click={() => handleBuy(chain.value)}
              >
                <img src={chain.logo} class="w-5 h-5 rounded-full" />
                {chain.label}</Button
              >
            </div>
          {/each}
          <div
            class="text-[#1E96FC] cursor-pointer flex items-center gap-2 mt-2 xl:text-base text-2xl"
            on:click={() => {
              selectedPackage = undefined;
            }}
          >
            <div class="transform -rotate-180">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="#1E96FC"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                  fill=""
                /></svg
              >
            </div>
            Choose other Plan
          </div>
        </div>
        <div class="text-center text-gray-500 xl:text-sm text-2xl mt-8">
          If missing your prefer payment method, please contact Telegram
          <strong>@thanhle27</strong> for support
        </div> -->
      </div>
    {:else}
      <PricePackage selectedPackage={handleSelectedPackage} />
    {/if}
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global>
</style>
