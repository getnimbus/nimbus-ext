<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { onMount } from "svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Image from "~/components/Image.svelte";
  import Loading from "~/components/Loading.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, wallet } from "~/store";

  import defaultToken from "~/assets/defaultToken.png";
  import gmPoints from "~/assets/Gold4.svg";

  const protocolInfo = {
    GMPoints: {
      name: "GMPoints",
      logo: gmPoints,
    },
    Switchboard: {
      name: "Switchboard",
      website: "https://switchboard.xyz",
      twitter: "https://twitter.com/switchboardxyz",
      logo: "https://solana.com/_next/image?url=%2Fapi%2Fprojectimg%2Fckwgwh9xb31924eysxixplnsjz%3Ftype%3DLOGO&w=3840&q=75",
    },
    Symmetry: {
      name: "Symmetry",
      website: "https://www.symmetry.fi/",
      twitter: "https://twitter.com/symmetry_fi",
      logo: "https://avatars.githubusercontent.com/u/84089824?s=200&v=4",
    },
    Drift: {
      name: "Drift",
      website: "https://app.drift.trade/points",
      twitter: "https://twitter.com/DriftProtocol",
      logo: "https://pbs.twimg.com/profile_images/1762592166520426497/lbzXWyDw_400x400.png",
    },
    Kamino: {
      name: "Kamino",
      website: "https://app.kamino.finance",
      twitter: "https://x.com/kaminofinance",
      logo: "https://pbs.twimg.com/profile_images/1739993119150505984/tP0Lcgwp_400x400.jpg",
    },
  };

  let tableTokenHeader;
  let isStickyTableToken = false;
  let clickOnX = false;

  const getPointsAirdrop = async () => {
    return await nimbus.get(`/airdrop-points/${$wallet}`);
  };

  $: pointsQuery = createQuery({
    queryKey: ["points-airdrop", $wallet],
    queryFn: () => getPointsAirdrop(),
    staleTime: Infinity,
    enabled: $user && Object.keys($user).length !== 0,
  });

  onMount(() => {
    const handleScroll = () => {
      const clientRectTokenHeader = tableTokenHeader?.getBoundingClientRect();
      isStickyTableToken = clientRectTokenHeader?.top <= 0;
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  });

  $: dataquery =
    !$pointsQuery.isLoading &&
    $pointsQuery?.data?.data.map((item) => {
      return {
        ...item,
        points: item.points.map((point) => {
          const data = $pointsQuery?.data?.dataWhalesMarket;
          const pointIndex = data
            .map(
              (datawhale) =>
                (datawhale.name === "Drift Protocol" && "Drift") ||
                datawhale.name
            )
            .indexOf(point.protocolLabel);

          const price = data[pointIndex]?.last_price || null;

          return {
            ...point,
            price: price,
          };
        }),
      };
    });

  $: gmPoint = !$pointsQuery.isLoading && {
    points: $pointsQuery?.data?.totalPoint,
    protocol: "gmpoints",
    protocolLabel: "GMPoints",
    price: 0,
  };

  $: console.log({
    data: $pointsQuery.data,
    dataWhalesMarket: $pointsQuery?.data?.dataWhalesMarket,
    dataquery,
  });
</script>

<ErrorBoundary>
  <div
    class={`xl:block hidden rounded-[10px] xl:overflow-visible overflow-x-auto h-full ${
      $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
    }`}
  >
    {#if $pointsQuery.isLoading}
      <div>
        <div class="flex justify-center items-center h-full py-3 px-3">
          <Loading />
        </div>
      </div>
    {:else}
      {#each dataquery || [] as data}
        <table class="table-auto xl:w-full w-[2000px] h-full">
          <thead
            class={isStickyTableToken ? "sticky top-0 z-9" : ""}
            bind:this={tableTokenHeader}
          >
            <tr class="bg_f4f5f8">
              <th
                class="pl-3 py-3 rounded-tl-[10px] xl:static xl:bg-transparent sticky left-0 z-10 bg_f4f5f8 w-[200px]"
              >
                <div class="text-left xl:text-xs text-xl uppercase font-medium">
                  Name
                </div>
              </th>
              <th class="py-3 pr-3 rounded-tr-[10px]">
                <div
                  class="text-right xl:text-xs text-xl uppercase font-medium"
                >
                  Point
                </div>
              </th>
              <th class="py-3 pr-3 rounded-tr-[10px]">
                <div
                  class="text-right xl:text-xs text-xl uppercase font-medium"
                >
                  Estimated value
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each [gmPoint].concat(data.points) as item}
              <tr
                class="group transition-all cursor-pointer relative"
                on:click={() =>
                  !clickOnX &&
                  window.open(
                    protocolInfo[item?.protocolLabel].website,
                    "_blank"
                  )}
              >
                <td
                  class={`pl-3 py-3 xl:static sticky left-0 z-9 w-[200px] ${
                    $isDarkMode
                      ? "bg-[#131313] group-hover:bg-[#000]"
                      : "bg-white group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class=" flex justify-start items-center gap-3 text-2xl font-medium xl:text-sm"
                  >
                    <div class="rounded-full w-[30px] h-[30px] overflow-hidden">
                      <Image
                        logo={protocolInfo[item?.protocolLabel].logo}
                        defaultLogo={defaultToken}
                      />
                    </div>
                    <div>
                      {protocolInfo[item?.protocolLabel].name}
                    </div>

                    {#if protocolInfo[item?.protocolLabel].twitter}
                      <a
                        href={protocolInfo[item?.protocolLabel].twitter}
                        target="_blank"
                        on:mouseenter={() => (clickOnX = true)}
                        on:mouseleave={() => (clickOnX = false)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 14 14"
                        >
                          <rect width="14" height="14" fill="none" />
                          <g fill="none">
                            <g clip-path="url(#primeTwitter0)">
                              <path
                                fill="currentColor"
                                d="M11.025.656h2.147L8.482 6.03L14 13.344H9.68L6.294 8.909l-3.87 4.435H.275l5.016-5.75L0 .657h4.43L7.486 4.71zm-.755 11.4h1.19L3.78 1.877H2.504z"
                              />
                            </g>
                            <defs>
                              <clipPath id="primeTwitter0">
                                <path fill="#fff" d="M0 0h14v14H0z" />
                              </clipPath>
                            </defs>
                          </g>
                        </svg>
                      </a>
                    {/if}
                  </div>
                </td>

                <td
                  class={`py-3 pr-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div
                    class="flex justify-end text-2xl font-medium xl:text-sm text_00000099"
                  >
                    <TooltipNumber number={item?.points || 0} type="balance" />
                  </div>
                </td>

                <td
                  class={`py-3 pr-3 ${
                    $isDarkMode
                      ? "group-hover:bg-[#000]"
                      : "group-hover:bg-gray-100"
                  }`}
                >
                  <div class="flex justify-end">
                    {#if item?.price === null}
                      Invalidated
                    {:else}
                      <TooltipNumber
                        number={item?.price * item?.points || 0}
                        type="balance"
                      />
                    {/if}
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/each}
    {/if}
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
