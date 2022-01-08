// Generated by ReScript, PLEASE EDIT WITH CARE

import * as Big from "../bindings/Big.bs.js";
import * as Json from "@glennsl/bs-json/src/Json.bs.js";
import * as CodecUtils from "./CodecUtils.bs.js";
import * as Json_decode from "@glennsl/bs-json/src/Json_decode.bs.js";
import * as Json_encode from "@glennsl/bs-json/src/Json_encode.bs.js";

var decode = Json_decode.string;

function encode(id) {
  return id;
}

function toString(t) {
  return t;
}

function fromString(t) {
  return t;
}

var StringId = {
  decode: decode,
  encode: encode,
  toString: toString,
  fromString: fromString
};

function fromString$1(str) {
  switch (str) {
    case "Abandoned" :
        return /* Abandoned */1;
    case "Bungled" :
        return /* Bungled */3;
    case "Claimed" :
        return /* Claimed */0;
    case "PaidOut" :
        return /* PaidOut */5;
    case "Performed" :
        return /* Performed */2;
    case "Verified" :
        return /* Verified */4;
    default:
      throw {
            RE_EXN_ID: Json_decode.DecodeError,
            _1: "Cannot decode task status: \"" + str + "\"",
            Error: new Error()
          };
  }
}

function decode$1(json) {
  return fromString$1(Json_decode.string(json));
}

function display(status) {
  switch (status) {
    case /* Claimed */0 :
        return "Claimed";
    case /* Abandoned */1 :
        return "Abandoned";
    case /* Performed */2 :
        return "Performed";
    case /* Bungled */3 :
        return "Bungled";
    case /* Verified */4 :
        return "Verified";
    case /* PaidOut */5 :
        return "Paid out";
    
  }
}

var TaskStatusView = {
  fromString: fromString$1,
  decode: decode$1,
  display: display
};

function decode$2(json) {
  return /* TaskId */{
          _0: Json_decode.string(json)
        };
}

function toString$1(id) {
  return id._0;
}

var TaskId = {
  decode: decode$2,
  toString: toString$1
};

function decode$3(json) {
  return {
          id: /* TaskId */{
            _0: Json_decode.field("id", Json_decode.string, json)
          },
          orderId: Json_decode.field("orderId", Json_decode.string, json),
          status: Json_decode.field("status", decode$1, json),
          contractorReward: Big.fromString(Json_decode.field("contractorReward", Json_decode.string, json))
        };
}

var TaskView = {
  decode: decode$3
};

var decode$4 = Json_decode.string;

function toString$2(id) {
  return id;
}

function fromString$2(id) {
  return id;
}

var TweetId = {
  decode: decode$4,
  toString: toString$2,
  fromString: fromString$2
};

function decode$5(json) {
  return {
          id: Json_decode.field("id", Json_decode.string, json),
          text: Json_decode.field("text", Json_decode.string, json),
          authorTwitterAccountId: Json_decode.field("authorTwitterAccountId", Json_decode.string, json),
          tweetCreatedAt: Json_decode.field("tweetCreatedAt", Json_decode.string, json)
        };
}

var TweetView = {
  decode: decode$5
};

function decode$6(json) {
  return {
          task: Json_decode.field("task", decode$3, json),
          tweet: Json_decode.field("tweet", decode$5, json)
        };
}

var TaskWithTweetView = {
  decode: decode$6
};

function decode$7(json) {
  var match = Json_decode.string(json);
  switch (match) {
    case "TaskNotPerformed" :
        return /* TaskNotPerformed */1;
    case "UnexpectedTaskStatus" :
        return /* UnexpectedTaskStatus */0;
    default:
      throw {
            RE_EXN_ID: Json_decode.DecodeError,
            _1: "Unexpected value of CheckTaskPerformanceErrorView: " + Json.stringify(json),
            Error: new Error()
          };
  }
}

var CheckTaskPerformanceErrorView = {
  decode: decode$7
};

function decode$8(json) {
  return /* RetweetOrderId */{
          _0: Json_decode.string(json)
        };
}

function toString$3(id) {
  return id._0;
}

var RetweetOrderId = {
  decode: decode$8,
  toString: toString$3
};

function encode$1(params) {
  return Json_encode.object_({
              hd: [
                "tweetId",
                params.tweetId
              ],
              tl: {
                hd: [
                  "budget",
                  params.budget.toString()
                ],
                tl: {
                  hd: [
                    "numberOfTasks",
                    params.numberOfTasks
                  ],
                  tl: /* [] */0
                }
              }
            });
}

var CreateRetweetOrderParams = {
  encode: encode$1
};

function decode$9(json) {
  var tag = CodecUtils.pickTag(json);
  switch (tag) {
    case "ActiveOrderAlreadyExists" :
        return /* ActiveOrderAlreadyExists */0;
    case "FailedToObtainTweet" :
        return /* FailedToObtainTweet */1;
    case "InvalidBudget" :
        return /* InvalidBudget */2;
    case "InvalidNumberOfTasks" :
        return /* InvalidNumberOfTasks */3;
    case "NotEnoughAvailableBalance" :
        var contentJson = CodecUtils.pickContent(json);
        return /* NotEnoughAvailableBalance */{
                availableBalance: Json_decode.field("availableBalance", CodecUtils.decodeBig, contentJson),
                budget: Json_decode.field("budget", CodecUtils.decodeBig, contentJson)
              };
    default:
      throw {
            RE_EXN_ID: Json_decode.DecodeError,
            _1: "Cannot decode CreateRetweetOrderErrorView: \"" + tag + "\"",
            Error: new Error()
          };
  }
}

var CreateRetweetOrderErrorView = {
  decode: decode$9
};

function decode$10(json) {
  return {
          id: Json_decode.field("id", decode$8, json),
          reward: Big.fromString(Json_decode.field("reward", Json_decode.string, json)),
          tweet: Json_decode.field("tweet", decode$5, json)
        };
}

var ClaimableRetweetOrderView = {
  decode: decode$10
};

function decode$11(json) {
  return {
          id: Json_decode.field("id", decode$8, json),
          tweetId: Json_decode.field("tweetId", decode$4, json),
          budget: Big.fromString(Json_decode.field("budget", Json_decode.string, json)),
          numberOfTasks: Json_decode.field("numberOfTasks", Json_decode.$$int, json),
          createdAt: Json_decode.field("createdAt", Json_decode.string, json),
          updatedAt: Json_decode.field("updatedAt", Json_decode.string, json)
        };
}

var MyRetweetOrderView = {
  decode: decode$11
};

function decode$12(json) {
  return {
          numberOfTasksPerformed: Json_decode.field("numberOfTasksPerformed", Json_decode.$$int, json)
        };
}

var RetweetOrderDetailsView = {
  decode: decode$12
};

function decode$13(json) {
  return {
          retweetOrder: Json_decode.field("retweetOrder", decode$11, json),
          tweet: Json_decode.field("tweet", decode$5, json),
          details: Json_decode.field("details", decode$12, json)
        };
}

var ExtendedRetweetOrderView = {
  decode: decode$13
};

function decode$14(json) {
  var tag = CodecUtils.pickTag(json);
  switch (tag) {
    case "OrderHasNoFreeTaskSlots" :
        return /* OrderHasNoFreeTaskSlots */2;
    case "OrderIsNotActive" :
        return /* OrderIsNotActive */1;
    case "OrderNotFound" :
        return /* OrderNotFound */0;
    case "UserAlreadyHasTask" :
        var content = CodecUtils.pickContent(json);
        var taskId = Json_decode.field("taskId", decode$2, content);
        return /* UserAlreadyHasTask */{
                _0: taskId
              };
    default:
      throw {
            RE_EXN_ID: Json_decode.DecodeError,
            _1: "Unexpected ClaimTaskErrorView tag: \"" + tag + "\"",
            Error: new Error()
          };
  }
}

var ClaimTaskErrorView = {
  decode: decode$14
};

function encode$2(params) {
  return Json_encode.object_({
              hd: [
                "recipientNearAccountId",
                params.recipientNearAccountId
              ],
              tl: {
                hd: [
                  "amount",
                  params.amount.toString()
                ],
                tl: /* [] */0
              }
            });
}

var WithdrawParams = {
  encode: encode$2
};

function decode$15(json) {
  var tag = CodecUtils.pickTag(json);
  switch (tag) {
    case "InsufficientFunds" :
        var content = CodecUtils.pickContent(json);
        return {
                TAG: /* InsufficientFunds */3,
                availableBalance: Json_decode.field("availableBalance", CodecUtils.decodeBig, content),
                requestedAmount: Json_decode.field("requestedAmount", CodecUtils.decodeBig, content)
              };
    case "InvalidRecipient" :
        return /* InvalidRecipient */0;
    case "RecipientAccountDoesNotExist" :
        return {
                TAG: /* RecipientAccountDoesNotExist */0,
                recipientAccountId: Json_decode.field("recipientAccountId", decode, CodecUtils.pickContent(json))
              };
    case "RequestedAmountTooHigh" :
        var content$1 = CodecUtils.pickContent(json);
        return {
                TAG: /* RequestedAmountTooHigh */2,
                maxAmount: Json_decode.field("maxAmount", CodecUtils.decodeBig, content$1),
                requestedAmount: Json_decode.field("requestedAmount", CodecUtils.decodeBig, content$1)
              };
    case "RequestedAmountTooSmall" :
        var content$2 = CodecUtils.pickContent(json);
        return {
                TAG: /* RequestedAmountTooSmall */1,
                minAmount: Json_decode.field("minAmount", CodecUtils.decodeBig, content$2),
                requestedAmount: Json_decode.field("requestedAmount", CodecUtils.decodeBig, content$2)
              };
    default:
      throw {
            RE_EXN_ID: Json_decode.DecodeError,
            _1: "Cannot decode WithdrawErrorView: \"" + Json.stringify(json) + "\"",
            Error: new Error()
          };
  }
}

var WithdrawErrorView = {
  decode: decode$15
};

function decode$16(json) {
  return {
          nearTransactionHash: Json_decode.field("nearTransactionHash", decode, json),
          amount: Json_decode.field("amount", CodecUtils.decodeBig, json),
          recipientNearAccountId: Json_decode.field("recipientNearAccountId", decode, json)
        };
}

var WithdrawResponseView = {
  decode: decode$16
};

function fromString$3(id) {
  var match = id.toLowerCase();
  switch (match) {
    case "mainnet" :
        return /* Mainnet */0;
    case "testnet" :
        return /* Testnet */1;
    default:
      throw {
            RE_EXN_ID: Json_decode.DecodeError,
            _1: "Cannot decode NearNetworkId: \"" + id + "\"",
            Error: new Error()
          };
  }
}

function toString$4(id) {
  if (id) {
    return "testnet";
  } else {
    return "mainnet";
  }
}

function decode$17(json) {
  return fromString$3(Json_decode.string(json));
}

var NearNetworkId = {
  fromString: fromString$3,
  toString: toString$4,
  decode: decode$17
};

function decode$18(json) {
  return {
          contractName: Json_decode.field("contractName", Json_decode.string, json),
          helperUrl: Json_decode.field("helperUrl", Json_decode.string, json),
          networkId: Json_decode.field("networkId", decode$17, json),
          nodeUrl: Json_decode.field("nodeUrl", Json_decode.string, json),
          walletUrl: Json_decode.field("walletUrl", Json_decode.string, json)
        };
}

var NearConfigView = {
  decode: decode$18
};

function decode$19(json) {
  return {
          name: Json_decode.field("name", Json_decode.string, json),
          profileImageUrl: Json_decode.field("profileImageUrl", Json_decode.string, json),
          balance: Json_decode.field("balance", CodecUtils.decodeBig, json)
        };
}

var CurrentUserView = {
  decode: decode$19
};

function decode$20(json) {
  return {
          currentUser: Json_decode.field("currentUser", decode$19, json),
          nearConfig: Json_decode.field("nearConfig", decode$18, json)
        };
}

var SeedView = {
  decode: decode$20
};

function encode$3(params) {
  return Json_encode.object_({
              hd: [
                "amount",
                CodecUtils.encodeBig(params.amount)
              ],
              tl: /* [] */0
            });
}

var CreateRequestDepositParams = {
  encode: encode$3
};

function decode$21(json) {
  return {
          token: Json_decode.field("token", Json_decode.string, json),
          amount: Json_decode.field("amount", CodecUtils.decodeBig, json)
        };
}

var DepositRequestView = {
  decode: decode$21
};

function encode$4(params) {
  return Json_encode.object_({
              hd: [
                "transactionHash",
                params.transactionHash
              ],
              tl: /* [] */0
            });
}

var FinilizeRequestDepositParams = {
  encode: encode$4
};

var D;

var E;

var NearAccountId = StringId;

var NearTransactionHash = StringId;

export {
  D ,
  E ,
  StringId ,
  TaskStatusView ,
  TaskId ,
  TaskView ,
  TweetId ,
  TweetView ,
  TaskWithTweetView ,
  CheckTaskPerformanceErrorView ,
  RetweetOrderId ,
  CreateRetweetOrderParams ,
  CreateRetweetOrderErrorView ,
  ClaimableRetweetOrderView ,
  MyRetweetOrderView ,
  RetweetOrderDetailsView ,
  ExtendedRetweetOrderView ,
  ClaimTaskErrorView ,
  NearAccountId ,
  NearTransactionHash ,
  WithdrawParams ,
  WithdrawErrorView ,
  WithdrawResponseView ,
  NearNetworkId ,
  NearConfigView ,
  CurrentUserView ,
  SeedView ,
  CreateRequestDepositParams ,
  DepositRequestView ,
  FinilizeRequestDepositParams ,
  
}
/* Big Not a pure module */
