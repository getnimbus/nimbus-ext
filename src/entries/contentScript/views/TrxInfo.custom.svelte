<svelte:options tag="trx-info" />

<script lang="ts">
  import { onMount } from "svelte";
  import { nimbus } from "../../../lib/network";
  import { chainIdData, shorterAddress } from "../../../utils";
  import { isEmpty, get } from "lodash";
  import moment from "moment";
  import numeral from "numeral";
  import { sendMessage } from "webext-bridge";
  import tooltip from "~/entries/contentScript/views/tooltip";
  import { track } from "~/lib/data-tracking";
  import { formatCurrency } from "../../../utils";
  import dayjs from "dayjs";
  import relativeTime from "dayjs/plugin/relativeTime";
  dayjs.extend(relativeTime);

  import "~/components/Loading.custom.svelte";
  import "~/components/CoinChart.custom.svelte";
  import "~/components/PriceConvert.custom.svelte";
  import "~/components/Switch.custom.svelte";
  import "~/components/TxInfo/User.custom.svelte";
  import "~/components/TxInfo/MoneyMove.custom.svelte";
  import "~/components/TxInfo/Changes.custom.svelte";

  export let hash;
  export let popup: boolean = true;

  let isLoading = false;
  let unknownTRX = false;
  let enabledFilter = false;
  let info;

  const loadTrxInfo = async (hash) => {
    // TODO: Verify trx hash before calling api
    if (hash?.length < 10) {
      unknownTRX = true;
      return;
    }
    isLoading = true;
    try {
      const response: any = await sendMessage("TrxHashInfo", {
        hash,
      });
      if (isEmpty(response)) {
        unknownTRX = true;
      } else {
        unknownTRX = false;
        info = response;
      }
      isLoading = false;
    } catch (e) {
      console.log(e);
      isLoading = false;
      unknownTRX = true;
    }
  };

  onMount(() => {
    loadTrxInfo(hash);
    track("Trx Info", {
      url: window.location.href,
      hash,
    });
  });
</script>

<reset-style>
  <div
    class={`rounded-[20px] bg-white font-sans text-sm text-gray-600 transition-all overflow-hidden w-[600px] ${
      isLoading && popup && "max-h-[120px]"
    } ${popup ? "max-h-[680px]" : ""}`}
    class:shadow={popup}
  >
    {#if isLoading}
      <div class="w-full h-[120px] flex justify-center items-center">
        <loading-icon />
      </div>
    {:else}
      <div class="p-4">
        {#if unknownTRX}
          <div class="py-2 title-5 text-center font-semibold">
            We're decoding this transaction and will get back to you soon!
          </div>
        {:else}
          <div class="flex flex-col">
            <div class="pb-4 border-bottom flex flex-col gap-4">
              <div class="flex justify-between items-center">
                <a
                  href={`https://etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noreferrer"
                  class="no-underline flex items-center gap-1"
                >
                  <div
                    class="text-[#FF7D00] px-[6px] py-1 rounded-lg bg-[#ff7d001a] text-xs"
                    use:tooltip={{
                      content: `<tooltip-detail text="${hash}" />`,
                      allowHTML: true,
                      placement: "top",
                    }}
                  >
                    {shorterAddress(hash)}
                  </div>
                  <div class="h-4 w-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      class="w-full h-full object-contain text-[#212121]"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                        clip-rule="evenodd"
                      />
                      <path
                        fill-rule="evenodd"
                        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </div>
                </a>
                <div class="text-xs text-[#5E656B] font-normal">
                  {dayjs(info?.timestamp).fromNow()} - {dayjs(
                    info?.timestamp
                  ).format("DD/MM/YYYY HH:mm A")}
                </div>
              </div>
              <div class="flex justify-between items-center gap-4">
                <div class="w-max">
                  <user-info
                    name="Sender"
                    avatar={info?.from_logo}
                    address={info?.from}
                    id={1}
                  />
                </div>
                <div class="relative line-arrow flex-1">
                  <div
                    class="absolute -bottom-[3px] -right-[5.5px] h-0 w-0 transform rotate-90 arrow"
                  />
                </div>
                <div class="w-max">
                  <user-info
                    name="Receiver"
                    avatar={info?.to_logo}
                    address={info?.to}
                    id={1}
                  />
                </div>
              </div>
            </div>
            <div class="flex items-start justify-between gap-2 mt-4">
              <div class="flex flex-col gap-1">
                <div class="text-black text-xs font-normal">
                  Transaction Detail
                </div>
                <div
                  class="text-xs font-medium text-[#27326F] px-1 py-[2px] bg-[#6AC7F533] rounded-[5px]"
                >
                  Gas fee: {`${Number(info?.gasUsed)} ${
                    info?.nativeToken
                  } ($${formatCurrency(info?.transactionFee)})`}
                </div>
              </div>
              {#if info?.logs && info?.logs.length !== 0}
                <div class="flex items-center gap-2">
                  <label class="switch">
                    <input type="checkbox" bind:checked={enabledFilter} />
                    <span class="slider" />
                  </label>
                  <div class="text-black text-xs font-normal">
                    Only Sender change
                  </div>
                </div>
              {/if}
            </div>
            <div class="my-6">
              {#if info?.logs}
                <div class="max-h-[400px] h-[135px] overflow-y-auto">
                  <change-list
                    data={info?.logs}
                    id={1}
                    explorer={info?.chain?.explorer}
                    from={info?.from}
                    to={info?.to}
                    enable={enabledFilter}
                  />
                </div>
              {:else}
                <div class="title-5 text-center font-semibold">
                  The transaction failed and has been reverted
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
      <div class="flex justify-between px-4 pb-4">
        <div class="flex items-center gap-1">
          <svg
            width="20"
            height="30"
            viewBox="0 0 508 542"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M315 209H192V227H315V209Z" fill="#27326F" />
            <path
              d="M164.757 190.973C164.757 171.524 180.655 155.789 200.243 155.789C219.831 155.789 235.729 171.551 235.729 190.973H253.486C253.486 172.074 243.442 155.514 228.349 146.189C232.566 131.444 246.106 120.55 262.337 120.55C281.953 120.55 297.851 136.313 297.851 155.761V164.564H315.608C330.313 164.564 342.243 176.393 342.243 190.973H360C360 166.682 340.134 146.986 315.608 146.986C315.33 146.986 315.108 147.041 314.831 147.069C310.614 122.063 288.778 103 262.365 103C238.726 103 218.694 118.295 211.73 139.476C208.039 138.679 204.183 138.211 200.243 138.211C170.833 138.211 147 161.841 147 191H164.757V190.973Z"
              fill="#27326F"
            />
            <path
              d="M253.486 306.503V227H244.672L183 359.497H253.486V439H262.3L324 306.503H253.486ZM210.682 341.823L235.885 287.698V324.177H296.318L271.115 378.302V341.823H210.682Z"
              fill="#27326F"
            />
            <path
              d="M95 493H413V50H95V493ZM112.673 67.72H395.327V475.28H112.673V67.72Z"
              fill="#27326F"
            />
          </svg>
          <div class="text-[#27326F] text-xs font-medium">
            Nimbus - A personalized portfolio
          </div>
        </div>
        <a
          href="https://nimbus.sleekplan.app/"
          target="_blank"
          class="inline-flex no-underline cursor-pointer items-center bg-[#6AC7F533] text-[#27326F] w-max px-3 py-1 rounded-[5px]"
        >
          Report
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3 ml-1 text-[#27326F]"
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
    {/if}
  </div>
</reset-style>

<style>
  .border-bottom {
    border-bottom: 1px solid #00000014;
  }

  .shadow {
    box-shadow: 0px 0px 40px 0px #0000001a;
  }

  .line-arrow {
    border-top: 1px solid #27326f;
  }

  .arrow {
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid #27326f;
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
