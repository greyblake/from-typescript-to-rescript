module D = Json.Decode
module E = Json.Encode

// Experimental Id and StringId modules
module type Id = {
  type t

  let decode: Js.Json.t => t
  let encode: t => Js.Json.t
  let toString: t => string
  let fromString: string => t
}

module StringId = {
  type t = string

  let decode = (json: Js.Json.t): t => D.string(json)
  let encode = (id: t): Js.Json.t => E.string(id)
  let toString = t => t
  let fromString = t => t
}

module TaskStatusView = {
  type t = Claimed | Abandoned | Performed | Bungled | Verified | PaidOut

  let fromString = (str: string): t => {
    switch str {
    | "Claimed" => Claimed
    | "Abandoned" => Abandoned
    | "Performed" => Performed
    | "Bungled" => Bungled
    | "Verified" => Verified
    | "PaidOut" => PaidOut
    | _ => raise(D.DecodeError(`Cannot decode task status: "${str}"`))
    }
  }

  let decode = (json: Js.Json.t): t => json->D.string->fromString

  let display = (status: t): string => {
    switch status {
    | Claimed => "Claimed"
    | Abandoned => "Abandoned"
    | Performed => "Performed"
    | Bungled => "Bungled"
    | Verified => "Verified"
    | PaidOut => "Paid out"
    }
  }
}

module TaskId = {
  type t = TaskId(string)
  let decode = json => json->D.string->TaskId
  let toString = (TaskId(id): t) => id
}

module TaskView = {
  type t = {
    id: TaskId.t,
    orderId: string,
    status: TaskStatusView.t,
    contractorReward: Big.t,
  }

  let decode = (json: Js.Json.t): t => {
    {
      id: D.field("id", D.string, json)->TaskId,
      orderId: D.field("orderId", D.string, json),
      status: D.field("status", TaskStatusView.decode, json),
      contractorReward: D.field("contractorReward", D.string, json)->Big.fromString,
    }
  }
}

// Tweets
//
module TweetId = {
  @unboxed
  type t = TweetId(string)
  let decode = (json: Js.Json.t): t => json->D.string->TweetId
  let toString = (TweetId(id)) => id
  let fromString = id => TweetId(id)
}

module TweetView = {
  @unboxed
  type tweetText = TweetText(string)

  type t = {
    id: TweetId.t,
    text: tweetText,
    authorTwitterAccountId: string,
    tweetCreatedAt: string,
  }

  let decode = (json: Js.Json.t): t => {
    {
      id: TweetId(D.field("id", D.string, json)),
      text: TweetText(D.field("text", D.string, json)),
      authorTwitterAccountId: D.field("authorTwitterAccountId", D.string, json),
      tweetCreatedAt: D.field("tweetCreatedAt", D.string, json),
    }
  }
}

module TaskWithTweetView = {
  type t = {
    task: TaskView.t,
    tweet: TweetView.t,
  }

  let decode = (json: Js.Json.t): t => {
    {
      task: D.field("task", TaskView.decode, json),
      tweet: D.field("tweet", TweetView.decode, json),
    }
  }
}

module CheckTaskPerformanceErrorView = {
  type t = UnexpectedTaskStatus | TaskNotPerformed

  let decode = (json: Js.Json.t): t => {
    switch D.string(json) {
    | "UnexpectedTaskStatus" => UnexpectedTaskStatus
    | "TaskNotPerformed" => TaskNotPerformed
    | _ =>
      raise(
        D.DecodeError(`Unexpected value of CheckTaskPerformanceErrorView: ${Json.stringify(json)}`),
      )
    }
  }
}

module RetweetOrderId = {
  type t = RetweetOrderId(string)
  let decode = json => json->D.string->RetweetOrderId
  let toString = (RetweetOrderId(id): t) => id
}

module CreateRetweetOrderParams = {
  type t = {
    tweetId: TweetId.t,
    budget: Big.t,
    numberOfTasks: int,
  }

  let encode = (params: t): Js.Json.t => {
    let {tweetId, budget, numberOfTasks} = params
    E.object_(list{
      ("tweetId", tweetId->TweetId.toString->E.string),
      ("budget", budget->Big.toString->E.string),
      ("numberOfTasks", numberOfTasks->E.int),
    })
  }
}

module CreateRetweetOrderErrorView = {
  type t =
    | NotEnoughAvailableBalance({availableBalance: Big.t, budget: Big.t})
    | ActiveOrderAlreadyExists
    | FailedToObtainTweet
    | InvalidBudget
    | InvalidNumberOfTasks

  let decode = (json: Js.Json.t): t => {
    let tag = CodecUtils.pickTag(json)
    switch tag {
    | "NotEnoughAvailableBalance" => {
        let contentJson = CodecUtils.pickContent(json)
        NotEnoughAvailableBalance({
          availableBalance: D.field("availableBalance", CodecUtils.decodeBig, contentJson),
          budget: D.field("budget", CodecUtils.decodeBig, contentJson),
        })
      }
    | "ActiveOrderAlreadyExists" => ActiveOrderAlreadyExists
    | "FailedToObtainTweet" => FailedToObtainTweet
    | "InvalidBudget" => InvalidBudget
    | "InvalidNumberOfTasks" => InvalidNumberOfTasks
    | _ => raise(D.DecodeError(`Cannot decode CreateRetweetOrderErrorView: "${tag}"`))
    }
  }
}

module ClaimableRetweetOrderView = {
  type t = {
    id: RetweetOrderId.t,
    reward: Big.t,
    tweet: TweetView.t,
  }

  let decode = (json: Js.Json.t): t => {
    {
      id: D.field("id", RetweetOrderId.decode, json),
      reward: D.field("reward", D.string, json)->Big.fromString,
      tweet: D.field("tweet", TweetView.decode, json),
    }
  }
}

module MyRetweetOrderView = {
  type t = {
    id: RetweetOrderId.t,
    tweetId: TweetId.t,
    budget: Big.t,
    numberOfTasks: int,
    // TODO: use time types
    createdAt: string,
    updatedAt: string,
  }

  let decode = (json: Js.Json.t): t => {
    {
      id: D.field("id", RetweetOrderId.decode, json),
      tweetId: D.field("tweetId", TweetId.decode, json),
      budget: D.field("budget", D.string, json)->Big.fromString,
      numberOfTasks: D.field("numberOfTasks", D.int, json),
      createdAt: D.field("createdAt", D.string, json),
      updatedAt: D.field("updatedAt", D.string, json),
    }
  }
}

module RetweetOrderDetailsView = {
  type t = {numberOfTasksPerformed: int}

  let decode = (json: Js.Json.t): t => {
    {
      numberOfTasksPerformed: D.field("numberOfTasksPerformed", D.int, json),
    }
  }
}

module ExtendedRetweetOrderView = {
  type t = {
    retweetOrder: MyRetweetOrderView.t,
    tweet: TweetView.t,
    details: RetweetOrderDetailsView.t,
  }

  let decode = (json: Js.Json.t): t => {
    {
      retweetOrder: D.field("retweetOrder", MyRetweetOrderView.decode, json),
      tweet: D.field("tweet", TweetView.decode, json),
      details: D.field("details", RetweetOrderDetailsView.decode, json),
    }
  }
}

module ClaimTaskErrorView = {
  type t =
    | UserAlreadyHasTask(TaskId.t)
    | OrderNotFound
    | OrderIsNotActive
    | OrderHasNoFreeTaskSlots

  let decode = (json: Js.Json.t): t => {
    let tag = CodecUtils.pickTag(json)
    switch tag {
    | "UserAlreadyHasTask" => {
        let content = CodecUtils.pickContent(json)
        let taskId = D.field("taskId", TaskId.decode, content)
        UserAlreadyHasTask(taskId)
      }
    | "OrderNotFound" => OrderNotFound
    | "OrderIsNotActive" => OrderIsNotActive
    | "OrderHasNoFreeTaskSlots" => OrderHasNoFreeTaskSlots
    | _ => raise(D.DecodeError(`Unexpected ClaimTaskErrorView tag: "${tag}"`))
    }
  }
}

// Transactions

module NearAccountId: Id = StringId
module NearTransactionHash: Id = StringId

module WithdrawParams = {
  type t = {
    recipientNearAccountId: NearAccountId.t,
    amount: Big.t,
  }

  let encode = (params: t): Js.Json.t => {
    let {recipientNearAccountId, amount} = params
    E.object_(list{
      ("recipientNearAccountId", recipientNearAccountId->NearAccountId.encode),
      ("amount", amount->Big.toString->E.string),
    })
  }
}

module WithdrawErrorView = {
  type t =
    | InvalidRecipient
    | RecipientAccountDoesNotExist({recipientAccountId: NearAccountId.t})
    | RequestedAmountTooSmall({minAmount: Big.t, requestedAmount: Big.t})
    | RequestedAmountTooHigh({maxAmount: Big.t, requestedAmount: Big.t})
    | InsufficientFunds({availableBalance: Big.t, requestedAmount: Big.t})

  let decode = (json: Js.Json.t): t => {
    let tag = CodecUtils.pickTag(json)
    switch tag {
    | "InvalidRecipient" => InvalidRecipient
    | "RecipientAccountDoesNotExist" =>
      RecipientAccountDoesNotExist({
        recipientAccountId: D.field(
          "recipientAccountId",
          NearAccountId.decode,
          CodecUtils.pickContent(json),
        ),
      })
    | "RequestedAmountTooSmall" => {
        let content = CodecUtils.pickContent(json)
        RequestedAmountTooSmall({
          minAmount: D.field("minAmount", CodecUtils.decodeBig, content),
          requestedAmount: D.field("requestedAmount", CodecUtils.decodeBig, content),
        })
      }

    | "RequestedAmountTooHigh" => {
        let content = CodecUtils.pickContent(json)
        RequestedAmountTooHigh({
          maxAmount: D.field("maxAmount", CodecUtils.decodeBig, content),
          requestedAmount: D.field("requestedAmount", CodecUtils.decodeBig, content),
        })
      }

    | "InsufficientFunds" => {
        let content = CodecUtils.pickContent(json)
        InsufficientFunds({
          availableBalance: D.field("availableBalance", CodecUtils.decodeBig, content),
          requestedAmount: D.field("requestedAmount", CodecUtils.decodeBig, content),
        })
      }
    | _ => raise(D.DecodeError(`Cannot decode WithdrawErrorView: "${Json.stringify(json)}"`))
    }
  }
}

module WithdrawResponseView = {
  type t = {
    nearTransactionHash: NearTransactionHash.t,
    amount: Big.t,
    recipientNearAccountId: NearAccountId.t,
  }

  let decode = (json: Js.Json.t): t => {
    {
      nearTransactionHash: D.field("nearTransactionHash", NearTransactionHash.decode, json),
      amount: D.field("amount", CodecUtils.decodeBig, json),
      recipientNearAccountId: D.field("recipientNearAccountId", NearAccountId.decode, json),
    }
  }
}

module NearNetworkId = {
  type t = Mainnet | Testnet

  let fromString = (id: string): t => {
    switch Js.String.toLowerCase(id) {
    | "mainnet" => Mainnet
    | "testnet" => Testnet
    | _ => raise(D.DecodeError(`Cannot decode NearNetworkId: "${id}"`))
    }
  }

  let toString = (id: t): string => {
    switch id {
    | Mainnet => "mainnet"
    | Testnet => "testnet"
    }
  }

  let decode = (json: Js.Json.t): t => {
    json->D.string->fromString
  }
}

module NearConfigView = {
  type t = {
    contractName: string,
    helperUrl: string,
    networkId: NearNetworkId.t,
    nodeUrl: string,
    walletUrl: string,
  }

  let decode = (json: Js.Json.t): t => {
    {
      contractName: D.field("contractName", D.string, json),
      helperUrl: D.field("helperUrl", D.string, json),
      networkId: D.field("networkId", NearNetworkId.decode, json),
      nodeUrl: D.field("nodeUrl", D.string, json),
      walletUrl: D.field("walletUrl", D.string, json),
    }
  }
}

module CurrentUserView = {
  type t = {
    name: string,
    profileImageUrl: string,
    balance: Big.t,
  }

  let decode = (json: Js.Json.t): t => {
    {
      name: D.field("name", D.string, json),
      profileImageUrl: D.field("profileImageUrl", D.string, json),
      balance: D.field("balance", CodecUtils.decodeBig, json),
    }
  }
}

module SeedView = {
  type t = {
    currentUser: CurrentUserView.t,
    nearConfig: NearConfigView.t,
  }

  let decode = (json: Js.Json.t): t => {
    {
      currentUser: D.field("currentUser", CurrentUserView.decode, json),
      nearConfig: D.field("nearConfig", NearConfigView.decode, json),
    }
  }
}

module CreateRequestDepositParams = {
  type t = {amount: Big.t}

  let encode = (params: t): Js.Json.t => {
    let {amount} = params
    E.object_(list{("amount", amount->CodecUtils.encodeBig)})
  }
}

module DepositRequestView = {
  type t = {
    token: string,
    amount: Big.t,
  }

  let decode = (json: Js.Json.t): t => {
    {
      token: D.field("token", D.string, json),
      amount: D.field("amount", CodecUtils.decodeBig, json),
    }
  }
}

module FinilizeRequestDepositParams = {
  type t = {transactionHash: NearTransactionHash.t}

  let encode = (params: t): Js.Json.t => {
    let {transactionHash} = params
    E.object_(list{("transactionHash", transactionHash->NearTransactionHash.encode)})
  }
}
