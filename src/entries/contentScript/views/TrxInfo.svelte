<svelte:options tag="trx-info" />

<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "./network";
  import { chainIdData } from "./utils";
  import { isEmpty, get } from "lodash";
  import moment from "moment";
  import numeral from "numeral";

  import "~/components/Button.svelte";
  import "~/components/Loading.svelte";
  import "./CoinChart.svelte";
  import "./PriceConvert.svelte";
  import "~/components/Switch.svelte";
  import "~/components/TxInfo/User.svelte";
  import "~/components/TxInfo/MoneyMove.svelte";
  import "~/components/TxInfo/Changes.svelte";
  import "~/components/Footer.svelte";
  import { track } from "~/lib/data-tracking";

  export let hash;
  export let popup: boolean = true;
  let mouted = false;

  let isLoading = true;
  let unknownTRX = false;
  let enabledFilter = false;

  let info = {
    name: "",
    block_signed_at: "",
    chain: {},
    chainId: 0,
    trx_hash: "",

    to_address: "",
    to_address_label: "",
    to_address_logo: "",

    from_address: "",
    from_address_label: "",
    from_address_logo: "",

    changes: [],
    successful: false,
    fees_paid_value: "",
    gas_quote: "",
  };

  const loadTrxInfo = async (hash) => {
    // TODO: Verify trx hash before calling api
    if (hash?.length < 10) {
      return;
    }
    isLoading = true;
    let response;

    try {
      response = await nimbus
        .get(`/tx/${hash}`)
        .then((response) => response.data);

      const transactionInfo = get(response, "data");

      if (isEmpty(transactionInfo)) {
        unknownTRX = true;
      } else {
        unknownTRX = false;
        info = transactionInfo;
        // info.name = transactionInfo.name;
        // info.block_signed_at = transactionInfo.block_signed_at;
        info.chain = chainIdData(transactionInfo.chainId);
        // info.chainId = transactionInfo.chainId;
        // info.trx_hash = transactionInfo.tx_hash;

        // info.from_address = transactionInfo.from_address;
        // info.from_address_label = transactionInfo.from_address_label;
        // info.from_address_logo = transactionInfo.from_address_logo;

        // info.to_address = transactionInfo.to_address;
        // info.to_address_label = transactionInfo.to_address_label;
        // info.to_address_logo = transactionInfo.to_address_logo;

        // info.successful = transactionInfo.successful;
        info.changes = transactionInfo.changes || [];
        info.fees_paid_value = transactionInfo.fees_paid_value || "unknown";
        info.gas_quote = transactionInfo.gas_quote || "unknown";
      }

      isLoading = false;
    } catch (e) {
      console.log(e);
      isLoading = false;
      unknownTRX = true;
    }
  };

  $: {
    if (mouted) {
      loadTrxInfo(hash);
    }
  }

  onMount(() => {
    mouted = true;
    track("Trx Info", {
      url: window.location.href,
      hash,
    });
  });
</script>

<div
  class={`rounded-lg bg-white border-1 border-gray-200 border-solid font-sans text-sm text-gray-600 transition-all overflow-hidden min-w-[520px] w-full max-w-[700px] ${
    isLoading && popup && "w-[350px] max-w-[400px] max-h-[120px] "
  } ${popup ? "max-h-[680px]" : ""}`}
  class:shadow-xl={popup}
>
  {#if isLoading}
    <div class="w-full h-[120px] flex justify-center items-center">
      <loading-icon />
    </div>
  {:else}
    <div class="p-3">
      {#if unknownTRX}
        <div class="py-2">
          We're decoding this transaction and will get back to you soon!
        </div>
      {:else}
        <div class="flex flex-col mb-4 text-xs">
          <div class="flex justify-between items-center gap-3">
            <div class="w-7 h-7 rounded-full overflow-hidden">
              <img
                src={info.chain.logo}
                alt={info.chain.nativeToken}
                class="w-full h-full object-cover"
              />
            </div>
            <div class="w-full flex flex-col text-xs">
              <a
                href={`${info.chain.explorer}/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                class="text-blue-400 no-underline"
              >
                {hash}
              </a>
              <div class="text-gray-500">
                {`${moment(info.block_signed_at).fromNow()} - ${moment(
                  info.block_signed_at
                ).format("DD/MM/YYYY hh:mm A")}`}
              </div>
            </div>
          </div>

          <div class="flex gap-2 items-center justify-end mt-1">
            <div class="text-gray-500">Only Sender change</div>
            <label class="switch">
              <input type="checkbox" bind:checked={enabledFilter} />
              <span class="slider" />
            </label>
          </div>

          <div class="flex justify-between items-center mt-2 gap-2">
            <div class="flex flex-col items-center justify-between flex-[0.4]">
              <div class="w-full">
                <user-info
                  name="Sender"
                  avatar={info.from_address_logo}
                  label={info.from_address_label}
                  address={info.from_address}
                  explorer={info.chain.explorer}
                />
              </div>
              <div class="h-9 my-2 relative line-arrow">
                <div
                  class="absolute -bottom-[1px] -left-[5.5px] h-0 w-0 transform rotate-180 arrow"
                />
              </div>
              <div class="w-full">
                <user-info
                  name="Receiver"
                  avatar={info.to_address_logo}
                  label={info.to_address_label}
                  address={info.to_address}
                  explorer={info.chain.explorer}
                />
              </div>
            </div>

            <div
              class="pl-3 space-y-4 py-3 flex-1 w-full border-0 border-l-1 border-solid border-sky-200"
            >
              {#if info.successful}
                <div class="max-h-[400px] overflow-y-auto py-3">
                  <change-list
                    data={info.changes}
                    id={info.chainId}
                    explorer={info.chain.explorer}
                    from={info.from_address}
                    to={info.to_address}
                    enable={enabledFilter}
                  />
                </div>
              {:else}
                <div class="text-center text-base font-semibold">
                  The transaction failed and has been reverted
                </div>
              {/if}

              <div class="text-right">
                <span class="text-gray-500 mr-1">Gas fee:</span>
                <span class="font-bold">
                  {`${numeral(info.fees_paid_value).format("0,0.00000")} ${
                    info.chain.nativeToken
                  } (${numeral(info.gas_quote).format("0,0.0000")}$)`}
                </span>
              </div>
            </div>
          </div>
        </div>
      {/if}

      <div
        class="mb-2"
        class:text-center={unknownTRX}
        class:text-right={!unknownTRX}
      >
        <a
          href="https://feedback.getnimbus.xyz/"
          target="_blank"
          class="inline-flex no-underline cursor-pointer items-center px-2.5 py-1.5 border-1 border-solid border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
        >
          Report
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
      </div>
    </div>

    <nimbus-footer>
      <ul class="list-disc list-outside px-3">
        <li class="italic">
          <a
            class="text-blue-400 no-underline"
            href="https://ethereum.org/en/developers/docs/transactions/"
            target="_blank">What is transaction?</a
          >
        </li>
      </ul>
    </nimbus-footer>
  {/if}
</div>

<style>
  .line-arrow {
    border-left: 1px solid gray;
  }
  .arrow {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid gray;
  }

  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }
  input:checked + .slider {
    background-color: #2196f3;
  }
  input:checked + .slider {
    box-shadow: 0 0 1px #2196f3;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
  }
</style>
