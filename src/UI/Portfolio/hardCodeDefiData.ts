import logoDefault from "~/assets/defaultToken.png";

export interface Protocol {
  name: string;
  logo: string;
  url: string;
}

export interface Token {
  contract_address: string;
  symbol: string;
  name?: string;
  decimals: number;
  chain: string; // TODO: CHAIN
  logo: string;
}

export interface Price {
  price: number;
  decimals: number;
  symbol: string;
}

type TokenWithPrice = Token & Price;

export interface TokenState {
  amount: number;
  value: number;
  token: TokenWithPrice;
}

export type TokenStateYield = TokenState & {
  claimable: boolean;
};
export interface FeeState {
  value: number;
  amount?: number;
}

export interface AMM {
  positionId: string;
  owner: string;
  input: TokenState[];
  current: {
    tokens: TokenState[];
    yield: TokenStateYield[];
  };
  fee: FeeState;
  chain: string;
  meta: {
    protocol: Protocol;
  };
}

export interface CLMM {
  positionId: string;
  owner: string;
  input: TokenState[];
  yieldCollected: TokenWithPrice[];
  current: {
    tokens: TokenState[];
    currentPrice: number;
    lowerPrice: number;
    upperPrice: number;
    isInRange: boolean;
    yield: TokenStateYield[];
  };
  chain: string;
  meta: {
    protocol: Protocol;
  };
}

export interface Lending {
  positionId: string;
  owner: string;
  input: TokenState[];
  yieldCollected: TokenState[];
  current: {
    tokens: TokenState[];
    yield: TokenStateYield[];
  };
  fee: FeeState;
  chain: string;
  meta: {
    protocol: Protocol;
  };
}

export interface Borrow {
  positionId: string;
  owner: string;
  input: Lending[];
  yieldCollected: TokenState[];
  current: {
    tokens: TokenState[];
    yield: TokenStateYield[]; // Yield negative value
    healthy?: number;
  };
  fee: FeeState;
  chain: string;
  meta: {
    protocol: Protocol;
  };
}

export interface Stake {
  positionId: string;
  owner: string;
  input: TokenState[];
  yieldCollected: TokenState[];
  current: {
    tokens: TokenState[];
    yield: TokenStateYield[];
  };
  fee: FeeState;
  chain: string;
  meta: {
    protocol: Protocol;
  };
}

export interface Vest {
  positionId: string;
  owner: string;
  input: {
    amount: number;
    token: TokenWithPrice;
  };
  claimed: {
    amount: number;
    token: TokenWithPrice;
  };
  current: {
    amount: number;
    token: TokenWithPrice;
    fee?: {
      amount: number;
      token: TokenWithPrice;
    };
    endDate: Date;
  };
  chain: string;
  meta: {
    protocol: Protocol;
  };
}

export interface Farm {
  positionId: string;
  owner: string;
  input: AMM[] | CLMM[];
  feeCollected: {
    amount: number;
    token: TokenWithPrice;
  }[];
  current: {
    amount: number;
    token: TokenWithPrice;
    fee?: {
      amount: number;
      token: TokenWithPrice;
    };
    healthy?: number;
  };
  chain: string;
  meta: {
    protocol: Protocol;
  };
}

export interface Reward {
  positionId: string;
  owner: string;
  feeCollected: {
    amount: number;
    token: TokenWithPrice;
  }[];
  current: {
    amount: number;
    token: TokenWithPrice;
  };
  chain: string;
  meta: {
    protocol: Protocol;
  };
}

type Position = AMM | CLMM | Lending | Borrow | Stake | Vest | Farm;

// TokenState = [{
//   amount: 0, value: 0, token:{
//     chain:"USDHD", contract_address:"", decimals:18,price:0,symbol:"", name:""
//   }
// }],

export const ammData: AMM[] = [
  {
    positionId:
      "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x2::sui::SUI>",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          logo: logoDefault,
          name: "",
          contract_address: "0x2::sui::SUI",
          symbol: "N/A",
          price: 1.8,

          decimals: 18,

          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 1.8,

            decimals: 18,

            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
        },
      ],
      yield: [
        {
          amount: 0,
          value: 0,
          claimable: true,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 0,
            decimals: 18,
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
          claimable: true,
        },
      ],
    },
    fee: {
      value: 0,
    },
    chain: "string",
    meta: {
      protocol: {
        name: "Scallop",
        logo: "",
        url: "",
      },
    },
  },
];

export const clmmData: CLMM[] = [
  {
    positionId:
      "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x2::sui::SUI>",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          logo: logoDefault,
          name: "",
          contract_address: "0x2::sui::SUI",
          symbol: "N/A",
          price: 1.8,
          decimals: 18,
          chain: "SUI",
        },
      },
    ],
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 1.8,

            decimals: 18,

            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
        },
      ],
      yield: [
        {
          amount: 0,
          value: 0,
          claimable: true,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 0,
            decimals: 18,
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          claimable: true,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
        },
      ],
      currentPrice: 0,
      lowerPrice: 0,
      upperPrice: 0,
      isInRange: true,
    },
    chain: "string",
    meta: {
      protocol: {
        name: "Scallop",
        logo: "",
        url: "",
      },
    },
  },
];

export const protocolData: Lending[] = [
  {
    positionId:
      "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x2::sui::SUI>",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          logo: logoDefault,
          name: "",
          contract_address: "0x2::sui::SUI",
          symbol: "N/A",
          price: 1.8,
          decimals: 18,
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          logo: logoDefault,
          name: "",
          contract_address: "0x2::sui::SUI",
          symbol: "N/A",
          price: 192.12,
          decimals: 18,
          chain: "FISH",
        },
      },
    ],
    yieldCollected: [
      {
        amount: 0,
        value: 0,
        token: {
          logo: logoDefault,
          name: "",
          contract_address: "0x2::sui::SUI",
          symbol: "N/A",
          price: 1.8,
          decimals: 18,
          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 1.8,
            decimals: 18,
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
        },
      ],
      yield: [
        {
          amount: 0,
          value: 0,
          claimable: true,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 0,
            decimals: 18,
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
          claimable: true,
        },
      ],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    meta: {
      protocol: {
        name: "Scallop",
        logo: "",
        url: "",
      },
    },
  },
  {
    positionId:
      "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x2::sui::SUI>",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          logo: logoDefault,
          name: "",
          contract_address: "0x2::sui::SUI",
          symbol: "N/A",
          price: 1.8,

          decimals: 18,

          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          logo: logoDefault,
          name: "",
          contract_address: "0x2::sui::SUI",
          symbol: "N/A",
          price: 192.12,
          decimals: 18,
          chain: "FISH",
        },
      },
    ],
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 1.8,

            decimals: 18,

            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
        },
      ],
      yield: [
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 0,
            decimals: 18,
            chain: "SUI",
          },
          claimable: true,
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
          claimable: true,
        },
      ],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    meta: {
      // txs: [],
      protocol: {
        name: "Scallop",
        logo: "",
        url: "",
      },
    },
  },
];

export const borrowdData: Borrow[] = [
  {
    positionId: "string",
    owner: "string",
    input: protocolData,
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 1.8,

            decimals: 18,

            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
        },
      ],
      yield: [
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 0,
            decimals: 18,
            chain: "SUI",
          },
          claimable: true,
        },
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            name: "",
            contract_address: "0x2::sui::SUI",
            symbol: "N/A",
            price: 192.12,
            decimals: 18,
            chain: "FISH",
          },
          claimable: true,
        },
      ],
      healthy: 0,
    },
    fee: { value: 0, amount: 0 },
    chain: "",
    meta: {
      protocol: {
        logo: "",
        name: "Borrowa bsaj",
        url: "",
      },
    },
  },
];

export const stakeData: Stake[] = [
  {
    positionId: "",
    owner: "",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          logo: logoDefault,
          chain: "USDHD",
          contract_address: "",
          decimals: 18,
          price: 0,
          symbol: "",
          name: "",
        },
      },
    ],
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 0,
          value: 0,
          token: {
            logo: logoDefault,
            chain: "USDHD",
            contract_address: "",
            decimals: 18,
            price: 0,
            symbol: "",
            name: "",
          },
        },
      ],
      yield: [
        {
          amount: 0,
          value: 0,
          claimable: true,
          token: {
            logo: logoDefault,
            chain: "USDHD",
            contract_address: "",
            decimals: 18,
            price: 0,
            symbol: "",
            name: "",
          },
        },
      ],
    },
    fee: { value: 0, amount: 0 },
    chain: "",
    meta: {
      protocol: { logo: "", name: "", url: "" },
    },
  },
];

export const vestData: Vest[] = [
  {
    positionId:
      "0xefe8b36d5b2e43728cc323298626b83177803521d195cfb11e15b910e892fddf::reserve::MarketCoin<0x2::sui::SUI>",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: {
      amount: 0,
      token: {
        logo: logoDefault,
        chain: "USDHD",
        contract_address: "",
        decimals: 18,
        price: 0,
        symbol: "",
        name: "",
      },
    },
    claimed: {
      amount: 0,
      token: {
        logo: logoDefault,
        chain: "USDHD",
        contract_address: "",
        decimals: 18,
        price: 0,
        symbol: "",
        name: "",
      },
    },
    current: {
      endDate: "22-03-2024 15:32:02",
      amount: 0,
      token: {
        logo: logoDefault,
        chain: "USDHD",
        contract_address: "",
        decimals: 18,
        price: 0,
        symbol: "",
        name: "",
      },
      fee: {
        amount: 0,
        token: {
          logo: logoDefault,
          chain: "USDHD",
          contract_address: "",
          decimals: 18,
          price: 0,
          symbol: "",
          name: "",
        },
      },
    },
    chain: "",
    meta: {
      protocol: { logo: "", name: "", url: "" },
    },
  },
];

export const farmData: Farm[] = [
  {
    positionId: "string",
    owner: "string",
    input: ammData,
    feeCollected: [
      {
        amount: 0,
        token: {
          logo: logoDefault,
          chain: "USDHD",
          contract_address: "",
          decimals: 18,
          price: 0,
          symbol: "",
          name: "",
        },
      },
    ],
    current: {
      amount: 0,
      token: {
        logo: logoDefault,
        chain: "USDHD",
        contract_address: "",
        decimals: 18,
        price: 0,
        symbol: "",
        name: "",
      },
      fee: {
        amount: 0,
        token: {
          logo: logoDefault,
          chain: "USDHD",
          contract_address: "",
          decimals: 18,
          price: 0,
          symbol: "",
          name: "",
        },
      },
      healthy: 0,
    },
    chain: "string",
    meta: {
      protocol: { logo: "", name: "", url: "" },
    },
  },
];
