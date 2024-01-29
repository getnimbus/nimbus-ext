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

const authKey = import.meta.env.VITE_MOBULA_KEY || "fe18f8be-644a-45a8-ad05-b088a5e61764"

export const handleFormatBlockChainId = (chain: string) => {
  let id = ""
  switch (chain) {
    case "FTM": id = "250"; break;
    case "XDAI": id = "100"; break;
    case "AVAX": id = "43114"; break;
    case "CRONOS": id = "25"; break;
    case "ETH": id = "1"; break;
    case "MATIC": id = "137"; break;
    case "BNB": id = "56"; break;
    case "KLAY": id = "8217"; break;
    case "AURA": id = "1313161554"; break;
    case "ARB": id = "42161"; break;
    case "OP": id = "10"; break;
    case "BASE": id = "8453"; break;
    case "SUI": id = "sui"; break;
    case "MANTLE": id = "5000"; break;
  }
  return id
}

export const priceMobulaSubscribe = (
  data: string[] | number[],
  chain: string,
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
        realtimePrice.update((n) => n = cached[key])
      } else {
        if (chain === "CEX") {
          mobulaSocket.send(
            JSON.stringify({
              type: "market",
              authorization: authKey,
              payload: {
                assets: data.map((item) => {
                  return {
                    symbol: item
                  }
                }),
                interval: 15
              }
            })
          )
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
                    blockchain: handleFormatBlockChainId(chain)
                  }
                }),
                interval: 15
              }
            })
          )
        }
      }

      mobulaSocket.addEventListener("message", (ev) => {
        const res = decodeEvent(ev);
        if (res?.data && Object.keys(res?.data).length !== 0) {
          const keyData = Object.keys(res?.data)

          if (!cached[key] && JSON.stringify(key.split('-')[0].split(",")) !== JSON.stringify(keyData)) {
            cached[key] = res?.data;
          }

          realtimePrice.update((n) => n = res?.data)
        }
      });
    }
  } catch (error) {
    console.error("Socket error", error);
  }
};