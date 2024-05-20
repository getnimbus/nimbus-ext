<script lang="ts">
  import { Toast } from "flowbite-svelte";
  import { blur } from "svelte/transition";
  import { TransactionBlock } from "@mysten/sui.js/transactions";
  import { bcs } from "@mysten/bcs";
  import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
  import axios from "axios";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import type { WalletState } from "nimbus-sui-kit";
  import { SuiConnector } from "nimbus-sui-kit";
  import { suiWalletInstance, userPublicAddress } from "~/store";
  import { isDarkMode } from "~/store";
  import { shorterAddress, triggerFirework } from "~/utils";
  import { nimbus } from "~/lib/network";
  import { getLinkData } from "~/lib/queryAPI";
  import { wait } from "~/entries/background/utils";
  import tooltip from "~/entries/contentScript/views/tooltip";

  import ReactAdapter from "~/components/ReactAdapter.svelte";
  import Button from "~/components/Button.svelte";
  import Loading from "~/components/Loading.svelte";

  import suiBackground from "~/assets/campaign/flipCoin/sui-background-img.png";
  import betterLuck from "~/assets/campaign/flipCoin/better-luck.png";
  import flipCoin2 from "~/assets/campaign/flipCoin/flip-coin2.png";
  import gmPoints from "~/assets/Gold4.svg";

  export let dataFlipCheck;
  export let getFlipCheck = () => {};

  const chains = [
    {
      id: "sui:mainnet",
      name: "Mainnet",
      rpcUrl: "https://fullnode.mainnet.sui.io",
    },
  ];

  const queryClient = useQueryClient();

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

  let toastMsg = "";
  let isSuccessToast = false;
  let counter = 5;
  let showToast = false;
  let isLoadingFlip = false;

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

  let isUserWin = false;
  let openScreenResult = false;
  let startFlip = false;
  let linkedSuiWallet = false;

  $: queryLinkSocial = createQuery({
    queryKey: ["link-socials"],
    queryFn: () => getLinkData(),
    staleTime: Infinity,
    retry: false,
  });

  const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

  const getRound = async () => {
    const round = await client
      .getObject({
        id: "0xfc94a9e689692098ad6c81cfe12b6ece40f3b8a354dd79a1a4ba47110408efcd",
        options: {
          showContent: true,
        },
      })
      .then((res: any) => res?.data?.content?.fields?.round)
      .catch((err) => {
        console.log(err);
      });

    return round;
  };

  const getSignature = async (round) => {
    const signature = await axios
      .get(
        `https://drand.cloudflare.com/52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971/public/${round}`
      )
      .then((res) => res?.data?.signature)
      .catch((err) => {
        console.log("signature error: ", err);
      });

    return signature;
  };

  const triggerFlipResult = async (type: number) => {
    if (
      ($suiWalletInstance as WalletState) &&
      ($suiWalletInstance as WalletState).connected
    ) {
      isLoadingFlip = true;
      try {
        const tx = new TransactionBlock();
        tx.setGasBudget(50000000);
        const round = await getRound();
        const signature = await getSignature(round);

        // call flip function
        tx.moveCall({
          // target:
          //   "0x86611815332fbe7670121858bd75dd0a949cf7d9578a342d8a4a916ee66285ff::coin_flip::flip", // devnet
          target:
            "0x5d20579940a0c071a8849bece0361c24a0c5296c1051c1648ec64a4f0b3975b8::coin_flip::flip", // mainnet
          typeArguments: [],
          arguments: [
            // tx.object(
            //   "0xb440cf576ccf24b5c9b81a80a146eeaae9c7f09a87983769ec2d34212a434815"
            // ), // devnet
            tx.object(
              "0xfc94a9e689692098ad6c81cfe12b6ece40f3b8a354dd79a1a4ba47110408efcd"
            ), // mainnet
            tx.pure(type, "u64"),
            tx.pure(bcs.string().serialize(signature).toBytes()),
          ],
        });

        const res: any = await (
          $suiWalletInstance as WalletState
        ).signAndExecuteTransactionBlock({
          transactionBlock: tx,
          options: {
            showInput: true,
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
            showBalanceChanges: true,
          },
        });

        await wait(3000);

        if (Number(res.events[0]?.parsedJson?.result) === type) {
          isUserWin = true;
          triggerFirework();
          openScreenResult = true;
        } else {
          isUserWin = false;
          openScreenResult = true;
        }

        getFlipCheck();
        queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);

        isLoadingFlip = false;
      } catch (error) {
        console.log("err: ", error);
        isLoadingFlip = false;
      }
    }
  };

  const handleStartFlip = async () => {
    if (!dataFlipCheck.canPlay) {
      toastMsg =
        "Your flipping capacity has reached its limit! You can only flip 5 times a day.";
      isSuccessToast = false;
      trigger();
      return;
    }

    if ($suiWalletInstance as WalletState) {
      if (($suiWalletInstance as WalletState).connected) {
        startFlip = true;
      } else {
        handleSUIAuth();
      }
    }
  };

  let selectedDataSUILink: any = {};
  let openScreenBonusScore = false;
  let bonusScore = 0;

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };

  $: {
    if (!$queryLinkSocial.isError && $queryLinkSocial.data !== undefined) {
      selectedDataSUILink =
        $queryLinkSocial?.data?.data.find(
          (item) => item?.kind === "wallet" && item?.chain === "MOVE"
        ) || {};

      if (
        selectedDataSUILink &&
        Object.keys(selectedDataSUILink).length !== 0 &&
        ($suiWalletInstance as WalletState)?.address !== undefined
      ) {
        if (
          selectedDataSUILink?.uid !==
          ($suiWalletInstance as WalletState)?.address
        ) {
          linkedSuiWallet = false;
          toastMsg = `Please connect to wallet ${shorterAddress(selectedDataSUILink?.uid)} to flip`;
          isSuccessToast = false;
          trigger();
          ($suiWalletInstance as WalletState)?.disconnect();
        } else {
          linkedSuiWallet = true;
        }
      }
    }
  }

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
          const payload = {
            signature: signature.signature,
            publicAddress: address?.toLowerCase(),
          };
          if (
            selectedDataSUILink &&
            Object.keys(selectedDataSUILink).length === 0
          ) {
            handleUpdatePublicAddress(payload);
          } else {
            startFlip = true;
          }
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

  const handleUpdatePublicAddress = async (payload) => {
    try {
      const params: any = {
        id: $userPublicAddress,
        kind: "wallet",
        type: null,
        userPublicAddress: payload?.publicAddress,
        signature: payload?.signature,
      };
      const res: any = await nimbus.post("/accounts/link", params);
      if (res && res?.error) {
        toastMsg = res?.error;
        isSuccessToast = false;
        trigger();
        return;
      }

      queryClient?.invalidateQueries(["link-socials"]);
      queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);

      triggerBonusScore();
      bonusScore = 1000;

      toastMsg = "Your are successfully connect your Sui wallet!";
      isSuccessToast = true;
      trigger();

      startFlip = true;
    } catch (e) {
      console.log(e);
      toastMsg =
        "Something wrong when connect your Sui wallet. Please try again!";
      isSuccessToast = true;
      trigger();
    }
  };
</script>

<div
  class={`flex flex-col items-center gap-10 relative rounded-[10px] py-10 px-8 overflow-hidden ${$isDarkMode ? "bg-[#222222]" : "bg-[#fff] border border_0000001a"}`}
>
  <img
    src={suiBackground}
    alt=""
    class="absolute right-[-21px] top-[50%] -translate-y-1/2 object-contain h-full z-1"
  />

  <div class="font-semibold sm:text-5xl text-3xl uppercase">Flip The GM</div>

  <div class="relative z-2 h-[110px]">
    <img src={flipCoin2} alt="" class="h-full h-full object-contain" />
  </div>

  <div class="text-amber-400 font-medium text-center relative z-2">
    No Loss: Pay Gas > Flip GM Points > Get Rewards
  </div>

  <div
    class="bg-[#424C81] text-white rounded-md flex flex-col items-center justify-center py-2 px-20 relative z-2"
  >
    <div class="text-2xl">Rewards</div>
    <div class="flex items-center gap-2 py-2">
      <div class="p-2 rounded-[10px] bg-[#27326F]">
        <img src={gmPoints} alt="" class="h-7 w-7" />
      </div>
      <div class="sm:text-[44px] text-2xl font-medium">1000</div>
    </div>
  </div>

  <div class="relative z-2 w-full">
    {#if selectedDataSUILink && Object.keys(selectedDataSUILink).length === 0}
      <div
        class="flex justify-center items-center gap-3 text-white bg-[#1e96fc] py-1 px-2 rounded-[10px] cursor-pointer xl:w-[280px] w-max mx-auto"
        on:click={handleSUIAuth}
      >
        Connect SUI Wallet
        <div
          class="flex items-center gap-1 text-sm font-medium bg-[#27326F] py-1 px-2 text-white rounded-[10px]"
        >
          1000
          <img src={gmPoints} alt="" class="w-6 h-6" />
        </div>
      </div>
    {:else}
      <div>
        {#if startFlip && dataFlipCheck?.canPlay && linkedSuiWallet}
          <div class="flex justify-center items-center gap-4">
            <button
              class="rounded-[12px] text-white bg-[#FFB800] w-full py-4 px-5 font-medium sm:text-2xl text-lg max-w-[140px] flex items-center justify-center"
              on:click={() => {
                if (!isLoadingFlip) {
                  triggerFlipResult(1);
                }
              }}
              disabled={isLoadingFlip}
            >
              {#if isLoadingFlip}
                <Loading size={20} />
              {:else}
                Head
              {/if}
            </button>
            <button
              class="rounded-[12px] text-white bg-[#FFB800] w-full py-4 px-5 font-medium sm:text-2xl text-lg max-w-[140px] flex items-center justify-center"
              on:click={() => {
                if (!isLoadingFlip) {
                  triggerFlipResult(0);
                }
              }}
              disabled={isLoadingFlip}
            >
              {#if isLoadingFlip}
                <Loading size={20} />
              {:else}
                Tail
              {/if}
            </button>
          </div>
        {:else}
          <div class="w-max mx-auto">
            {#if dataFlipCheck.canPlay}
              <Button variant="tertiary" on:click={handleStartFlip}>
                <div class="font-medium sm:text-2xl text-lg py-4 px-5">
                  Flip Now 👑
                </div>
              </Button>
            {:else}
              <div
                use:tooltip={{
                  content: `<tooltip-detail text="Your flipping capacity has reached its limit! You can only flip 5 times a day." />`,
                  allowHTML: true,
                  placement: "top",
                }}
              >
                <Button disabled>
                  <div class="font-medium sm:text-2xl text-lg py-4 px-5">
                    Flip Now 👑
                  </div>
                </Button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <div class="text-sm font-medium italic">Max 5 Flips/day</div>
</div>

<ReactAdapter
  element={SuiConnector}
  config={widgetConfig}
  autoConnect={false}
  {chains}
  integrator="svelte-example"
/>

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

{#if openScreenResult}
  <div
    class="fixed h-screen w-screen top-0 left-0 z-10 flex items-center justify-center bg-[#000000cc]"
    on:click={() => {
      setTimeout(() => {
        openScreenResult = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      {#if isUserWin}
        <div class="text-4xl text-[#FFD569] font-medium">Stonk Stonk</div>
        <img src={gmPoints} alt="" class="w-40 h-40" />
        <div class="text-[34px] text-white font-medium">+1000 GMs</div>
      {:else}
        <div class="text-4xl text-[#FFD569] font-medium">
          ohh... it's stink stink
        </div>
        <img src={betterLuck} alt="" class="w-40 h-40 object-contain" />
        <div class="text-[34px] text-white font-medium">Try again...</div>
      {/if}
    </div>
  </div>
{/if}

{#if openScreenBonusScore}
  <div
    class="fixed h-screen w-screen top-0 left-0 flex items-center justify-center bg-[#000000cc]"
    style="z-index: 2147483648;"
    on:click={() => {
      setTimeout(() => {
        openScreenBonusScore = false;
      }, 500);
    }}
  >
    <div class="flex flex-col items-center justify-center gap-10">
      <div class="xl:text-2xl text-4xl text-white font-medium">
        Congratulation!!!
      </div>
      <img src={gmPoints} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {bonusScore} Bonus GM Points
      </div>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>
