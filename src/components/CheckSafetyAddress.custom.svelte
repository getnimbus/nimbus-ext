<svelte:options tag="check-safety-address" />

<script lang="ts">
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
  let data;
  let infoList = [];

  const checkSafetyAddress = async () => {
    const response: any = await sendMessage("checkSafetyAddress", {
      address,
      id,
    });

    if (response.result) {
      data = {
        blacklist_doubt: response.result.blacklist_doubt,
        stealing_attack: response.result.stealing_attack,
        blackmail_activities: response.result.blackmail_activities,
        cybercrime: response.result.cybercrime,
        darkweb_transactions: response.result.darkweb_transactions,
        fake_kyc: response.result.fake_kyc,
        financial_crime: response.result.financial_crime,
        honeypot_related_address: response.result.honeypot_related_address,
        malicious_mining_activities:
          response.result.malicious_mining_activities,
        mixer: response.result.mixer,
        money_laundering: response.result.money_laundering,
        number_of_malicious_contracts_created:
          response.result.number_of_malicious_contracts_created,
        phishing_activities: response.result.phishing_activities,
        sanctioned: response.result.sanctioned,
      };
    } else {
      isAudited = false;
    }
  };

  $: {
    if (address) {
      checkSafetyAddress();
    }
  }

  $: {
    if (data) {
      const value = Object.keys(data).map((key) => data[key]);

      infoList = [
        {
          value: data.honeypot_related_address,
          title: "Non-honeypot related address",
          content:
            "This address has not been found to be related to honeypot tokens or has created scam tokens.",
        },
        {
          value: data.money_laundering,
          title: "No money laundering involved",
          content:
            "This address was not found to be involved in money laundering.",
        },
        {
          value: data.malicious_mining_activities,
          title: "No suspected malicious behavior found",
          content:
            "This address was not found to be suspected of malicious behavior.",
        },
        {
          value: data.phishing_activities,
          title: "No phishing activities involved",
          content:
            "This address was not found to be involved in phishing activities.",
        },
      ];

      isAudited = value.every((currentValue) => {
        return currentValue === "0";
      });
    }
  }
</script>

<reset-style>
  <div
    class={`pl-2 pr-3 pt-[6px] pb-2 rounded-lg ${
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
          <div class="flex items-center gap-2 text-[11px] pl-7">
            <div class="text-[#00000066]">
              {MultipleLang.scan_by_go_plus}
            </div>
            <a
              href={`https://gopluslabs.io/malicious-address-detection/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              class="-mt-[2px]"
            >
              {MultipleLang.learn_more}
            </a>
          </div>
        </div>
      </div>
      <div slot="content">
        <div class="flex flex-col gap-1 mt-1">
          {#each infoList as info}
            <collapsible-custom content={true}>
              <div slot="title">
                <div class="flex items-center gap-1">
                  {#if info.value === "0"}
                    <img src={getLocalImg(Success)} alt="" class="w-6 h-6" />
                  {:else}
                    <img src={getLocalImg(Fail)} alt="" class="w-6 h-6" />
                  {/if}
                  <div
                    class={`font-medium ${
                      info.value === "0" ? "text-green-700" : "text-[#F25F5C]"
                    }`}
                  >
                    {info.title}
                  </div>
                </div>
              </div>
              <div slot="content" class="pl-7 leading-4">
                {info.content}
              </div>
            </collapsible-custom>
          {/each}
        </div>
      </div>
    </collapsible-custom>
  </div>
</reset-style>

<style>
</style>
