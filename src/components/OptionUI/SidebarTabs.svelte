<svelte:options tag="sidebar-tabs" />

<script>
  import Icon from "~/components/OptionUI/Icon.svelte";
  import logo from "../../assets/logo-1.svg";
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
  } from "flowbite-svelte";
  import { i18n } from "~/lib/i18n";

  export let activeTabValue = 1;

  let items = [
    {
      label: i18n("optionsPage.tab-title-accounts", "Accounts"),
      value: 1,
      type: "Wallets",
    },
    {
      label: i18n("optionsPage.tab-title-dashboard", "Dashboard"),
      value: 2,
      type: "Dashboard",
    },
    {
      label: i18n("optionsPage.tab-title-highlight", "Highlight"),
      value: 3,
      type: "Highlight",
    },
    {
      label: i18n("optionsPage.tab-title-notification", "Notification"),
      value: 4,
      type: "Notification",
    },
    {
      label: i18n("optionsPage.tab-title-settings", "Settings"),
      value: 5,
      type: "Settings",
    },
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
              type={item.type}
              active={activeTabValue === item.value ? true : false}
            />
          </svelte:fragment>
        </SidebarItem>
      {/each}
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>

<style></style>
