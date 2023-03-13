<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as echarts from "echarts";

  export let id;
  export let theme;
  export let width = 200;
  export let height = 200;

  export let option;
  export let notMerge = false;
  export let replaceMerge = undefined;
  export let lazyUpdate = false;

  let chart; // our chart instance

  const setOption = () => {
    if (chart && !chart.isDisposed()) {
      chart.setOption(option, notMerge, replaceMerge, lazyUpdate);
    }
  };

  const destroyChart = () => {
    if (chart && !chart.isDisposed()) {
      chart.dispose();
    }
  };

  const makeChart = () => {
    destroyChart();
    chart = echarts.init(document.getElementById(id), theme);
  };

  onMount(() => {
    makeChart();
  });

  onDestroy(() => {
    destroyChart();
  });

  let timeoutId: any;
  const handleResize = () => {
    if (timeoutId == undefined) {
      timeoutId = setTimeout(() => {
        if (chart && !chart.isDisposed()) {
          chart.resize();
        }
        timeoutId = undefined;
      }, 500);
    }
  };

  $: width && handleResize();
  $: option && setOption();
  $: if (chart && theme) {
    makeChart();
    setOption();
  }
</script>

<div bind:clientWidth={width}>
  <div {id} style="height: {height}px" />
</div>
