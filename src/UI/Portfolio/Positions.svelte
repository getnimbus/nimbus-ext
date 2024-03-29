<script lang="ts">
  import { priceSubscribe } from "~/lib/price-ws";
  import { i18n } from "~/lib/i18n";
  import { flattenArray } from "~/utils";

  export let data;
  export let isLoading;
  export let totalPositions;
  export let totalClaimable;

  import Table from "~/UI/PositionTable/Table.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Loading from "~/components/Loading.svelte";

  const MultipleLang = {
    positions: i18n("newtabPage.positions", "Positions"),
  };

  let formatPositionsDataTable = [];
  let flattenPositionsDataTable = [];

  let marketPrice;

  $: {
    if (data) {
      data.map((eachData) => {
        let types = Object.getOwnPropertyNames(eachData.positions);
        types.map((type) => {
          if (type === "LP-Provider") {
            eachData.positions?.["LP-Provider"]
              ?.filter(
                (item) =>
                  Number(item?.token0Info?.info?.cmc_id) ||
                  Number(item?.token1Info?.info?.cmc_id)
              )
              ?.map((item) => {
                const token0 = Number(item?.token0Info?.info?.cmc_id);
                const token1 = Number(item?.token1Info?.info?.cmc_id);
                priceSubscribe([token0, token1], "");
              });
          }
          if (type === "LP-Provider v2") {
            eachData.positions?.["LP-Provider v2"]
              ?.filter(
                (item) =>
                  Number(item?.token0Info?.info?.cmc_id) ||
                  Number(item?.token1Info?.info?.cmc_id)
              )
              ?.map((item) => {
                const token0 = Number(item?.token0Info?.info?.cmc_id);
                const token1 = Number(item?.token1Info?.info?.cmc_id);
                priceSubscribe([token0, token1], "");
              });
          }
          if (type === "LP Staking") {
            eachData.positions?.["LP Staking"]
              ?.filter(
                (item) =>
                  Number(item?.token0Info?.info?.cmc_id) ||
                  Number(item?.token1Info?.info?.cmc_id)
              )
              ?.map((item) => {
                const token0 = Number(item?.token0Info?.info?.cmc_id);
                const token1 = Number(item?.token1Info?.info?.cmc_id);
                const rewardToken0 = Number(
                  item?.rewardTokens[0]?.info?.info?.cmc_id
                );
                priceSubscribe([token0, token1, rewardToken0], "");
              });
          }
          if (type === "Staking") {
            eachData.positions?.["Staking"]
              ?.filter((item) => item?.cmc_id)
              ?.map((item) => {
                priceSubscribe([item?.cmc_id], "");
              });
          }
          if (type === "Lending") {
            eachData.positions?.["Lending"]
              ?.filter((item) => item?.cmc_id)
              ?.map((item) => {
                priceSubscribe([item?.cmc_id], "");
              });
          }
          if (type === "Borrow") {
            eachData.positions?.["Borrow"]
              ?.filter((item) => item?.cmc_id)
              ?.map((item) => {
                priceSubscribe([item?.cmc_id], "");
              });
          }
          if (type === "MCD") {
            eachData.positions?.["MCD"]
              ?.filter((item) => item?.cmc_id)
              ?.map((item) => {
                const token = Number(item?.token?.cmc_id);
                priceSubscribe([token], "");
              });
          }
        });
      });
    }
  }

  $: {
    if (data) {
      const realtimePositionsDataTable = data.map((eachData) => {
        let types = Object.getOwnPropertyNames(eachData.positions);

        const eachTypeDataList = types.map((type) => {
          if (type === "LP-Provider") {
            let defaultDataPositionFormat = eachData.positions?.[
              "LP-Provider"
            ].map((item) => {
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
            });

            let dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            let claimable = (defaultDataPositionFormat || []).reduce(
              (prev, item) =>
                prev +
                  item.claimable0Amount * Number(item?.amount0Price?.price) ||
                0 + item.claimable1Amount * Number(item?.amount1Price?.price) ||
                0,
              0
            );

            let sum = (defaultDataPositionFormat || []).reduce(
              (prev, item) =>
                prev +
                  Number(item.amount0out) * Number(item?.amount0Price?.price) ||
                0 +
                  Number(item.amount1out) * Number(item?.amount1Price?.price) ||
                0 + item.claimable0Amount * Number(item?.amount0Price?.price) ||
                0 + item.claimable1Amount * Number(item?.amount1Price?.price) ||
                0,
              0
            );

            if (marketPrice !== undefined) {
              const formatDataWithMarketPrice = defaultDataPositionFormat.map(
                (item) => {
                  if (
                    marketPrice.id === Number(item?.token0Info?.info?.cmc_id)
                  ) {
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
                  if (
                    marketPrice.id === Number(item?.token1Info?.info?.cmc_id)
                  ) {
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
                [type]: dataPositionFormat,
              },
              sum,
              sum_claimable: claimable,
            };
          }
          if (type === "LP-Provider v2") {
            let defaultDataPositionFormat = eachData.positions?.[
              "LP-Provider v2"
            ].map((item) => {
              return {
                ...item,
                market_price0: Number(item?.amount0Price?.price) || 0,
                market_price1: Number(item?.amount1Price?.price) || 0,
                initialValue:
                  Number(item.amount0out) *
                    (Number(item?.amount0Price?.price) || 0) +
                    Number(item.amount1out) *
                      Number(item?.amount1Price?.price) || 0,
              };
            });

            let dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            let sum = (defaultDataPositionFormat || []).reduce(
              (prev, item) =>
                prev +
                  Number(item.amount0out) *
                    (Number(item?.amount0Price?.price) || 0) +
                  Number(item.amount1out) * Number(item?.amount1Price?.price) ||
                0,
              0
            );

            let claimable = (defaultDataPositionFormat || []).reduce(
              (prev, item) =>
                prev +
                  Number(item.amount0out) *
                    (Number(item?.amount0Price?.price) || 0) +
                  Number(item.amount1out) * Number(item?.amount1Price?.price) ||
                0,
              0
            );

            if (marketPrice !== undefined) {
              const formatDataWithMarketPrice = defaultDataPositionFormat.map(
                (item) => {
                  if (
                    marketPrice.id === Number(item?.token0Info?.info?.cmc_id)
                  ) {
                    return {
                      ...item,
                      market_price0: marketPrice.market_price,
                      initialValue:
                        Number(item.amount0out) * marketPrice.market_price +
                        Number(item.amount1out) * item.market_price1,
                    };
                  }
                  if (
                    marketPrice.id === Number(item?.token1Info?.info?.cmc_id)
                  ) {
                    return {
                      ...item,
                      market_price1: marketPrice.market_price,
                      initialValue:
                        Number(item.amount0out) * item.market_price0 +
                        Number(item.amount1out) * marketPrice.market_price,
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

              claimable = (formatDataWithMarketPrice || []).reduce(
                (prev, item) =>
                  prev +
                  Number(item.amount0out) * item.market_price0 +
                  Number(item.amount1out) * item.market_price1,
                0
              );
            }

            return {
              ...eachData,
              positions: {
                [type]: dataPositionFormat,
              },
              sum,
              sum_claimable: claimable,
            };
          }
          if (type === "LP Staking") {
            let defaultDataPositionFormat = eachData.positions?.[
              "LP Staking"
            ].map((item) => {
              return {
                ...item,
                market_price0: Number(item?.amount0Price?.price) || 0,
                market_price1: Number(item?.amount1Price?.price) || 0,
                rewardToken0:
                  Number(item?.rewardTokens[0]?.info?.price?.price) || 0,
                initialValue:
                  Number(item.amount0out) *
                    (Number(item?.amount0Price?.price) || 0) +
                    Number(item.amount1out) *
                      Number(item?.amount1Price?.price) ||
                  0 +
                    item?.rewardTokens[0]?.rewardOut *
                      Number(item?.rewardTokens[0]?.info?.price?.price),
              };
            });

            let dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            let sum = (defaultDataPositionFormat || []).reduce(
              (prev, item) =>
                prev +
                  Number(item.amount0out) *
                    (Number(item?.amount0Price?.price) || 0) +
                  Number(item.amount1out) * Number(item?.amount1Price?.price) ||
                0 +
                  item?.rewardTokens[0]?.rewardOut *
                    Number(item?.rewardTokens[0]?.info?.price?.price),
              0
            );

            let claimable = (defaultDataPositionFormat || []).reduce(
              (prev, item) =>
                prev +
                  Number(item.amount0out) *
                    (Number(item?.amount0Price?.price) || 0) +
                  Number(item.amount1out) * Number(item?.amount1Price?.price) ||
                0 +
                  item?.rewardTokens[0]?.rewardOut *
                    Number(item?.rewardTokens[0]?.info?.price?.price),
              0
            );

            if (marketPrice !== undefined) {
              const formatDataWithMarketPrice = defaultDataPositionFormat.map(
                (item) => {
                  if (
                    marketPrice.id === Number(item?.token0Info?.info?.cmc_id)
                  ) {
                    return {
                      ...item,
                      market_price0: marketPrice.market_price,
                      initialValue:
                        Number(item.amount0out) * marketPrice.market_price +
                        Number(item.amount1out) * item.market_price1 +
                        item?.rewardTokens[0]?.rewardOut *
                          Number(item?.rewardTokens[0]?.info?.price?.price),
                    };
                  }
                  if (
                    marketPrice.id === Number(item?.token1Info?.info?.cmc_id)
                  ) {
                    return {
                      ...item,
                      market_price1: marketPrice.market_price,
                      initialValue:
                        Number(item.amount0out) * item.market_price0 +
                        Number(item.amount1out) * marketPrice.market_price +
                        item?.rewardTokens[0]?.rewardOut *
                          Number(item?.rewardTokens[0]?.info?.price?.price),
                    };
                  }
                  if (
                    marketPrice.id ===
                    Number(item?.rewardTokens[0]?.info?.info?.cmc_id)
                  ) {
                    return {
                      ...item,
                      rewardToken0: marketPrice.market_price,
                      initialValue:
                        Number(item.amount0out) * item.market_price0 +
                        Number(item.amount1out) * item.market_price1 +
                        item?.rewardTokens[0]?.rewardOut *
                          marketPrice.market_price,
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

              sum = (defaultDataPositionFormat || []).reduce(
                (prev, item) =>
                  prev +
                  Number(item.amount0out) * item.market_price0 +
                  Number(item.amount1out) * item.market_price1 +
                  item?.rewardTokens[0]?.rewardOut * item.rewardToken0,
                0
              );

              claimable = (defaultDataPositionFormat || []).reduce(
                (prev, item) =>
                  prev +
                  Number(item.amount0out) * item.market_price0 +
                  Number(item.amount1out) * item.market_price1 +
                  item?.rewardTokens[0]?.rewardOut * item.rewardToken0,
                0
              );
            }

            return {
              ...eachData,
              positions: {
                [type]: dataPositionFormat,
              },
              sum,
              sum_claimable: claimable,
            };
          }
          if (type === "Staking") {
            let defaultDataPositionFormat = eachData.positions?.["Staking"].map(
              (item) => {
                return {
                  ...item,
                  market_price: item?.price?.price || 0,
                  initialValue: item?.price?.price || 0 * item?.amount,
                };
              }
            );

            let dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            let sum = (defaultDataPositionFormat || []).reduce(
              (prev, item) => prev + (item?.price?.price || 0) * item?.amount,
              0
            );

            let claimable = (defaultDataPositionFormat || []).reduce(
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

              sum = (formatDataWithMarketPrice || []).reduce(
                (prev, item) => prev + item.market_price * item?.amount,
                0
              );

              claimable = (formatDataWithMarketPrice || []).reduce(
                (prev, item) => prev + item.market_price * item?.amount,
                0
              );
            }

            return {
              ...eachData,
              positions: {
                [type]: defaultDataPositionFormat,
              },
              sum,
              sum_claimable: claimable,
            };
          }
          if (type === "Lending") {
            let defaultDataPositionFormat = eachData.positions?.["Lending"].map(
              (item) => {
                return {
                  ...item,
                  market_price: item?.price?.price || 0,
                  initialValue: item?.price?.price || 0 * item?.amount,
                };
              }
            );

            let dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            let claimable = (defaultDataPositionFormat || []).reduce(
              (prev, item) => prev + (item?.price?.price || 0) * item?.amount,
              0
            );

            let sum = (defaultDataPositionFormat || []).reduce(
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
                (prev, item) => prev + item.market_price * item?.amount,
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
                [type]: dataPositionFormat,
              },
              sum,
              sum_claimable: claimable,
            };
          }
          if (type === "Borrow") {
            let defaultDataPositionFormat = eachData.positions?.["Borrow"].map(
              (item) => {
                return {
                  ...item,
                  market_price: item?.price?.price || 0,
                  initialValue: item?.price?.price || 0 * item?.amount,
                };
              }
            );

            let dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            let claimable = (defaultDataPositionFormat || []).reduce(
              (prev, item) => prev + item.claimable,
              0
            );

            let sum = (defaultDataPositionFormat || []).reduce(
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
                [type]: dataPositionFormat,
              },
              sum,
              sum_claimable: claimable,
            };
          }
          if (type === "MCD") {
            let defaultDataPositionFormat = eachData.positions?.["MCD"].map(
              (item) => {
                const value =
                  item?.collateralAmount * item?.price?.price -
                  item?.debtAmount * 1;
                return {
                  ...item,
                  market_price: item?.price?.price || 0,
                  initialValue: value,
                };
              }
            );

            let dataPositionFormat = defaultDataPositionFormat.sort((a, b) => {
              if (a.initialValue < b.initialValue) {
                return 1;
              }
              if (a.initialValue > b.initialValue) {
                return -1;
              }
              return 0;
            });

            let claimable = 0;

            let sum = (defaultDataPositionFormat || []).reduce(
              (prev, item) =>
                prev +
                item?.collateralAmount * item?.price?.price -
                item?.debtAmount * 1,
              0
            );

            if (marketPrice !== undefined) {
              const formatDataWithMarketPrice = defaultDataPositionFormat.map(
                (item) => {
                  if (marketPrice.id === Number(item?.token?.cmc_id)) {
                    const value =
                      item?.collateralAmount * marketPrice.market_price +
                      item?.debtAmount * 1 * -1;
                    return {
                      ...item,
                      market_price: marketPrice.market_price,
                      initialValue: value,
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

              sum = (defaultDataPositionFormat || []).reduce(
                (prev, item) =>
                  prev +
                  item?.collateralAmount * item?.market_price -
                  item?.debtAmount * 1,
                0
              );
            }

            return {
              ...eachData,
              positions: {
                [type]: dataPositionFormat,
              },
              sum,
              sum_claimable: claimable,
            };
          }
        });

        return eachTypeDataList;
      });

      const filterRealtimePositionsDataTable = realtimePositionsDataTable.map(
        (item) => {
          return item.filter((el) => el !== undefined);
        }
      );

      flattenPositionsDataTable = flattenArray(
        filterRealtimePositionsDataTable.map((item) => item)
      );

      formatPositionsDataTable = data.map((item, index) => {
        const types = Object.getOwnPropertyNames(item.positions);

        const selectedPositionData = types.map((type) => {
          const selectedData = filterRealtimePositionsDataTable[index].filter(
            (selected) =>
              Object.getOwnPropertyNames(selected.positions)[0] === type
          );

          const formatSelectedData = {
            data: selectedData[0]?.positions[type],
            sum: selectedData[0]?.sum,
            sum_claimable: selectedData[0]?.sum_claimable,
          };

          return {
            [type]: formatSelectedData,
          };
        });

        return {
          ...item,
          positions: selectedPositionData,
        };
      });
    }
  }

  $: {
    if (flattenPositionsDataTable.length === 0) {
      totalPositions = 0;
      totalClaimable = 0;
    } else {
      totalPositions = flattenPositionsDataTable.reduce(
        (prev, item) => prev + item.sum,
        0
      );
      totalClaimable = flattenPositionsDataTable.reduce(
        (prev, item) => prev + item.sum_claimable,
        0
      );
    }
  }
</script>

<ErrorBoundary>
  <div class="flex flex-col gap-4">
    <div class="xl:text-2xl text-4xl font-medium">
      {MultipleLang.positions}
    </div>

    {#if isLoading}
      <div class="flex items-center justify-center pt-6">
        <Loading />
      </div>
    {:else}
      <div class="flex flex-col gap-7">
        {#if formatPositionsDataTable && formatPositionsDataTable.length !== 0}
          {#each formatPositionsDataTable as position}
            <Table data={position} />
          {/each}
        {:else}
          <div class="flex justify-center items-center text-base text-gray-400">
            Empty
          </div>
        {/if}
      </div>
    {/if}
  </div>
</ErrorBoundary>

<style>
</style>
