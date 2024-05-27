<script lang="ts">
  import { flatten } from "lodash";
  import { createQuery } from "@tanstack/svelte-query";
  import { nimbus } from "~/lib/network";
  import { isDarkMode, wallet, totalAirdrops } from "~/store";

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
    Parcl: {
      name: "Parcl",
      website: "https://www.parcl.co/",
      twitter: "https://twitter.com/Parcl",
      logo: "https://airdrops.io/wp-content/uploads/2024/01/Parcl-logo.jpg",
    },
    "Sharky.fi": {
      name: "Sharky",
      website: "https://sharky.fi/",
      twitter: "https://twitter.com/SharkyFi",
      logo: "https://sharky.fi/sharky.svg",
    },
    Sanctum: {
      name: "Sanctum",
      website: "https://www.sanctum.so/",
      twitter: "https://twitter.com/sanctumso",
      logo: "https://image.typedream.com/cdn-cgi/image/width=256,format=auto,fit=scale-down,quality=100/https://api.typedream.com/v0/document/public/1e17facc-56e9-4158-9522-8cfee85931a9/2eijF98kDTQfQ2udXN7dGWGRb4E_Sanctum_logo.png",
    },
    SPAM: {
      name: "SPAM",
      website: "https://spamsui.com/",
      logo: "https://spamsui.com/img/spam-logo.webp",
    },
    FlowX: {
      name: "FlowX",
      website: "https://flowx.finance/",
      logo: "https://strapi-dev.scand.app/uploads/photo_2023_10_23_09_56_50_7d2b8e58b3.jpg",
    },
    Suilend: {
      name: "Suilend",
      website: "https://www.suilend.fi/",
      logo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAA1VBMVEUCChkBCRYABhIAAAAAABwAADkzWapvk+WPsv+cvv+Qtv96pP9Rf+UbSaoADjgAAA4+ZsGiwv/J3f/Y5f/b5//F2P+xzP9Ri/8WTsIACUfh6//l7v/o8P9flP8lcP8hZfbe6f/r8v/t8/81YMAAKXEFFTTw9f9sj9sAACZQcbry9/9Ye8jj7f89Y7dWfdMAGVJJZ6UAGVxPeNSAnuIeQo5ZdrVsl/c/W5kONHq91f8AADQAABYsSYUYPId0k9iQr/JkiuEAIl4DIlM+X6kkTqgfXuUAFUYAxKikAAABfUlEQVR4AY2SBY5rMQxFX3LL3DgPU0jy+8tMwwz7X9JMUUVpLLSO2df5uzF2BXAAsRgAfp6DeCKZSmeyuXwBJ/nFYqksSJJwvYwfOEcUYZYiVVGRFF6mWqvjMC/M6IqxtqLIzfxr/D+ciyGlK7bZtCYSrTbAD6uiQ5Vmt9u1FeqBOzicmBe8vu2uYJQEY2gMhoMRdoljMt2VGXdSZJh6gkQ5saWYRevEZmUGByVX91VfevMNRXpXdQFeSMuKtUbRcg1ZrLyBhm6A2zv16zSNTt/zFXzIaNNczSrmwKMw6yp9L1xPjCWp1QW0N+IY603/vvfA1vDJk32ltBjCwbNqbvq/7MZNlAXR3WuM87i33Uou9pu+DV6H89Vxhtuq6u69uL88ADgMH6JiV8zIFo6+zYGeq41t/rIoXeAHDHz0mb2jfsWu5i6/4ZB91fyUJ2SkKpU+ZRpHRXks8DOeK0hK8qb3ONXedz6XSpfT2cEE/JI0i/H4A47R4cScOX+1H/ovLHjBsaBsAAAAAElFTkSuQmCC",
    },
    SOL: {
      name: "solana",
      website: "https://solana.com",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
    },
    ZETA: {
      name: "Zeta",
      website: "https://dex.zeta.markets/",
      logo: "https://moralis.io/wp-content/uploads/web3wiki/343-zeta-markets/637add4d81763793ad1c4e30_cPTtgWTpPraW-GTW3WbScNVkRHoBUwe2v4XPTsYY3FA.jpeg",
    },
    DegenSeason1: {
      name: "Degen Season 1",
      website: "https://www.degen.tips/",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/30096.png",
    },
    DegenSeason2: {
      name: "Degen Season 2",
      website: "https://www.degen.tips/",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/30096.png",
    },
    DegenSeason3: {
      name: "Degen Season 3",
      website: "https://www.degen.tips/",
      logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/30096.png",
    },
  };

  const getPointsAirdrop = async () => {
    return await nimbus.get(`/airdrop-points/${$wallet}`);
  };

  $: query = createQuery({
    queryKey: ["points-airdrop", $wallet],
    queryFn: () => getPointsAirdrop(),
    staleTime: Infinity,
  });

  let formatData = [];
  let eligibilityData = [];
  let pointsData = [];
  let marketPointsData = [];
  let totalEstimateValueEligibilities = 0;
  let totalEstimateValuePoints = 0;
  let totalListingValue = 0;

  $: {
    if (
      !$query.isError &&
      $query.data !== undefined &&
      $query.data?.data?.length !== 0
    ) {
      formatData = $query?.data?.data.map((item) => {
        return {
          ...item,
          points: item.points.map((point) => {
            const pointIndex = ($query?.data?.dataWhalesMarket || [])
              .map((datawhale) =>
                datawhale?.name === "Sharky"
                  ? "Sharky.fi"
                  : (datawhale?.name === "Drift Protocol" && "Drift") ||
                    datawhale?.name
              )
              .indexOf(point.protocolLabel);

            return {
              ...point,
              price:
                $query?.data?.dataWhalesMarket[pointIndex]?.last_price || null,
            };
          }),
        };
      });

      const formatEligibilityData = flatten(
        $query?.data?.data.map((item) => {
          return item?.eligibility;
        })
      );
      eligibilityData = formatEligibilityData
        .filter((item: any) => item?.eligible)
        .map((item: any) => {
          return {
            ...item,
            value: Number(item?.amount) * Number(item?.tokenPrice) || 0,
          };
        })
        .sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });

      totalEstimateValueEligibilities = eligibilityData.reduce(
        (prev, item) => prev + Number(item?.value),
        0
      );

      const formatPointsData = [
        {
          points: $query?.data?.totalPoint,
          protocol: "gmpoints",
          protocolLabel: "GMPoints",
          price: null,
        },
      ]?.concat(formatData[0].points);

      pointsData = formatPointsData
        .map((item) => {
          return {
            ...item,
            value: Number(item?.points) * Number(item?.price),
          };
        })
        .sort((a, b) => {
          if (a.value < b.value) {
            return 1;
          }
          if (a.value > b.value) {
            return -1;
          }
          return 0;
        });

      marketPointsData = $query?.data?.pointMarketList
        .map((item) => {
          return {
            ...item,
            listing_value: Number(item?.value) * Number(item?.ex_token?.price),
          };
        })
        .sort((a, b) => {
          if (a.listing_value < b.listing_value) {
            return 1;
          }
          if (a.listing_value > b.listing_value) {
            return -1;
          }
          return 0;
        });

      totalListingValue = marketPointsData.reduce(
        (prev, item) => prev + Number(item?.listing_value),
        0
      );
      totalEstimateValuePoints = pointsData.reduce(
        (prev, item) => prev + Number(item?.value),
        0
      );

      totalAirdrops.update(
        (n) =>
          (n =
            totalEstimateValueEligibilities +
            totalEstimateValuePoints +
            totalListingValue)
      );
    }
  }
</script>

<ErrorBoundary>
  <div class="flex flex-col xl:px-3">
    <!-- Desktop view -->
    <div class="xl:flex hidden flex-col gap-6">
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 justify-between">
          <div class="text-2xl font-medium">Airdrops</div>
          <div class="text-3xl font-medium">
            <TooltipNumber
              number={totalEstimateValueEligibilities}
              type="value"
            />
          </div>
        </div>
        <div
          class={`rounded-[10px] overflow-hidden h-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          <table class="table-auto w-full h-full">
            <thead>
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] bg-transparent bg_f4f5f8"
                >
                  <div class="text-left text-xs uppercase font-medium">
                    Assets
                  </div>
                </th>

                <th class="py-3">
                  <div class="text-right text-xs uppercase font-medium">
                    Amount
                  </div>
                </th>

                <th class="py-3">
                  <div class="text-right text-xs uppercase font-medium">
                    Price
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

            {#if $query.isFetching}
              <tbody>
                <tr>
                  <td colspan="4">
                    <div
                      class="flex justify-center items-center h-full py-3 px-3"
                    >
                      <Loading />
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else if eligibilityData?.length === 0}
              <tbody>
                <tr>
                  <td colspan="4">
                    <div
                      class="flex justify-center items-center h-full py-4 px-3 text-lg text-gray-400"
                    >
                      Empty
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else}
              <tbody>
                {#each eligibilityData || [] as item}
                  <tr class="group transition-all relative">
                    <td
                      class={`pl-3 py-3 ${
                        $isDarkMode
                          ? "bg-[#131313] group-hover:bg-[#000]"
                          : "bg-white group-hover:bg-gray-100"
                      }`}
                    >
                      <div
                        class="flex justify-start items-center gap-3 text-sm font-medium"
                      >
                        <div
                          class="rounded-full w-[30px] h-[30px] overflow-hidden"
                        >
                          <Image
                            logo={item.logoUrl}
                            defaultLogo={defaultToken}
                          />
                        </div>
                        <div class="flex flex-col gap-1">
                          <div class="text-2xl font-medium xl:text-sm">
                            {item?.protocolLabel}
                          </div>
                          <div
                            class="text-lg font-medium text_00000080 xl:text-xs"
                          >
                            {item?.ticker}
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
                        <TooltipNumber
                          number={item?.amount || 0}
                          type="amount"
                        />
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
                        <TooltipNumber
                          number={item?.tokenPrice || 0}
                          type="value"
                        />
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
                        <TooltipNumber
                          number={Number(item.value || 0)}
                          type="value"
                        />
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            {/if}
          </table>
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 justify-between">
          <div class="text-2xl font-medium">Points</div>
          <div class="text-3xl font-medium">
            <TooltipNumber number={totalEstimateValuePoints} type="value" />
          </div>
        </div>
        <div
          class={`rounded-[10px] overflow-hidden h-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          <table class="table-auto w-full h-full">
            <thead>
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] bg-transparent bg_f4f5f8"
                >
                  <div class="text-left text-xs uppercase font-medium">
                    Assets
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

            {#if $query.isFetching}
              <tbody>
                <tr>
                  <td colspan="3">
                    <div
                      class="flex justify-center items-center h-full py-3 px-3"
                    >
                      <Loading />
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else if formatData?.length === 0}
              <tr>
                <td colspan="3">
                  <div
                    class="flex justify-center items-center h-full py-4 px-3 text-lg text-gray-400"
                  >
                    Empty
                  </div>
                </td>
              </tr>
            {:else}
              {#each pointsData || [] as item}
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
                          logo={protocolInfo[item?.protocolLabel]?.logo}
                          defaultLogo={defaultToken}
                        />
                      </div>

                      <div class="flex flex-col gap-1">
                        {protocolInfo[item?.protocolLabel]?.name || ""}

                        <div class="flex items-center gap-2 w-max">
                          {#if protocolInfo[item?.protocolLabel]?.twitter}
                            <a
                              href={protocolInfo[item?.protocolLabel]?.twitter}
                              target="_blank"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="13"
                                height="13"
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
                                      <path fill="#606060" d="M0 0h14v14H0z" />
                                    </clipPath>
                                  </defs>
                                </g>
                              </svg>
                            </a>
                          {/if}

                          {#if protocolInfo[item?.protocolLabel]?.website}
                            <a
                              href={protocolInfo[item?.protocolLabel]?.website}
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

                          {#if item?.protocolLabel === "GMPoints"}
                            <a
                              href="https://app.getnimbus.io/daily-checkin?tab=quests"
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
                      <TooltipNumber
                        number={item?.points || 0}
                        type="balance"
                      />
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
                            number={item?.value || 0}
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
            {/if}
          </table>
        </div>
      </div>
      <div class="-mt-4 text-right text-sm text_00000099">
        Data by <a
          href="https://www.airdropped.link/"
          class="hover:underline max-lg:underline text-[#1E96FC]"
          target="_blank"
          >https://www.airdropped.link
        </a>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-2 justify-between">
          <div class="text-2xl font-medium">Points Market</div>
          <div class="text-3xl font-medium">
            <TooltipNumber number={totalListingValue} type="value" />
          </div>
        </div>
        <div
          class={`rounded-[10px] overflow-hidden h-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          <table class="table-auto w-full h-full">
            <thead>
              <tr class="bg_f4f5f8">
                <th
                  class="pl-3 py-3 rounded-tl-[10px] bg-transparent bg_f4f5f8"
                >
                  <div class="text-left text-xs uppercase font-medium">
                    Assets
                  </div>
                </th>

                <th class="py-3">
                  <div class="text-right text-xs uppercase font-medium">
                    Points
                  </div>
                </th>

                <th class="py-3">
                  <div class="text-right text-xs uppercase font-medium">
                    Price
                  </div>
                </th>

                <th class="py-3 pr-3 rounded-tr-[10px]">
                  <div
                    class="text-right text-xs uppercase font-medium flex justify-end"
                  >
                    Listing Value
                  </div>
                </th>
              </tr>
            </thead>

            {#if $query.isFetching}
              <tbody>
                <tr>
                  <td colspan="4">
                    <div
                      class="flex justify-center items-center h-full py-3 px-3"
                    >
                      <Loading />
                    </div>
                  </td>
                </tr>
              </tbody>
            {:else if marketPointsData?.length === 0}
              <tr>
                <td colspan="4">
                  <div
                    class="flex justify-center items-center h-full py-4 px-3 text-lg text-gray-400"
                  >
                    Empty
                  </div>
                </td>
              </tr>
            {:else}
              {#each marketPointsData || [] as item}
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
                          logo={item?.token?.icon}
                          defaultLogo={defaultToken}
                        />
                      </div>

                      <div class="flex flex-col gap-1">
                        {item?.token?.name || ""}

                        <div class="flex items-center gap-2 w-max">
                          {#if item?.token?.token_info?.twitter}
                            <a
                              href={item?.token?.token_info?.twitter}
                              target="_blank"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="13"
                                height="13"
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
                                      <path fill="#606060" d="M0 0h14v14H0z" />
                                    </clipPath>
                                  </defs>
                                </g>
                              </svg>
                            </a>
                          {/if}

                          {#if item?.token?.token_info?.website}
                            <a
                              href={item?.token?.token_info?.website}
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
                      <TooltipNumber
                        number={item?.total_amount || 0}
                        type="balance"
                      />
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
                      $<TooltipNumber
                        number={item?.listing_value / item?.total_amount || 0}
                        type="balance"
                      />/point
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
                      <div class="flex flex-col items-end gap-1">
                        <div>
                          <TooltipNumber
                            number={item?.value || 0}
                            type="amount"
                          />
                          {item?.ex_token?.symbol}
                        </div>
                        <TooltipNumber
                          number={item?.listing_value || 0}
                          type="value"
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              {/each}
            {/if}
          </table>
        </div>
      </div>
    </div>

    <!-- Mobile view -->
    <div class="xl:hidden flex flex-col gap-6">
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <div class="text-2xl font-medium">Airdrops</div>
          <div class="text-3xl font-medium">
            <TooltipNumber
              number={totalEstimateValueEligibilities}
              type="value"
            />
          </div>
        </div>
        <div
          class={`rounded-[10px] overflow-visible h-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          {#if $query.isFetching}
            <div
              class="flex justify-center items-center min-h-[300px] py-3 px-3"
            >
              <Loading />
            </div>
          {:else}
            <div>
              {#if eligibilityData?.length === 0}
                <div
                  class="flex justify-center items-center min-h-[300px] py-3 px-3"
                >
                  Empty
                </div>
              {:else}
                {#each eligibilityData || [] as item}
                  <div
                    class="flex flex-col gap-4 border-b-[1px] border_0000000d last:border-none py-4 px-2"
                  >
                    <div class="flex justify-between items-start">
                      <div class="text-sm uppercase font-medium">
                        {item?.protocolLabel}
                      </div>
                    </div>

                    <div class="flex justify-between items-start">
                      <div class="text-right text-sm uppercase font-medium">
                        Amount
                      </div>

                      <div
                        class="flex items-center justify-end font-medium text-sm text_00000099"
                      >
                        <TooltipNumber
                          number={item?.amount || 0}
                          type="amount"
                        />
                      </div>
                    </div>

                    <div class="flex justify-between items-start">
                      <div class="text-right text-sm uppercase font-medium">
                        Price
                      </div>

                      <div
                        class="flex items-center justify-end font-medium text-sm text_00000099"
                      >
                        <TooltipNumber
                          number={item?.tokenPrice || 0}
                          type="value"
                        />
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
                        <TooltipNumber
                          number={Number(item?.amount) *
                            Number(item?.tokenPrice) || 0}
                          type="value"
                        />
                      </div>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <div class="text-2xl font-medium">Points</div>
          <div class="text-3xl font-medium">
            <TooltipNumber number={totalEstimateValuePoints} type="value" />
          </div>
        </div>
        <div
          class={`rounded-[10px] overflow-visible h-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          {#if $query.isFetching}
            <div
              class="flex justify-center items-center min-h-[300px] py-3 px-3"
            >
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
                {#each pointsData || [] as item}
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
                            logo={protocolInfo[item?.protocolLabel]?.logo}
                            defaultLogo={defaultToken}
                          />
                        </div>
                        {protocolInfo[item?.protocolLabel]?.name}
                      </div>

                      <div
                        class="flex items-center justify-end gap-3 font-medium text-sm text_00000099"
                      >
                        {#if protocolInfo[item?.protocolLabel]?.twitter}
                          <a
                            href={protocolInfo[item?.protocolLabel]?.twitter}
                            target="_blank"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="17"
                              height="17"
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

                        {#if protocolInfo[item?.protocolLabel]?.website}
                          <a
                            href={protocolInfo[item?.protocolLabel]?.website}
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
                            href="https://app.getnimbus.io/daily-checkin?tab=quests"
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
                      </div>
                    </div>

                    <div class="flex justify-between items-start">
                      <div class="text-right text-sm uppercase font-medium">
                        Points
                      </div>

                      <div
                        class="flex items-center justify-end font-medium text-sm text_00000099"
                      >
                        <TooltipNumber
                          number={item?.points || 0}
                          type="balance"
                        />
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
                              number={item?.value || 0}
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
              {/if}
            </div>
          {/if}
        </div>
      </div>
      <div class="-mt-4 text-right text-sm text_00000099">
        Data by <a
          href="https://www.airdropped.link/"
          class="hover:underline max-lg:underline text-[#1E96FC]"
          target="_blank"
          >https://www.airdropped.link
        </a>
      </div>

      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-2">
          <div class="text-2xl font-medium">Points Market</div>
          <div class="text-3xl font-medium">
            <TooltipNumber number={totalListingValue} type="value" />
          </div>
        </div>
        <div
          class={`rounded-[10px] overflow-visible h-full ${
            $isDarkMode ? "bg-[#131313]" : "bg-[#fff] border border_0000000d"
          }`}
        >
          {#if $query.isFetching}
            <div
              class="flex justify-center items-center min-h-[300px] py-3 px-3"
            >
              <Loading />
            </div>
          {:else}
            <div>
              {#if marketPointsData?.length === 0}
                <div
                  class="flex justify-center items-center min-h-[300px] py-3 px-3"
                >
                  Empty
                </div>
              {:else}
                {#each marketPointsData || [] as item}
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
                            logo={item?.token?.icon}
                            defaultLogo={defaultToken}
                          />
                        </div>
                        {item?.token?.name || ""}
                      </div>

                      <div
                        class="flex items-center justify-end gap-3 font-medium text-sm text_00000099"
                      >
                        {#if item?.token?.token_info?.twitter}
                          <a
                            href={item?.token?.token_info?.twitter}
                            target="_blank"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="17"
                              height="17"
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

                        {#if item?.token?.token_info?.website}
                          <a
                            href={item?.token?.token_info?.website}
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
                      </div>
                    </div>

                    <div class="flex justify-between items-start">
                      <div class="text-right text-sm uppercase font-medium">
                        Points
                      </div>

                      <div
                        class="flex items-center justify-end font-medium text-sm text_00000099"
                      >
                        <TooltipNumber
                          number={item?.total_amount || 0}
                          type="balance"
                        />
                      </div>
                    </div>

                    <div class="flex justify-between items-start">
                      <div class="text-right text-sm uppercase font-medium">
                        Price
                      </div>

                      <div
                        class="flex items-center justify-end font-medium text-sm text_00000099"
                      >
                        $<TooltipNumber
                          number={item?.listing_value / item?.total_amount || 0}
                          type="balance"
                        />/point
                      </div>
                    </div>

                    <div class="flex justify-between items-start">
                      <div class="text-right text-sm uppercase font-medium">
                        Listing Value
                      </div>

                      <div
                        class="flex items-center justify-end font-medium text-sm text_00000099"
                      >
                        <div class="flex flex-col items-end gap-1">
                          <div>
                            <TooltipNumber
                              number={item?.value || 0}
                              type="amount"
                            />
                            {item?.ex_token?.symbol}
                          </div>
                          <TooltipNumber
                            number={item?.listing_value || 0}
                            type="value"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</ErrorBoundary>

<style></style>
