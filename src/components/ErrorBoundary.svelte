<script>
  import { createBoundary } from "@crownframework/svelte-error-boundary";
  import Error from "./Error.svelte";

  const Boundary = createBoundary(Error);
</script>

<Boundary onError={console.error}>
  <slot />
</Boundary>

<style></style>
