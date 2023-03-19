<svelte:options tag="check-safety" />

<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import { isEmpty } from "lodash";
  import { getLocalImg } from "~/utils";

  import Success from "~/assets/shield-done.svg";
  import Fail from "~/assets/shield-fail.svg";

  let isLoading = true;
  let data: any = {};
  const IS_AUDITED_CODE = 1;

  const checkSafetyCurrentUrl = async () => {
    let currentUrl = window.location.href;
    isLoading = true;

    const response: {
      code: number;
      message: string;
      result: any;
    } = await sendMessage("checkSafety", { currentUrl });
    if (response.result) {
      data = response.result;
    }

    isLoading = false;
  };

  onMount(() => {
    checkSafetyCurrentUrl();
  });
</script>

<reset-style>
  <div
    class={`pl-2 pr-3 py-[6px] rounded-lg ${
      !isEmpty(data) && data.is_audit === IS_AUDITED_CODE
        ? "text-green-700 bg-green-100"
        : "text-black bg-[#FFCB5999]"
    }`}
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        {#if !isEmpty(data) && data.is_audit === IS_AUDITED_CODE}
          <img src={getLocalImg(Success)} alt="Success" />
          <div class="text-xs">
            The page has been audited.
            <a
              href={data?.audit_info?.[0]?.audit_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Audit report
            </a>
          </div>
        {:else if data.is_audit !== IS_AUDITED_CODE}
          <img src={getLocalImg(Fail)} alt="fail" />
          <div class="text-xs">This page is not support.</div>
        {/if}
      </div>
      <div class="text-[10px] text-[#00000066]">Scan by Go+</div>
    </div>
  </div>
</reset-style>

<style>
</style>
