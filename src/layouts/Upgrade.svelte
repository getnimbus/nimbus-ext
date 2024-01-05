<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { isDarkMode } from "~/store";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { wagmiAbi } from "~/lib/viem-evm-abi";
  import publicClient from "~/lib/viem-client";
  import { mainnet } from "viem/chains";
  import { useNavigate } from "svelte-navigator";

  import PricePackage from "~/UI/PricePackage/PricePackage.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";

  import Ethereum from "~/assets/ethereum.png";
  import Solana from "~/assets/solana.png";
  import Bnb from "~/assets/bnb.png";
  import Matic from "~/assets/matic.png";

  const navigate = useNavigate();

  const usdcAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
  const receiveAddress = "0x6AedbE81435BBD67e2223eadd256992DC64fc90B";

  const listChain = [
    {
      logo: Ethereum,
      label: "Ethereum",
      value: "ETH",
    },
    // {
    //   logo: Solana,
    //   label: "Solana",
    //   value: "SOL",
    // },
    // {
    //   logo: Bnb,
    //   label: "Binance",
    //   value: "BSC",
    // },
    // {
    //   logo: Matic,
    //   label: "Polygon",
    //   value: "POL",
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

  let isLoadingSubmitCoupleCode = false;
  let code = "";
  let discountPercent = 0;
  let coupleCode = "";

  const handleSelectedPackage = (item) => {
    selectedPackage = item;
  };

  const onSubmitCoupleCode = async (e) => {
    isLoadingSubmitCoupleCode = true;
    const formData = new FormData(e.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    try {
      const response = await nimbus.post("/v3/payments/check-coupon", {
        code: data.code,
      });
      if (response?.error) {
        toastMsg = response?.error;
        isSuccessToast = false;
      } else {
        if (response?.data?.status === 1) {
          coupleCode = data.code;
          isSuccessToast = true;

          if (response?.data?.type === "Discount") {
            discountPercent = response?.data?.value;
          }

          if (response?.data?.type === "Free Trial") {
            await submitTrial(data.code);
          }
        }

        if (response?.data?.status === 0) {
          isSuccessToast = false;
        }

        toastMsg = response?.data?.message;
      }
      isLoadingSubmitCoupleCode = false;
      trigger();
    } catch (e) {
      console.error(e);
      isLoadingSubmitCoupleCode = false;
      toastMsg =
        "There are some error when apply your coupon code. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };

  const submitTrial = async (code) => {
    try {
      await nimbus.post("/v2/payments/redeem-code", {
        code,
        plan: selectedPackage.plan,
      });
      navigate(`/payments/success?isTrial=${true}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuy = async (chainValue: string) => {
    const account = await publicClient.requestAddresses();

    const payload = {
      value: selectedPackage.selectedTypePackage === "year" ? 12 : 1,
      code: coupleCode,
      plan: selectedPackage.plan,
      chain: chainValue,
      txHash: "",
    };

    isLoadingBuy = true;
    try {
      // if (chainValue === "SOL") {
      //   const response = await nimbus.post(
      //     "/v2/payments/create-session",
      //     payload
      //   );
      //   if (response && response?.data) {
      //     window.location.replace(response?.data?.url);
      //   }
      // }

      if (chainValue === "ETH") {
        let price =
          selectedPackage.selectedTypePackage === "year"
            ? selectedPackage.price * 12
            : selectedPackage.price;

        if (discountPercent !== 0) {
          const newPrice = price - price * (discountPercent / 100);
          price = Math.round(newPrice * 100) / 100;
        }

        publicClient
          .writeContract({
            address: usdcAddress,
            account: account[0],
            chain: mainnet,
            abi: wagmiAbi,
            functionName: "transfer",
            args: [receiveAddress, price * 10 ** 6],
          })
          .then(async (res) => {
            const response = await nimbus.post("/v3/payments/create-session", {
              ...payload,
              txHash: res,
            });
            if (response && response?.data) {
              navigate(
                `/payments/success?paymentId=${response?.data?.paymentLinkId}`
              );
            }
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
          <div class="flex items-center gap-1 xl:text-lg text-2xl">
            You're going to upgrade to plan <span
              class="font-semibold uppercase"
              >{selectedPackage.plan === "Professional"
                ? "Alpha"
                : selectedPackage.plan}</span
            >
            with
            <span class="flex items-end gap-1 font-semibold">
              {selectedPackage.selectedTypePackage === "year"
                ? "$" +
                  `${
                    discountPercent !== 0
                      ? Math.round(
                          (selectedPackage.price * 12 -
                            selectedPackage.price *
                              12 *
                              (discountPercent / 100)) *
                            100
                        ) / 100
                      : selectedPackage.price * 12
                  }` +
                  " for 1 year"
                : "$" +
                  `${
                    discountPercent !== 0
                      ? Math.round(
                          (selectedPackage.price -
                            selectedPackage.price * (discountPercent / 100)) *
                            100
                        ) / 100
                      : selectedPackage.price
                  }` +
                  " for 1 month"}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-3 justify-center items-center mt-2">
          <form
            on:submit|preventDefault={onSubmitCoupleCode}
            class="flex items-center gap-3"
          >
            <div
              class={`input-2 input-border w-full xl:py-[6px] py-3 px-3 ${
                code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
              }`}
            >
              <input
                type="text"
                id="code"
                name="code"
                required
                placeholder="Couple code"
                value=""
                class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal ${
                  code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
                } ${
                  $isDarkMode
                    ? "text-white"
                    : "text-[#5E656B] placeholder-[#5E656B]"
                }`}
                on:keyup={({ target: { value } }) => (code = value)}
              />
            </div>
            <div class="w-[120px]">
              <Button
                type="submit"
                isLoading={isLoadingSubmitCoupleCode}
                disabled={isLoadingSubmitCoupleCode}
              >
                Apply
              </Button>
            </div>
          </form>
        </div>

        <div class="flex flex-col gap-3 items-center mt-5">
          <div class="my-3 xl:text-base text-2xl">
            Choose your prefer payment method
          </div>
          {#each listChain as chain}
            <div class="w-62 xl:text-lg text-xl">
              <Button
                variant="secondary"
                isLoading={isLoadingBuy}
                on:click={() => {
                  handleBuy(chain.value);
                }}
              >
                <img
                  src={chain.logo}
                  class="xl:w-5 xl:h-5 w-7 h-7 rounded-full"
                />
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
              <div class="xl:block hidden">
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
              <div class="xl:hidden block">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 14 14"
                  fill="#1E96FC"
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    d="M10.4767 6.17348L6.00668 1.70348L7.18501 0.525146L13.6667 7.00681L7.18501 13.4885L6.00668 12.3101L10.4767 7.84015H0.333344V6.17348H10.4767Z"
                    fill=""
                  /></svg
                >
              </div>
            </div>
            Choose other Plan
          </div>
        </div>

        <div class="text-center text-gray-500 xl:text-sm text-xl mt-8">
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
  <div class="fixed top-3 right-3 w-full z-50">
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
