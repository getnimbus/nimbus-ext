<script lang="ts">
  import { isDarkMode, tonConnector, userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { triggerToast } from "~/utils/functions";
  import { v4 as uuidv4 } from "uuid";

  import Ton from "~/assets/chains/ton.png";

  export let data;
  export let isPrimaryLogin;

  const queryClient = useQueryClient();

  const handleTonAuth = async () => {
    const uuid = uuidv4();
    if ($tonConnector.connected) {
      $tonConnector.disconnect();
    }
    handleGetNonce(uuid);
  };

  const handleGetNonce = async (id: string) => {
    try {
      const res: any = await nimbus.post("/users/nonce?verified=true", {
        publicAddress: id,
        referrer: undefined,
      });

      if (res && res.data) {
        const msg = `I am signing my one-time nonce: ${res.data.nonce}`;

        $tonConnector.setConnectRequestParameters({
          state: "ready",
          value: { tonProof: msg },
        });

        $tonConnector.openModal();

        $tonConnector.onStatusChange((wallet) => {
          if (
            wallet &&
            wallet.connectItems?.tonProof &&
            "proof" in wallet.connectItems.tonProof
          ) {
            handleUpdatePublicAddress(wallet, id);
          }
        });
      }
    } catch (e) {
      console.error("error: ", e);
      if ($tonConnector.connected) {
        $tonConnector.disconnect();
      }
    }
  };

  const handleUpdatePublicAddress = async (payload, id) => {
    try {
      const formatData = {
        account: {
          address: payload?.account?.address,
          chain: payload?.account?.chain,
          walletStateInit: payload?.account?.walletStateInit,
        },
        connectItems: {
          tonProof: {
            name: payload?.connectItems?.tonProof?.name,
            proof: {
              timestamp: payload?.connectItems?.tonProof?.proof?.timestamp,
              domain: {
                lengthBytes:
                  payload?.connectItems?.tonProof?.proof?.domain?.lengthBytes,
                value: payload?.connectItems?.tonProof?.proof?.domain?.value,
              },
              signature: payload?.connectItems?.tonProof?.proof?.signature,
            },
          },
        },
      };

      const params: any = {
        id: isPrimaryLogin ? data?.uid : $userPublicAddress,
        kind: "wallet",
        type: null,
        userPublicAddress: formatData?.account?.address,
        signature: formatData?.connectItems?.tonProof?.proof?.signature,
      };
      const res: any = await nimbus.post(
        `/accounts/link?loginId=${id}`,
        params
      );
      if (res && res?.error) {
        triggerToast(res?.error, "fail");
        return;
      }

      triggerToast("Your are successfully connect your Ton wallet!", "success");
      queryClient.invalidateQueries(["link-socials"]);
    } catch (e) {
      console.log(e);
      triggerToast(
        "Something wrong when connect your Ton wallet. Please try again!",
        "fail"
      );
    } finally {
      if ($tonConnector.connected) {
        $tonConnector.disconnect();
      }
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] md:w-[310px] w-full ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={handleTonAuth}
>
  <img src={Ton} class="h-[24px] w-auto" />
  <div class="font-semibold text-[15px]">Connect Ton Wallet</div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
