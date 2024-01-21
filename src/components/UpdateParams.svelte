<script>
  import { useLocation } from "svelte-navigator";
  import { detectParams } from "~/store";

  const params = useLocation();

  $: {
    detectParams.update((e) => (e = $params.pathname));
  }
</script>
