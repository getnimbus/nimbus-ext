export type NewData = New[]

export type NewDataRes = {
  result: NewData,
  address: string
}

export type New = {
  description: string;
  img: string;
  title: string;
  tokens: TokenInfo[]
  url: string;
}

export type TokenInfo = {
  id: string | number;
  logo: string;
  name: string;
  symbol: string;
}
