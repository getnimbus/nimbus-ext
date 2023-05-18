<script lang="ts">
  import Button from "../Button.svelte";

  const handleBuy = async () => {
    const res = await fetch("https://api.getnimbus.io/payment", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
    if (res) {
      console.log("res: ", res);
    }
  };
</script>

<div class="flex justify-center items-center h-screen">
  <div class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center">
    <div class="text-lg">Please buy Nimbus NFT to unlock this feature</div>
    <Button variant="secondary" on:click={() => handleBuy()}>Buy</Button>
  </div>
</div>

<style></style>
