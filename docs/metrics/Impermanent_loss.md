---
label: Impermanent loss
layout: default
icon: alert
---

# Impermanent Loss

Impermanent loss is a phenomenon that occurs in liquidity provision or yield farming on decentralized exchanges (DEXs) and automated market maker (AMM) platforms. It refers to the temporary reduction in the value of an asset when providing liquidity compared to holding the same assets separately.

## How it Works

When you provide liquidity to a DEX or AMM, you typically deposit a pair of assets (e.g., token A and token B) into a liquidity pool. In return, you receive LP tokens representing your share of the pool. These LP tokens can be used to redeem your share of the liquidity pool at any time.

Impermanent loss arises when the prices of the deposited tokens change relative to each other while you are providing liquidity. Let's consider an example:

Suppose you deposit 1 ETH and 1000 DAI into an ETH-DAI liquidity pool. At the time of deposit, the price of 1 ETH is equivalent to 1000 DAI. After some time, the price of ETH increases to 1200 DAI, while the price of DAI remains constant.

## Calculation of Impermanent Loss

Impermanent loss is calculated by comparing the value of your initial deposit to the value of the same assets if you had held them separately. In our example:

- Value of initial deposit: 1 ETH \* 1000 DAI = 1000 DAI
- Value of separate holdings:
  - ETH: 1 ETH \* 1200 DAI = 1200 DAI
  - DAI: 1000 DAI

The difference between the value of your initial deposit and the value of separate holdings is the impermanent loss:

- Impermanent loss = Value of separate holdings - Value of initial deposit
- Impermanent loss = (1200 DAI + 1000 DAI) - 1000 DAI = 1200 DAI

In this example, you would experience an impermanent loss of 1200 DAI.

## Implications and Risk Mitigation

Impermanent loss can occur when the prices of the deposited tokens diverge significantly. The greater the price divergence, the higher the impermanent loss. However, it is important to note that impermanent loss is temporary and can be mitigated by various strategies.

Some approaches to mitigate impermanent loss include:

- Selecting liquidity pools with low volatility between the deposited assets.
- Focusing on providing liquidity to stablecoin pairs that are less prone to price fluctuations.
- Utilizing impermanent loss insurance products offered by certain platforms.
- Active portfolio management techniques to rebalance and adjust liquidity positions.

It is crucial to carefully assess the risks and rewards before engaging in liquidity provision or yield farming activities to make informed decisions.
