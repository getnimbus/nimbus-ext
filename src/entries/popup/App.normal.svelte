<svelte:options tag="nimbus-popup" />

<script lang="ts">
  import * as browser from "webextension-polyfill";

  browser.tabs.query({ active: true, currentWindow: true }).then((tab) => {
    browser.tabs.sendMessage(tab[0].id, { action: "toggleSidebar" });
  });
</script>
