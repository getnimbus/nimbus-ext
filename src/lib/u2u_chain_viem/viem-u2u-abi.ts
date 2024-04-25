export const wagmiU2UAbi = [
  {
    "type": "constructor",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "type": "address",
        "name": "_token",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "event",
    "name": "RedeemSuccess",
    "inputs": [
      {
        "type": "address",
        "name": "sender",
        "internalType": "address",
        "indexed": true
      },
      {
        "type": "uint256",
        "name": "value",
        "internalType": "uint256",
        "indexed": false
      }
    ],
    "anonymous": false
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [
      {
        "type": "bool",
        "name": "",
        "internalType": "bool"
      }
    ],
    "name": "depositPrize",
    "inputs": [
      {
        "type": "tuple[]",
        "name": "_winnersList",
        "internalType": "struct GMPrizePool.Winner[]",
        "components": [
          {
            "type": "address",
            "name": "winnerAddress",
            "internalType": "address"
          },
          {
            "type": "uint256",
            "name": "prizeAmount",
            "internalType": "uint256"
          }
        ]
      },
      {
        "type": "uint256",
        "name": "_expiredTime",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "uint256",
        "name": "",
        "internalType": "uint256"
      }
    ],
    "name": "expiredTime",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [
      {
        "type": "bool",
        "name": "",
        "internalType": "bool"
      }
    ],
    "name": "getPrizeBack",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "tuple",
        "name": "",
        "internalType": "struct GMPrizePool.Winner",
        "components": [
          {
            "type": "address",
            "name": "winnerAddress",
            "internalType": "address"
          },
          {
            "type": "uint256",
            "name": "prizeAmount",
            "internalType": "uint256"
          }
        ]
      }
    ],
    "name": "getWinner",
    "inputs": [
      {
        "type": "address",
        "name": "account",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "function",
    "stateMutability": "view",
    "outputs": [
      {
        "type": "address",
        "name": "",
        "internalType": "address"
      }
    ],
    "name": "owner",
    "inputs": []
  },
  {
    "type": "function",
    "stateMutability": "nonpayable",
    "outputs": [
      {
        "type": "bool",
        "name": "",
        "internalType": "bool"
      }
    ],
    "name": "redeemPrize",
    "inputs": []
  }
] as const;