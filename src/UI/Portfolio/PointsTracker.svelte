<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, user, wallet } from "~/store";

  import TooltipTitle from "~/components/TooltipTitle.svelte";
  import TooltipNumber from "~/components/TooltipNumber.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Image from "~/components/Image.svelte";
  import Loading from "~/components/Loading.svelte";

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

  const getPointsAirdrop = async () => {
    return await nimbus.get(`/airdrop-points/${$wallet}`);
  };

  $: query = createQuery({
    queryKey: ["points-airdrop", $wallet],
    queryFn: () => getPointsAirdrop(),
    staleTime: Infinity,
    enabled: $user && Object.keys($user).length !== 0,
  });

  let formatData = [];
  let gmPoint = {};

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      $query.data?.data.length !== 0 &&
      $query.data?.dataWhalesMarket.length !== 0
    ) {
      formatData = $query?.data?.data.map((item) => {
        return {
          ...item,
          points: item.points.map((point) => {
            const data = $query?.data?.dataWhalesMarket;
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

      gmPoint = {
        points: $query?.data?.totalPoint,
        protocol: "gmpoints",
        protocolLabel: "GMPoints",
        price: null,
      };
    }
  }
</script>

<ErrorBoundary>
  <div class="flex flex-col">
    <!-- Desktop view -->
    <div
      class={`xl:block hidden rounded-[10px] overflow-visible h-full ${
        $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
      }`}
    >
      {#if $query.isFetching}
        <div class="flex justify-center items-center min-h-[300px] py-3 px-3">
          <Loading />
        </div>
      {:else}
        <div>
          {#if formatData?.length === 0}
            <div
              class="flex justify-center items-center min-h-[300px] py-3 px-3"
            >
              Empty
            </div>
          {:else}
            {#each formatData || [] as data}
              <table class="table-auto w-full h-full">
                <thead>
                  <tr class="bg_f4f5f8">
                    <th
                      class="pl-3 py-3 rounded-tl-[10px] bg-transparent bg_f4f5f8"
                    >
                      <div class="text-left text-xs uppercase font-medium">
                        Name
                      </div>
                    </th>

                    <th class="py-3">
                      <div class="text-right text-xs uppercase font-medium">
                        Points
                      </div>
                    </th>

                    <th class="py-3 pr-3 rounded-tr-[10px]">
                      <div
                        class="text-right text-xs uppercase font-medium flex justify-end"
                      >
                        <TooltipTitle tooltipText="Based on pre-market price">
                          Estimated value
                        </TooltipTitle>
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {#each [gmPoint].concat(data.points) as item}
                    <tr class="group transition-all relative">
                      <td
                        class={`pl-3 py-3 ${
                          $isDarkMode
                            ? "bg-[#131313] group-hover:bg-[#000]"
                            : "bg-white group-hover:bg-gray-100"
                        }`}
                      >
                        <div
                          class=" flex justify-start items-center gap-3 text-sm font-medium"
                        >
                          <div
                            class="rounded-full w-[30px] h-[30px] overflow-hidden"
                          >
                            <Image
                              logo={protocolInfo[item?.protocolLabel].logo}
                              defaultLogo={defaultToken}
                            />
                          </div>

                          <div class="flex flex-col gap-1">
                            {protocolInfo[item?.protocolLabel].name}

                            <div class="flex items-center gap-1">
                              {#if protocolInfo[item?.protocolLabel].twitter}
                                <a
                                  href={protocolInfo[item?.protocolLabel]
                                    .twitter}
                                  target="_blank"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                  >
                                    <rect width="14" height="14" fill="none" />
                                    <g fill="none">
                                      <g clip-path="url(#primeTwitter0)">
                                        <path
                                          fill="#606060"
                                          d="M11.025.656h2.147L8.482 6.03L14 13.344H9.68L6.294 8.909l-3.87 4.435H.275l5.016-5.75L0 .657h4.43L7.486 4.71zm-.755 11.4h1.19L3.78 1.877H2.504z"
                                        />
                                      </g>
                                      <defs>
                                        <clipPath id="primeTwitter0">
                                          <path
                                            fill="#606060"
                                            d="M0 0h14v14H0z"
                                          />
                                        </clipPath>
                                      </defs>
                                    </g>
                                  </svg>
                                </a>
                              {/if}

                              {#if protocolInfo[item?.protocolLabel].website}
                                <a
                                  href={protocolInfo[item?.protocolLabel]
                                    .website}
                                  target="_blank"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 256 256"
                                  >
                                    <rect
                                      width="14"
                                      height="14"
                                      fill="#606060"
                                    />
                                    <path
                                      fill="#606060"
                                      d="M137.54 186.36a8 8 0 0 1 0 11.31l-9.94 10a56 56 0 0 1-79.22-79.27l24.12-24.12a56 56 0 0 1 76.81-2.28a8 8 0 1 1-10.64 12a40 40 0 0 0-54.85 1.63L59.7 139.72a40 40 0 0 0 56.58 56.58l9.94-9.94a8 8 0 0 1 11.32 0m70.08-138a56.08 56.08 0 0 0-79.22 0l-9.94 9.95a8 8 0 0 0 11.32 11.31l9.94-9.94a40 40 0 0 1 56.58 56.58l-24.12 24.14a40 40 0 0 1-54.85 1.6a8 8 0 1 0-10.64 12a56 56 0 0 0 76.81-2.26l24.12-24.12a56.08 56.08 0 0 0 0-79.24Z"
                                    />
                                  </svg>
                                </a>
                              {/if}

                              {#if item?.protocolLabel === "GMPoints"}
                                <a
                                  href="https://app.getnimbus.io/daily-checkin?tab=checkin"
                                  target="_blank"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 256 256"
                                  >
                                    <rect
                                      width="14"
                                      height="14"
                                      fill="#606060"
                                    />
                                    <path
                                      fill="#606060"
                                      d="M137.54 186.36a8 8 0 0 1 0 11.31l-9.94 10a56 56 0 0 1-79.22-79.27l24.12-24.12a56 56 0 0 1 76.81-2.28a8 8 0 1 1-10.64 12a40 40 0 0 0-54.85 1.63L59.7 139.72a40 40 0 0 0 56.58 56.58l9.94-9.94a8 8 0 0 1 11.32 0m70.08-138a56.08 56.08 0 0 0-79.22 0l-9.94 9.95a8 8 0 0 0 11.32 11.31l9.94-9.94a40 40 0 0 1 56.58 56.58l-24.12 24.14a40 40 0 0 1-54.85 1.6a8 8 0 1 0-10.64 12a56 56 0 0 0 76.81-2.26l24.12-24.12a56.08 56.08 0 0 0 0-79.24Z"
                                    />
                                  </svg>
                                </a>
                              {/if}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td
                        class={`py-3 ${
                          $isDarkMode
                            ? "group-hover:bg-[#000]"
                            : "group-hover:bg-gray-100"
                        }`}
                      >
                        <div
                          class="flex justify-end text-sm font-medium text_00000099"
                        >
                          {#if item.protocolLabel === "GMPoints"}
                            0
                          {:else}
                            <TooltipNumber
                              number={item?.points || 0}
                              type="balance"
                            />
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
                          class="flex justify-end text-sm font-medium text_00000099"
                        >
                          {#if item?.price === null}
                            Not available
                          {:else}
                            <div class="flex flex-col items-end gap-1">
                              <TooltipNumber
                                number={item?.price * item?.points || 0}
                                type="value"
                              />
                              <div>
                                $<TooltipNumber
                                  number={(item?.price * item?.points) /
                                    item?.points || 0}
                                  type="balance"
                                />/point
                              </div>
                            </div>
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
      {/if}
    </div>

    <!-- Mobile view -->
    <div
      class={`xl:hidden rounded-[10px] overflow-visible h-full ${
        $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
      }`}
    >
      {#if $query.isFetching}
        <div class="flex justify-center items-center min-h-[300px] py-3 px-3">
          <Loading />
        </div>
      {:else}
        <div>
          {#if formatData?.length === 0}
            <div
              class="flex justify-center items-center min-h-[300px] py-3 px-3"
            >
              Empty
            </div>
          {:else}
            {#each formatData || [] as data}
              {#each [gmPoint].concat(data.points) || [] as item}
                <div
                  class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-4 px-2"
                >
                  <div class="flex justify-between items-start">
                    <div
                      class="flex gap-2 items-center text-right text-sm uppercase font-medium"
                    >
                      <div
                        class="w-[30px] h-[30px] overflow-hidden rounded-full"
                      >
                        <Image
                          logo={protocolInfo[item?.protocolLabel].logo}
                          defaultLogo={defaultToken}
                        />
                      </div>
                      {protocolInfo[item?.protocolLabel].name}
                    </div>

                    <div
                      class="flex items-center justify-end font-medium text-sm text_00000099"
                    >
                      {#if protocolInfo[item?.protocolLabel].twitter}
                        <a
                          href={protocolInfo[item?.protocolLabel].twitter}
                          target="_blank"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 14 14"
                          >
                            <rect width="14" height="14" fill="none" />
                            <g fill="#606060">
                              <g clip-path="url(#primeTwitter0)">
                                <path
                                  fill="#606060"
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

                      {#if protocolInfo[item?.protocolLabel].website}
                        <a
                          href={protocolInfo[item?.protocolLabel].website}
                          target="_blank"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 256 256"
                          >
                            <rect width="14" height="14" fill="#606060" />
                            <path
                              fill="#606060"
                              d="M137.54 186.36a8 8 0 0 1 0 11.31l-9.94 10a56 56 0 0 1-79.22-79.27l24.12-24.12a56 56 0 0 1 76.81-2.28a8 8 0 1 1-10.64 12a40 40 0 0 0-54.85 1.63L59.7 139.72a40 40 0 0 0 56.58 56.58l9.94-9.94a8 8 0 0 1 11.32 0m70.08-138a56.08 56.08 0 0 0-79.22 0l-9.94 9.95a8 8 0 0 0 11.32 11.31l9.94-9.94a40 40 0 0 1 56.58 56.58l-24.12 24.14a40 40 0 0 1-54.85 1.6a8 8 0 1 0-10.64 12a56 56 0 0 0 76.81-2.26l24.12-24.12a56.08 56.08 0 0 0 0-79.24Z"
                            />
                          </svg>
                        </a>
                      {/if}

                      {#if item?.protocolLabel === "GMPoints"}
                        <a
                          href="https://app.getnimbus.io/daily-checkin?tab=checkin"
                          target="_blank"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 256 256"
                          >
                            <rect width="14" height="14" fill="#606060" />
                            <path
                              fill="#606060"
                              d="M137.54 186.36a8 8 0 0 1 0 11.31l-9.94 10a56 56 0 0 1-79.22-79.27l24.12-24.12a56 56 0 0 1 76.81-2.28a8 8 0 1 1-10.64 12a40 40 0 0 0-54.85 1.63L59.7 139.72a40 40 0 0 0 56.58 56.58l9.94-9.94a8 8 0 0 1 11.32 0m70.08-138a56.08 56.08 0 0 0-79.22 0l-9.94 9.95a8 8 0 0 0 11.32 11.31l9.94-9.94a40 40 0 0 1 56.58 56.58l-24.12 24.14a40 40 0 0 1-54.85 1.6a8 8 0 1 0-10.64 12a56 56 0 0 0 76.81-2.26l24.12-24.12a56.08 56.08 0 0 0 0-79.24Z"
                            />
                          </svg>
                        </a>
                      {/if}
                    </div>
                  </div>

                  <div class="flex justify-between items-start">
                    <div class="text-right text-sm uppercase font-medium">
                      Points
                    </div>

                    <div
                      class="flex items-center justify-end font-medium text-sm text_00000099"
                    >
                      {#if item?.protocolLabel === "GMPoints"}
                        0
                      {:else}
                        <TooltipNumber
                          number={item?.points || 0}
                          type="balance"
                        />
                      {/if}
                    </div>
                  </div>

                  <div class="flex justify-between items-start">
                    <div class="text-right text-sm uppercase font-medium">
                      <TooltipTitle tooltipText="Based on pre-market price">
                        Estimated value
                      </TooltipTitle>
                    </div>

                    <div
                      class="flex items-center justify-end font-medium text-sm text_00000099"
                    >
                      {#if item?.price === null}
                        Not available
                      {:else}
                        <div class="flex flex-col items-end gap-1">
                          <TooltipNumber
                            number={item?.price * item?.points || 0}
                            type="value"
                          />
                          <div>
                            $<TooltipNumber
                              number={(item?.price * item?.points) /
                                item?.points || 0}
                              type="balance"
                            />/point
                          </div>
                        </div>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            {/each}
          {/if}
        </div>
      {/if}
    </div>

    <div class="py-3 px-3 text-right text-sm text_00000099">
      Data by <a
        href="https://solana-airdrop-checker.solworks.dev/"
        class="hover:underline max-lg:underline"
        target="_blank"
        >https://solana-airdrop-checker.solworks.dev
      </a>
    </div>
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
