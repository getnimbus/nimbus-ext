---
label: Holding profit and loss
layout: default
icon: pulse
---

# Holding profit and loss

For token holding, the profit and loss is only calculated by Swapping event (On DEX - Uniswap, SushiSwap, KyberSwap), so basic sending token will not impact your profit and loss

Let said we have some transacations for WBTC

| Tx  | Event   | Token In         | Token Out          |
| --- | ------- | ---------------- | ------------------ |
| 1   | Deposit | +1 BTC (10 000$) |
| 2   | Swap    | -0.5BTC          | +4000 USDT (4000$) |
| 3   | Swap    | -0.2BTC          | +0.5 ETH (3000$)   |
| 4   | Swap    | +0.4BTC          | -2000 USDT (2000$) |

---

Current state: 0.6 BTC, 0.5 ETH, 2 000 USDT

_The Tx 1 will be ignore for calculate since it is Deposit event_

Total cost: (4000 + 3000 - 2000) = 5000$ (All converted to USD)

Let said current BTC Price is 12 000$/BTC

So total holding is: 0.6 BTC (0.6\*12000 = 7 200$)

=> Profit and loss = Current Value - Total cost = 7 200 - 5 000 = 2 200$
