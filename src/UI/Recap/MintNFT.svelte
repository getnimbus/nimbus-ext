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
        "https://rpc.shyft.to?api_key=Qjb6SubTTbLrkmNo"
      );
      const result = await $walletStore.sendTransaction(signedTx, connection);
      console.log(result);
      return result;
    },
  });
</script>

<div class="h-screen">
  MintnFT

  <button on:click={$handleMintNFT.mutate()}>Mint NFT</button>
</div>

<style></style>
