<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";

  const getPointsAirdrop = async () => {
    const data = await nimbus
      .get(`/airdrop-points/GeY8NPRFeeCUPpgmh5Jm3ACin755QQ3P5W3JV3nxnmzz`)
      .then((res) => res?.data?.data);

    console.log({ data });
    return data;
  };

  $: query = createQuery({
    queryKey: ["points-airdrop"],
    queryFn: () => getPointsAirdrop(),
    staleTime: Infinity,
    retry: false,
    // enabled: $user && Object.keys($user).length !== 0,
  });
</script>

<div></div>

<style windi:preflights:global windi:safelist:global></style>
