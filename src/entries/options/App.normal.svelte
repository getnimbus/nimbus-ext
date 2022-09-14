<svelte:options tag="nimbus-options" />

<script>
  import "../../components/TabUI/TabAccounts.svelte";
  import "../../components/TabUI/TabDashboard.svelte";
  import "../../components/TabUI/TabHighlight.svelte";
  import "../../components/TabUI/TabNotification.svelte";
  import "../../components/TabUI/Icon.svelte";

  let activeTabValue = 1;

  let items = [
    { label: "Accounts", value: 1 },
    { label: "Dashboard", value: 2 },
    { label: "Highlight", value: 3 },
    { label: "Notification", value: 4 },
  ];

  const handleClick = (tabValue) => () => (activeTabValue = tabValue);
</script>

<div class="max-w-[1440px] m-auto w-[100%] h-screen flex gap-3">
  <div class="w-54 flex flex-col">
    <div class="title-2 mb-4 w-full text-center">🌩 Nimbus</div>
    {#each items as item}
      <div
        on:click={handleClick(item.value)}
        class={`tab cursor-pointer py-2 pl-2 flex items-center gap-2 w-full title-5 ${
          activeTabValue === item.value ? "active" : ""
        }`}
      >
        <tab-icon
          type={item.label}
          active={activeTabValue === item.value ? true : false}
        />
        {item.label}
      </div>
    {/each}
  </div>

  <div class="flex-1 px-6 border-left">
    {#if activeTabValue === 1}
      <tab-accounts />
    {:else if activeTabValue === 2}
      <tab-dashboard />
    {:else if activeTabValue === 3}
      <tab-highlight />
    {:else if activeTabValue === 4}
      <tab-notification />
    {/if}
  </div>
</div>

<style>
  .border-left {
    border-left: 1px solid #dee2e6;
  }

  .tab {
    border-right: 4px solid transparent;
    transition: all 0.2s ease;
  }

  .tab:hover {
    border-right: 4px solid rgb(179, 245, 254);
  }

  .tab.active {
    border-right: 4px solid #00bdd6ff;
    color: #00bdd6ff;
  }
</style>
