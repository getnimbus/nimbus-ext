<svelte:options tag="tab-dashboard" />

<script>
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";
  import * as browser from "webextension-polyfill";
  import { Toast } from "flowbite-svelte";
  import { fly } from "svelte/transition";

  const MultipleLang = {
    title: i18n("optionsPage.dashboard-page-title", "Dashboard"),
    show_portfolio_label: i18n(
      "optionsPage.dashboard-page-content.show-portfolio-label",
      "Show your Portfolio on new tab"
    ),
  };

  let show = false;
  let counter = 3;
  let checked = true;

  const trigger = () => {
    show = true;
    counter = 3;
    timeout();
  };

  const timeout = () => {
    if (--counter > 0) return setTimeout(timeout, 1000);
    show = false;
  };

  onMount(() => {
    browser.storage.sync.get("defaultnewtab").then(function (storage) {
      checked = storage.defaultnewtab;
    });
  });
</script>

<div class="flex flex-col gap-2">
  <div class="title-3 text-gray-500 mb-2">{MultipleLang.title}</div>
  <Toast
    transition={fly}
    params={{ x: 200 }}
    position="top-right"
    color="green"
    bind:open={show}
  >
    <svelte:fragment slot="icon">
      <svg
        aria-hidden="true"
        class="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        ><path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        /></svg
      >
      <span class="sr-only">Check icon</span>
    </svelte:fragment>
    {checked ? "Show" : "Hide"} your Portfolio on new tab
  </Toast>

  {#if APP_TYPE.TYPE === "WEB"}
    <div class="title-5">
      Install <a
        href="https://getnimbus.io/"
        target="_blank"
        class="text-blue-500">our extension</a
      > to try out this feature
    </div>
  {:else}
    <!-- <div class="flex items-center gap-2">
      <div class="title-5">{MultipleLang.show_portfolio_label}</div>
      <label class="switch">
        <input
          type="checkbox"
          bind:checked
          on:change={(e) => {
            browser.storage.sync.set({ defaultnewtab: e.target.checked });
            trigger();
          }}
        />
        <span class="slider" />
      </label>
    </div> -->
    <div class="title-5">Comming soon...</div>
  {/if}
</div>

<style>
  .switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
  }
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 34px;
  }
  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 2px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
  }
  input:checked + .slider {
    background-color: #2196f3;
  }
  input:checked + .slider {
    box-shadow: 0 0 1px #2196f3;
  }
  input:checked + .slider:before {
    -webkit-transform: translateX(16px);
    -ms-transform: translateX(16px);
    transform: translateX(16px);
  }
</style>
