import numeral from "numeral";

export const regexList = [
  {
    name: "ETH",
    regex_address: /(\b0x[a-fA-F0-9]{40}\b)/g,
    regex_trx: /(\b0x[a-fA-F0-9]{64}\b)/g
  },
  // {
  //   name: "BTC",
  //   regex_address: /(\b(?!0x.*$)([13]|bc1)[a-zA-HJ-NP-Z0-9]{25,39}\b)/g,
  //   regex_trx: /(\b(?!0x.*$)[a-fA-F0-9]{64}\b)/g
  // },
  // {
  //   name: "Solana",
  //   regex_address: /(\b[a-zA-Z0-9]{32,44}\b)/g,
  //   regex_trx: /(\b[a-zA-Z0-9]{87,88}\b)/g
  // },
  // {
  //   name: "NEAR",
  //   regex_address: /(\b[a-zA-Z0-9]{64}\b)/g,
  //   regex_trx: /(\b[a-zA-Z0-9]{43,44}\b)/g,
  // },
  // {
  //   name: "NEAR1",
  //   regex_address: /(\b\w+(?:\.\w+)*\.near\b)/g,
  //   regex_trx: /(\b[a-zA-Z0-9]{43,44}\b)/g,
  // }
]

export const exponentialToDecimal = (exponential: number) => {
  let decimal = exponential.toString().toLowerCase();
  if (decimal.includes("e+")) {
    const exponentialSplitted = decimal.split("e+");
    let postfix = "";
    for (
      let i = 0;
      i <
      +exponentialSplitted[1] -
      (exponentialSplitted[0].includes(".")
        ? exponentialSplitted[0].split(".")[1].length
        : 0);
      i++
    ) {
      postfix += "0";
    }
    const addCommas = (text) => {
      let j = 3;
      let textLength = text.length;
      while (j < textLength) {
        text = `${text.slice(0, textLength - j)},${text.slice(
          textLength - j,
          textLength
        )}`;
        textLength++;
        j += 3 + 1;
      }
      return text;
    };
    decimal = addCommas(exponentialSplitted[0].replace(".", "") + postfix);
  }
  if (decimal.toLowerCase().includes("e-")) {
    const exponentialSplitted = decimal.split("e-");
    let prefix = "0.";
    for (let i = 0; i < +exponentialSplitted[1] - 1; i++) {
      prefix += "0";
    }
    decimal = prefix + exponentialSplitted[0].replace(".", "");
  }
  return decimal;
};

export const formatLongNumber = (number: number) => {
  if (!number.toString().includes("e-")) {
    return number;
  }
  const firstValueChar = exponentialToDecimal(number).indexOf(
    number.toString().slice(0, 1)
  );
  const zeroReplace = exponentialToDecimal(number).slice(2, firstValueChar);
  const formatNumber = exponentialToDecimal(number).replace(
    zeroReplace,
    "0..."
  );
  return formatNumber;
};

export const formatCurrency = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN"
    ? formatLongNumber(input)
    : numeral(input).format("0,0.00");
};

export const formatBalance = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN" ? formatSmallBalance(input) : numeral(input).format("0,0.00")
};

export const checkFormatBalance = (input: number) => {
  return numeral(input).format("0,0.00")
}

export const formatSmallBalance = (input: number) => {
  return numeral(input).format("0.000e+0");
};

export const formatBigBalance = (input: number, isFormatPercent: boolean) => {
  if (checkFormatBalance(input) === "NaN") {
    return {
      number_format: isFormatPercent ? 0 : formatSmallBalance(input),
      number_size: ""
    }
  } else {
    const regExp = /[a-zA-Z]/g;
    const numberFormat = numeral(input).format("0.00a")
    if (regExp.test(numberFormat)) {
      return {
        number_format: Number(numberFormat.slice(0, -1)),
        number_size: numberFormat.slice("-1").toUpperCase()
      }
    } else {
      return {
        number_format: Number(numberFormat),
        number_size: ""
      }
    }
  }
}

export const shorterAddress = (string: string) => {
  return string ? string.slice(0, 6) + "..." + string.substr(-4) : string;
};

export const shorterName = (string: string) => {
  if (string?.length > 16) {
    return string.slice(0, 16) + "...";
  } else {
    return string
  }
}

export const flattenArray = (arr) => {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
  }, [])
}

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

export const add3Dots = (string: string, limit: number) => {
  const dots = "...";
  if (string.length > limit) {
    string = string.substring(0, limit) + dots;
  }

  return string;
}
