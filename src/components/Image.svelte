<svelte:options immutable />

<script>
  import { handleImgError } from "~/utils";

  export let logo;
  export let defaultLogo;
</script>

<img
  src={logo || defaultLogo}
  alt=""
  class="w-full h-full"
  on:error={(e) => handleImgError(e, logo, defaultLogo)}
/>
