import numeral from "numeral";

export const formatCurrency = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN"
    ? longNumberString(input)
    : numeral(input).format("0,0.00");
};

export const longNumberString = (n) => {
  let str,
    str2 = "",
    mag,
    data = n.toExponential().replace(".", "").split(/e/i);
  (str = data[0]), (mag = Number(data[1]));
  if (mag >= 0 && str.length > mag) {
    mag += 1;
    return str.substring(0, mag) + "." + str.substring(mag);
  }
  if (mag < 0) {
    while (++mag) str2 += "0";
    return "0." + str2 + str;
  }
  mag = mag - str.length + 1;
  while (mag > str2.length) {
    str2 += "0";
  }
  return str + str2;
};

export const formatBalance = (input: number) => {
  return numeral(input).format("0,0.00");
};

export const shorterAddress = (string: string) => {
  return string.slice(0, 6) + "...." + string.substr(-4);
};

export const getTokenLogo = (address: string, chainId: number) => {
  return `https://logo.getnimbus.io/logo/${chainId}/${address}`;
};

export const getCgLogo = (coinId: string) => {
  return `https://api.getnimbus.io/logo-cg/${coinId}`;
};

export const escapeRegex = (string: string) => {
  return string.toString().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

export const getLocalImg = (src: string) => {
  return new URL(src, import.meta.url).href;
};

const CHAIN_IDS = {
  ETH: 1,
  ETH_KOVAN: 42,
  POLYGON: 137,
  POLYGON_TESTNET: 80001,
  AVAX: 43114,
  AVAX_TESTNET: 43113,
  BSC: 56,
  BSC_TESTNET: 97,
  FANTOM: 250,
  FANTOM_TESTNET: 4002,
};

export const chainIdData = (chainId: number) => {
  switch (chainId) {
    case CHAIN_IDS.ETH:
      return {
        explorer: "https://etherscan.io",
        explorerAPI: "https://api.etherscan.io/api",
        explorerAPIKey: "",
        networkName: "Ethereum Mainnet",
        molarisChain: "eth",
        nativeToken: "ETH",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
      };
    case CHAIN_IDS.ETH_KOVAN:
      return {
        explore: "https://kovan.etherscan.io",
        explorerAPI: "",
        explorerAPIKey: "",
        networkName: "Kovan",
        molarisChain: "kov",
        nativeToken: "KOV",
        logo: "",
      };
    case CHAIN_IDS.POLYGON:
      return {
        explore: "https://polygonscan.com",
        explorerAPI: "",
        explorerAPIKey: "",
        networkName: "Polygon Mainnet",
        molarisChain: "matic",
        nativeToken: "MATIC",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png",
      };
    case CHAIN_IDS.POLYGON_TESTNET:
      return {
        explore: "https://mumbai.polygonscan.com",
        explorerAPI: "",
        explorerAPIKey: "",
        networkName: "Mumbai",
        molarisChain: "matic",
        nativeToken: "MATIC",
        logo: "",
      };
    case CHAIN_IDS.AVAX:
      return {
        explore: "https://avascan.info/blockchain/c",
        explorerAPI: "",
        explorerAPIKey: "",
        networkName: "Avalanche C-Chain",
        molarisChain: "avax",
        nativeToken: "AVAX",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png",
      };
    case CHAIN_IDS.AVAX_TESTNET:
      return {
        explore: "https://snowtrace.io",
        explorerAPI: "",
        explorerAPIKey: "",
        networkName: "Avalanche Fuji Testnet",
        molarisChain: "avax",
        nativeToken: "AVAX",
        logo: "",
      };
    case CHAIN_IDS.BSC:
      return {
        explorer: "https://bscscan.com",
        explorerAPI: "https://api.bscscan.com/api/",
        explorerAPIKey: "9RPBSP17IT7YGHAX9Q1CVB2BQB4N8V9U9N",
        networkName: "Binance Smart Chain Mainnet",
        molarisChain: "bsc",
        nativeToken: "BNB",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
      };
    case CHAIN_IDS.BSC_TESTNET:
      return {
        explore: "https://bscscan.com",
        explorerAPI: "",
        explorerAPIKey: "",
        networkName: "Binance Smart Chain Testnet",
        molarisChain: "bsc",
        nativeToken: "tBNB",
        logo: "",
      };
    case CHAIN_IDS.FANTOM:
      return {
        explore: "https://ftmscan.com",
        explorerAPI: "",
        explorerAPIKey: "",
        networkName: "Fantom Opera",
        molarisChain: "ftm",
        nativeToken: "FTM",
        logo: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/fantom/info/logo.png",
      };
    case CHAIN_IDS.FANTOM_TESTNET:
      return {
        explore: "https://ftmscan.com",
        explorerAPI: "",
        explorerAPIKey: "",
        networkName: "Fantom Testnet",
        molarisChain: "ftm",
        nativeToken: "FTM",
        logo: "",
      };
  }

  return null;
};
