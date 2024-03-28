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
  type: "AMM";
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
  type: "CLMM";
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
  type: "Lending";
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
  type: "Borrow";
  owner: string;
  input: (Lending | Stake)[] | TokenState[];
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
  type: "Stake";
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
  type: "Vest";
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
    tokens: TokenState[];
    yield: TokenStateYield[];
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
  type: "Farm";
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
    type: "AMM",
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
    type: "CLMM",
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

export const protocolData: Position[] = [
  {
    positionId:
      "0x97aae7a80abb29c9feabbe7075028550230401ffe7fb745757d3c28a30437408",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280150,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "afSUI",
          contract_address:
            "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "AFSUI",
          price: 1.6679916530393928,
          timestamp: 1711280150,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
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
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280150,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            name: "afSUI",
            contract_address:
              "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
            symbol: "AFSUI",
            price: 1.6679916530393928,
            timestamp: 1711280150,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "AMM",
    meta: {
      protocol: {
        name: "AftermathFinance",
        logo: "",
        url: "",
      },
    },
  },
  {
    positionId:
      "0xfe25614a57b5979cfa37fc4f9d269b0aae16ba25718b82f72dcfe7b123e45607",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280150,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "USD Coin",
          contract_address:
            "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
          symbol: "USDC",
          price: 1.0014277379938274,
          timestamp: 1711280150,
          decimals: 6,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: 0.193210456,
          value: 0.3177547227594209,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280150,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 1.269325,
          value: 1.271137263529015,
          token: {
            name: "USD Coin",
            contract_address:
              "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
            symbol: "USDC",
            price: 1.0014277379938274,
            timestamp: 1711280150,
            decimals: 6,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "AMM",
    meta: {
      protocol: {
        name: "AftermathFinance",
        logo: "",
        url: "",
      },
    },
  },
  {
    positionId:
      "0x1b3e0c4b02fc0102fae1d710b24b7e5d9a7219d3f3c393e4e7a11fc05d727923",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0.493983,
        value: 0.49429100870376724,
        token: {
          name: "Tether USD",
          contract_address:
            "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
          symbol: "USDT",
          price: 1.0011189642334537,
          timestamp: 1711280149,
          decimals: 6,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 1,
        value: 1.000025798027742,
        token: {
          name: "USD Coin",
          contract_address:
            "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
          symbol: "USDC",
          price: 1.0014277379938274,
          timestamp: 1711280149,
          decimals: 6,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    yieldCollected: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "Tether USD",
          contract_address:
            "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
          symbol: "USDT",
          price: 1.0011189642334537,
          timestamp: 1711280149,
          decimals: 6,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "USD Coin",
          contract_address:
            "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
          symbol: "USDC",
          price: 1.0014277379938274,
          timestamp: 1711280149,
          decimals: 6,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: 1.493514,
          value: 1.4951851887481624,
          token: {
            name: "Tether USD",
            contract_address:
              "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
            symbol: "USDT",
            price: 1.0011189642334537,
            timestamp: 1711280149,
            decimals: 6,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            name: "USD Coin",
            contract_address:
              "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
            symbol: "USDC",
            price: 1.0014277379938274,
            timestamp: 1711280149,
            decimals: 6,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      currentPrice:
        "0.999900009999000099917932213167294192212082960938421629212881981",
      lowerPrice:
        "1.00020000999999999998247754082192351177135095048860106030871396",
      upperPrice:
        "1.001000450120021002514052849757776946001472544792936060838447954",
      isInRange: false,
      yield: [
        {
          amount: 0,
          value: 0,
          token: {
            name: "Tether USD",
            contract_address:
              "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
            symbol: "USDT",
            price: 1.0011189642334537,
            timestamp: 1711280149,
            decimals: 6,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            name: "USD Coin",
            contract_address:
              "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
            symbol: "USDC",
            price: 1.0014277379938274,
            timestamp: 1711280149,
            decimals: 6,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            name: "USD Coin",
            contract_address:
              "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
            symbol: "USDC",
            price: 1.0014277379938274,
            timestamp: 1711280149,
            decimals: 6,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0.001997269,
          value: 0.0002611815765774572,
          token: {
            name: "Cetus Token",
            contract_address:
              "0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS",
            symbol: "CETUS",
            price: 0.13076935384139904,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b::cetus::CETUS&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0.001898113,
          value: 0.0031216445660738603,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "CLMM",
    meta: {
      protocol: {
        name: "CETUS",
        logo: "",
        url: "",
      },
      url: "",
    },
  },
  {
    positionId:
      "0x27214d981ea02d16c28925cea0e7811ae68f3b8a73a7c0f1fec3dd1fa48c9f6a",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "afSUI",
          contract_address:
            "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "AFSUI",
          price: 1.6679916530393928,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    yieldCollected: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "afSUI",
          contract_address:
            "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "AFSUI",
          price: 1.6679916530393928,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: 4.200387069,
          value: 7.0062105706266,
          token: {
            name: "afSUI",
            contract_address:
              "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
            symbol: "AFSUI",
            price: 1.6679916530393928,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 14.657195361,
          value: 24.105284697248603,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      currentPrice:
        "1.015010802251732653392897696656604729303177320052537717809777439",
      lowerPrice:
        "1.013489503371420886282172852108584915393740633403738197422342956",
      upperPrice:
        "1.015518409164089360534030078430703285539926871397345316050040584",
      isInRange: true,
      yield: [
        {
          amount: 0,
          value: 0,
          token: {
            name: "afSUI",
            contract_address:
              "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
            symbol: "AFSUI",
            price: 1.6679916530393928,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0.04576416,
          value: 0.07526392864120034,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "CLMM",
    meta: {
      protocol: {
        name: "CETUS",
        logo: "",
        url: "",
      },
      url: "",
    },
  },
  {
    positionId:
      "0x77e1e8423c86e01043588ce07f986b58d4db2982219201f48c3a6d3805d509aa",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "afSUI",
          contract_address:
            "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "AFSUI",
          price: 1.6679916530393928,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    yieldCollected: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "afSUI",
          contract_address:
            "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
          symbol: "AFSUI",
          price: 1.6679916530393928,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: 3245.80093023,
          value: 5413.968859051137,
          token: {
            name: "afSUI",
            contract_address:
              "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
            symbol: "AFSUI",
            price: 1.6679916530393928,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 4017.203353848,
          value: 6606.709411058928,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      currentPrice:
        "1.015010802251732653392897696656604729303177320052537717809777439",
      lowerPrice:
        "1.01450344906670885059524652831851396819308474746742753662305547",
      upperPrice:
        "1.015518409164089360534030078430703285539926871397345316050040584",
      isInRange: true,
      yield: [
        {
          amount: 0,
          value: 0,
          token: {
            name: "afSUI",
            contract_address:
              "0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI",
            symbol: "AFSUI",
            price: 1.6679916530393928,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0xf325ce1300e8dac124071d3152c5c5ee6174914f8bc2161e88329cf579246efc::afsui::AFSUI&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0,
          value: 0,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 1.283133518,
          value: 2.1102467419020554,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "CLMM",
    meta: {
      protocol: {
        name: "CETUS",
        logo: "",
        url: "",
      },
      url: "",
    },
  },
  {
    positionId:
      "0xf385dee283495bb70500f5f8491047cd5a2ef1b7ff5f410e6dfe8a3c3ba58716",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "Volo Staked SUI",
          contract_address:
            "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
          symbol: "vSUI",
          price: 1.6624106546929676,
          timestamp: 1711280148,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address: "0x2::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280148,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: 0.7636980820736832,
          value: 1.2695798286078752,
          token: {
            name: "Volo Staked SUI",
            contract_address:
              "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
            symbol: "vSUI",
            price: 1.6624106546929676,
            timestamp: 1711280148,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 1.0937536934407708,
          value: 1.7987918916063463,
          token: {
            name: "Sui",
            contract_address: "0x2::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280148,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "AMM",
    meta: {
      protocol: {
        name: "Kriya",
        logo: "",
        url: "",
      },
    },
  },
  {
    positionId:
      "0xf385dee283495bb70500f5f8491047cd5a2ef1b7ff5f410e6dfe8a3c3ba58716",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "Volo Staked SUI",
          contract_address:
            "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
          symbol: "vSUI",
          price: 1.6624106546929676,
          timestamp: 1711280148,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT&chain=SUI",
          chain: "SUI",
        },
      },
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address: "0x2::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280148,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: 0.2545660273578944,
          value: 0.42319327620262515,
          token: {
            name: "Volo Staked SUI",
            contract_address:
              "0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT",
            symbol: "vSUI",
            price: 1.6624106546929676,
            timestamp: 1711280148,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x549e8b69270defbfafd4f94e17ec44cdbdd99820b33bda2278dea3b9a32d3f55::cert::CERT&chain=SUI",
            chain: "SUI",
          },
        },
        {
          amount: 0.364584564480257,
          value: 0.5995972972021155,
          token: {
            name: "Sui",
            contract_address: "0x2::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280148,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "AMM",
    meta: {
      protocol: {
        name: "Kriya",
        logo: "",
        url: "",
      },
    },
  },
  {
    positionId:
      "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        positionId:
          "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
        owner:
          "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
        input: [
          {
            amount: 2,
            value: 3.199472618894256,
            token: {
              name: "Sui",
              contract_address:
                "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
              symbol: "SUI",
              price: 1.6446041758703829,
              timestamp: 1711280149,
              decimals: 9,
              source: "Nimbus",
              logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
              chain: "SUI",
            },
          },
        ],
        yieldCollected: [],
        current: {
          tokens: [
            {
              amount: 1.0010070609995387,
              value: 1.6462603925955805,
              token: {
                name: "Sui",
                contract_address:
                  "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
                symbol: "SUI",
                price: 1.6446041758703829,
                timestamp: 1711280149,
                decimals: 9,
                source: "Nimbus",
                logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
                chain: "SUI",
              },
            },
          ],
          yield: [],
        },
        fee: {
          value: 2.79250856166607,
        },
        chain: "SUI",
        type: "Lending",
        meta: {
          protocol: {
            name: "Navi",
            logo: "",
            url: "",
          },
        },
      },
    ],
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 0.20116605439909357,
          value: 0.20139115201895116,
          token: {
            name: "Tether USD",
            contract_address:
              "0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN",
            symbol: "USDT",
            price: 1.0011189642334537,
            timestamp: 1711280149,
            decimals: 6,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [],
      healthy: 10,
    },
    fee: {
      value: 2.79250856166607,
    },
    chain: "SUI",
    type: "Borrow",
    meta: {
      protocol: {
        name: "Navi",
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
          name: "Sui",
          contract_address: "0x2::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280150,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 1.984883359,
          value: 3.264347460827032,
          token: {
            name: "Sui",
            contract_address: "0x2::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280150,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [
        {
          amount: 2.000000013814886,
          value: 3.289208374460785,
          token: {
            name: "Sui",
            contract_address: "0x2::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280150,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "Lending",
    meta: {
      txs: [],
      protocol: {
        name: "Scallop",
        logo: "",
        url: "",
      },
    },
  },
  {
    positionId:
      "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280162,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 10.000000124507537,
          value: 16.446041963469444,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280162,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [
        {
          amount: 0.0006743855094396196,
          value: 0.0011090972249708738,
          token: {
            name: "Sui",
            contract_address:
              "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280162,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
            chain: "SUI",
          },
          claimable: true,
        },
      ],
    },
    fee: 0,
    chain: "SUI",
    type: "Staking",
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
      "0x5f47fab30cd06d8d77b36cd9c7b389375aaeddd133fc00c82f10d4790e1446db",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: 5,
        value: 8.223020879351914,
        token: {
          name: "Sui",
          contract_address:
            "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280151,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 2,
          value: 2.002855475987655,
          token: {
            name: "USD Coin",
            contract_address:
              "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
            symbol: "USDC",
            price: 1.0014277379938274,
            timestamp: 1711280151,
            decimals: 6,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [],
      healthy: 0.30454637359785036,
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "Borrow",
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
      "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [],
    yieldCollected: [],
    current: {
      tokens: [
        {
          amount: 10,
          value: 8.406095772716688,
          token: {
            name: "Scallop",
            contract_address:
              "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
            symbol: "SCA",
            price: 0.8406095772716687,
            timestamp: 1711280148,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      endDate: "2024-04-01T00:00:00.000Z",
      yield: [],
    },
    fee: {
      value: 0,
    },
    chain: "SUI",
    type: "Vest",
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
      "0x68cf08c4ef8b0462d8c3879f4e26cc371fbddd844650d0c41a9c3badc8104609",
    owner: "0x692853c81afc8f847147c8a8b4368dc894697fc12b929ef3071482d27339815e",
    input: [
      {
        amount: "1",
        value: 1.6446041758703829,
        token: {
          name: "Sui",
          contract_address: "0x2::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    yieldCollected: [
      {
        amount: 0,
        value: 0,
        token: {
          name: "Sui",
          contract_address: "0x2::sui::SUI",
          symbol: "SUI",
          price: 1.6446041758703829,
          timestamp: 1711280149,
          decimals: 9,
          source: "Nimbus",
          logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
          chain: "SUI",
        },
      },
    ],
    current: {
      tokens: [
        {
          amount: "1",
          value: 1.6446041758703829,
          token: {
            name: "Sui",
            contract_address: "0x2::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
            chain: "SUI",
          },
        },
      ],
      yield: [
        {
          amount: "0.001116208",
          value: 0.0018357203379399283,
          token: {
            name: "Sui",
            contract_address: "0x2::sui::SUI",
            symbol: "SUI",
            price: 1.6446041758703829,
            timestamp: 1711280149,
            decimals: 9,
            source: "Nimbus",
            logo: "https://logo.getnimbus.io/api/v1/logo?address=0x2::sui::SUI&chain=SUI",
            chain: "SUI",
          },
          claimable: false,
        },
      ],
    },
    fee: 0,
    chain: "SUI",
    type: "Staking",
    meta: {
      protocol: {
        name: "native_stake",
        logo: "",
        url: "",
      },
    },
  },
];

export const stakeData: Stake[] = [
  {
    positionId: "",
    owner: "",
    type: "Stake",
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
    type: "Vest",
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
    type: "Farm",
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
