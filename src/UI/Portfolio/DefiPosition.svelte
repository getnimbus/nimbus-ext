<script lang="ts">
  import { totalPositions, typeWallet, wallet } from "~/store";
  import { nimbusSuiDefi } from "~/lib/network";
  import { groupBy } from "lodash";
  import { flatten } from "lodash";

  import Loading from "~/components/Loading.svelte";
  import ErrorBoundary from "~/components/ErrorBoundary.svelte";
  import Positions from "./DefiPosition/Positions.svelte";

  export let conditionQuery: boolean;

  let positionsData = [];
  let isLoading = false;

  const getSUIPositions = async (address) => {
    try {
      isLoading = true;
      const response: any = await nimbusSuiDefi.get(`/positions/${address}`);
      formatDataProtocol(response?.data || []);
    } catch (e) {
      console.log(e);
    } finally {
      isLoading = false;
    }
  };

  $: {
    if (conditionQuery) {
      getSUIPositions($wallet);
    }
  }

  const formatDataProtocol = (data) => {
    const formatData = data.map((item) => {
      return {
        ...item,
        protocol: item?.meta?.protocol?.name || "",
      };
    });
    const groupProtocol = groupBy(formatData, "protocol");
    const protocolList = Object.getOwnPropertyNames(groupProtocol);

    const formatPositionsData = protocolList.map((item) => {
      const groupType = groupBy(groupProtocol[item], "type");
      const typeList = Object.getOwnPropertyNames(groupType);

      return {
        protocol: item,
        data: typeList.map((type) => {
          if (type === "Borrow") {
            const borrowData = groupType[type].filter((eachData) => {
              return eachData.input.find((inputItem) => !inputItem.type);
            });

            const borrowLendingStakingData = groupType[type].filter(
              (eachData) => {
                return eachData.input.find((inputItem) => inputItem.type);
              }
            );

            return {
              type,
              data: [
                {
                  type,
                  data: borrowData,
                },
                {
                  type: "BorrowLendingStaking",
                  data: borrowLendingStakingData,
                },
              ],
            };
          }
          return {
            type,
            data: groupType[type],
          };
        }),
      };
    });

    positionsData = formatPositionsData.map((item) => {
      return {
        ...item,
        sum: handleCalculateTotalProtocol(item.data),
      };
    });

    const sum = positionsData?.reduce((prev, item) => {
      return prev + Number(item.sum);
    }, 0);

    totalPositions.update((n) => (n = sum));
  };

  const handleCalculateTotalProtocol = (data: any) => {
    const formatData = data.map((item) => {
      return item.data.map((eachItem) => {
        if (eachItem.type === "Borrow") {
          const listCurrentTokens: any = flatten(
            eachItem.data.map((item) => {
              return item.current.tokens;
            })
          );

          const listCurrentYield: any = flatten(
            eachItem.data.map((item) => {
              return item.current.yield;
            })
          );

          const valueCurrent =
            (listCurrentTokens?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0) +
            (listCurrentYield?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0);

          const listInput: any = flatten(
            eachItem.data.map((item) => {
              return item.input;
            })
          );

          const valueInput =
            listInput?.reduce((prev, item) => prev + Number(item.value), 0) ||
            0;

          return {
            totalInputValue: valueInput - valueCurrent,
            totalYieldCollected: 0,
          };
        }

        if (eachItem.type === "BorrowLendingStaking") {
          const listCurrentTokens: any = flatten(
            eachItem.data.map((item) => {
              return item.current.tokens;
            })
          );

          const listCurrentYield: any = flatten(
            eachItem.data.map((item) => {
              return item.current.yield;
            })
          );

          const valueCurrent =
            (listCurrentTokens?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0) +
            (listCurrentYield?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0);

          const listInputTokens: any = flatten(
            flatten(
              eachItem.data.map((item) => {
                return item.input.map((eachInput) => {
                  return eachInput.current.tokens;
                });
              })
            )
          );

          const listInputYield: any = flatten(
            flatten(
              eachItem.data.map((item) => {
                return item.input.map((eachInput) => {
                  return eachInput.current.yield;
                });
              })
            )
          );

          const valueInput =
            (listInputTokens?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0) +
            (listInputYield?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0);

          return {
            totalInputValue: valueInput - valueCurrent,
            totalYieldCollected: 0,
          };
        }

        return {
          totalInputValue:
            eachItem?.current?.tokens?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0,
          totalYieldCollected:
            eachItem?.current?.yield?.reduce(
              (prev, item) => prev + Number(item.value),
              0
            ) || 0,
        };
      });
    });
    const flattenData: any = flatten(formatData);

    const totalProtocolInput = flattenData.reduce(
      (prev, item) => prev + Number(item.totalInputValue),
      0
    );

    const totalProtocolYieldCollected = flattenData.reduce(
      (prev, item) => prev + Number(item.totalYieldCollected),
      0
    );

    return totalProtocolInput + totalProtocolYieldCollected;
  };
</script>

<ErrorBoundary>
  <div class="flex flex-col gap-2 px-3">
    <div class="xl:text-2xl text-3xl font-medium">Positions</div>
    {#if $typeWallet === "MOVE"}
      {#if isLoading}
        <div class="flex justify-center items-center min-h-[300px]">
          <Loading />
        </div>
      {:else}
        <div>
          {#if positionsData.length === 0}
            <div class="flex justify-center items-center min-h-[300px]">
              Empty
            </div>
          {:else}
            <div class="flex flex-col gap-6">
              {#each positionsData as item}
                <Positions data={item} />
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    {:else}
      <div class="text-lg min-h-[300px] flex items-center justify-center">
        Coming soon 🚀
      </div>
    {/if}
  </div>
</ErrorBoundary>

<style windi:preflights:global windi:safelist:global></style>
