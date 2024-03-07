<script lang="ts">
  import { selectedPackage, user } from "~/store";
  import { formatHeaderTokenHistoryCSV } from "~/utils";
  import tooltip from "~/entries/contentScript/views/tooltip";

  import Button from "~/components/Button.svelte";

  export let data;
  export let name;
  export let triggerExportCSV = () => {};
  export let isLoading;
  export let isDisabled;

  $: {
    if (data && data.length !== 0) {
      handleFormatData(data);
    }
  }

  const handleFormatData = (data) => {
    const headers = Object.keys(data[0])
      .map((item) => formatHeaderTokenHistoryCSV[item])
      .toString();

    const body = data.map((item) => {
      return Object.values(item).toString();
    });

    const dataCSV = [headers, ...body].join("\n");

    if (dataCSV) {
      downloadCSV(dataCSV);
    }
  };

  const downloadCSV = (data) => {
    const blob = new Blob([data], { type: "application/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `${name}.csv`;
    a.href = url;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerExportCSV();
  };
</script>

{#if $selectedPackage !== "Free" && $user && Object.keys($user).length !== 0 && !isDisabled}
  <div class="w-max min-w-[142px]">
    <Button
      variant="premium"
      on:click={() => {
        triggerExportCSV();
      }}
      {isLoading}
    >
      <div class="font-medium text-base">Download CSV</div>
    </Button>
  </div>
{:else}
  <div
    use:tooltip={{
      content: `<tooltip-detail text="Upgrade to Premium to download your csv" />`,
      allowHTML: true,
      placement: "top",
      interactive: true,
    }}
    class="w-max"
  >
    <Button variant="premium" disabled>
      <div class="font-medium text-base">Download CSV</div></Button
    >
  </div>
{/if}

<style windi:preflights:global windi:safelist:global></style>
