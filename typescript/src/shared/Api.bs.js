// Generated by ReScript, PLEASE EDIT WITH CARE

import * as Json from "@glennsl/bs-json/src/Json.bs.js";
import * as Curry from "rescript/lib/es6/curry.js";
import * as Fetch from "bs-fetch/src/Fetch.bs.js";
import * as Types from "./Types.bs.js";
import * as CodecUtils from "./CodecUtils.bs.js";
import * as Caml_option from "rescript/lib/es6/caml_option.js";
import * as Json_decode from "@glennsl/bs-json/src/Json_decode.bs.js";

function decode(json, veDecoder) {
  var match = CodecUtils.pickTag(json);
  switch (match) {
    case "Internal" :
        return /* Internal */0;
    case "Malformed" :
        return /* Malformed */2;
    case "NotFound" :
        return /* NotFound */3;
    case "Unauthorized" :
        return /* Unauthorized */1;
    case "Validation" :
        return /* Validation */{
                _0: Curry._1(veDecoder, CodecUtils.pickContent(json))
              };
    default:
      throw {
            RE_EXN_ID: Json_decode.DecodeError,
            _1: "Unknown ApiErrorView: " + Json.stringify(json),
            Error: new Error()
          };
  }
}

var ApiErrorView = {
  decode: decode
};

function getMyTask(id) {
  return fetch("/api/tasks/" + id._0).then(function (prim) {
                return prim.json();
              }).then(function (json) {
              return Promise.resolve(Types.TaskWithTweetView.decode(json));
            });
}

function getClaimableRetweetOrders(param) {
  return fetch("/api/retweet-orders/claimable").then(function (prim) {
                return prim.json();
              }).then(function (json) {
              return Promise.resolve(Json_decode.array(Types.ClaimableRetweetOrderView.decode, json));
            });
}

function getMyTasks(param) {
  return fetch("/api/tasks/my").then(function (prim) {
                return prim.json();
              }).then(function (json) {
              return Promise.resolve(Json_decode.array(Types.TaskWithTweetView.decode, json));
            });
}

function getMyRetweetOrders(param) {
  return fetch("/api/retweet-orders/my").then(function (prim) {
                return prim.json();
              }).then(function (json) {
              return Promise.resolve(Json_decode.array(Types.ExtendedRetweetOrderView.decode, json));
            });
}

function getSeed(param) {
  return fetch("/api/seed").then(function (prim) {
                return prim.json();
              }).then(function (json) {
              return Promise.resolve(Types.SeedView.decode(json));
            });
}

function post(path, payload, okDecoder, errorDecoder) {
  var req;
  if (payload !== undefined) {
    var headers = [[
        "Content-Type",
        "application/json"
      ]];
    req = Fetch.RequestInit.make(/* Post */2, Caml_option.some(headers), Caml_option.some(JSON.stringify(Caml_option.valFromOption(payload))), undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)(undefined);
  } else {
    req = Fetch.RequestInit.make(/* Post */2, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined)(undefined);
  }
  return fetch(path, req).then(function (resp) {
              if (resp.ok) {
                return resp.json().then(function (json) {
                            return Promise.resolve({
                                        TAG: /* Ok */0,
                                        _0: Curry._1(okDecoder, json)
                                      });
                          });
              }
              var respStatus = resp.status;
              if (respStatus === 400) {
                return resp.json().then(function (json) {
                              return Promise.resolve(decode(json, errorDecoder));
                            }).then(function (err) {
                            if (typeof err === "number") {
                              return Promise.reject({
                                          RE_EXN_ID: "Failure",
                                          _1: "Server returned unexpected error"
                                        });
                            } else {
                              return Promise.resolve({
                                          TAG: /* Error */1,
                                          _0: err._0
                                        });
                            }
                          });
              } else {
                return Promise.reject({
                            RE_EXN_ID: "Failure",
                            _1: "Unexpected response status"
                          });
              }
            });
}

function checkTaskPerformance(taskId) {
  return post("/api/tasks/" + taskId._0 + "/check-performance", undefined, Types.TaskView.decode, Types.CheckTaskPerformanceErrorView.decode);
}

function claimOrderTask(id) {
  return post("/api/retweet-orders/" + id._0 + "/claim-task", undefined, Types.TaskView.decode, Types.ClaimTaskErrorView.decode);
}

function createRetweetOrder(params) {
  var payload = Caml_option.some(Types.CreateRetweetOrderParams.encode(params));
  return post("/api/retweet-orders", payload, Types.ExtendedRetweetOrderView.decode, Types.CreateRetweetOrderErrorView.decode);
}

function withdraw(params) {
  var payload = Caml_option.some(Types.WithdrawParams.encode(params));
  return post("/api/withdraw", payload, Types.WithdrawResponseView.decode, Types.WithdrawErrorView.decode);
}

function createDepositRequest(params) {
  var unitDecoder = function (param) {
    
  };
  var payload = Caml_option.some(Types.CreateRequestDepositParams.encode(params));
  return post("/api/deposit-requests", payload, Types.DepositRequestView.decode, unitDecoder).then(function (result) {
              if (result.TAG === /* Ok */0) {
                return Promise.resolve(result._0);
              } else {
                return Promise.reject({
                            RE_EXN_ID: "Failure",
                            _1: "Unexpected error on attempt to createDepositRequest"
                          });
              }
            });
}

function finilizeDepositRequest(params) {
  var unitDecoder = function (param) {
    
  };
  var payload = Caml_option.some(Types.FinilizeRequestDepositParams.encode(params));
  return post("/api/deposit-requests/finilize", payload, unitDecoder, unitDecoder);
}

export {
  ApiErrorView ,
  getMyTask ,
  getClaimableRetweetOrders ,
  getMyTasks ,
  getMyRetweetOrders ,
  getSeed ,
  post ,
  checkTaskPerformance ,
  claimOrderTask ,
  createRetweetOrder ,
  withdraw ,
  createDepositRequest ,
  finilizeDepositRequest ,
  
}
/* Types Not a pure module */