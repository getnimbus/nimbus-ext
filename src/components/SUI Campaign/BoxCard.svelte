<script lang="ts">
  import { isDarkMode, suiWalletInstance, userPublicAddress } from "~/store";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import type { WalletState } from "nimbus-sui-kit";
  import { SuiConnector } from "nimbus-sui-kit";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { triggerFirework } from "~/utils";

  export let isClaimable = false;
  export let isRedeem = false;
  export let data;
  export let handleRedeemBox = (value) => {};
  export let isLoadingRedeem;
  export let totalPoint;
  export let triggerClaimSuccess = (data) => {};

  import Copy from "~/components/Copy.svelte";
  import ReactAdapter from "~/components/ReactAdapter.svelte";
  import Button from "~/components/Button.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import Crown from "~/assets/crown.svg";

  const queryClient = useQueryClient();

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;

  const trigger = () => {
    showToast = true;
    counter = 5;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    showToast = false;
    toastMsg = "";
    isSuccessToast = false;
  };

  const chains = [
    {
      id: "sui:mainnet",
      name: "Mainnet",
      rpcUrl: "https://fullnode.mainnet.sui.io",
    },
  ];

  const onConnectSuccess = (msg) => {
    console.log("Success connect: ", msg);
    if ($suiWalletInstance) {
      ($suiWalletInstance as WalletState).toggleSelect();
    }
  };

  const onConnectError = (msg) => {
    console.error("Error connect", msg);
    if ($suiWalletInstance) {
      ($suiWalletInstance as WalletState).toggleSelect();
    }
  };

  const widgetConfig = {
    walletFn: (wallet) => {
      suiWalletInstance.update((n) => (n = wallet));
    },
    onConnectSuccess,
    onConnectError,
  };

  let showDisabled = false;
  let isLoadingClaim = false;
  let isClickClaim = false;

  const handleClaim = async () => {
    if (
      ($suiWalletInstance as WalletState) &&
      ($suiWalletInstance as WalletState).connected &&
      isClickClaim
    ) {
      isLoadingClaim = true;
      try {
        const { signature } = await handleSignAddressMessage(
          `I am confirming that I want to claim the reward with id ${data.id} to address ${$suiWalletInstance.account?.address}`
        );

        if (signature) {
          const res: any = await nimbus.post(
            `/v2/rewards/${data.id}/token-claim`,
            {
              publicAddress: $suiWalletInstance.account?.address,
              signature,
            }
          );

          if (res && res?.error) {
            toastMsg =
              res?.error ||
              "Something went wrong while claiming prize. Please try again!";
            isSuccessToast = false;
            trigger();
            return;
          }

          triggerClaimSuccess(res?.data);
          isLoadingClaim = false;
          isClickClaim = false;
          triggerFirework();

          queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);
          queryClient?.invalidateQueries([$userPublicAddress, "rewards"]);
        }
      } catch (e) {
        console.error(e);
        if (
          ($suiWalletInstance as WalletState) &&
          ($suiWalletInstance as WalletState).connected
        ) {
          ($suiWalletInstance as WalletState).disconnect();
        }
        isLoadingClaim = false;
        isClickClaim = false;
      }
    } else {
      ($suiWalletInstance as WalletState).toggleSelect();
    }
  };

  $: {
    if (
      ($suiWalletInstance as WalletState) &&
      ($suiWalletInstance as WalletState).connected &&
      isClickClaim
    ) {
      handleClaim();
    }
  }

  const handleSignAddressMessage = async (msg: string) => {
    return await ($suiWalletInstance as WalletState).signPersonalMessage({
      message: new TextEncoder().encode(msg),
    });
  };
</script>

<div
  class={`py-4 sm:w-[438px] w-full min-h-[280px] rounded-[16px] border border_0000000d flex flex-col justify-between gap-4 mx-auto ${
    $isDarkMode ? "bg-[#212121]" : "bg-white"
  }`}
>
  <div class="px-[16px] flex items-center h-full gap-[27px]">
    <div
      class={`w-[135px] relative rounded-2xl p-2 flex items-center h-full justify-center ${
        $isDarkMode ? "" : "bg-white"
      }`}
    >
      <div class="w-20 h-20">
        <img src={data.logo} alt="" class="w-full h-full object-contain" />
      </div>

      {#if !isClaimable && isRedeem}
        <div
          class="absolute -bottom-2 w-full text-center whitespace-nowrap left-timee italic text-sm"
        >
          {Number(data.cap) - Number(data.sold)} lefts
        </div>
      {/if}

      {#if data?.code === "wUSDC" || data?.code === "FLX"}
        <div
          class="absolute -bottom-2 w-full text-center whitespace-nowrap left-timee italic text-sm"
        >
          {data?.value + " " + data?.code}
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <img src={Crown} alt="" class="w-[26px] h-[26px]" />
        <div class="text-[#FFB800] text-lg font-medium uppercase">
          NIMBUS ON SUI
        </div>
      </div>

      <div class="text-3xl font-normal">
        {#if isRedeem}
          {data.title}
        {:else}
          {data?.code}
        {/if}
      </div>

      <div class="text-sm font-normal">
        {data?.description}
      </div>
    </div>
  </div>

  <div class="flex flex-col gap-5 pb-1">
    <div class="relative border-b-2 border-dashed">
      <div
        class={`w-4 h-10 rounded-l-none rounded-full absolute -left-[1px] -bottom-5 border-r border-t border-b border_0000000d ${
          $isDarkMode ? "bg-[#161616]" : "bg-[#fff]"
        }`}
      />
      <div
        class={`w-4 h-10 rounded-r-none rounded-full absolute -right-[1px] -bottom-5 border-l border-t border-b border_0000000d ${
          $isDarkMode ? "bg-[#161616]" : "bg-[#fff]"
        }`}
      />
    </div>

    <div class="px-[16px]">
      <div
        class="flex items-center md:justify-start justify-between md:gap-[100px] gap-[40px]"
      >
        {#if !isClaimable && isRedeem}
          <div class="w-[150px] text-base font-normal text-right">
            {data.cap} boxs <br />/per-week
          </div>
        {/if}

        {#if isClaimable && (data.code === "wUSDC" || data.code === "FLX")}
          <div class="w-full flex justify-end">
            <div class="w-[220px]">
              <Button
                variant="tertiary"
                on:click={() => {
                  if (!isLoadingClaim) {
                    isClickClaim = true;
                    handleClaim();
                  }
                }}
                disabled={isLoadingClaim}
              >
                <div class="text-white text-smxs">Claim</div>
              </Button>
            </div>
          </div>
        {:else if !isClaimable && totalPoint >= 1000 && isRedeem && Number(data.cap) - Number(data.sold) > 0}
          <Button
            variant="tertiary"
            on:click={() => {
              if (!isLoadingRedeem) {
                handleRedeemBox(data);
              }
            }}
            disabled={isLoadingRedeem}
          >
            <div class="flex items-center gap-1">
              <img src={goldImg} alt="" class="w-[28px] h-[28px]" />
              <div class="text-white sm:text-lg text-smxs font-medium">
                {data?.cost}
              </div>
            </div>
            <div class="text-white text-smxs">Redeem</div>
          </Button>
        {:else}
          <div class="w-full">
            {#if !isClaimable && (data?.code === "wUSDC" || data?.code === "FLX" || data?.code === "PREMIUM_CODE")}
              <div
                class="flex items-center justify-between p-[12px] bg-[#EEEEEE] rounded-[12px] w-full"
              >
                {#if data?.code === "wUSDC" || data?.code === "FLX"}
                  <div class="text-[#131313] text-sm">Your Trx hash</div>
                  <Copy
                    address={data?.tx}
                    iconColor="#000"
                    iconSize={20}
                    color="#000"
                    isShorten
                    isLink
                    link={`https://suiscan.xyz/testnet/tx/${data?.tx}`}
                    textTooltip="Copy tx link"
                  />
                {/if}

                {#if data?.code === "PREMIUM_CODE"}
                  <div class="text-[#131313] text-sm">Your Premium Code</div>
                  <Copy
                    address={data?.value}
                    iconColor="#000"
                    iconSize={20}
                    color="#000"
                    textTooltip="Copy Premium Code"
                  />
                {/if}
              </div>
            {:else}
              <div
                class="relative"
                on:mouseenter={() => (showDisabled = true)}
                on:mouseleave={() => (showDisabled = false)}
              >
                <Button disabled>
                  <div class="flex items-center gap-1">
                    <img src={goldImg} alt="" class="w-[28px] h-[28px]" />
                    <div class="text-white sm:text-lg text-smxs font-medium">
                      {data?.cost}
                    </div>
                  </div>
                  <div class="text-white text-smxs">Redeem</div>
                </Button>
                {#if showDisabled}
                  <div
                    class="absolute transform left-1/2 -translate-x-1/2 -top-8"
                    style="z-index: 2147483648;"
                  >
                    <div
                      class="max-w-[360px] text-white bg-black py-1 px-2 text-xs rounded relative w-max normal-case"
                    >
                      {#if totalPoint < 1000}
                        You are not enough GM Points to Redeem
                      {:else}
                        There are not available now
                      {/if}
                    </div>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>

  <ReactAdapter
    element={SuiConnector}
    config={widgetConfig}
    autoConnect={false}
    {chains}
    integrator="svelte-example"
  />
</div>

{#if showToast}
  <div class="fixed top-3 right-3 w-full" style="z-index: 2147483648;">
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
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Check icon</span>
        {:else}
          <svg
            aria-hidden="true"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="sr-only">Error icon</span>
        {/if}
      </svelte:fragment>
      {toastMsg}
    </Toast>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
  @media (max-width: 320) {
    .text-smxs {
      font-size: 14px;
      line-height: 20px;
    }

    .gap-320-sx {
      grid-gap: 10px !important;
      gap: 10px !important;
    }
  }
</style>
