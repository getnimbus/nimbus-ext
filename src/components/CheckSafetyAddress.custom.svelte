<svelte:options tag="check-safety-address" />

<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import { getLocalImg } from "~/utils";
  import { i18n } from "~/lib/i18n";

  import Success from "~/assets/shield-done.svg";
  import Fail from "~/assets/shield-fail-address.svg";

  const MultipleLang = {
    not_audited_address: i18n(
      "quickSearchLang.not-audited-address",
      "This contract is marked as risky."
    ),
    audited_address: i18n(
      "quickSearchLang.audited-address",
      "This contract is marked as audited."
    ),
    scan_by_go_plus: i18n("quickSearchLang.scan-with-go-plus", "Scan by Go+"),
  };

  export let address;
  export let chainId;

  let isAudited = false;

  const checkSafetyAddress = async () => {
    const response: {
      code: number;
      message: string;
      result: any;
    } = await sendMessage("checkSafetyAddress", { address, chainId });

    if (response.result) {
      const vals = Object.keys(response.result).map(
        (key) => response.result[key]
      );
      isAudited = vals.every((currentValue) => currentValue === "1");
    } else {
      isAudited = true;
    }
  };

  onMount(() => {
    checkSafetyAddress();
  });
</script>

<reset-style>
  <div
    class={`pl-2 pr-3 py-[6px] rounded-lg ${
      !isAudited
        ? "text-green-700 bg-green-100"
        : "text-[#F25F5C] bg-[#f25f5c4d]"
    }`}
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        {#if !isAudited}
          <img src={getLocalImg(Success)} alt="Success" />
          <div class="text-xs">
            <div>{MultipleLang.audited_address}</div>
          </div>
        {:else}
          <img src={getLocalImg(Fail)} alt="fail" />
          <div class="text-xs">
            {MultipleLang.not_audited_address}
          </div>
        {/if}
      </div>
      <div class="text-[10px] text-[#00000066]">
        {MultipleLang.scan_by_go_plus}
      </div>
    </div>
  </div>
</reset-style>

<style>
</style>
