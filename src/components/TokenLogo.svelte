<svelte:options immutable />

<script>
  import { handleImgError } from "~/utils";

  export let logo;
  export let defaultLogo;
  export let width = 30;
  export let height = 30;
</script>

<img
  src={logo}
  alt=""
  {width}
  {height}
  class="rounded-full"
  on:error={(e) => handleImgError(e, logo, defaultLogo)}
/>
