<svelte:options tag="sidebar-tabs" />

<script>
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
  } from "flowbite-svelte";
  import { i18n } from "~/lib/i18n";

  import Icon from "~/UI/Option/Icon.svelte";

  import logo from "../../assets/logo-1.svg";

  export let activeTabValue;

  let items = [
    {
      label: i18n("optionsPage.tab-title-accounts", "Accounts"),
      value: "wallets",
      type: "Wallets",
    },
    // {
    //   label: i18n("optionsPage.tab-title-nft", "NFT"),
    //   value: "nft",
    //   type: "NFT",
    // },
    {
      label: i18n("optionsPage.tab-title-dashboard", "Dashboard"),
      value: "dashboard",
      type: "Dashboard",
    },
    {
      label: i18n("optionsPage.tab-title-highlight", "Highlight"),
      value: "highlight",
      type: "Highlight",
    },
    {
      label: i18n("optionsPage.tab-title-notification", "Notification"),
      value: "notification",
      type: "Notification",
    },
    {
      label: i18n("optionsPage.tab-title-settings", "Settings"),
      value: "settings",
      type: "Settings",
    },
  ];

  const handleClick = (e, tabValue) => {
    e.preventDefault();
    activeTabValue = tabValue;
    window.history.replaceState(
      null,
      "",
      window.location.pathname + `?tab=${tabValue}`
    );
  };
</script>

<Sidebar asideClass="bg-gray-50">
  <SidebarWrapper>
    <img src={logo} alt="logo" class="mb-4 mx-auto" width={150} />
    <SidebarGroup>
      {#each items as item}
        <SidebarItem
          label={item.label}
          on:click={(e) => handleClick(e, item.value)}
          active={activeTabValue === item.value}
          spanClass={`title-5 pl-2 ${
            activeTabValue === item.value ? "text-blue-500" : "text-black"
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
