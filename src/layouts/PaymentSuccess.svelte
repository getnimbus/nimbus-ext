<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { nimbus } from "~/lib/network";
  import { Link } from "svelte-navigator";
  import "flowbite/dist/flowbite.css";
  import { Toast } from "flowbite-svelte";
  import { useNavigate } from "svelte-navigator";
  import { selectedPackage } from "~/store";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";

  import Button from "~/components/Button.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";

  let status = false;
  let intervalId = null;

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 3;
  let showToast = false;

  const navigate = useNavigate();

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

  const getStatusPayment = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentIdParams = urlParams.get("paymentId");

      const response = await nimbus.get(
        `/v2/payments/status?paymentId=${paymentIdParams}`
      );

      if (
        response &&
        response?.data &&
        response?.data?.paymentStatus === "succeeded"
      ) {
        status = true;
        clearInterval(intervalId);
      } else if (
        response &&
        response?.data &&
        response?.data?.paymentStatus === "failed"
      ) {
        status = true;
        clearInterval(intervalId);
        navigate("/payments/fail");
      } else {
        status = false;
      }
    } catch (e) {
      console.error("error: ", e);
      status = false;
    }
  };

  const queryClient = useQueryClient();
  const queryUserInfo = createQuery({
    queryKey: ["users-me"],
    queryFn: () => getUserInfo(),
    staleTime: Infinity,
  });

  const getUserInfo = async () => {
    const response = await nimbus.get("/users/me");
    return response.data;
  };

  $: {
    if (!$queryUserInfo.isError && $queryUserInfo.data !== undefined) {
      if (
        $queryUserInfo.data?.plan?.tier &&
        $queryUserInfo.data?.plan?.tier.length !== 0
      ) {
        selectedPackage.update(
          (n) => (n = $queryUserInfo.data?.plan?.tier.toUpperCase())
        );
      }
    }
  }

  onMount(() => {
    toastMsg = "Please waiting for a while we updating your payment!";
    isSuccessToast = true;
    trigger();
    getStatusPayment();
  });

  onDestroy(() => {
    clearInterval(intervalId);
  });

  $: {
    intervalId = setInterval(() => {
      getStatusPayment();
    }, 5000); // 5s
  }
</script>

<ErrorBoundary>
  <div class="flex justify-center items-center h-screen">
    <div class="p-6 w-2/3 flex flex-col gap-5 justify-center items-center">
      <div class="flex flex-col justify-center items-center">
        <div class="text-lg">Thank you for upgrading your plan</div>
        <div class="text-sm text-gray-500">
          We hope you enjoy your investment with Nimbus
        </div>
      </div>
      <div class="w-[120px]">
        {#if status}
          <Link to="/">
            <Button
              variant="secondary"
              on:click={() => {
                queryClient.invalidateQueries(["users-me"]);
              }}>Continue</Button
            >
          </Link>
        {:else}
          <Button isLoading={!status} variant="secondary">Continue</Button>
        {/if}
      </div>
      <div class="text-gray-500 xl:text-sm text-base">
        Notice: Your can use our application as normal. We will upgrade your
        account Plan as soon as we receive the payment
      </div>
    </div>
  </div>

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
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
