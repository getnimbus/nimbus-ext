<script lang="ts">
  import { useQueryClient } from "@tanstack/svelte-query";
  import { SuiConnector, WalletState } from "nimbus-sui-kit";
  import { isDarkMode, suiWalletInstance, userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { wait } from "~/entries/background/utils";
  import { triggerFirework, triggerToast } from "~/utils";

  import ReactAdapter from "~/components/ReactAdapter.svelte";

  import SUI from "~/assets/chains/sui.png";
  import goldImg from "~/assets/Gold4.svg";

  export let data;
  export let isPrimaryLogin;

  let openScreenBonusScore = false;
  let bonusScore = 0;

  const triggerBonusScore = async () => {
    openScreenBonusScore = true;
    triggerFirework();
    await wait(2000);
    openScreenBonusScore = false;
  };

  const queryClient = useQueryClient();
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
          handleUpdatePublicAddress(payload);
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
        id: isPrimaryLogin ? data?.uid : $userPublicAddress,
        kind: "wallet",
        type: null,
        userPublicAddress: payload?.publicAddress,
        signature: payload?.signature,
      };
      const res: any = await nimbus.post("/accounts/link", params);
      if (res && res?.error) {
        triggerToast(res?.error, "fail");
        return;
      }

      triggerToast("Your are successfully connect your SUI wallet!", "success");
      triggerBonusScore();
      bonusScore = 1000;
      queryClient?.invalidateQueries(["link-socials"]);
      queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);
    } catch (e) {
      console.log(e);
      triggerToast(
        "Something wrong when connect your Sui wallet. Please try again!",
        "fail"
      );
    } finally {
      if (
        ($suiWalletInstance as WalletState) &&
        ($suiWalletInstance as WalletState).connected
      ) {
        ($suiWalletInstance as WalletState).disconnect();
      }
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] md:w-[310px] w-full ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleSUIAuth}
>
  <img src={SUI} class="h-[24px] w-auto" />
  <div class="font-semibold text-[15px]">Connect Sui Wallet</div>

  <div
    class="flex items-center gap-1 text-sm font-medium bg-[#27326F] py-1 px-2 text-white rounded-[10px]"
  >
    1000
    <img src={goldImg} alt="" class="w-6 h-6" />
  </div>
</div>

<ReactAdapter
  element={SuiConnector}
  config={widgetConfig}
  autoConnect={false}
  {chains}
  integrator="svelte-example"
/>

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
      <img src={goldImg} alt="" class="w-40 h-40" />
      <div class="xl:text-2xl text-4xl text-white font-medium">
        You have received {bonusScore} Bonus GM Points
      </div>
    </div>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global>
</style>
