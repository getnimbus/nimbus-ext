<svelte:options tag="sidebar-tabs" />

<script>
  import Icon from "~/components/TabUI/Icon.svelte";
  import logo from "../../assets/logo-1.svg";
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
  } from "flowbite-svelte";

  export let activeTabValue = 1;

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
