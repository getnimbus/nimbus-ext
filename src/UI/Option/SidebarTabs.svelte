<svelte:options tag="sidebar-tabs" />

<script>
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
  } from "flowbite-svelte";

  import Icon from "~/UI/Option/Icon.svelte";

  import Logo from "../../assets/logo-1.svg";
  import LogoWhite from "~/assets/logo-white.svg";

  export let activeTabValue;
  export let darkMode;
  export let listSideBar;

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

<Sidebar asideClass="h-full">
  <SidebarWrapper divClass={`${darkMode ? "bg-[#080808]" : "bg-white"}`}>
    {#if APP_TYPE.TYPE === "EXT"}
      <img
        src={darkMode ? LogoWhite : Logo}
        alt=""
        class="mb-4 mx-auto"
        width={150}
      />
    {/if}
    <SidebarGroup>
      {#each listSideBar as item}
        <SidebarItem
          label={item.label}
          on:click={(e) => handleClick(e, item.value)}
          active={activeTabValue === item.value}
          spanClass={`text-lg pl-2 ${
            activeTabValue === item.value ? "text-blue-500" : ""
          }`}
        >
          <svelte:fragment slot="icon">
            <Icon
              type={item.type}
              active={activeTabValue === item.value ? true : false}
              {darkMode}
            />
          </svelte:fragment>
        </SidebarItem>
      {/each}
    </SidebarGroup>
  </SidebarWrapper>
</Sidebar>

<style></style>
