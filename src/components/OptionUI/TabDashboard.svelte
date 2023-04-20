<svelte:options tag="tab-dashboard" />

<script>
  import { onMount } from "svelte";
  import { i18n } from "~/lib/i18n";

  const MultipleLang = {
    title: i18n("optionsPage.dashboard-page-title", "Dashboard"),
    show_portfolio_label: i18n(
      "optionsPage.dashboard-page-content.show-portfolio-label",
      "Show your Portfolio on new tab"
    ),
  };

  let checked = true;

  onMount(() => {
    chrome.storage.sync.get("defaultnewtab", function (storage) {
      checked = storage.defaultnewtab;
    });
  });
</script>

<div class="flex flex-col gap-2">
  <div class="title-3 text-gray-500 mb-2">{MultipleLang.title}</div>
  <div class="flex items-center gap-2">
    <div class="title-5">{MultipleLang.show_portfolio_label}</div>
    <label class="switch">
      <input
        type="checkbox"
        bind:checked
        on:change={(e) => {
          chrome.storage.sync.set({ defaultnewtab: e.target.checked });
        }}
      />
      <span class="slider" />
    </label>
  </div>
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
