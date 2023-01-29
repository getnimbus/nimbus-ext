<svelte:options tag="check-safety" />

<script lang="ts">
  import { onMount } from "svelte";
  import { sendMessage } from "webext-bridge";
  import { isEmpty } from "lodash";

  let isLoading = true;
  let data = {};
  const IS_AUDITED_CODE = 1;

  const checkSafetyCurrentUrl = async () => {
    let currentUrl = window.location.href;
    isLoading = true;

    const response = await sendMessage("checkSafety", { currentUrl });
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
  {#if !isEmpty(data) && data.is_audit === IS_AUDITED_CODE}
    <div
      class="flex gap-2 items-center pl-4 py-2 mx-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800"
      role="alert"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="#0E9F6E"
        viewBox="0 0 256 256"
      >
        <rect width="256" height="256" fill="none" />
        <path
          d="M40,114.7V56a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8v58.7c0,84-71.3,111.8-85.5,116.5a7.2,7.2,0,0,1-5,0C111.3,226.5,40,198.7,40,114.7Z"
          fill="none"
          stroke="#000000"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        />
        <polyline
          points="172 104 113.3 160 84 132"
          fill="none"
          stroke="#000000"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="16"
        />
      </svg>
      <div>
        The page has been audited.
        <a
          href={data?.audit_info?.[0]?.audit_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Audit report
        </a>
      </div>
    </div>
  {:else if data.is_audit !== IS_AUDITED_CODE}
    <!-- <div
    class="flex gap-2 pl-4 py-2 mx-4 text-sm text-yellow-700 bg-yellow-100 rounded-lg dark:bg-yellow-200 dark:text-yellow-800"
    role="alert"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="#F05252"
      viewBox="0 0 256 256"
    >
      <rect width="256" height="256" fill="none" />
      <line
        x1="33.5"
        y1="24"
        x2="222.5"
        y2="232"
        fill="none"
        stroke="#000000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <path
        d="M187.5,193.5c-21.5,24.6-48.8,35-57,37.7a7.2,7.2,0,0,1-5,0C111.3,226.5,40,198.7,40,114.7V56a8,8,0,0,1,8-8h7.3"
        fill="none"
        stroke="#000000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
      <path
        d="M98.5,48H208a8,8,0,0,1,8,8v58.7c0,20.1-4.1,36.9-10.5,51"
        fill="none"
        stroke="#000000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="16"
      />
    </svg>
    <div>This page is not support.</div>
  </div> -->
  {/if}
</reset-style>
