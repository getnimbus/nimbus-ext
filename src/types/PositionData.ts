import type { TokenInfo } from "./NewData";

export type PositionData = Position[]

export type PositionDataRes = {
  result: PositionData,
  address: string
}

export type Position = {
  claimable: number;
  currentValue: number;
  logo: string;
  positions: PositionDetail[];
  protocol: string;
  url: string;
}

export type PositionDetail = {
  claimable: number;
  currentValue: number;
  inputTime: string;
  inputValue: number;
  logo: string;
  name: string;
  poolId: number | string;
  tokens: TokenInfo[];
  type: string;
}

export type PositionDataLocal = {
  createdAt: string;
  result: {
    address: string;
    result: PositionData
  }
}
