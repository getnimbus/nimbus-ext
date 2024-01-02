<script>
  import { useLocation } from "svelte-navigator";
  import { detectParams } from "~/store";

  const locationparamas = useLocation();
  $: {
    detectParams.update((e) => (e = $locationparamas.pathname));
  }
</script>
