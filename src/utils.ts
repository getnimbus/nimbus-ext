import numeral from "numeral";
import jwt_decode from "jwt-decode";
import { nimbus } from "./lib/network";
import { groupBy } from "lodash";

import logo from "~/assets/bitcoin.png";
import Bnb from "~/assets/bnb.png";
import Ethereum from "~/assets/ethereum.png";
import Bitcoin from "~/assets/bitcoin.png";
import Matic from "~/assets/matic.png";
import Optimism from "~/assets/optimism.png";
import Avax from "~/assets/avax.png";
import Solana from "~/assets/solana.png";
import Arbitrum from "~/assets/arbitrum.png";
import Gnosis from "~/assets/gnosis.png";

export const ExtensionsID = "hjlilcigcidfaialcihialehachkldfd";

export const ETHAddressRegex = /(\b0x[a-fA-F0-9]{40}\b)/g
export const ETHTrxRegex = /(\b0x[a-fA-F0-9]{64}\b)/g
export const BTCAddressRegex = /(\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}\b)/g
export const BTCTrxRegex = /(\b(?!0x.*$)[a-fA-F0-9]{64}\b)/g
export const SOLAddressRegex = /(\b[a-zA-Z0-9]{32,44}\b)/g
export const SOLTrxRegex = /(\b[a-zA-Z0-9]{87,88}\b)/g

export const regexList = [
  {
    name: "ETH",
    regex_address: ETHAddressRegex,
    regex_trx: ETHTrxRegex
  },
  {
    name: "BTC",
    regex_address: BTCAddressRegex,
    // regex_trx: BTCTrxRegex
  },
  // {
  //   name: "Solana",
  //   regex_address: SOLAddressRegex,
  //   regex_trx: SOLTrxRegex
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

export const netWorthFilter = [
  {
    label: "1k - 50K",
    value: "networth > 1000 AND networth < 50000",
  },
  {
    label: "50K - 100K",
    value: "networth > 50000 AND networth < 100000",
  },
  {
    label: "> 100K",
    value: "networth > 100000",
  },
];

export const sharpeRatioFilter = [
  {
    label: "< 1",
    value: "sharpeRatio < 1",
  },
  {
    label: "> 1",
    value: "sharpeRatio > 1",
  },
  {
    label: "1 - 2",
    value: "sharpeRatio > 1 AND sharpeRatio < 2",
  },
  {
    label: "> 2",
    value: "sharpeRatio > 2",
  },
];

export const volatilityFilter = [
  {
    label: "0-10%",
    value: "volatility > 0 AND volatility < 10",
  },
  {
    label: "10% - 50%",
    value: "volatility > 10 AND volatility < 50",
  },
  {
    label: "> 50%",
    value: "volatility > 50",
  },
];

export const returnsFilter = [
  {
    label: "1D > 0",
    value: "change1D > 0",
  },
  {
    label: "7D > 0",
    value: "change7D > 0",
  },
  {
    label: "30D > 0",
    value: "change30D > 0",
  },
  {
    label: "1Y > 0",
    value: "change1Y > 0",
  },
];

export const typeList = [
  {
    label: "Category",
    value: "category",
  },
  {
    label: "Sector",
    value: "sector",
  },
  {
    label: "Market Cap",
    value: "rank",
  },
];

export const typeTrx = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "Send",
    value: "send",
  },
  {
    label: "Receive",
    value: "receive",
  },
  {
    label: "Exchange",
    value: "exchange",
  },
];

export const typePieChart = [
  {
    label: "Token",
    value: "token",
  },
  {
    label: "NFT",
    value: "nft",
  },
]

export const typePackage = [
  {
    label: "Monthly",
    value: "month",
  },
  {
    label: "Yearly (Save 17%)",
    value: "year",
  },
]

export const performanceTypeChart = [
  {
    label: "Line",
    value: "line",
  },
  {
    label: "Bar",
    value: "bar",
  },
]

export const performanceTypeChartPortfolio = [
  {
    label: "Percent Change",
    value: "percent",
  },
  {
    label: "Net Worth",
    value: "networth",
  },
]

export const returnType = [
  {
    label: "Overview",
    value: "overview",
  },
  {
    label: "By month",
    value: "month",
  },
]

export const getAddressContext = (address: string) => {
  if (!address) {
    return undefined;
  }

  if (address.match(ETHAddressRegex)) {
    return {
      type: 'EVM',
      address
    }
  }

  if (address.match(BTCAddressRegex)) {
    return {
      type: 'BTC',
      address
    }
  }

  return undefined;
}

export const detectedChain = (type) => {
  let chain
  switch (type) {
    case "ETH":
      chain = Ethereum
      break;
    case "XDAI":
      chain = Gnosis
      break;
    case "BNB":
      chain = Bnb
      break;
    case "MATIC":
      chain = Matic
      break;
    case "OP":
      chain = Optimism
      break;
    case "AVAX":
      chain = Avax
      break;
    case "ARB":
      chain = Arbitrum
      break;
    default:
      chain = logo
  }
  return chain
}

export const linkExplorer = (chain, hash) => {
  let links = {
    trx: "",
    address: ""
  }
  switch (chain) {
    case "BTC":
      links = {
        trx: `https://www.oklink.com/btc/tx/${hash}`,
        address: `https://www.oklink.com/btc/address/${hash}`
      }
      break;
    case "ETH":
      links = {
        trx: `https://etherscan.io/tx/${hash}`,
        address: `https://etherscan.io/address/${hash}`
      }
      break;
    case "XDAI":
      links = {
        trx: `https://gnosisscan.io/tx/${hash}`,
        address: `https://gnosisscan.io/address/${hash}`
      }
      break;
    case "BNB":
      links = {
        trx: `https://bscscan.com/tx/${hash}`,
        address: `https://bscscan.com/address/${hash}`,
      }
      break;
    case "MATIC":
      links = {
        trx: `https://polygonscan.com/tx/${hash}`,
        address: `https://polygonscan.com/address/${hash}`,
      }
      break;
    case "OP":
      links = {
        trx: `https://optimistic.etherscan.io/tx/${hash}`,
        address: `https://optimistic.etherscan.io/address/${hash}`,
      }
      break;
    case "AVAX":
      links = {
        trx: `https://snowtrace.io/tx/${hash}`,
        address: `https://snowtrace.io/address/${hash}`,
      }
      break;
    case "ARB":
      links = {
        trx: `https://arbiscan.io/tx/${hash}`,
        address: `https://arbiscan.io/address/${hash}`,
      }
      break;
    default:
      links = {
        trx: "",
        address: ""
      }
  }
  return links
}

export const listProviderCEX = [
  "binance",
  "binanceus",
  "bitfinex",
  "bittrex",
  "bitvavo",
  "blockchaincom",
  "coinbasepro",
  "coindcx",
  "coinspot",
  "cointracking",
  "cryptocom",
  "gateio",
  "gemini",
  "kraken",
  "kucoin",
  "ndax",
  "newton",
  "poloniex",
  "wazirx",
  "bitmart",
  "bybit",
  "huobi",
  "mexc",
  "okx",
  "wavesexchange",
  "bitrue",
  "ascendex",
  "bitso",
  "upbit",
  "bitstamp",
]

export const listLogoCEX = [
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/270.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/89.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/24.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/311.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/521.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/294.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/70.png",
  "https://s2.coinmarketcap.com/static/img/exchanges/64x64/37.png",
];

export const chainList = [
  {
    logo: logo,
    label: "All chains",
    value: "ALL",
  },
  {
    logo: Ethereum,
    label: "Ethereum",
    value: "ETH",
  },
  {
    logo: Bnb,
    label: "BNB",
    value: "BNB",
  },
  {
    logo: Matic,
    label: "Matic",
    value: "MATIC",
  },
  {
    logo: Optimism,
    label: "Optimism",
    value: "OP",
  },
  {
    logo: Avax,
    label: "Avax",
    value: "AVAX",
  },
  {
    logo: Arbitrum,
    label: "Arbitrum",
    value: "ARB",
  },
  {
    logo: Gnosis,
    label: "Gnosis",
    value: "XDAI",
  },
  {
    logo: Solana,
    label: "Solana",
    value: "SOL",
  },
];

export const showChatAnimationVariants = {
  visible: { opacity: 1, y: 0, display: "flex" },
  hidden: { opacity: 0, y: 500, display: "none" },
};

export const showChangeLogAnimationVariants = {
  visible: { opacity: 1, y: 0, display: "flex" },
  hidden: { opacity: 0, y: -20, display: "none" },
};

export const showOverlayAnimationVariants = {
  visible: { opacity: 1, y: 0, display: "block" },
  hidden: { opacity: 0, y: -50, display: "none" },
};

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

export const formatCurrencyV2 = (input: number) => {
  return numeral(input).format("0,0.00") === "NaN"
    ? formatLongNumber(input)
    : numeral(input).format("0,0.00");
};

export const formatCurrency = (input: number) => {
  return numeral(input).format("0,0.000000") === "NaN"
    ? formatLongNumber(input)
    : numeral(input).format("0,0.0[00000]");
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

export const formatBigBalance = (input: number) => {
  if (checkFormatBalance(input) === "NaN") {
    return {
      number_format: formatSmallBalance(input),
      number_size: ""
    }
  } else {
    const regExp = /[a-zA-Z]/g;
    const numberFormat = numeral(input).format("0.00a")
    if (regExp.test(numberFormat)) {
      return {
        number_format: Number(numberFormat.slice(0, -1)),
        number_size: numberFormat.slice(-1).toUpperCase()
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

export const shorterName = (string: string, length: number = 10) => {
  if (string?.length > length) {
    return string.slice(0, length) + "...";
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

export const add3Dots = (string: string, limit: number) => {
  const dots = "...";
  if (string.length > limit) {
    string = string.substring(0, limit) + dots;
  }
  return string;
}

export const handleGetAccessToken = async (code: string) => {
  const res = await nimbus.post("/auth", {
    code,
    direct_url:
      APP_TYPE.TYPE === "EXT"
        ? `https://${ExtensionsID}.chromiumapp.org`
        : "https://app.getnimbus.io",
  }).then((response) => response)
  if (res.data) {
    localStorage.setItem("token", JSON.stringify(res.data));
    if (APP_TYPE.TYPE !== "EXT") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    return jwt_decode(res.data.id_token);
  }
};

export const handleFormatDataPieChart = (data, type) => {
  const formatData = data.map((item) => {
    return {
      ...item,
      value: Number(item?.amount) * Number(item?.price?.price),
    };
  });

  const groupData = groupBy(formatData, type);
  const typesData = Object.getOwnPropertyNames(groupData);

  const formatGroupData = typesData.map((item) => {
    return {
      logo: undefined,
      name: item,
      symbol: "",
      name_ratio: "Ratio",
      value: 0,
      name_value: "Value",
      value_value: groupData[item].reduce(
        (prev, item) => prev + Number(item.value),
        0
      ),
      name_balance: "Balance",
      value_balance: groupData[item].reduce(
        (prev, item) => prev + Number(item.amount),
        0
      ),
    };
  });

  const sumData = formatGroupData.reduce(
    (prev, item) => prev + Number(item.value_value),
    0
  );

  return formatGroupData.map((item) => {
    return {
      logo: item.logo,
      name: item.name,
      symbol: "",
      name_ratio: item.name_ratio,
      value: (Number(item.value_value) / sumData) * 100,
      name_value: item.name_value,
      value_value: item.value_value,
      name_balance: item.name_balance,
      value_balance: item.value_balance,
    };
  });
};

export const handleFormatDataTable = (data, type) => {
  let formatData = data.map((item) => {
    return {
      ...item,
      value: Number(item?.amount) * Number(item?.price?.price),
      market_price: Number(item?.price?.price) || 0,
    };
  });

  let groupData = groupBy(formatData, type);
  let typesData = Object.getOwnPropertyNames(groupData);

  let formatGroupData = typesData.map((item) => {
    return {
      name: item,
      data: groupData[item],
    };
  });

  return {
    select: typesData.map((item) => {
      return {
        value: item,
        label: item,
      };
    }),
    data: formatGroupData,
  };
};
