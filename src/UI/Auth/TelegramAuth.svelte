<!-- <script>
  function onTelegramAuth(user) {
    alert(
      "Logged in as " +
        user.first_name +
        " " +
        user.last_name +
        " (" +
        user.id +
        (user.username ? ", @" + user.username : "") +
        ")"
    );
  }
</script> -->

<script
  async
  src="https://telegram.org/js/telegram-widget.js?22"
  data-telegram-login="Nimbus Bot"
  data-size="large"
  data-radius="12"
  data-request-access="write"
  data-preload
></script>
