import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";
import ledgerModule from "@web3-onboard/ledger";
import coinbaseModule from "@web3-onboard/coinbase";

const injected = injectedModule();
const coinbaseWallet = coinbaseModule();
const ledger = ledgerModule({ chainId: 1, walletConnectVersion: 1 });

const wallets = [
  injected,
  coinbaseWallet,
  ledger
]

const chains = [
  {
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum Mainnet',
  }
]

const onboard = Onboard({
  wallets,
  chains,
  accountCenter: {
    desktop: {
      enabled: false,
      position: 'bottomLeft'
    },
    mobile: {
      enabled: false,
      position: 'bottomLeft'
    }
  }
})

export default onboard

