<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as echarts from "echarts";

  export let type = "default";
  export let id;
  export let theme;
  export let width = 200;
  export let height = 200;

  export let option;
  export let notMerge = false;
  export let replaceMerge = undefined;
  export let lazyUpdate = false;

  let chart; // our chart instance

  const autoFontSize = () => {
    let element = document.getElementById(id);
    if (element) {
      let newFontSize = Math.round(element.offsetWidth / 48);
      return type === "default"
        ? newFontSize
        : element.offsetWidth > 1024
        ? 12
        : newFontSize;
    }
  };

  const setOption = () => {
    if (chart && !chart.isDisposed()) {
      chart.setOption(
        {
          ...option,
          textStyle: {
            fontFamily: "Golos Text",
            fontSize:
              id === "total-gasfee-paid" || "historical-activities-personality"
                ? 14
                : autoFontSize(),
          },
        },
        notMerge,
        replaceMerge,
        lazyUpdate
      );
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
    if (!window.echarts) {
      window.echarts = {
        [id]: chart,
      };
    } else {
      window.echarts[id] = chart;
    }
  };

  window.onresize = function () {
    chart.resize();
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
          chart.setOption({
            ...option,
            textStyle: {
              fontSize:
                id === "total-gasfee-paid" ||
                "historical-activities-personality"
                  ? 14
                  : autoFontSize(),
            },
          });
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
