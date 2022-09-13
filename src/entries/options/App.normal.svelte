<svelte:options tag="nimbus-options" />

<script>
  import Tabs from "../../components/TabUI/Tabs.svelte";
  import Tab1 from "../../components/TabUI/Tab1.svelte";
  import Tab2 from "../../components/TabUI/Tab2.svelte";
  import Tab3 from "../../components/TabUI/Tab3.svelte";

  let items = [
    { label: "Tab 1", value: 1, component: Tab1 },
    { label: "Tab 2", value: 2, component: Tab2 },
    { label: "Tab 3", value: 3, component: Tab3 },
  ];
</script>

<Tabs {items} />

<style>
</style>
