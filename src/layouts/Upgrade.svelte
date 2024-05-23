<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { isDarkMode } from "~/store";
  import { navigateTo } from "svelte-router-spa";
  import mixpanel from "mixpanel-browser";
  import { wait } from "~/entries/background/utils";
  import { triggerToast } from "~/utils/functions";

  import PricePackage from "~/UI/PricePackage/PricePackage.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Button from "~/components/Button.svelte";

  import Coinbase from "~/assets/coinbase.png";

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
      const response: any = await nimbus.post("/v3/payments/check-coupon", {
        code: data.code,
      });
      if (response?.error) {
        triggerToast(response?.error, "fail");
      } else {
        if (response?.data?.status === 1) {
          coupleCode = data.code;
          triggerToast(response?.data?.message, "success");

          if (response?.data?.type === "Discount") {
            discountPercent = response?.data?.value;
          }

          if (response?.data?.type === "Free Trial") {
            await submitTrial(data.code);
          }
        }

        if (response?.data?.status === 0) {
          triggerToast(response?.data?.message, "fail");
        }
      }

      isLoadingSubmitCoupleCode = false;
      code = "";
    } catch (e) {
      console.error(e);
      isLoadingSubmitCoupleCode = false;
      triggerToast(
        "There are some error when apply your coupon code. Please try again!",
        "fail"
      );
    }
  };

  onMount(() => {
    mixpanel.track("upgrade_page");
  });

  const submitTrial = async (code) => {
    try {
      await nimbus.post("/v2/payments/redeem-code", {
        code,
        plan: selectedPackage.plan,
      });
      navigateTo(`/payments/success?isTrial=${true}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuy = async () => {
    const payload = {
      value: selectedPackage.selectedTypePackage === "year" ? 12 : 1,
      code: coupleCode,
      plan: selectedPackage.plan,
    };
    isLoadingBuy = true;
    try {
      const response: any = await nimbus.post(
        "/v3/payments/create-session",
        payload
      );
      if (response && response?.data) {
        window.open(response?.data?.hosted_url, "_blank");
        await wait(4000);
        navigateTo(
          `/payments/success?paymentId=${response?.data?.paymentLinkId}`
        );
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
    class="xl:min-h-screen max-w-[2000px] m-auto xl:w-[90%] w-[90%] py-8 flex flex-col gap-10"
  >
    <div class="flex flex-col gap-2 justify-center">
      <div class="sm:text-5xl text-4xl font-semibold text-center">
        Upgrade Plan
      </div>
      <div class="text-xl text-center">
        Use Nimbus at its full potential. Tracking your portfolio, reduce risk,
        maximize return.
      </div>
    </div>

    {#if selectedPackage && Object.keys(selectedPackage)?.length !== 0}
      <div class="flex flex-col justify-center min-h-[70vh]">
        <div class="flex flex-col items-center gap-1">
          <div class="flex flex-wrap items-center gap-1 text-lg">
            You're going to upgrade to plan <span
              class="sm:font-semibold font-medium uppercase"
              >{selectedPackage.plan === "Professional"
                ? "Alpha"
                : selectedPackage.plan}</span
            >
            with
            <span class="flex items-end gap-1 sm:font-semibold font-medium">
              {selectedPackage.selectedTypePackage === "year"
                ? `${
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
                  " USDC" +
                  " for 1 year"
                : `${
                    discountPercent !== 0
                      ? Math.round(
                          (selectedPackage.price -
                            selectedPackage.price * (discountPercent / 100)) *
                            100
                        ) / 100
                      : selectedPackage.price
                  }` +
                  " USDC" +
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
              class={`input-2 input-border w-full xl:py-[4px] py-3 px-3 ${
                code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg_fafafbff"
              }`}
            >
              <input
                type="text"
                id="code"
                name="code"
                required
                placeholder="Couple code"
                bind:value={code}
                class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-lg font-normal ${
                  code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
                } ${
                  $isDarkMode
                    ? "text-white"
                    : "text-[#5E656B] placeholder-[#5E656B]"
                }`}
                on:change={(event) => {
                  code = event?.target?.value;
                }}
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
          <div class="my-3 text-base">Choose your prefer payment method</div>
          <div class="w-62 text-base">
            <Button
              variant="secondary"
              isLoading={isLoadingBuy}
              on:click={handleBuy}
            >
              <img src={Coinbase} alt="coinbase" class="w-5 h-5 rounded-full" />
              Coinbase</Button
            >
          </div>
          <div
            class="text-[#1E96FC] cursor-pointer flex items-center gap-2 mt-2 text-base"
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

        <div class="text-center text-gray-500 xl:text-sm text-lg mt-8">
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

<style windi:preflights:global windi:safelist:global>
</style>
