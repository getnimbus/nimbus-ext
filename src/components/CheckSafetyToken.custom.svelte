<svelte:options tag="check-safety-token" />

<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import { getLocalImg } from "~/utils";
  import { i18n } from "~/lib/i18n";

  import "~/components/Collapsible.custom.svelte";

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
  export let id;

  let isAudited = false;

  const checkSafetyToken = async () => {
    const response: any = await sendMessage("checkSafetyToken", {
      address,
      id,
    });
    console.log("response token: ", response);

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
    checkSafetyToken();
  });
</script>

<reset-style>
  <div
    class={`flex flex-col gap-2 pl-2 pr-3 py-[6px] rounded-lg ${
      isAudited ? "bg-green-100" : "bg-[#f25f5c4d]"
    }`}
  >
    <collapsible-custom content={true}>
      <div slot="title">
        <div
          class={`flex flex-col ${
            isAudited ? "text-green-700" : "text-[#F25F5C]"
          }`}
        >
          <div class="flex items-center gap-1">
            {#if isAudited}
              <img src={getLocalImg(Success)} alt="Success" />
              <div class="text-sm">
                <div>{MultipleLang.audited_address}</div>
              </div>
            {:else}
              <img src={getLocalImg(Fail)} alt="fail" />
              <div class="text-sm">
                <div>{MultipleLang.not_audited_address}</div>
              </div>
            {/if}
          </div>
          <div class="text-[11px] text-[#00000066] pl-7">
            {MultipleLang.scan_by_go_plus}
          </div>
        </div>
      </div>

      <div slot="content">
        {#if isAudited}
          <div class="flex flex-col gap-1">
            <collapsible-custom content={true}>
              <div slot="title">
                <div class="flex items-center gap-1">
                  <img src={getLocalImg(Success)} alt="Success" />
                  <div>No fake KYC involved</div>
                </div>
              </div>
              <div slot="content">
                This address was not found to be involved in fake KYC.
              </div>
            </collapsible-custom>

            <collapsible-custom>
              <div slot="title">
                <div class="flex items-center gap-1">
                  <img src={getLocalImg(Success)} alt="Success" />
                  <div>Collapse or Expand me 2</div>
                </div>
              </div>
            </collapsible-custom>
          </div>
        {:else}
          <div>hello world</div>
        {/if}
      </div>
    </collapsible-custom>
  </div>
</reset-style>

<style>
</style>
