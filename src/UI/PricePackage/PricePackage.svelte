<script lang="ts">
  import { getTooltipContent, typePackage, dateDiffInDays } from "~/utils";
  import { AnimateSharedLayout, Motion } from "svelte-motion";
  import { nimbus } from "~/lib/network";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { isDarkMode, user, wallet, chain, typeWallet } from "~/store";
  import { useNavigate } from "svelte-navigator";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";

  import tooltip from "~/entries/contentScript/views/tooltip";
  import ExplorerPlan from "./ExplorerPlan.svelte";
  import ProfessionalPlan from "./ProfessionalPlan.svelte";
  import Button from "~/components/Button.svelte";
  import AppOverlay from "~/components/Overlay.svelte";
  import Error from "~/components/Error.svelte";

  import YieldFarmingVideo from "~/assets/pricing/Yield-Farming.mp4";
  import RealtimeVideo from "~/assets/pricing/Realtime.mp4";
  import PricingTable from "~/components/PricingTable.svelte";

  export let selectedPackage = (item) => {};

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  let selectedTypePackage: "month" | "year" = "year";
  let buyPackage = "Free";
  let interval = "month";
  let isNewUser = false;
  let endDatePackage = "";
  let isSubscription = false;
  let isOpenConfirmCancel = false;
  let isLoadingCancel = false;

  const getUserInfo = async () => {
    const response: any = await nimbus.get("/users/me");
    return response?.data;
  };

  $: query = createQuery({
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
    if (!$query.isError && $query.data !== undefined) {
      buyPackage = $query.data.plan?.tier;
      interval = $query.data.plan?.interval;
      endDatePackage = $query.data.plan?.endDate;
      isSubscription = $query.data.plan?.subscription;
      isNewUser = $query.data.plan?.isNewUser;
    }
  }

  const handleCancelSubscription = async () => {
    isLoadingCancel = true;
    try {
      await nimbus.get("/v2/payments/subscriptions/cancel");
      isOpenConfirmCancel = false;
      isLoadingCancel = false;
      queryClient.invalidateQueries(["users-me"]);
    } catch (e) {
      console.error("error: ", e);
      isLoadingCancel = false;
    }
  };

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

  let isLoadingSubmitCoupleCode = false;
  let code = "";

  const onSubmitCoupleCode = async (e) => {
    isLoadingSubmitCoupleCode = true;
    const formData = new FormData(e.target);
    const data: any = {};
    for (let field of formData) {
      const [key, value] = field;
      data[key] = value;
    }
    try {
      const response = await nimbus.post("/v2/payments/redeem-code", {
        code: data.code,
      });
      if (response?.error) {
        toastMsg = response?.error;
        isSuccessToast = false;
      } else {
        queryClient.invalidateQueries(["users-me"]);
        toastMsg = "Apply your couple code success!";
        isSuccessToast = true;
      }
      isLoadingSubmitCoupleCode = false;
      trigger();
    } catch (e) {
      console.error(e);
      isLoadingSubmitCoupleCode = false;
      toastMsg =
        "There are some error when apply your couple code. Please try again!";
      isSuccessToast = false;
      trigger();
    }
  };
</script>

<div class="flex flex-col xl:gap-4 gap-8 mt-3">
  <div class="xl:text-xl text-3xl text-center mb-6">
    Use Nimbus at its full potential. Tracking your portfolio, reduce risk,
    maximize return.
  </div>

  <div
    class="p-4 mb-4 text-2xl text-green-600 rounded-lg xl:text-base bg-green-50"
    role="alert"
  >
    <span class="mr-2 xl:mr-1">⭐️</span> We're giving 1000 coupon codes
    <span class="font-bold">EARLY-BIRD</span>
    which get <span class="font-bold">30%</span> off for the first-time payment
    and
    <span class="font-bold">10% off lifetime</span> payments.
  </div>

  <!-- <div class="flex items-center justify-center gap-2">
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
  </div> -->

  <div class="flex flex-col gap-20">
    <PricingTable />
  </div>

  <div class="flex flex-col gap-2 justify-center items-center">
    <div class="xl:text-base text-2xl font-normal">
      Enter your couple code to redeem exclusive access
    </div>
    <div>
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
            class={`p-0 border-none focus:outline-none focus:ring-0 xl:text-sm text-2xl font-normal text-[#5E656B] placeholder-[#5E656B] ${
              code && !$isDarkMode ? "bg-[#F0F2F7]" : "bg-transparent"
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
  </div>
</div>

<!-- Modal confirm cancel package -->
<AppOverlay
  clickOutSideToClose
  isOpen={isOpenConfirmCancel}
  on:close={() => (isOpenConfirmCancel = false)}
>
  <div class="flex flex-col xl:gap-4 gap-10">
    <div class="flex flex-col gap-1 items-start">
      <div class="xl:title-3 title-1 font-semibold">Are you sure?</div>
      <div class="xl:text-sm text-2xl text-gray-500">
        Your <span class="uppercase font-medium">{buyPackage}</span>
        Plan have
        <span class="font-medium">
          {dateDiffInDays(new Date(), new Date(endDatePackage))} days left.
        </span>
        Do you really want to cancel? This process cannot revert
      </div>
    </div>
    <div class="flex justify-end lg:gap-2 gap-6">
      <div class="lg:w-[120px] w-full">
        <Button
          variant="secondary"
          on:click={() => {
            isOpenConfirmCancel = false;
          }}
        >
          Cancel
        </Button>
      </div>
      <div class="lg:w-[120px] w-full">
        <Button
          variant="delete"
          isLoading={isLoadingCancel}
          on:click={handleCancelSubscription}
        >
          Submit
        </Button>
      </div>
    </div>
  </div>
</AppOverlay>

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
