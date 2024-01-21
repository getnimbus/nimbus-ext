import Solana from "~/assets/solana.png";
import Aura from "~/assets/aura.png";
import Bitcoin from "~/assets/bitcoin.png";
import Near from "~/assets/near.png";

import Ton from "~/assets/ton.png";
import Sui from "~/assets/sui.png";

import All from "~/assets/all.svg";
import Bnb from "~/assets/bnb.png";
import Ethereum from "~/assets/ethereum.png";
import Matic from "~/assets/matic.png";
import Optimism from "~/assets/optimism.png";
import Avax from "~/assets/avax.png";
import Arbitrum from "~/assets/arbitrum.png";
import Gnosis from "~/assets/gnosis.png";
import Base from "~/assets/base.svg";
import Scroll from "~/assets/scroll.png";
import ZkSync from "~/assets/zksync.png";
import Linea from "~/assets/linea.png";
import Cronos from "~/assets/cronos.png";
import Mantle from "~/assets/mantle.png";
import Algorand from "~/assets/algorand.png";
import Exzo from "~/assets/exzo.png";
import Klaytn from "~/assets/klaytn.png";
import Viction from "~/assets/viction.png";
import Moonbeam from "~/assets/moonbeam.png";
import Aurora from "~/assets/aurora.png";
import Evmos from "~/assets/evmos.png";
import Fantom from "~/assets/fantom.png";
import Harmony from "~/assets/harmony.png";
import Metis from "~/assets/metis.png";
import Ronin from "~/assets/ronin.png";
import Zeta from "~/assets/zeta.png";
import zkEVM from "~/assets/zkEVM.png";
import opBNB from "~/assets/opbnb.png";

export const listProviderCEX = [
  "binance",
  "binanceus",
  "bitfinex",
  "bittrex",
  "bitvavo",
  "blockchaincom",
  "coinbase",
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
];

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

export const chainSupportedList = ["BUNDLE", "EVM", "CEX", "MOVE", "SOL", "NEAR", "TON", "ALGO", "AURA"];
export const evmChainNotSupportHistoricalBalances = ["VIC", "MANTLE", "CRONOS", "LINEA", "ZKSYNC", "XDAI", "ARB", "AVAX", "OP", "BASE", "SCROLL", "KLAY", "XZO", "ZETA", "RON", "FANTOM", "AURORA", "EVMOS", "ONE", "GLMR", "METIS", "POLYGON_ZKEVM", "OPBNB"];

export const chainMoveList = [
  {
    logo: All,
    label: "All chains",
    value: "ALL",
  },
  {
    logo: Sui,
    label: "Sui",
    value: "SUI",
  },
];

export const chainList = [
  {
    logo: All,
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
    logo: opBNB,
    label: "opBNB",
    value: "OPBNB",
  },
  {
    logo: Matic,
    label: "Polygon",
    value: "MATIC",
  },
  {
    logo: zkEVM,
    label: "Polygon zkEVM",
    value: "POLYGON_ZKEVM",
  },
  {
    logo: Optimism,
    label: "Optimism",
    value: "OP",
  },
  {
    logo: Avax,
    label: "Avalanche",
    value: "AVAX",
  },
  {
    logo: Arbitrum,
    label: "Arbitrum",
    value: "ARB",
  },
  {
    logo: Base,
    label: "Base",
    value: "BASE",
  },
  {
    logo: Scroll,
    label: "Scroll",
    value: "SCROLL",
  },
  {
    logo: Gnosis,
    label: "Gnosis",
    value: "XDAI",
  },
  {
    logo: ZkSync,
    label: "ZkSync",
    value: "ZKSYNC",
  },
  {
    logo: Linea,
    label: "Linea",
    value: "LINEA",
  },
  {
    logo: Cronos,
    label: "Cronos",
    value: "CRONOS",
  },
  {
    logo: Mantle,
    label: "Mantle",
    value: "MANTLE",
  },
  {
    logo: Exzo,
    label: "Exzo",
    value: "XZO",
  },
  {
    logo: Klaytn,
    label: "Klaytn",
    value: "KLAY",
  },
  {
    logo: Viction,
    label: "Viction",
    value: "VIC",
  },
  {
    logo: Zeta,
    label: "Zeta",
    value: "ZETA",
  },
  {
    logo: Fantom,
    label: "Fantom",
    value: "FANTOM",
  },
  {
    logo: Evmos,
    label: "Evmos",
    value: "EVMOS",
  },
  {
    logo: Harmony,
    label: "Harmony",
    value: "ONE",
  },
  {
    logo: Moonbeam,
    label: "Moonbeam",
    value: "GLMR",
  },
  {
    logo: Metis,
    label: "Metis",
    value: "METIS",
  },
  {
    logo: Aurora,
    label: "Aurora",
    value: "AURORA",
  },
  {
    logo: Ronin,
    label: "Ronin",
    value: "RON",
  },
];

export const detectedChain = (type) => {
  let chain;
  switch (type) {
    case "BTC":
      chain = Bitcoin;
      break;
    case "ALL":
      chain = Bitcoin;
      break;
    case "AURA":
      chain = Aura;
      break;
    case "SUI":
      chain = Sui;
      break;
    case "SOL":
      chain = Solana;
      break;
    case "NEAR":
      chain = Near;
      break;
    case "TON":
      chain = Ton;
      break;
    case "ALGO":
      chain = Algorand;
      break;
    case "ETH":
      chain = Ethereum;
      break;
    case "XDAI":
      chain = Gnosis;
      break;
    case "BNB":
      chain = Bnb;
      break;
    case "MATIC":
      chain = Matic;
      break;
    case "OP":
      chain = Optimism;
      break;
    case "AVAX":
      chain = Avax;
      break;
    case "ARB":
      chain = Arbitrum;
      break;
    case "BASE":
      chain = Base;
      break;
    case "SCROLL":
      chain = Scroll;
      break;
    case "ZKSYNC":
      chain = ZkSync;
      break;
    case "LINEA":
      chain = Linea;
      break;
    case "CRONOS":
      chain = Cronos;
      break;
    case "MANTLE":
      chain = Mantle;
      break;
    case "XZO":
      chain = Exzo;
      break;
    case "KLAY":
      chain = Klaytn;
      break;
    case "VIC":
      chain = Viction;
      break;
    case "ZETA":
      chain = Zeta;
      break;
    case "FANTOM":
      chain = Fantom;
      break;
    case "EVMOS":
      chain = Evmos;
      break;
    case "ONE":
      chain = Harmony;
      break;
    case "GLMR":
      chain = Moonbeam;
      break;
    case "METIS":
      chain = Metis;
      break;
    case "AURORA":
      chain = Aurora;
      break;
    case "RON":
      chain = Ronin;
      break;
    case "POLYGON_ZKEVM":
      chain = zkEVM;
      break;
    case "OPBNB":
      chain = opBNB;
      break;
  }
  return chain;
};

export const linkExplorer = (chain, hash) => {
  let links = {
    trx: "",
    address: "",
  };
  switch (chain) {
    case "BTC":
      links = {
        trx: `https://www.oklink.com/btc/tx/${hash}`,
        address: `https://www.oklink.com/btc/address/${hash}`,
      };
      break;
    case "SOL":
      links = {
        trx: `https://solscan.io/tx/${hash}`,
        address: `https://solscan.io/address/${hash}`,
      };
      break;
    case "NEAR":
      links = {
        trx: `https://nearblocks.io/txns/${hash}`,
        address: `https://nearblocks.io/address/${hash}`,
      };
      break;
    case "TON":
      links = {
        trx: `https://tonscan.org/tx/${hash}`,
        address: `https://tonscan.org/address/${hash}#transactions`,
      };
      break;
    case "SUI":
      links = {
        trx: `https://suiexplorer.com/txblock/${hash}`,
        address: `https://suiexplorer.com/address/${hash}`,
      };
      break;
    case "AURA":
      links = {
        trx: `https://aurascan.io/transaction/${hash}`,
        address: `https://aurascan.io/account/${hash}`,
      };
      break;
    case "ALGO":
      links = {
        trx: `https://algoexplorer.io/tx/${hash}`,
        address: `https://algoexplorer.io/address/${hash}`,
      };
      break;
    case "ETH":
      links = {
        trx: `https://etherscan.io/tx/${hash}`,
        address: `https://etherscan.io/address/${hash}`,
      };
      break;
    case "XDAI":
      links = {
        trx: `https://gnosisscan.io/tx/${hash}`,
        address: `https://gnosisscan.io/address/${hash}`,
      };
      break;
    case "BNB":
      links = {
        trx: `https://bscscan.com/tx/${hash}`,
        address: `https://bscscan.com/address/${hash}`,
      };
      break;
    case "MATIC":
      links = {
        trx: `https://polygonscan.com/tx/${hash}`,
        address: `https://polygonscan.com/address/${hash}`,
      };
      break;
    case "OP":
      links = {
        trx: `https://optimistic.etherscan.io/tx/${hash}`,
        address: `https://optimistic.etherscan.io/address/${hash}`,
      };
      break;
    case "AVAX":
      links = {
        trx: `https://snowtrace.io/tx/${hash}`,
        address: `https://snowtrace.io/address/${hash}`,
      };
      break;
    case "ARB":
      links = {
        trx: `https://arbiscan.io/tx/${hash}`,
        address: `https://arbiscan.io/address/${hash}`,
      };
      break;
    case "BASE":
      links = {
        trx: `https://basescan.org/tx/${hash}`,
        address: `https://basescan.org/address/${hash}`,
      };
      break;
    case "SCROLL":
      links = {
        trx: `https://blockscout.scroll.io/tx/${hash}`,
        address: `https://blockscout.scroll.io/address/${hash}`,
      };
      break;
    case "ZKSYNC":
      links = {
        trx: `https://explorer.zksync.io/tx/${hash}`,
        address: `https://explorer.zksync.io/address/${hash}`,
      };
      break;
    case "LINEA":
      links = {
        trx: `https://lineascan.build/tx/${hash}`,
        address: `https://lineascan.build/address/${hash}`,
      };
      break;
    case "CRONOS":
      links = {
        trx: `https://cronoscan.com/tx/${hash}`,
        address: `https://cronoscan.com/address/${hash}`,
      };
      break;
    case "MANTLE":
      links = {
        trx: `https://mantlescan.info/tx/${hash}`,
        address: `https://mantlescan.info/address/${hash}`,
      };
      break;
    case "XZO":
      links = {
        trx: `https://evm.exzoscan.io/tx/${hash}`,
        address: `https://evm.exzoscan.io/address/${hash}`,
      };
      break;
    case "KLAY":
      links = {
        trx: `https://klaytnscope.com/tx/${hash}`,
        address: `https://klaytnscope.com/account/${hash}`,
      };
      break;
    case "VIC":
      links = {
        trx: `https://tomoscan.io/tx/${hash}`,
        address: `https://tomoscan.io/address/${hash}`,
      };
      break;
    case "ZETA":
      links = {
        trx: `https://explorer.zetachain.com/evm/tx/${hash}`,
        address: `https://explorer.zetachain.com/address/${hash}`
      };
      break;
    case "FANTOM":
      links = {
        trx: `https://ftmscan.com/tx/${hash}`,
        address: `https://ftmscan.com/address/${hash}`,
      };
      break;
    case "EVMOS":
      links = {
        trx: `https://escan.live/tx/${hash}`,
        address: `https://escan.live/address/${hash}`,
      };
      break;
    case "ONE":
      links = {
        trx: `https://explorer.harmony.one/tx/${hash}`,
        address: `https://explorer.harmony.one/address/${hash}`,
      };
      break;
    case "GLMR":
      links = {
        trx: `https://moonscan.io/tx/${hash}`,
        address: `https://moonscan.io/address/${hash}`,
      };
      break;
    case "METIS":
      links = {
        trx: `https://andromeda-explorer.metis.io/tx/${hash}`,
        address: `https://andromeda-explorer.metis.io/address/${hash}`,
      };
      break;
    case "POLYGON_ZKEVM":
      links = {
        trx: `https://zkevm.polygonscan.com/tx/${hash}`,
        address: `https://zkevm.polygonscan.com/address/${hash}`,
      };
      break;
    case "OPBNB":
      links = {
        trx: `https://opbnbscan.com/tx/${hash}`,
        address: `https://opbnbscan.com/address/${hash}`,
      };
      break;
    case "AURORA":
      links = {
        trx: `https://explorer.aurora.dev/tx/${hash}`,
        address: `https://explorer.aurora.dev/address/${hash}`,
      };
      break;
    case "RON":
      links = {
        trx: `https://app.roninchain.com/tx/${hash}`,
        address: `https://app.roninchain.com/address/${hash}`,
      };
      break;
    default:
      links = {
        trx: "",
        address: "",
      };
  }
  return links;
};

const ETHAddressRegex = /(\b0x[a-fA-F0-9]{40}\b)/g;
const ETHTrxRegex = /(\b0x[a-fA-F0-9]{64}\b)/g;
const BTCAddressRegex = /(\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}\b)/g;
const BTCTrxRegex = /(\b(?!0x.*$)[a-fA-F0-9]{64}\b)/g;
const SOLAddressRegex = /(\b[a-zA-Z0-9]{32,44}\b)/g;
const SOLTrxRegex = /(\b[a-zA-Z0-9]{87,88}\b)/g;

export const regexList = [
  {
    name: "ETH",
    regex_address: ETHAddressRegex,
    regex_trx: ETHTrxRegex,
  },
  {
    name: "BTC",
    regex_address: BTCAddressRegex,
    regex_trx: BTCTrxRegex
  },
  {
    name: "Solana",
    regex_address: SOLAddressRegex,
    regex_trx: SOLTrxRegex
  },
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
];

export const getAddressContext = (address: string) => {
  if (!address) {
    return undefined;
  }

  if (address.match(ETHAddressRegex)) {
    return {
      type: "EVM",
      address,
    };
  }

  if (address.match(BTCAddressRegex)) {
    return {
      type: "BTC",
      address,
    };
  }

  if (address.match(SOLAddressRegex)) {
    return {
      type: "SOL",
      address,
    };
  }

  return undefined;
};
