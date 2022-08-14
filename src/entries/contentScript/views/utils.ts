import numeral from "numeral";

export const formatCurrency = (input: number) => {
  return numeral(input.toFixed(2)).format("0,0.00");
};

export const shorterAddress = (string: string) => {
  return string.slice(0, 6) + "...." + string.substr(-4);
};

export const getTokenLogo = (address: string, chainId: number) => {
  return `https://logo.getnimbus.xyz/logo/${chainId}/${address}`;
};

export const getCgLogo = (coinId: string) => {
  return `https://utils.getnimbus.xyz/logo-cg/${coinId}`;
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
