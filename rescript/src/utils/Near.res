open Types

let nearTransactionUrl = (networkId: NearNetworkId.t, hash: NearTransactionHash.t): string => {
  let hash = NearTransactionHash.toString(hash)
  switch networkId {
  | NearNetworkId.Mainnet => `https://explorer.near.org/transactions/${hash}`
  | NearNetworkId.Testnet => `https://explorer.testnet.near.org/transactions/${hash}`
  }
}

let nearAccountUrl = (networkId: NearNetworkId.t, account: NearAccountId.t): string => {
  let account = NearAccountId.toString(account)
  switch networkId {
  | NearNetworkId.Mainnet => `https://explorer.near.org/accounts/${account}`
  | NearNetworkId.Testnet => `https://explorer.testnet.near.org/accounts/${account}`
  }
}
