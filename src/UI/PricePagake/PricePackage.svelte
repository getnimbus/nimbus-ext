<script lang="ts">
  import { onMount } from "svelte";
  import { typePackage } from "~/utils";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import YieldFarmingVideo from "~/assets/pricing/Yield-Farming.mp4";
  import RiskVideo from "~/assets/pricing/Risk.mp4";
  import ReturnVideo from "~/assets/pricing/Return.mp4";
  import RiskReturnVideo from "~/assets/pricing/Risk-Return.mp4";
  import RealtimeVideo from "~/assets/pricing/Realtime.mp4";
  import RebalanceVideo from "~/assets/pricing/Rebalance.mp4";
  import CustomAllocationVideo from "~/assets/pricing/Custom-Allocation.mp4";

  export let selectedPackage = (item) => {};
  export let selectedExplorer;
  export let selectedProfessional;

  let selectedTypePackage: "month" | "year" = "year";

  const getUserInfo = async () => {
    try {
      const response = await nimbus.get("/users/me");
      if (response && response.data) {
        console.log("response: ", response);
      }
    } catch (e) {
      console.error("e: ", e);
    }
  };

  onMount(() => {
    getUserInfo();
  });

  const getTooltipContent = (text: string, videoUrl: string) => {
    return `
      <div style="padding: 8px; border-radius: 8px; background: rgba(0, 0, 0, 0.8); width: 560px; height: auto;">
        ${
          text
            ? `<div style="margin-bottom: 6px; font-size: 14px; line-height: 16px; color: #fff;">${text}</div>`
            : ""
        }
        <video autoplay muted playsinline control disablepictureinpicture loop style="border-radius: 6px;">
          <source type="video/mp4" src="${videoUrl}" />
        </video>
      </div>
    `;
  };
</script>

<div class="flex flex-col gap-4 mt-2">
  <div class="text-center text-gray-500 xl:text-xl text-3xl">
    Use Nimbus at its full potential. Traking your portfolio, reduce risk,
    maximize return.
  </div>

  <div
    class="xl:text-lg text-2xl p-4 mb-4 text-green-600 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-500"
    role="alert"
  >
    <span class="xl:mr-1 mr-2">⭐️</span> We're giving 1000 coupon codes
    <span class="font-bold">OG-INVESTOR</span>
    which get <span class="font-bold">30%</span> off for the first-time payment
    and
    <span class="font-bold">10% off lifetime</span> payments.
  </div>

  <div class="flex items-center justify-center gap-2">
    <AnimateSharedLayout>
      {#each typePackage as type}
        <div
          class="relative cursor-pointer xl:text-base text-2xl font-medium py-1 px-3 rounded-[100px] transition-all"
          on:click={() => (selectedTypePackage = type.value)}
        >
          <div
            class={`relative z-20 ${
              selectedTypePackage === type.value && "text-white"
            }`}
          >
            {type.label}
          </div>
          {#if type.value === selectedTypePackage}
            <Motion
              let:motion
              layoutId="active-pill"
              transition={{ type: "spring", duration: 0.6 }}
            >
              <div
                class="absolute inset-0 rounded-full bg-[#1E96FC] z-10"
                use:motion
              />
            </Motion>
          {/if}
        </div>
      {/each}
    </AnimateSharedLayout>
  </div>

  <div class="grid lg:grid-cols-3 grid-cols-1 gap-7">
    <div class="border border-[#0000001a] rounded-xl flex flex-col gap-4 p-4">
      <div class="xl:text-3xl text-4xl font-semibold">
        0$<span class="xl:text-xl text-2xl ml-1 text-gray-400 mb-[2px]"
          >/{selectedTypePackage}</span
        >
      </div>
      <div>
        <div class="flex flex-col border-b-[1px] border-[#0000001a] pb-4">
          <div class="xl:text-xl text-2xl font-medium">FREE</div>
          <div class="xl:text-lg text-xl text-gray-500">
            For those who starting to invest
          </div>
        </div>
        <div class="mt-4 flex flex-col items-start gap-2">
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent(
                "Get latest market information and real-time market update",
                RealtimeVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Real-time market update
          </div>
          <div class="xl:text-base text-lg text-black">
            <span class="font-bold">3</span> tracked Wallets
          </div>
          <div class="xl:text-base text-lg text-black">
            <span class="font-bold">$2 000</span> total net worth
          </div>
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent(
                "Get up to 1000+ yield farming opportunities to boost your earning",
                YieldFarmingVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Yield farming opportunities (Limited)
          </div>
          <div class="xl:text-base text-lg text-gray-400">
            Custom token category
          </div>
          <div class="xl:text-base text-lg text-gray-400">Risks analysis</div>
          <div class="xl:text-base text-lg text-gray-400">Returns analysis</div>
          <div class="xl:text-base text-lg text-gray-400">
            Risks & Returns analysis
          </div>
          <div class="xl:text-base text-lg text-gray-400">
            Rebalance Strategy
          </div>
          <div class="xl:text-base text-lg text-gray-400">
            Professional community
          </div>

          <div
            class="flex items-center gap-2 mt-2 text-[#1E96FC] font-semibold xl:text-lg text-xl cursor-pointer"
            on:click={() => {
              selectedPackage({
                name: "FREE",
                price: 0,
              });
            }}
          >
            Try FREE
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
        </div>
      </div>
    </div>

    <!-- Explorer -->
    <div
      class="border border-[#0000001a] rounded-xl flex flex-col gap-4 p-4 relative"
    >
      <div
        class="absolute top-6 right-0 rounded-tl-full rounded-bl-full bg-[#1E96FC] font-medium text-white xl:text-xs text-base uppercase py-1 px-3"
      >
        popular
      </div>
      <div class="xl:text-3xl text-4xl font-semibold flex items-end gap-2">
        <span
          >{selectedTypePackage === "month"
            ? `$${
                selectedExplorer?.prices.find(
                  (item) => item.recurring.interval === "month"
                )?.unitAmountDecimal
              }`
            : `$${
                selectedExplorer?.prices.find(
                  (item) => item.recurring.interval === "year"
                )?.unitAmountDecimal / 12
              }`}</span
        ><span class="xl:text-xl text-2xl text-gray-400 mb-[2px]"
          >/{selectedTypePackage}</span
        >
      </div>
      <div>
        <div class="flex flex-col border-b-[1px] border-[#0000001a] pb-4">
          <div class="xl:text-xl text-2xl font-medium">EXPLORER</div>
          <div class="xl:text-lg text-xl text-gray-500">
            Boost your return and reduce your risk
          </div>
        </div>
        <div class="mt-4 flex flex-col items-start gap-2">
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent(
                "Get latest market information and real-time market update",
                RealtimeVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Real-time market update
          </div>
          <div class="xl:text-base text-lg text-black">
            <span class="font-bold">7</span> tracked Wallets
          </div>
          <div class="xl:text-base text-lg text-black">
            <span class="font-bold">$50 000</span> total net worth
          </div>
          <div
            use:tooltip={{
              content: getTooltipContent(
                "Get up to 1000+ yield farming opportunities to boost your earning",
                YieldFarmingVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
          >
            Yield farming opportunities
          </div>
          <div
            use:tooltip={{
              content: getTooltipContent(
                "Custom your token category to diversify your portfolio on your own way",
                CustomAllocationVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
          >
            Custom token category
          </div>
          <div
            use:tooltip={{
              content: getTooltipContent(
                "Know what is your portfolio risk, in every single token you hold",
                RiskVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
          >
            Risks analysis
          </div>
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent("", ReturnVideo),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Returns analysis
          </div>
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent("", RiskReturnVideo),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Risks & Returns analysis
          </div>
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent(
                "We suggest you how to optimize your portfolio to minimize the risk while maximizing the return",
                RebalanceVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Rebalance Strategy
          </div>
          <div class="xl:text-base text-lg text-gray-400">
            Professional community
          </div>

          <div
            class="flex items-center gap-2 mt-2 text-[#1E96FC] font-semibold xl:text-lg text-xl cursor-pointer"
            on:click={() => {
              selectedPackage({
                name: "Explorer",
                price:
                  selectedTypePackage === "month"
                    ? `$${
                        selectedExplorer?.prices.find(
                          (item) => item.recurring.interval === "month"
                        )?.unitAmountDecimal
                      }`
                    : `$${
                        selectedExplorer?.prices.find(
                          (item) => item.recurring.interval === "year"
                        )?.unitAmountDecimal / 12
                      }`,
                selectedTypePackage,
              });
            }}
          >
            Upgrade
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
        </div>
      </div>
    </div>

    <!-- Professional -->
    <div class="border border-[#0000001a] rounded-xl flex flex-col gap-4 p-4">
      <div class="xl:text-3xl text-4xl font-semibold flex items-end gap-2">
        <span
          >{selectedTypePackage === "month"
            ? `$${
                selectedProfessional?.prices.find(
                  (item) => item.recurring.interval === "month"
                )?.unitAmountDecimal
              }`
            : `$${
                selectedProfessional?.prices.find(
                  (item) => item.recurring.interval === "year"
                )?.unitAmountDecimal / 12
              }`}</span
        ><span class="xl:text-xl text-2xl text-gray-400 mb-[2px]"
          >/{selectedTypePackage === "month" ? "month" : "year"}</span
        >
      </div>
      <div>
        <div class="flex flex-col border-b-[1px] border-[#0000001a] pb-4">
          <div class="xl:text-xl text-2xl font-medium">PROFESSIONAL</div>
          <div class="xl:text-lg text-xl text-gray-500">
            Enjoy all the features without any limited
          </div>
        </div>
        <div class="mt-4 flex flex-col items-start gap-2">
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent(
                "Get latest market information and real-time market update",
                RealtimeVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Real-time market update
          </div>
          <div class="xl:text-base text-lg text-black">
            <span class="font-bold">Unlimited</span> tracked Wallets
          </div>
          <div class="xl:text-base text-lg text-black">
            <span class="font-bold">Unlimited</span> total net worth
          </div>
          <div
            use:tooltip={{
              content: getTooltipContent(
                "Get up to 1000+ yield farming opportunities to boost your earning",
                YieldFarmingVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
          >
            Yield farming opportunities
          </div>
          <div
            use:tooltip={{
              content: getTooltipContent(
                "Custom your token category to diversify your portfolio on your own way",
                CustomAllocationVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
          >
            Custom token category
          </div>
          <div
            use:tooltip={{
              content: getTooltipContent(
                "Know what is your portfolio risk, in every single token you hold",
                RiskVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
          >
            Risks analysis
          </div>
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent("", ReturnVideo),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Returns analysis
          </div>
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent("", RiskReturnVideo),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Risks & Returns analysis
          </div>
          <div
            class="xl:text-base text-lg text-black underline decoration-dotted cursor-pointer"
            use:tooltip={{
              content: getTooltipContent(
                "We suggest you how to optimize your portfolio to minimize the risk while maximizing the return",
                RebalanceVideo
              ),
              allowHTML: true,
              placement: "top",
              interactive: true,
            }}
          >
            Rebalance Strategy
          </div>
          <div class="xl:text-base text-lg text-black">
            Professional community (Soon)
          </div>

          <div
            class="flex items-center gap-2 mt-2 text-[#1E96FC] font-semibold xl:text-lg text-xl cursor-pointer"
            on:click={() => {
              selectedPackage({
                name: "Professional",
                price:
                  selectedTypePackage === "month"
                    ? `$${
                        selectedProfessional?.prices.find(
                          (item) => item.recurring.interval === "month"
                        )?.unitAmountDecimal
                      }`
                    : `$${
                        selectedProfessional?.prices.find(
                          (item) => item.recurring.interval === "year"
                        )?.unitAmountDecimal / 12
                      }`,
                selectedTypePackage,
              });
            }}
          >
            Upgrade
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
        </div>
      </div>
    </div>
  </div>

  <div class="text-center xl:text-sm text-lg text-gray-500 my-4 px-4">
    Price in USDC. Subscription is tied to <strong>one</strong> wallet address.
    It will be transferable soon
    <br /> Unsubscribe anytime. No questions asked.
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
