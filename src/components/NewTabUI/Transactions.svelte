<script lang="ts">
  import { nimbus } from "~/lib/network";
  import { user } from "~/store";

  import Button from "../Button.svelte";
  import "~/components/Loading.custom.svelte";

  let userInfo = {};
  user.subscribe((value) => {
    userInfo = value;
  });

  let listNft = [];
  let isLoading = false;

  const handleBuy = async () => {
    const res = await nimbus
      .get(`/payments/create-session?device=${APP_TYPE.TYPE}`)
      .then((response) => response);
    if (res) {
      window.location.replace(res.data.payment_url);
    }
  };

  const handleGetNft = async () => {
    try {
      isLoading = true;
      const solanaAddress = localStorage.getItem("solana_address");
      const solanaToken = localStorage.getItem("solana_token");
      if (solanaAddress && solanaToken) {
        const res = await nimbus
          .get(`/nft/${solanaAddress}`, {
            headers: {
              Authorization: `${solanaToken}`,
            },
          })
          .then((response) => response);
        if (res) {
          listNft = res?.data?.result;
        }
      }
    } catch (e) {
      console.log("error: ", e);
    } finally {
      isLoading = false;
    }
  };

  $: {
    if (Object.keys(userInfo).length !== 0) {
      handleGetNft();
    } else {
      listNft = [];
    }
  }
</script>

{#if Object.keys(userInfo).length === 0}
  <div class="flex justify-center items-center h-screen">
    <div class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center">
      <div class="text-lg">Please login to use this feature</div>
    </div>
  </div>
{:else}
  <div>
    {#if isLoading}
      <div class="flex justify-center items-center h-screen">
        <div class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center">
          <loading-icon />
        </div>
      </div>
    {:else}
      <div>
        {#if listNft && listNft.length !== 0}
          <div
            class="flex justify-between items-center max-w-[2000px] m-auto w-[90%]"
          >
            Already have NFT
          </div>
        {:else}
          <div class="flex justify-center items-center h-screen">
            <div
              class="p-6 w-2/3 flex flex-col gap-4 justify-center items-center"
            >
              <div class="text-lg">
                You need Nimbus NFT to unlock this feature
              </div>
              <Button variant="secondary" on:click={() => handleBuy()}
                >Buy</Button
              >
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style></style>
