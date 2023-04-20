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
      "This address is marked as unsafe."
    ),
    audited_address: i18n(
      "quickSearchLang.audited-address",
      "This address is marked as safe."
    ),
    scan_by_go_plus: i18n("quickSearchLang.scan-with-go-plus", "Scan by Go+"),
    learn_more: i18n("quickSearchLang.learn-more", "Learn more"),
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
      isAudited = vals.every((currentValue) => {
        return currentValue === "0" || currentValue === "";
      });
    } else {
      isAudited = false;
    }
  };

  onMount(() => {
    checkSafetyAddress();
  });
</script>

<reset-style>
  <div
    class={`pl-2 pr-3 py-[6px] rounded-lg ${
      isAudited
        ? "text-green-700 bg-green-100"
        : "text-[#F25F5C] bg-[#f25f5c4d]"
    }`}
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        {#if isAudited}
          <img src={getLocalImg(Success)} alt="Success" />
          <div class="text-xs">
            <div>{MultipleLang.audited_address}</div>
            <a
              href={`https://gopluslabs.io/malicious-address-detection/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {MultipleLang.learn_more}
            </a>
          </div>
        {:else}
          <img src={getLocalImg(Fail)} alt="fail" />
          <div class="text-xs">
            <div>{MultipleLang.not_audited_address}</div>
            <a
              href={`https://gopluslabs.io/malicious-address-detection/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {MultipleLang.learn_more}
            </a>
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
