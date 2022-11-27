<script>
  import "flowbite/dist/flowbite.css";
  import TabAccounts from "~/components/TabUI/TabAccounts.svelte";
  import TabDashboard from "~/components/TabUI/TabDashboard.svelte";
  import TabHighlight from "~/components/TabUI/TabHighlight.svelte";
  import TabNotification from "~/components/TabUI/TabNotification.svelte";
  import TabSettings from "~/components/TabUI/TabSettings.svelte";
  import Icon from "~/components/TabUI/Icon.svelte";
  import logo from "../../assets/logo-1.svg";

  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
  } from "flowbite-svelte";

  let activeTabValue = 1;

  let items = [
    { label: "Accounts", value: 1 },
    { label: "Dashboard", value: 2 },
    { label: "Highlight", value: 3 },
    { label: "Notification", value: 4 },
    { label: "Settings", value: 5 },
  ];

  const handleClick = (e, tabValue) => {
    e.preventDefault();
    activeTabValue = tabValue;
  };
</script>

<div class="max-w-[2000px] m-auto w-[100%] h-screen flex gap-1">
  <Sidebar asideClass="bg-gray-50 w-64">
    <SidebarWrapper>
      <img src={logo} alt="logo" class="mb-4" width={200} />
      <SidebarGroup>
        {#each items as item}
          <SidebarItem
            label={item.label}
            on:click={(e) => handleClick(e, item.value)}
            active={activeTabValue === item.value}
            spanClass={`title-5 pl-2 ${
              activeTabValue === item.value ? "text-sky-500" : "text-black"
            }`}
          >
            <svelte:fragment slot="icon">
              <Icon
                type={item.label}
                active={activeTabValue === item.value ? true : false}
              />
            </svelte:fragment>
          </SidebarItem>
        {/each}
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>

  <div class="flex-1 px-6 pt-2">
    {#if activeTabValue === 1}
      <TabAccounts />
    {:else if activeTabValue === 2}
      <TabDashboard />
    {:else if activeTabValue === 3}
      <TabHighlight />
    {:else if activeTabValue === 4}
      <TabNotification />
    {:else if activeTabValue === 5}
      <TabSettings />
    {/if}
  </div>
</div>

<style windi:preflights:global windi:safelist:global>
</style>
