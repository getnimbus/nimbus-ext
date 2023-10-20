# Nimbus - A personalized portfolio tool for Web3 investors

![Nimubs architecture](./doc/intro.png)

Website: https://getnimbus.io

## ✨ USP

- 👀 **On-chain & CEX tracking**: We help you track your investment on Binance, CoinBase, Bybit,… and the biggest chains like Ethereal, Solana, Polygon, BNB, Base,...
- 📊 **Investment metrics** (PnL, Volatility, Returns, Sharpe ratio,…): Most other tools only show what you have right now, but with Nimbus, we give you advantage analysis so you can get your PnL, portfolio volatility, Sharpe ratio, money flow,… You can understand what is going on with your investment, and what the next step to do.
- 👩‍🌾 **Yield farming suggestion**: Don’t just let your token stay the same, we turn your holding into passive income by suggesting yield farming opportunities
- 🐳 **Whale analysis**: The easiest way to gain in this market is to follow the whale, with our hand-pick whale list, you can get their insight, and then make a huge profit like them

## Project Setup

```sh
yarn install
```

## Commands

### Build

#### Development, HMR

```sh
yarn run dev
```

Then after that, load the unpacked extension to the browser under `dist` foler

#### Production

Minifies and optimizes extension build

```sh
yarn run build
```

### Load extension in browser

Loads the contents of the dist directory into the specified browser

```sh
yarn run serve:chrome
```

```sh
yarn run serve:firefox
```
