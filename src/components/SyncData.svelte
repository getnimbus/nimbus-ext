<script lang="ts">
  import { wait } from "~/entries/background/utils";
  import { nimbus } from "~/lib/network";
  import { chain } from "~/store";

  import Testimonial from "~/UI/Testimonial/Testimonial.svelte";

  export let address;

  let isErrorAllData = false;
  let isLoadingSync = false;
  let syncMsg = "";

  const getSync = async () => {
    try {
      await nimbus
        .post(`/v2/address/${address}/sync?chain=${$chain}`, {})
        .then((response) => response);
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const getSyncStatus = async () => {
    try {
      const response = await nimbus
        .get(`/address/${address}/sync-status?chain=${$chain}`)
        .then((response) => response);
      return response;
    } catch (e) {
      console.error("e: ", e);
    }
  };

  const handleSync = async () => {
    console.log("Going to full sync");
    await getSync();
  };

  const handleGetAllData = async () => {
    isLoadingSync = false;
    try {
      let syncStatus = await getSyncStatus();
      // sync data again
      if (!syncStatus?.data?.lastSync) {
        handleSync();
      }

      // already sync data from db
      if (syncStatus?.data?.lastSync) {
        console.log("start load data (already sync)");
        syncMsg = "";
        isLoadingSync = false;
        isErrorAllData = false;
      }

      // check data from db
      if (syncStatus?.data?.canWait) {
        syncMsg = syncStatus?.data?.error;
        isLoadingSync = true;
        // keep call api /sync-status until we can not wait
        while (true) {
          if (syncStatus?.data?.lastSync) {
            console.log("start load data (newest sync)");
            syncMsg = "";
            isLoadingSync = false;
            isErrorAllData = false;
            break;
          } else {
            isLoadingSync = true;
            await wait(5000);
            syncStatus = await getSyncStatus();
          }
        }
      } else {
        // Cut call when we can not wait
        syncMsg = syncStatus?.data?.error;
        isLoadingSync = false;
        isErrorAllData = true;
      }
    } catch (e) {
      console.error("error: ", e);
      isLoadingSync = false;
      isErrorAllData = true;
    }
  };

  $: {
    if (address) {
      handleGetAllData();
    }
  }
</script>

{#if isLoadingSync}
  <div
    class="text-xl font-medium flex flex-col gap-5 justify-center items-center rounded-[20px] p-6 h-screen"
  >
    {syncMsg}
    {#if syncMsg !== "Invalid address"}
      <Testimonial />
    {/if}
  </div>
{:else}
  <div>
    {#if isErrorAllData}
      <div class="flex flex-col justify-center items-center gap-2">
        Something when wrong! Please reload your browser to try again
      </div>
    {:else}
      <slot />
    {/if}
  </div>
{/if}
