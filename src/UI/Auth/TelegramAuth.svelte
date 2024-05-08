<script>
  import { isDarkMode } from "~/store";

  const handleLogout = () => {
    const cookies = document.cookie.split(";");
    let cookieNames = [];
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim().split("=");
      cookieNames.push(cookie[0]);
    }
    console.log("HELLO: ", cookieNames);

    // document.cookie =
    //   "oauth.telegram.org" +
    //   "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };
</script>

<div
  class={`rounded-[12px] cursor-pointer ${
    $isDarkMode ? "border border-white" : ""
  }`}
>
  <script
    async
    src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="test_nimbus_bot"
    data-size="large"
    data-userpic="false"
    data-radius="12"
    data-onauth="onTelegramAuth(user)"
    data-request-access="write"
  ></script>

  <script type="text/javascript">
    function onTelegramAuth(user) {
      console.log("HELLO WORLD", user);
    }
  </script>
</div>

<!-- <div on:click={handleLogout}>test</div> -->

<style>
</style>
