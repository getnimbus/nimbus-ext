<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "~/lib/network";

  const getPositionDetailPrice = async (positionId, address) => {
    try {
      const response = await nimbus
        .get(`/address/${address}/token/${positionId}`)
        .then((res) => res.data);
    } catch (e) {
      console.log("error: ", e);
    }
  };

  const getPositionDetail = async (positionId, positionType, address) => {
    try {
      const response = await nimbus
        .get(`/address/${address}/positions/${positionType}/${positionId}`)
        .then((res) => res.data);

      console.log("response: ", response);
    } catch (e) {
      console.log("error: ", e);
    }
  };

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const positionIDParams = urlParams.get("positionId");
    const positionTypeParams = urlParams.get("positionType");
    const addressParams = urlParams.get("address");

    if (positionIDParams && positionTypeParams && addressParams) {
      getPositionDetailPrice(positionIDParams, addressParams);
      getPositionDetail(positionIDParams, positionTypeParams, addressParams);
    }
  });
</script>

<div class="max-w-[2000px] m-auto w-[90%] py-8 flex flex-col gap-10">
  <div class="flex flex-col">
    <div class="text-3xl text-black font-semibold">hello1</div>
    <div class="text-lg text-black font-medium">hello2</div>
  </div>
  <div>hello</div>
</div>

<style></style>
