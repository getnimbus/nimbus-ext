<script lang="ts">
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import { isDarkMode, userPublicAddress } from "~/store";
  import { nimbus } from "~/lib/network";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { triggerToast } from "~/utils/functions";

  import Evm from "~/assets/chains/evm.png";

  export let data;
  export let isPrimaryLogin;

  const queryClient = useQueryClient();
  const wallets$ = onboard.state.select("wallets");

  const disconnect = (value: any) => {
    if (value && Object.keys(value)?.length !== 0) {
      onboard.disconnectWallet({ label: value.label });
    }
  };

  // handle evm login
  const connect = async () => {
    try {
      const res = await onboard.connectWallet();
      if (res && res?.length !== 0) {
        handleGetNonce(res?.[0]?.provider, res?.[0]?.accounts[0]?.address);
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleSignAddressMessage = async (provider, signatureString) => {
    try {
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider, "any");
        const signer = await ethersProvider?.getSigner();
        const signature = await signer.signMessage(
          `I am signing my one-time nonce: ${signatureString}`
        );
        if (signature) {
          return signature;
        } else {
          return "";
        }
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleGetNonce = async (provider, address) => {
    try {
      const res: any = await nimbus.post("/users/nonce?verified=true", {
        publicAddress: address,
        referrer: undefined,
      });
      if (res && res.data) {
        const signatureString = await handleSignAddressMessage(
          provider,
          res?.data?.nonce
        );
        if (signatureString) {
          const payload = {
            signature: signatureString,
            publicAddress: address?.toLowerCase(),
          };
          handleUpdatePublicAddress(payload);
        }
      }
    } catch (e) {
      console.error("error: ", e);
      disconnect($wallets$?.[0]);
    }
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

      queryClient.invalidateQueries(["link-socials"]);
      triggerToast("Your are successfully connect your Evm wallet!", "success");
    } catch (e) {
      console.log(e);
      triggerToast(
        "Something wrong when connect your Evm wallet. Please try again!",
        "fail"
      );
    } finally {
      disconnect($wallets$?.[0]);
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] md:w-[310px] w-full ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={connect}
>
  <img src={Evm} alt="" width="24" height="24" />
  <div class="font-semibold text-[15px]">Connect EVM Wallet</div>
</div>

<style>
</style>
