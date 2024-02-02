<script lang="ts">
  import onboard from "~/lib/web3-onboard";
  import { ethers } from "ethers";
  import { isDarkMode, user } from "~/store";
  import { nimbus } from "~/lib/network";
  import { useQueryClient } from "@tanstack/svelte-query";

  import Evm from "~/assets/chains/evm.png";
  import User from "~/assets/user.png";

  export let data;
  export let reCallAPI = () => {};

  const queryClient = useQueryClient();

  // handle evm login
  const connect = async () => {
    try {
      const res = await onboard.connectWallet();
      if (res && res.length !== 0) {
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
      const res = await nimbus.post("/users/nonce", {
        publicAddress: address,
        referrer: undefined,
      });
      if (res && res.data) {
        const signatureString = await handleSignAddressMessage(
          provider,
          res.data.nonce
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
    }
  };

  const handleGetEVMToken = async (data) => {
    try {
      const res = await nimbus.post("/auth/evm", data);
      if (res?.data?.result) {
        localStorage.setItem("evm_token", res?.data?.result);
        user.update(
          (n) =>
            (n = {
              picture: User,
            })
        );
        queryClient?.invalidateQueries(["users-me"]);
        queryClient.invalidateQueries(["list-address"]);
        queryClient.invalidateQueries(["list-bundle"]);
        reCallAPI();
      }
    } catch (e) {
      console.error("error: ", e);
    }
  };

  const handleUpdatePublicAddress = async (payload) => {
    try {
      let params: any = {
        kind: "wallet",
        id: data?.uid,
        type: "google",
        info: data?.info,
        userPublicAddress: payload.publicAddress,
      };
      await nimbus.post("/accounts/link", params);
      localStorage.removeItem("auth_token");
      handleGetEVMToken(payload);
    } catch (e) {
      console.log(e);
    }
  };
</script>

<div
  class={`flex items-center justify-center gap-2 text-white border cursor-pointer py-3 px-6 rounded-[12px] w-[250px] ${
    $isDarkMode ? "border-white text-white" : "border-[#27326f] text-[#27326f]"
  }`}
  on:click={connect}
>
  <img src={Evm} alt="" width="24" height="24" />
  <div class="font-semibold text-[15px]">Connect EVM</div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
