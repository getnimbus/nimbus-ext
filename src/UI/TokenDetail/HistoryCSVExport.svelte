<script lang="ts">
  import Button from "~/components/Button.svelte";
  import { selectedPackage, user } from "~/store";
  import { formatHeaderTokenHistoryCSV } from "~/utils";
  import tooltip from "~/entries/contentScript/views/tooltip";

  export let data;
  export let name;

  let dataCSV;

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

    dataCSV = [headers, ...body].join("\n");
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
  };
</script>

{#if $selectedPackage !== "Free" && $user && Object.keys($user).length !== 0}
  <div class="w-max">
    <Button
      variant="premium"
      on:click={() => {
        if (dataCSV) {
          downloadCSV(dataCSV);
        }
      }}>Download CSV</Button
    >
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
    <Button variant="premium" disabled>Download CSV</Button>
  </div>
{/if}

<style windi:preflights:global windi:safelist:global></style>
