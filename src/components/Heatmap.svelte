<script lang="ts">
  import SvelteHeatmap from "svelte-heatmap";

  export let id;
  export let data;

  $: console.log("data: ", data);

  let heatmap;

  const destroyChart = () => {
    if (heatmap) {
      heatmap.$destroy();
    }
  };

  const makeChart = () => {
    destroyChart();
    heatmap = new SvelteHeatmap({
      props: {
        data: data,
        dayLabel: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        emptyColor: "#ecedf0",
      },
      target: id,
    });
  };

  $: {
    if (data && data.length !== 0) {
      makeChart();
    }
  }
</script>

<div {id} />
