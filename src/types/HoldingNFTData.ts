export type NFTData = Data[]

export type HoldingNFTRes = {
  result: NFTData
  address: string
}

export type Data = {
  balance: number,
  collection: {
    description: string,
    discord_url: string,
    external_url: string,
    id: string,
    image_url: string,
    name: string,
    royalties: any[]
    total_items: number,
    twitter_username: string
  },
  collectionId: string,
  floorPrice: number,
  token: {
    attributes: {
      key: string,
      kind: string,
      value: string
    }[],
    image_url: string,
    inscription_id: string,
    inscription_number: number,
    item_id: string,
    name: string
  },
  totalCost: number
}
