<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { isDarkMode } from "~/store";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { wagmiAbi } from "~/lib/viem-evm-abi";
  import { publicClient } from "~/lib/viem-client";
  import { mainnet } from "viem/chains";

  import PricePackage from "~/UI/PricePackage/PricePackage.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";
  import Copy from "~/components/Copy.svelte";

  import Ethereum from "~/assets/ethereum.png";
  import Solana from "~/assets/solana.png";
  import Bnb from "~/assets/bnb.png";
  import Matic from "~/assets/matic.png";

  const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const receiveAddress = "0x6AedbE81435BBD67e2223eadd256992DC64fc90B";

  const listChain = [
    {
      logo: Ethereum,
      label: "Ethereum",
      value: "eth",
    },
    // {
    //   logo: Solana,
    //   label: "Solana",
    //   value: "sol",
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

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  let isLoadingBuy = false;
  let selectedPackage;

  const handleSelectedPackage = (item) => {
    selectedPackage = item;
  };

  const handleBuy = async (chainValue: string) => {
    const account = await publicClient.requestAddresses();

    const formatData = {
      plan: selectedPackage.plan,
      interval: selectedPackage.selectedTypePackage,
      chain: chainValue,
      isTrial: selectedPackage.isNewUser,
    };

    isLoadingBuy = true;
    try {
      if (chainValue === "sol") {
        const response = await nimbus.post(
          "/v2/payments/create-session",
          formatData
        );
        if (response && response?.data) {
          window.location.replace(response?.data?.url);
        }
      }

      if (chainValue === "eth") {
        const price =
          selectedPackage.selectedTypePackage === "year"
            ? selectedPackage.price * 12
            : selectedPackage.price;
        console.log("price: ", price);

        // Todo: update $ to usdc amount

        publicClient
          .writeContract({
            address: usdcAddress,
            account: account[0],
            chain: mainnet,
            abi: wagmiAbi,
            functionName: "transfer",
            args: [receiveAddress, BigInt(10 * 1000000)],
          })
          .catch((e) => {
            console.error("error", e);
            toastMsg =
              "Transfer amount exceeds balance in your wallet. Please try again!";
            isSuccessToast = false;
            trigger();
          });
      }
    } catch (e) {
      console.error(e);
      isLoadingBuy = false;
    } finally {
      isLoadingBuy = false;
    }
  };
</script>

<ErrorBoundary>
  <div
    class="max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="xl:text-5xl text-7xl font-semibold text-center">
        Upgrade Plan
      </div>
      <div class="xl:text-xl text-3xl text-center">
        Use Nimbus at its full potential. Tracking your portfolio, reduce risk,
        maximize return.
      </div>
    </div>

    {#if selectedPackage && Object.keys(selectedPackage).length !== 0}
      <div class="flex flex-col justify-center min-h-[70vh]">
        <div class="flex flex-col items-center gap-1">
          <div class="flex items-center gap-1 xl:text-lg text-xl">
            You're going to upgrade to plan <span
              class="font-semibold uppercase"
              >{selectedPackage.plan === "Professional"
                ? "Alpha"
                : selectedPackage.plan}</span
            >
            with
            <span class="flex items-end gap-1 font-semibold">
              {selectedPackage.selectedTypePackage === "year"
                ? "$" + selectedPackage.price * 12 + " for 1 year"
                : "$" + selectedPackage.price + " for 1 month"}
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
          If missing your prefer payment method<br /> please contact Telegram
          <a
            href="https://t.me/thanhle27"
            target="_blank"
            class="font-medium text-[#1E96FC] hover:underline">@thanhle27</a
          >
          or send email to
          <a
            href="mailto:thanhle@getnimbus.io"
            target="_blank"
            class="font-medium text-[#1E96FC] hover:underline"
            >thanhle@getnimbus.io</a
          > for support
        </div>
      </div>
    {:else}
      <PricePackage selectedPackage={handleSelectedPackage} />
    {/if}
  </div>
</ErrorBoundary>

{#if showToast}
  <div class="fixed top-3 right-3 w-full z-10">
    <Toast
      transition={blur}
      params={{ amount: 10 }}
      position="top-right"
      color={isSuccessToast ? "green" : "red"}
      bind:open={showToast}
    >
      <svelte:fragment slot="icon">
        {#if isSuccessToast}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            /></svg
          >
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>
