<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as echarts from "echarts";
  import { isDarkMode } from "~/store";

  export let id;
  export let theme;
  export let width = 200;
  export let height = 200;

  export let option;
  export let notMerge = false;
  export let replaceMerge = undefined;
  export let lazyUpdate = false;

  let darkMode = false;
  isDarkMode.subscribe((value) => {
    darkMode = value;
  });

  let chart; // our chart instance

  const autoFontSize = () => {
    const windowWidth =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    const element = document.getElementById(id);
    if (element && windowWidth) {
      if (windowWidth < 768) {
        // mobile
        return 20;
      } else if (windowWidth >= 768 && windowWidth < 1024) {
        // tablet
        return 16;
      } else {
        // pc
        return 14;
      }
    }
  };

  const setOption = () => {
    if (chart && !chart.isDisposed()) {
      chart.setOption(
        {
          ...option,
          tooltip: {
            ...(option?.tooltip || {}),
            backgroundColor: darkMode ? "#131313" : "#fff",
          },
          backgroundColor: "transparent",
          textStyle: {
            fontFamily: "Golos Text",
            fontSize:
              id === "total-gasfee-paid" ||
              id === "historical-activities-analytic" ||
              id === "historical-activities"
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
    try {
      destroyChart();
      if (echarts) {
        chart = echarts?.init(document.getElementById(id), theme);
        if (!window.echarts) {
          window.echarts = {
            [id]: chart,
          };
        } else {
          window.echarts[id] = chart;
        }
      }
    } catch (e) {
      // console.error(e);
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
                id === "historical-activities-analytic" ||
                id === "historical-activities"
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
