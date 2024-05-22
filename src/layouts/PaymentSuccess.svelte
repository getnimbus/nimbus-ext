<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { navigateTo } from "svelte-router-spa";
  import "flowbite/dist/flowbite.css";
  import { selectedPackage } from "~/store";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { getUserInfo } from "~/lib/queryAPI";
  import { triggerToast } from "~/utils";

  import Button from "~/components/Button.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  let status = false;
  let intervalId = null;

  const queryClient = useQueryClient();

  const handleUpgradePackageQuest = async () => {
    try {
      await nimbus.post(`/v2/checkin/quest/upgrade-package`, {});
    } catch (e) {
      console.log("e: ", e);
    }
  };

  const getStatusPayment = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIdParams = urlParams.get("paymentId");

      const response: any = await nimbus.get(
        `/v3/payments/status?payment_link_id=${paymentIdParams}`
      );

      if (
        response &&
        response?.data &&
        response?.data?.paymentStatus === "succeeded"
      ) {
        status = true;
        clearInterval(intervalId);
        handleUpgradePackageQuest();
      }

      if (
        response &&
        response?.data &&
        response?.data?.paymentStatus === "failed"
      ) {
        status = true;
        clearInterval(intervalId);
        navigateTo("/payments/fail");
      }

      if (
        response &&
        response?.data &&
        response?.data?.paymentStatus === "pending"
      ) {
        status = false;
      }
    } catch (e) {
      console.error("error: ", e);
      status = true;
      clearInterval(intervalId);
      navigateTo("/payments/fail");
    }
  };

  $: queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (
      !$queryUserInfo.isError &&
      $queryUserInfo &&
      $queryUserInfo.data !== undefined
    ) {
      selectedPackage.update(
        (n) => (n = $queryUserInfo.data?.plan?.tier.toUpperCase() || "FREE")
      );
    }
  }

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isTrialParams = urlParams.get("isTrial");
    if (isTrialParams && isTrialParams === "true") {
      status = true;
      triggerToast("Apply your TRIAL coupon code success!", "success");
    } else {
      getStatusPayment();
      triggerToast(
        "Please waiting for a while we updating your payment!",
        "success"
      );
    }
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });

  $: {
    intervalId = setInterval(() => {
      getStatusPayment();
    }, 30000); // 30s
  }
</script>

<ErrorBoundary>
  <div class="xl:min-h-screen flex justify-center items-center">
    <div class="p-6 w-2/3 flex flex-col gap-5 justify-center items-center">
      <div class="flex flex-col justify-center items-center">
        <div class="text-lg">Thank you for upgrading your plan</div>
        <div class="text-sm text-gray-500">
          Let's enjoy investment in easy-mode with Nimbus
        </div>
      </div>
      <div class="w-[120px]">
        {#if status}
          <Button
            variant="primary"
            on:click={() => {
              navigateTo("/");
              queryClient.invalidateQueries(["users-me"]);
            }}
          >
            Continue
          </Button>
        {:else}
          <Button isLoading={!status} variant="primary">Continue</Button>
        {/if}
      </div>
      <div class="text-gray-500 xl:text-sm text-base">
        Notice: You can use our application as normal. We will upgrade your
        account Plan as soon as we receive the payment
      </div>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
