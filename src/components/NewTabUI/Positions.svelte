<script lang="ts">
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";

  export let data;
  export let isLoading;
  export let totalPositions;
  export let totalClaimable;

  import Table from "../PositionTable/Table.svelte";
  import "~/components/Loading.custom.svelte";

  const MultipleLang = {
    positions: i18n("newtabPage.positions", "Positions"),
  };

  let formatPositionsDataTable = [];

  let defaultDataPositionFormat = [];
  let dataPositionFormat = [];
  let marketPrice;
  let sum = 0;
  let claimable = 0;
  let sumPositions = 0;
  let sumClaimablePositions = 0;

  $: {
    if (data) {
      data.map((eachData) => {
        let type = Object.getOwnPropertyNames(eachData.positions);
        if (type[0] === "LP-Provider") {
          eachData.positions?.["LP-Provider"].map((item) => {
            const token0 = Number(item?.token0Info?.info?.cmc_id);
            const token1 = Number(item?.token1Info?.info?.cmc_id);
            priceSubscribe([token0, token1], (data) => {
              marketPrice = {
                id: data.id,
                market_price: data.p,
              };
            });
          });
        }
        if (type[0] === "LP-Provider v2") {
          eachData.positions?.["LP-Provider v2"].map((item) => {
            const token0 = Number(item?.token0Info?.info?.cmc_id);
            const token1 = Number(item?.token1Info?.info?.cmc_id);
            priceSubscribe([token0, token1], (data) => {
              marketPrice = {
                id: data.id,
                market_price: data.p,
              };
            });
          });
        }
        if (type[0] === "Staking") {
          eachData.positions?.["Staking"].map((item) => {
            priceSubscribe([item?.cmc_id], (data) => {
              marketPrice = {
                id: data.id,
                market_price: data.p,
              };
            });
          });
        }
        if (type[0] === "Lending") {
          eachData.positions?.["Lending"].map((item) => {
            priceSubscribe([item?.cmc_id], (data) => {
              marketPrice = {
                id: data.id,
                market_price: data.p,
              };
            });
          });
        }
        if (type[0] === "Borrow") {
          eachData.positions?.["Borrow"].map((item) => {
            priceSubscribe([item?.cmc_id], (data) => {
              marketPrice = {
                id: data.id,
                market_price: data.p,
              };
            });
          });
        }
      });
    }
  }

  $: {
    if (data) {
      formatPositionsDataTable = data.map((eachData) => {
        let type = Object.getOwnPropertyNames(eachData.positions);

        if (type[0] === "LP-Provider") {
          defaultDataPositionFormat = eachData.positions?.["LP-Provider"].map(
            (item) => {
              return {
                ...item,
                market_price0: Number(item?.amount0Price?.price) || 0,
                market_price1: Number(item?.amount1Price?.price) || 0,
                initialValue:
                  Number(item.amount0out) *
                    (Number(item?.amount0Price?.price) || 0) +
                    Number(item.amount1out) *
                      Number(item?.amount1Price?.price) ||
                  0 +
                    item.claimable0Amount * Number(item?.amount0Price?.price) ||
                  0 +
                    item.claimable1Amount * Number(item?.amount1Price?.price) ||
                  0,
              };
            }
          );

          dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
            if (a.initialValue < b.initialValue) {
              return 1;
            }
            if (a.initialValue > b.initialValue) {
              return -1;
            }
            return 0;
          });

          claimable = (defaultDataPositionFormat || []).reduce(
            (prev, item) =>
              prev +
                item.claimable0Amount * Number(item?.amount0Price?.price) ||
              0 + item.claimable1Amount * Number(item?.amount1Price?.price) ||
              0,
            0
          );

          sum = (defaultDataPositionFormat || []).reduce(
            (prev, item) =>
              prev +
                Number(item.amount0out) * Number(item?.amount0Price?.price) ||
              0 + Number(item.amount1out) * Number(item?.amount1Price?.price) ||
              0 + item.claimable0Amount * Number(item?.amount0Price?.price) ||
              0 + item.claimable1Amount * Number(item?.amount1Price?.price) ||
              0,
            0
          );

          if (marketPrice !== undefined) {
            const formatDataWithMarketPrice = defaultDataPositionFormat.map(
              (item) => {
                if (marketPrice.id === Number(item?.token0Info?.info?.cmc_id)) {
                  return {
                    ...item,
                    market_price0: marketPrice.market_price,
                    initialValue:
                      Number(item.amount0out) * marketPrice.market_price +
                      Number(item.amount1out) * item.market_price1 +
                      item.claimable0Amount * marketPrice.market_price +
                      item.claimable1Amount * item.market_price1,
                  };
                }
                if (marketPrice.id === Number(item?.token1Info?.info?.cmc_id)) {
                  return {
                    ...item,
                    market_price1: marketPrice.market_price,
                    initialValue:
                      Number(item.amount0out) * item.market_price0 +
                      Number(item.amount1out) * marketPrice.market_price +
                      item.claimable0Amount * item.market_price0 +
                      item.claimable1Amount * marketPrice.market_price,
                  };
                }
                return { ...item };
              }
            );

            defaultDataPositionFormat = formatDataWithMarketPrice;

            dataPositionFormat = formatDataWithMarketPrice.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            claimable = (formatDataWithMarketPrice || []).reduce(
              (prev, item) =>
                prev +
                item.claimable0Amount * item.market_price0 +
                item.claimable1Amount * item.market_price1,
              0
            );

            sum = (formatDataWithMarketPrice || []).reduce(
              (prev, item) =>
                prev +
                Number(item.amount0out) * item.market_price0 +
                Number(item.amount1out) * item.market_price1 +
                item.claimable0Amount * item.market_price0 +
                item.claimable1Amount * item.market_price1,
              0
            );
          }

          return {
            ...eachData,
            positions: {
              [type[0]]: dataPositionFormat,
            },
            sum,
            sum_claimable: claimable,
          };
        }

        if (type[0] === "LP-Provider v2") {
          defaultDataPositionFormat = eachData.positions?.[
            "LP-Provider v2"
          ].map((item) => {
            return {
              ...item,
              market_price0: Number(item?.amount0Price?.price) || 0,
              market_price1: Number(item?.amount1Price?.price) || 0,
              initialValue:
                Number(item.amount0out) *
                  (Number(item?.amount0Price?.price) || 0) +
                  Number(item.amount1out) * Number(item?.amount1Price?.price) ||
                0,
            };
          });

          dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
            if (a.initialValue < b.initialValue) {
              return 1;
            }
            if (a.initialValue > b.initialValue) {
              return -1;
            }
            return 0;
          });

          sum = (defaultDataPositionFormat || []).reduce(
            (prev, item) =>
              prev +
                Number(item.amount0out) *
                  (Number(item?.amount0Price?.price) || 0) +
                Number(item.amount1out) * Number(item?.amount1Price?.price) ||
              0,
            0
          );

          claimable = 0;

          if (marketPrice !== undefined) {
            const formatDataWithMarketPrice = defaultDataPositionFormat.map(
              (item) => {
                if (marketPrice.id === Number(item?.token0Info?.info?.cmc_id)) {
                  return {
                    ...item,
                    market_price0: marketPrice.market_price,
                    initialValue:
                      Number(item.amount0out) * marketPrice.market_price +
                      Number(item.amount1out) * item.market_price1 +
                      item.claimable0Amount * marketPrice.market_price +
                      item.claimable1Amount * item.market_price1,
                  };
                }
                if (marketPrice.id === Number(item?.token1Info?.info?.cmc_id)) {
                  return {
                    ...item,
                    market_price1: marketPrice.market_price,
                    initialValue:
                      Number(item.amount0out) * item.market_price0 +
                      Number(item.amount1out) * marketPrice.market_price +
                      item.claimable0Amount * item.market_price0 +
                      item.claimable1Amount * marketPrice.market_price,
                  };
                }

                return { ...item };
              }
            );
            defaultDataPositionFormat = formatDataWithMarketPrice;
            dataPositionFormat = formatDataWithMarketPrice.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            sum = (formatDataWithMarketPrice || []).reduce(
              (prev, item) =>
                prev +
                Number(item.amount0out) * item.market_price0 +
                Number(item.amount1out) * item.market_price1,
              0
            );

            claimable = 0;
          }

          return {
            ...eachData,
            positions: {
              [type[0]]: dataPositionFormat,
            },
            sum,
            sum_claimable: claimable,
          };
        }

        if (type[0] === "Staking") {
          defaultDataPositionFormat = eachData.positions?.["Staking"].map(
            (item) => {
              return {
                ...item,
                market_price: item?.price?.price || 0,
              };
            }
          );

          sum = (defaultDataPositionFormat || []).reduce(
            (prev, item) => prev + (item?.price?.price || 0) * item?.amount,
            0
          );

          claimable = (defaultDataPositionFormat || []).reduce(
            (prev, item) => prev + item.claimable,
            0
          );

          if (marketPrice !== undefined) {
            const formatDataWithMarketPrice = defaultDataPositionFormat.map(
              (item) => {
                if (marketPrice.id === item?.cmc_id) {
                  return {
                    ...item,
                    market_price: marketPrice.market_price,
                  };
                }

                return { ...item };
              }
            );
            defaultDataPositionFormat = formatDataWithMarketPrice;

            sum = (formatDataWithMarketPrice || []).reduce(
              (prev, item) => prev + item.market_price * item?.amount,
              0
            );

            claimable = (formatDataWithMarketPrice || []).reduce(
              (prev, item) => prev + item.claimable,
              0
            );
          }

          return {
            ...eachData,
            positions: {
              [type[0]]: dataPositionFormat,
            },
            sum,
            sum_claimable: claimable,
          };
        }

        if (type[0] === "Lending") {
          defaultDataPositionFormat = eachData.positions?.["Lending"].map(
            (item) => {
              return {
                ...item,
                market_price: item?.price?.price || 0,
                initialValue: item?.price?.price || 0 * item?.amount,
              };
            }
          );

          dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
            if (a.initialValue < b.initialValue) {
              return 1;
            }
            if (a.initialValue > b.initialValue) {
              return -1;
            }
            return 0;
          });

          claimable = (defaultDataPositionFormat || []).reduce(
            (prev, item) => prev + item.claimable,
            0
          );

          sum = (defaultDataPositionFormat || []).reduce(
            (prev, item) => prev + (item?.price?.price || 0) * item?.amount,
            0
          );

          if (marketPrice !== undefined) {
            const formatDataWithMarketPrice = defaultDataPositionFormat.map(
              (item) => {
                if (marketPrice.id === item?.cmc_id) {
                  return {
                    ...item,
                    market_price: marketPrice.market_price,
                    initialValue: marketPrice.market_price * item?.amount,
                  };
                }

                return { ...item };
              }
            );
            defaultDataPositionFormat = formatDataWithMarketPrice;
            dataPositionFormat = formatDataWithMarketPrice.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            claimable = (defaultDataPositionFormat || []).reduce(
              (prev, item) => prev + item.claimable,
              0
            );

            sum = (defaultDataPositionFormat || []).reduce(
              (prev, item) => prev + item.market_price * item?.amount,
              0
            );
          }

          return {
            ...eachData,
            positions: {
              [type[0]]: dataPositionFormat,
            },
            sum,
            sum_claimable: claimable,
          };
        }

        if (type[0] === "Borrow") {
          defaultDataPositionFormat = eachData.positions?.["Borrow"].map(
            (item) => {
              return {
                ...item,
                market_price: item?.price?.price || 0,
                initialValue: item?.price?.price || 0 * item?.amount,
              };
            }
          );

          dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
            if (a.initialValue < b.initialValue) {
              return 1;
            }
            if (a.initialValue > b.initialValue) {
              return -1;
            }
            return 0;
          });

          claimable = (defaultDataPositionFormat || []).reduce(
            (prev, item) => prev + item.claimable,
            0
          );

          sum = (defaultDataPositionFormat || []).reduce(
            (prev, item) => prev + (item?.price?.price || 0) * item?.amount,
            0
          );

          if (marketPrice !== undefined) {
            const formatDataWithMarketPrice = defaultDataPositionFormat.map(
              (item) => {
                if (marketPrice.id === item?.cmc_id) {
                  return {
                    ...item,
                    market_price: marketPrice.market_price,
                    initialValue: marketPrice.market_price * item?.amount,
                  };
                }

                return { ...item };
              }
            );
            defaultDataPositionFormat = formatDataWithMarketPrice;
            dataPositionFormat = formatDataWithMarketPrice.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            claimable = (defaultDataPositionFormat || []).reduce(
              (prev, item) => prev + item.claimable,
              0
            );

            sum = (defaultDataPositionFormat || []).reduce(
              (prev, item) => prev + item.market_price * item?.amount,
              0
            );
          }

          return {
            ...eachData,
            positions: {
              [type[0]]: dataPositionFormat,
            },
            sum,
            sum_claimable: claimable,
          };
        }
      });
    }
  }

  $: {
    if (formatPositionsDataTable) {
      totalPositions = formatPositionsDataTable.reduce(
        (prev, item) => prev + item.sum,
        0
      );
      totalClaimable = formatPositionsDataTable.reduce(
        (prev, item) => prev + item.sum_claimable,
        0
      );
    }
  }
</script>

<div class="flex flex-col gap-4">
  <div class="text-2xl font-medium text-black">
    {MultipleLang.positions}
  </div>

  {#if isLoading}
    <div class="flex items-center justify-center pt-6">
      <loading-icon />
    </div>
  {:else}
    <div class="flex flex-col gap-7">
      {#if formatPositionsDataTable && formatPositionsDataTable.length !== 0}
        {#each formatPositionsDataTable as position}
          <Table data={position} />
        {/each}
      {:else}
        <div>No data</div>
      {/if}
    </div>
  {/if}
</div>

<style>
</style>
