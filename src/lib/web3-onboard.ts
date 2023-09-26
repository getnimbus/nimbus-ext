import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import ledgerModule from "@web3-onboard/ledger";
import coinbaseModule from "@web3-onboard/coinbase";

const injected = injectedModule();
const coinbaseWallet = coinbaseModule();
const ledger = ledgerModule({ chainId: 1, walletConnectVersion: 1 });

const wallets = [injected, coinbaseWallet, ledger];

const chains = [
  {
    id: 1,
    token: "ETH",
    label: "Ethereum Mainnet",
    rpcUrl: "https://rpc.ankr.com/eth",
  },
];

const onboard = Onboard({
  wallets,
  chains,
  appMetadata: {
    name: "Nimbus",
    description: "A personalized portfolio for Web3 investors",
  },
  accountCenter: {
    desktop: {
      enabled: false,
      position: "bottomLeft",
    },
    mobile: {
      enabled: false,
      position: "bottomLeft",
    },
  },
});

export default onboard;
