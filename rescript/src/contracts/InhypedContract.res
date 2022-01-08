type t = Contract(NearApi.Contract.t)

let make = (account: NearApi.ConnectedWalletAccount.t, contractName: string): t => {
  let methods: NearApi.ContractMethods.t = {
    viewMethods: [],
    changeMethods: ["deposit"],
  }
  let nearContract = NearApi.Contract.make(account, contractName, methods)
  Contract(nearContract)
}

type depositMethodArgs = {token: string}

%%private(
  @send
  external rawDeposit: (
    NearApi.Contract.t,
    depositMethodArgs,
    string, // gasLimit
    string,
  ) => // amount
  Js.Promise.t<unit> = "deposit"
)

let deposit = (contract: t, ~token: string, ~amount: string): Js.Promise.t<unit> => {
  let Contract(contract) = contract
  let gasLimit = "30000000000000" // 10 ** 13
  let args = {token: token}
  rawDeposit(contract, args, gasLimit, amount)
}
