<script lang="ts">
  import { onMount } from "svelte";
  import mixpanel from "mixpanel-browser";

  onMount(() => {
    mixpanel.init("d56364b743cd70634fe5bea51e1d7e1c", {
      debug: false,
      ignore_dnt: true,
    });
  });
</script>

<slot />
