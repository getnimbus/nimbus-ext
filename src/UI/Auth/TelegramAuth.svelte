<script lang="ts">
  import { isDarkMode } from "~/store";
</script>

<div
  class={`rounded-[12px] cursor-pointer ${
    $isDarkMode ? "border border-white" : ""
  }`}
>
  <script
    async
    src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="GetNimbusBot"
    data-size="large"
    data-radius="12"
    data-auth-url="https://app.getnimbus.io"
    data-request-access="write"
  ></script>
</div>

<style></style>
