<script lang="ts">
  import { triggerToast, triggerBonusScore } from "~/utils/functions";
  import { suiWalletInstance, userPublicAddress } from "~/store";
  import type { WalletState } from "nimbus-sui-kit";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { getLinkData, handleValidateAddress } from "~/lib/queryAPI";
  import { onMount } from "svelte";
  import { SuiConnector } from "nimbus-sui-kit";

  import ReactAdapter from "~/components/ReactAdapter.svelte";
  import Copy from "~/components/Copy.svelte";

  import goldImg from "~/assets/Gold4.svg";
  import SUI from "~/assets/chains/sui.png";

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
  let isTrigger = false;

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

  onMount(() => {
    if ($userPublicAddress) {
      handleCheckPublicAddress($userPublicAddress);
    }
  });

  const handleCheckPublicAddress = async (address) => {
    const addressValidate = await handleValidateAddress(address);
    if (addressValidate && addressValidate.type === "MOVE") {
      selectedDataSUILink = {
        uid: address,
      };
    }
  };

  const queryClient = useQueryClient();

  const handleSUIAuth = async () => {
    try {
      isTrigger = true;
      ($suiWalletInstance as WalletState).toggleSelect();
    } catch (e) {
      console.log("error: ", e);
    }
  };

  $: {
    if (
      ($suiWalletInstance as WalletState) &&
      ($suiWalletInstance as WalletState).connected &&
      isTrigger
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
      isTrigger = false;
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
        triggerToast(
          res?.error ||
            "Something wrong when connect your Sui wallet. Please try again!",
          "fail"
        );
        return;
      }

      queryClient?.invalidateQueries(["link-socials"]);
      queryClient?.invalidateQueries([$userPublicAddress, "daily-checkin"]);

      triggerBonusScore(1000, 2000);
      triggerToast("Your are successfully connect your Sui wallet!", "success");
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
      isTrigger = false;
    }
  };
</script>

{#if selectedDataSUILink && Object.keys(selectedDataSUILink).length !== 0}
  <div
    class="flex justify-center items-center gap-3 text-white bg-[#1e96fc] py-3 px-2 rounded-[10px] cursor-pointer xl:w-[280px] w-max"
  >
    <img src={SUI} alt="" width="24" height="24" />
    <Copy
      address={selectedDataSUILink?.uid}
      iconColor={"#fff"}
      color={"#fff"}
      isShorten
    />
  </div>
{:else}
  <div
    class="flex justify-center items-center gap-3 text-white bg-[#1e96fc] py-1 px-2 rounded-[10px] cursor-pointer xl:w-[280px] w-max"
    on:click={handleSUIAuth}
  >
    Connect SUI Wallet
    <div
      class="flex items-center gap-1 text-sm font-medium bg-[#27326F] py-1 px-2 text-white rounded-[10px]"
    >
      1000
      <img src={goldImg} alt="" class="w-6 h-6" />
    </div>
  </div>
{/if}

<ReactAdapter
  element={SuiConnector}
  config={widgetConfig}
  autoConnect={false}
  {chains}
  integrator="svelte-example"
/>

<style windi:preflights:global windi:safelist:global>
</style>
