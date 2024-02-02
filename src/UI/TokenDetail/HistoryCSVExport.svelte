<script lang="ts">
  import Button from "~/components/Button.svelte";
  import { selectedPackage } from "~/store";
  import { formatHeaderTokenHistoryCSV } from "~/utils";

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

<div class="w-max">
  {#if $selectedPackage !== "Free"}
    <Button
      variant="premium"
      on:click={() => {
        if (dataCSV) {
          downloadCSV(dataCSV);
        }
      }}>Download CSV</Button
    >
  {:else}
    <Button variant="premium" disabled>Download CSV</Button>
  {/if}
</div>

<style windi:preflights:global windi:safelist:global></style>
