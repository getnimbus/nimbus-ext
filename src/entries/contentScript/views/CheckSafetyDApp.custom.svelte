<svelte:options tag="check-safety-dapp" />

<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import { isEmpty } from "lodash";
  import { getLocalImg } from "~/utils/index";
  import { i18n } from "~/lib/i18n";

  import Success from "~/assets/shield-done.svg";
  import Fail from "~/assets/shield-fail.svg";

  const MultipleLang = {
    not_audited: i18n(
      "quickSearchLang.not-audited",
      "This page is not support."
    ),
    audited: i18n("quickSearchLang.audited", "The page has been audited."),
    scan_by_go_plus: i18n("quickSearchLang.scan-with-go-plus", "Scan by Go+"),
    audit_report: i18n("quickSearchLang.audit-report", "Audit report"),
  };

  let data: any = {};

  const checkSafetyCurrentUrl = async () => {
    let currentUrl = window.location.href;
    const response: {
      code: number;
      message: string;
      result: any;
    } = await sendMessage("checkSafety", { currentUrl });

    if (response.result) {
      data = response.result;
    }
  };

  onMount(() => {
    checkSafetyCurrentUrl();
  });
</script>

<reset-style>
  <div
    class={`pl-2 pr-3 py-[6px] rounded-lg ${
      !isEmpty(data) && data.is_audit === 1
        ? "text-green-700 bg-green-100"
        : "text-black bg-[#FFCB5999]"
    }`}
  >
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        {#if !isEmpty(data) && data.is_audit === 1}
          <img
            src={getLocalImg(Success)}
            alt="success-icon"
            width="22"
            height="22"
          />
          <div class="text-xs">
            <div>{MultipleLang.audited}</div>
            <a
              href={data?.audit_info?.[0]?.audit_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {MultipleLang.audit_report}
            </a>
          </div>
        {:else if data.is_audit !== 1}
          <img src={getLocalImg(Fail)} alt="fail-icon" width="22" height="22" />
          <div class="text-xs">{MultipleLang.not_audited}</div>
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
