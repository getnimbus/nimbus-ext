<script lang="ts">
  import dayjs from "dayjs";
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
    // destroyChart();
    // heatmap = new SvelteHeatmap({
    //   props: {
    //     data: data,
    //     dayLabel: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    //     emptyColor: "#ecedf0",
    //   },
    //   target: id,
    // });
  };

  $: {
    if (data && data.length !== 0) {
      makeChart();
    }
  }
</script>

<div {id}>
  <SvelteHeatmap
    allowOverflow={true}
    cellGap={5}
    cellRadius={1}
    colors={["#a1dab4", "#42b6c4", "#2c7fb9", "#263494"]}
    {data}
    dayLabelWidth={20}
    emptyColor={"#ecedf0"}
    endDate={dayjs().toDate()}
    monthGap={20}
    monthLabelHeight={20}
    startDate={dayjs().startOf("year").toDate()}
    view={"monthly"}
  />
</div>
