<script lang="ts">
  import { isDarkMode, suiWalletInstance } from "~/store";
  import { TransactionBlock } from "@mysten/sui.js/transactions";
  import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
  import { createQuery } from "@tanstack/svelte-query";
  import { getLinkData } from "~/lib/queryAPI";
  import { nimbus } from "~/lib/network";
  import type { WalletState } from "nimbus-sui-kit";
  import { SuiConnector } from "nimbus-sui-kit";
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { triggerFirework } from "~/utils";
  import { wait } from "~/entries/background/utils";

  export let isClaimable = false;
  export let isRedeem = false;
  export let data;
  export let handleRedeemBox = (value) => {};
  export let isLoadingRedeem;
  export let totalPoint;

  import ReactAdapter from "~/components/ReactAdapter.svelte";
  import Button from "~/components/Button.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import Crown from "~/assets/crown.svg";

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;

  let openScreenClaimSuccess = false;

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

  const triggerRedeemSuccess = async () => {
    openScreenClaimSuccess = true;
    triggerFirework();
    await wait(2000);
    openScreenClaimSuccess = false;
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

  let selectedDataSUILink: any = {};

  $: queryLinkSocial = createQuery({
    queryKey: ["link-socials"],
    queryFn: () => getLinkData(),
    staleTime: Infinity,
    retry: false,
  });

  $: {
    if (!$queryLinkSocial.isError && $queryLinkSocial.data !== undefined) {
      selectedDataSUILink = $queryLinkSocial?.data?.data?.find(
        (item) => item.kind === "wallet" && item.chain === "MOVE"
      );
    }
  }

  const client = new SuiClient({ url: getFullnodeUrl("testnet") });

  const base64ToBytes = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  let showDisabled = false;
  let isLoadingClaim = false;

  const handleClaim = async () => {
    if (
      ($suiWalletInstance as WalletState) &&
      ($suiWalletInstance as WalletState).connected
    ) {
      isLoadingClaim = true;
      try {
        const res = await nimbus.post(`/v2/rewards/${data.id}/token-claim`, {
          publicAddress: $suiWalletInstance.account?.address,
        });

        if (res && res?.data?.tx) {
          triggerRedeemSuccess();
          return;
        }

        if (res && !res?.data?.payload) {
          toastMsg =
            "Something went wrong while claiming prize. Please try again!";
          isSuccessToast = false;
          trigger();
          return;
        }

        const sponsoredTxb = TransactionBlock.fromKind(
          base64ToBytes(res?.data?.payload)
        );

        sponsoredTxb.setSender(
          "0x466c3adcfc05d5a356965ecc426efb367006d9e058db0a3597893f6007978fbc"
        );

        sponsoredTxb.setGasOwner($suiWalletInstance.account?.address);

        const { signature } = await (
          $suiWalletInstance as WalletState
        ).signTransactionBlock({
          transactionBlock: sponsoredTxb,
        });

        if (signature) {
          await nimbus.post(`/v2/rewards/:id/token-claim`, {
            publicAddress: $suiWalletInstance.account?.address,
            signature,
          });

          triggerRedeemSuccess();
        }
      } catch (e) {
        console.error(e);
      } finally {
        isLoadingClaim = false;
      }
    } else {
      handleSUIAuth();
    }
  };

  const handleSUIAuth = async () => {
    try {
      ($suiWalletInstance as WalletState).toggleSelect();
    } catch (e) {
      console.log("error: ", e);
    }
  };

  $: {
    if (
      ($suiWalletInstance as WalletState) &&
      ($suiWalletInstance as WalletState).connected
    ) {
      handleGetNonce(($suiWalletInstance as WalletState)?.account?.address);
    }
  }

  const handleGetNonce = async (address: string) => {
    try {
      const res: any = await nimbus.post("/users/nonce?verified=true", {
        publicAddress: address,
        referrer: undefined,
      });

      if (res && res.data) {
        const signature = await handleSignAddressMessage(res?.data?.nonce);
        if (signature) {
          handleClaim();
        }
      }
    } catch (e) {
      console.error("error: ", e);
      if (
        ($suiWalletInstance as WalletState) &&
        ($suiWalletInstance as WalletState).connected
      ) {
        ($suiWalletInstance as WalletState).disconnect();
      }
    }
  };

  const handleSignAddressMessage = async (nonce: string) => {
    const msg = await ($suiWalletInstance as WalletState).signPersonalMessage({
      message: new TextEncoder().encode(
        `I am signing my one-time nonce: ${nonce}`
      ),
    });
    return msg;
  };
</script>

<div
  class={`py-4 sm:w-[438px] w-full min-h-[280px] rounded-[16px] border border_0000000d flex flex-col justify-between gap-4 mx-auto ${
    $isDarkMode ? "bg-[#212121]" : "bg-white"
  }`}
>
  <div class="px-[16px] flex items-center h-full gap-[47px] gap-320-sx">
    <div
      class={`flex-[0.6] relative rounded-2xl p-2 flex items-center h-full justify-center ${
        $isDarkMode ? "" : "bg-white"
      }`}
    >
      <img src={data?.logo} alt="" class="w-20 h-20 object-contain" />
      {#if !isClaimable}
        <div
          class="absolute -bottom-2 w-full text-center whitespace-nowrap left-timee italic text-sm"
        >
          499 lefts
        </div>
      {/if}
    </div>

    <div class="flex-1 flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <img src={Crown} alt="" class="w-[26px] h-[26px]" />
        <div class="text-[#FFB800] text-lg font-medium uppercase">
          NIMBUS ON SUI
        </div>
      </div>
      <div class="lg:text-4xl text-3xl font-normal">
        {data?.title}
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
        <div class="w-[150px] text-base font-normal text-right">
          {#if !isClaimable}
            500 boxs <br />/per-week
          {/if}
        </div>

        {#if isClaimable}
          <Button
            variant="tertiary"
            on:click={() => {
              if (!isLoadingClaim) {
                handleClaim();
              }
            }}
            disabled={isLoadingClaim}
          >
            <div class="text-white text-smxs">Claim</div>
          </Button>
        {:else if totalPoint >= 1000 || isRedeem}
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
                  You are not enough GM Points to Redeem
                </div>
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

{#if openScreenClaimSuccess}
  <div
    class="fixed h-screen w-screen top-0 left-0 z-10 flex items-center justify-center bg-[#000000cc]"
    on:click={() => {
      setTimeout(() => {
        openScreenClaimSuccess = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Claim successfully
      </div>

      <!-- Todo update navigate base on state response -->

      <!-- <div class="w-40 h-40">
        <Image logo={selectedTicketReward?.logo} defaultLogo="" />
      </div>
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have redeemed the {selectedTicketReward?.title?.toLowerCase() || ""}
      </div> -->
    </div>
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
