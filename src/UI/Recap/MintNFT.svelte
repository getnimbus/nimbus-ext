<script>
  import {
    createQuery,
    createMutation,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { walletStore } from "@svelte-on-solana/wallet-adapter-core";
  import {
    Connection,
    Transaction,
    VersionedTransaction,
  } from "@solana/web3.js";

  import Logo from "~/assets/logo-1.svg";

  const handleMintNFT = createMutation({
    mutationFn: async () => {
      const data = await nimbus.post("/recap/mint-nft", {
        image: "", // TODO: Add base 64 image here
      });

      console.log(data.data.result.encoded_transaction);
      const signedTx = await $walletStore.signTransaction(
        Transaction.from(
          Buffer.from(data.data.result.encoded_transaction, "base64")
        )
      );
      const connection = new Connection(
        "https://devnet-rpc.shyft.to?api_key=Gny0V25q6Y2kMjze" // DEVNET
        // "https://rpc.shyft.to?api_key=Qjb6SubTTbLrkmNo" // PROD
      );
      const result = await $walletStore.sendTransaction(signedTx, connection);
      console.log(result);
      return result;
    },
  });
</script>

<div
  class="bg-[#E8F4EF] pt-10 pb-20 overflow-hidden w-full h-full"
  id="target-slide-4"
>
  <div
    class="relative flex flex-col gap-20 h-full max-w-[2400px] m-auto w-[96%]"
  >
    <img
      src={Logo}
      alt="logo"
      class="xl:w-[177px] w-[220px] xl:h-[75px] h-[100px]"
    />
    <div class="flex-1 h-full px-[35px]">
      <div>Mint your NFT</div>
      <button on:click={$handleMintNFT.mutate()}>Mint</button>
    </div>
  </div>
</div>

<style></style>
