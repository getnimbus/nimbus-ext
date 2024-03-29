<script>
  import { detectParams } from "~/store";

  $: {
    detectParams.update((e) => (e = window.location.pathname));
  }
</script>
