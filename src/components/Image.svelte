<svelte:options immutable />

<script>
  import { handleImgError } from "~/utils";

  export let logo;
  export let defaultLogo;
</script>

<img
  src={logo || defaultLogo}
  alt=""
  class="w-full h-full object-contain"
  on:error={(e) => handleImgError(e, defaultLogo)}
/>
