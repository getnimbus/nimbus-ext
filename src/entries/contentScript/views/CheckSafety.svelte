<svelte:options tag="check-safety"/>

<script lang="ts">
    import {onMount} from "svelte";
    import {goplus} from "~/entries/contentScript/views/network";

    let currentUrl = window.location.href;

    let isLoading = true;
    let isAudited = null;
    const ERROR_CODE = 2026;
    const SUCCESS_CODE = 1;

    const checkSafeteCurrentUrl = async () => {
        isLoading = true;

        goplus
            .get(`/dapp_security?url=${currentUrl}`)
            .then((response) => {
                if (response.data.code === SUCCESS_CODE) {
                    isAudited = true;
                } else if (response.data.code === ERROR_CODE) {
                    isAudited = false;
                }
            });
        isLoading = false;
    };

    onMount(() => {
        checkSafeteCurrentUrl();
    });
</script>

{#if isAudited}
    <div class="flex gap-2 items-center px-4 py-2 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800"
         role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#0E9F6E" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <path d="M40,114.7V56a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8v58.7c0,84-71.3,111.8-85.5,116.5a7.2,7.2,0,0,1-5,0C111.3,226.5,40,198.7,40,114.7Z"
                  fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path>
            <polyline points="172 104 113.3 160 84 132" fill="none" stroke="#000000" stroke-linecap="round"
                      stroke-linejoin="round" stroke-width="16"></polyline>
        </svg>
        <div>
            The page has been audited.
        </div>
    </div>
{:else if isAudited === false}
    <div class="flex gap-2 px-4 py-2 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
         role="alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#F05252" viewBox="0 0 256 256">
            <rect width="256" height="256" fill="none"></rect>
            <line x1="33.5" y1="24" x2="222.5" y2="232" fill="none" stroke="#000000" stroke-linecap="round"
                  stroke-linejoin="round" stroke-width="16"></line>
            <path d="M187.5,193.5c-21.5,24.6-48.8,35-57,37.7a7.2,7.2,0,0,1-5,0C111.3,226.5,40,198.7,40,114.7V56a8,8,0,0,1,8-8h7.3"
                  fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path>
            <path d="M98.5,48H208a8,8,0,0,1,8,8v58.7c0,20.1-4.1,36.9-10.5,51" fill="none" stroke="#000000"
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="16"></path>
        </svg>
        <div>
            This page is not support.
        </div>
    </div>
{/if}