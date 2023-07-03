<svelte:options tag="check-safety-token" />

<script lang="ts">
  import { sendMessage } from "webext-bridge";
  import { getLocalImg } from "~/utils";
  import { i18n } from "~/lib/i18n";

  import "~/components/Collapsible.custom.svelte";

  import Success from "~/assets/shield-done.svg";
  import Fail from "~/assets/shield-fail-address.svg";

  const MultipleLang = {
    warning_audited_address: i18n(
      "quickSearchLang.warning-audited-address",
      "This address is marked as warning."
    ),
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
  let isWarning = false;
  let data;
  let dataRisk;
  let dataWarning;
  let infoRiskList = [];
  let infoWarningList = [];

  const checkSafetyToken = async () => {
    const response: any = await sendMessage("checkSafetyToken", {
      address,
      id,
    });

    if (response.result) {
      data = response.result;
    } else {
      isAudited = false;
    }
  };

  $: {
    if (address) {
      checkSafetyToken();
    }
  }

  $: {
    if (data && Object.keys(data).length !== 0) {
      const address = Object.getOwnPropertyNames(data);
      const formatData = data[address[0]];

      dataRisk = {
        cannot_buy: formatData.cannot_buy,
        cannot_sell_all: formatData.cannot_sell_all,
        is_honeypot: formatData.is_honeypot,
        transfer_pausable: formatData.transfer_pausable,
      };

      dataWarning = {
        anti_whale_modifiable: formatData.anti_whale_modifiable,
        is_blacklisted: formatData.is_blacklisted,
        sell_tax: formatData.sell_tax,
        buy_tax: formatData.buy_tax,
        slippage_modifiable: formatData.slippage_modifiable,
      };
    }
  }

  $: {
    if (dataRisk && dataWarning) {
      const valueRisk = Object.keys(dataRisk).map((key) => dataRisk[key]);
      const valueWarning = Object.keys(dataWarning).map(
        (key) => dataWarning[key]
      );

      infoRiskList = [
        {
          value: dataRisk.cannot_buy,
          title: "The token can be bought",
          content:
            "Generally, these unbuyable tokens would be found in Reward Tokens. Such Tokens are issued as rewards for some on-chain applications and cannot be bought directly by users.",
        },
        {
          value: dataRisk.cannot_sell_all,
          title: "Holders can sell all of the token",
          content:
            "Holders can sell all of the token. Some token contracts will have a maximum sell ratio.",
        },
        {
          value: dataRisk.is_honeypot,
          title: "This does not appear to be a honeypot.",
          content: "We are not aware of any malicious code.",
        },
        {
          value: dataRisk.transfer_pausable,
          title: "No trading cooldown function",
          content:
            "The token contract has no trading cooldown function. If there is a trading cooldown function, the user will not be able to sell the token within a certain time or block after buying.",
        },
      ];

      infoWarningList = [
        {
          value: dataWarning.anti_whale_modifiable,
          title: "Anti whale is modifiable",
          content:
            "The maximum token trading amount or maximum position can be modified, which may lead to suspension of trading. (honeypot risk).",
        },
        {
          value: dataWarning.buy_tax,
          title: "Blacklist function",
          content:
            "The blacklist function is included. Some addresses may not be able to trade normally (honeypot risk).",
        },
        {
          value: dataWarning.is_blacklisted,
          title: "Holders can sell all of the token",
          content:
            "Holders can sell all of the token. Some token contracts will have a maximum sell ratio.",
        },
        {
          value: dataWarning.sell_tax,
          title: "Anti_whale(Limited number of transactions)",
          content:
            "The number of token transactions is limited. The number of scam token transactions may be limited (honeypot risk).",
        },
        {
          value: dataWarning.slippage_modifiable,
          title: "Tax cannot be modified",
          content:
            "The contract owner may not contain the authority to modify the transaction tax. If the transaction tax is increased to more than 49%, the tokens will not be able to be traded (honeypot risk).",
        },
      ];

      isAudited =
        valueRisk.every((currentValue) => {
          return currentValue === "0";
        }) &&
        valueWarning.every((currentValue) => {
          return currentValue === "0";
        });

      isWarning = valueWarning.every((currentValue) => {
        return currentValue === "0";
      });
    }
  }
</script>

<reset-style>
  <div
    class={`flex flex-col gap-2 pl-2 pr-3 py-[6px] rounded-lg ${
      isAudited
        ? "bg-green-100"
        : !isWarning
        ? "bg-orange-100"
        : "bg-[#f25f5c4d]"
    }`}
  >
    <collapsible-custom content={true}>
      <div slot="title">
        <div
          class={`flex flex-col ${
            isAudited
              ? "text-green-700"
              : !isWarning
              ? "text-orange-700"
              : "text-[#F25F5C]"
          }`}
        >
          <div class="flex items-center gap-1">
            {#if isAudited}
              <img src={getLocalImg(Success)} alt="" />
              <div class="text-sm">
                <div>{MultipleLang.audited_address}</div>
              </div>
            {:else if !isWarning}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke="#ff5a1f"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <div class="text-sm">
                <div>{MultipleLang.warning_audited_address}</div>
              </div>
            {:else}
              <img src={getLocalImg(Fail)} alt="" />
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
              href={`https://gopluslabs.io/token-security/${id}/${address}`}
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
          {#each infoRiskList as info}
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

          {#each infoWarningList as info}
            <collapsible-custom content={true}>
              <div slot="title">
                <div class="flex items-center gap-1">
                  {#if info.value === "0"}
                    <img src={getLocalImg(Success)} alt="" class="w-6 h-6" />
                  {:else}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke="#ff5a1f"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  {/if}
                  <div
                    class={`font-medium ${
                      info.value === "0" ? "text-green-700" : "text-orange-700"
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
