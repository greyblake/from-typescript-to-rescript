module BrowserLocalStorageKeyStore = {
  type t

  @module("near-api-js") @new @scope("keyStores")
  external make: unit => t = "BrowserLocalStorageKeyStore"
}

// TODO: consider using @obj: https://twitter.com/tsnobip/status/1476459290701578241
module NearConfig = {
  type t = {
    networkId: string,
    nodeUrl: string,
    headers: Js.Dict.t<string>,
    walletUrl: option<string>,
    keyStore: option<BrowserLocalStorageKeyStore.t>, // TODO: support abstract KeyStore
    // signer: Signer,
    helperUrl: option<string>,
    initialBalance: option<string>,
    masterAccount: option<string>,
  }

  let make = (
    ~networkId: string,
    ~nodeUrl: string,
    ~headers: Js.Dict.t<string>,
    ~walletUrl: option<string>=?,
    ~keyStore: option<BrowserLocalStorageKeyStore.t>=?, // TODO: support abstract KeyStore
    // ~signer: Signer=?,
    ~helperUrl: option<string>=?,
    ~initialBalance: option<string>=?,
    ~masterAccount: option<string>=?,
    (),
  ): t => {
    {
      networkId: networkId,
      nodeUrl: nodeUrl,
      headers: headers,
      walletUrl: walletUrl,
      keyStore: keyStore,
      helperUrl: helperUrl,
      initialBalance: initialBalance,
      masterAccount: masterAccount,
    }
  }
}

module Near = {
  type t
}

// Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/account.ts#L126
// This is an abstract interface that is extended by ConnectedWalletAccount
module Account = {
  type t
}

// Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/wallet-account.ts#L280
module ConnectedWalletAccount = {
  type t
}

// Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/connect.ts#L42
@module("near-api-js")
external connect: NearConfig.t => Js.Promise.t<Near.t> = "connect"

// Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/wallet-account.ts#L60
module WalletConnection = {
  type t

  // Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/wallet-account.ts#L82
  @module("near-api-js") @new
  external make: (Near.t, option<string>) => t = "WalletConnection"

  // Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/wallet-account.ts#L267
  @send
  external account: t => ConnectedWalletAccount.t = "account"

  // Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/wallet-account.ts#L105
  @send
  external isSignedIn: t => bool = "isSignedIn"

  // Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/wallet-account.ts#L135
  @send
  external requestSignIn: (
    t,
    string, // contractId
    string,
  ) => // title
  Js.Promise.t<unit> = "requestSignIn"
}

// Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/contract.ts#L31
module ContractMethods = {
  type t = {
    changeMethods: array<string>,
    viewMethods: array<string>,
  }
}

// Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/contract.ts#L81
module Contract = {
  type t

  // Origin: https://github.com/near/near-api-js/blob/v0.44.2/src/contract.ts#L90
  /// TODO: Find a way to use Account instead of ConnectedWalletAccount here
  @module("near-api-js") @new
  external make: (ConnectedWalletAccount.t, string, ContractMethods.t) => t = "Contract"
}
