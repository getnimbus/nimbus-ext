export type TrxHistoryData = Data[]

export type TrxHistoryDataRes = {
  result: TrxHistoryData
  address: string
}

export type Data = {
  chain: string,
  transaction_hash: string,
  type: string,
  detail: {
    action: string,
    amount: number,
    displayName: string,
    errorMsg: string,
    from: string,
    hash: string,
    inscriptionId: string,
    inscriptionNumber: string,
    logoUrl: string,
    status: string,
    to: string,
    tokenInscriptionNumber: string,
    tokenName: string,
    transferTime: number
  },
  changes: {
    address: string,
    logo: string,
    name: string,
    total: number,
    transaction_hash: string
  }[]
}