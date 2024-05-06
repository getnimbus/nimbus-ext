import { totalPositions } from "~/store";
import { groupBy, flatten } from "lodash";
import { filterDuplicates } from "~/utils";

export const formatDataProtocol = (data) => {
  const formatData = data?.filter((item) => !item.error)?.map((item) => {
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

  const positionsData = formatPositionsData
    .map((item) => {
      const protocolMeta = item.data.map((eachItem) => {
        return eachItem.data.map((eachProtocolData) => {
          if (eachProtocolData.data) {
            return eachProtocolData.data.map((data) => {
              return (
                data?.meta?.protocol || {
                  logo: "",
                  name: "",
                  url: "",
                }
              );
            });
          }

          return (
            eachProtocolData?.meta?.protocol || {
              logo: "",
              name: "",
              url: "",
            }
          );
        });
      });

      return {
        ...item,
        meta: filterDuplicates(flatten(flatten(protocolMeta)))[0],
        sum: handleCalculateTotalProtocol(item.data),
      };
    })
    .sort((a, b) => {
      if (a.sum < b.sum) {
        return 1;
      }
      if (a.sum > b.sum) {
        return -1;
      }
      return 0;
    });

  const sum = positionsData?.reduce((prev, item) => {
    return prev + Number(item.sum);
  }, 0);

  totalPositions.update((n) => (n = sum));

  return positionsData;
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