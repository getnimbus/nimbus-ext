import { realtimePrice } from "~/store";

type iFN = () => void;

export let mobulaSocket: null | WebSocket;
let isMobulaReady = false;
let cbMobulaList: iFN[] = [];

export const initWS = (cb?: () => void) => {
  mobulaSocket = new WebSocket("wss://general-api-wss-fgpupeioaa-uc.a.run.app");

  mobulaSocket.onopen = () => {
    console.log("Mobula WS connection established");
    cb && cb();
    isMobulaReady = true;
    cbMobulaList.forEach((cbItem) => {
      cbItem();
    });
    cbMobulaList = [];
  };
};

export const disconnectWs = () => {
  if (mobulaSocket) {
    mobulaSocket.close();
  }
};

export const decodeEvent = (ev: MessageEvent) => {
  try {
    const data = JSON.parse(ev.data);

    return data;
  } catch (error) {
    console.log(ev.data);
    console.log(error);
    return null;
  }
};

const cached = {};

export const chainSupport = [
  "FTM", //Fantom
  "XDAI", // Gnosis
  "AVAX", // Avalanche
  "CRONOS", // Cronos
  "ETH", // Ethereum
  "MATIC", // Polygon
  "BNB", // BNB
  "KLAY", // Klaytn
  "AURA", // Aurora
  "ARB", // Arbitrum
  "OP", // Optimistic
  "BASE", // Base
  "SUI", // Sui
  "MANTLE", // Mantle
];

const authKey =
  import.meta.env.VITE_MOBULA_KEY || "fe18f8be-644a-45a8-ad05-b088a5e61764";

export const handleFormatBlockChainId = (chain: string) => {
  switch (chain) {
    case "XDAI": // XDAI
      return "100";
    case "AVAX": // Avalanche C-Chain
      return "43114";
    case "CRONOS": // Cronos
      return "25";
    case "ETH": // Ethereum
      return "1";
    case "MATIC": // Polygon
      return "137";
    case "BNB": // BNB Smart Chain (BEP20)
      return "56";
    case "KLAY": // Klaytn
      return "8217";
    case "AURORA": // AURORA
      return "1313161554";
    case "ARB": // Arbitrum
      return "42161";
    case "OP": // Optimistic
      return "10";
    case "BASE": // Base
      return "8453";
    case "SUI": // SUI
      return "sui";
    case "MANTLE": // Mantle
      return "5000";
    case "MOVR": // Moonriver
      return "1285";
    case "GLMR": // Moonbeam
      return "1284";
    case "ZETA": // ZetaChain
      return "7000";
    case "ONE": // Harmony
      return "1666600000";
    case "FANTOM": // Fantom
      return "250";
    case "ROSE": // Oasis
      return "42262";
    case "TON":
      return "TON";
    case "NEAR":
      return "NEAR";
  }

  return "";
};

export const priceMobulaSubscribe = (
  data: string[] | number[],
  chain: string
) => {
  try {
    if (!mobulaSocket) {
      console.log("Mobula WS is not initiated");
      initWS(() => priceMobulaSubscribe(data, chain));
    } else {
      if (!isMobulaReady) {
        console.log("Delay Mobula Subscribe");
        cbMobulaList.push(() => priceMobulaSubscribe(data, chain));
        return;
      }

      const key = `${data}-${chain}`;

      if (cached[key]) {
        realtimePrice.update((n) => (n = cached[key]));
      } else {
        if (chain === "CEX") {
          mobulaSocket.send(
            JSON.stringify({
              type: "market",
              authorization: authKey,
              payload: {
                assets: data.map((item) => {
                  return {
                    symbol: item,
                  };
                }),
                interval: 15,
              },
            })
          );
        }

        if (chain !== "CEX" && chainSupport.includes(chain)) {
          mobulaSocket.send(
            JSON.stringify({
              type: "market",
              authorization: authKey,
              payload: {
                assets: data.map((item) => {
                  return {
                    address: item,
                    blockchain: handleFormatBlockChainId(chain),
                  };
                }),
                interval: 15,
              },
            })
          );
        }
      }

      mobulaSocket.addEventListener("message", (ev) => {
        const res = decodeEvent(ev);
        if (res?.data && Object.keys(res?.data).length !== 0) {
          Object.keys(res?.data).forEach((key) => {
            if (
              res?.data[key]?.liquidity < 1000 ||
              res?.data[key]?.price > 500000
            ) {
              delete res?.data[key];
            }
          });

          realtimePrice.update((n) => (n = res?.data));
        }
      });
    }
  } catch (error) {
    console.error("Socket error", error);
  }
};
