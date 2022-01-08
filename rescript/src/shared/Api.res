open Promise
open Types

module ApiErrorView = {
  type t<'ve> = Internal | Unauthorized | Validation('ve) | Malformed | NotFound

  type decoder<'a> = Js.Json.t => 'a

  let decode = (json: Js.Json.t, veDecoder: decoder<'ve>): t<'ve> => {
    switch CodecUtils.pickTag(json) {
    | "Internal" => Internal
    | "Unauthorized" => Unauthorized
    | "Validation" => Validation(veDecoder(CodecUtils.pickContent(json)))
    | "Malformed" => Malformed
    | "NotFound" => NotFound
    | _ => raise(Json.Decode.DecodeError(`Unknown ApiErrorView: ${Json.stringify(json)}`))
    }
  }
}

let getMyTask = (TaskId.TaskId(id)): Promise.t<TaskWithTweetView.t> => {
  Fetch.fetch(`/api/tasks/${id}`)
  ->then(Fetch.Response.json)
  ->then(json => json->TaskWithTweetView.decode->resolve)
}

let getClaimableRetweetOrders = (): Promise.t<array<ClaimableRetweetOrderView.t>> => {
  Fetch.fetch(`/api/retweet-orders/claimable`)
  ->then(Fetch.Response.json)
  ->then(json => Json.Decode.array(ClaimableRetweetOrderView.decode, json)->resolve)
}

let getMyTasks = (): Promise.t<array<TaskWithTweetView.t>> => {
  Fetch.fetch(`/api/tasks/my`)
  ->then(Fetch.Response.json)
  ->then(json => D.array(TaskWithTweetView.decode, json)->resolve)
}

let getMyRetweetOrders = (): Promise.t<array<ExtendedRetweetOrderView.t>> => {
  Fetch.fetch(`/api/retweet-orders/my`)
  ->then(Fetch.Response.json)
  ->then(json => D.array(ExtendedRetweetOrderView.decode, json)->resolve)
}

let getSeed = (): Promise.t<SeedView.t> => {
  Fetch.fetch(`/api/seed`)->then(Fetch.Response.json)->then(json => json->SeedView.decode->resolve)
}

let post = (
  ~path: string,
  ~payload: option<Js.Json.t>,
  ~okDecoder: Js.Json.t => 'a,
  ~errorDecoder: Js.Json.t => 'e,
): Promise.t<result<'a, 'e>> => {
  let req = switch payload {
  | Some(payload) =>
    let headers = Fetch.HeadersInit.makeWithArray([("Content-Type", "application/json")])
    Fetch.RequestInit.make(
      ~method_=Post,
      ~body=Fetch.BodyInit.make(Js.Json.stringify(payload)),
      ~headers,
      (),
    )
  | None => Fetch.RequestInit.make(~method_=Post, ())
  }

  Fetch.fetchWithInit(path, req)->then(resp => {
    if Fetch.Response.ok(resp) {
      Fetch.Response.json(resp)->then(json => json->okDecoder->Ok->resolve)
    } else {
      let respStatus = Fetch.Response.status(resp)
      if respStatus === 400 {
        Fetch.Response.json(resp)
        ->then(json => json->ApiErrorView.decode(errorDecoder)->resolve)
        ->then(err => {
          switch err {
          | Validation(ve) => ve->Error->resolve
          | _ => reject(Failure("Server returned unexpected error"))
          }
        })
      } else {
        reject(Failure("Unexpected response status"))
      }
    }
  })
}

let checkTaskPerformance = (TaskId.TaskId(taskId)): Promise.t<
  result<TaskView.t, CheckTaskPerformanceErrorView.t>,
> => {
  post(
    ~path=`/api/tasks/${taskId}/check-performance`,
    ~payload=None,
    ~okDecoder=TaskView.decode,
    ~errorDecoder=CheckTaskPerformanceErrorView.decode,
  )
}

let claimOrderTask = (id: RetweetOrderId.t): Promise.t<
  result<TaskView.t, ClaimTaskErrorView.t>,
> => {
  let RetweetOrderId.RetweetOrderId(id) = id
  post(
    ~path=`/api/retweet-orders/${id}/claim-task`,
    ~payload=None,
    ~okDecoder=TaskView.decode,
    ~errorDecoder=ClaimTaskErrorView.decode,
  )
}

let createRetweetOrder = (params: CreateRetweetOrderParams.t): Promise.t<
  result<ExtendedRetweetOrderView.t, CreateRetweetOrderErrorView.t>,
> => {
  let payload = Some(CreateRetweetOrderParams.encode(params))
  post(
    ~path=`/api/retweet-orders`,
    ~payload,
    ~okDecoder=ExtendedRetweetOrderView.decode,
    ~errorDecoder=CreateRetweetOrderErrorView.decode,
  )
}

let withdraw = (params: WithdrawParams.t): Promise.t<
  result<WithdrawResponseView.t, WithdrawErrorView.t>,
> => {
  let payload = Some(WithdrawParams.encode(params))
  post(
    ~path=`/api/withdraw`,
    ~payload,
    ~okDecoder=WithdrawResponseView.decode,
    ~errorDecoder=WithdrawErrorView.decode,
  )
}

let createDepositRequest = (params: CreateRequestDepositParams.t): Promise.t<
  DepositRequestView.t,
> => {
  let unitDecoder = (_: Js.Json.t) => ()
  let payload = Some(CreateRequestDepositParams.encode(params))
  post(
    ~path=`/api/deposit-requests`,
    ~payload,
    ~okDecoder=DepositRequestView.decode,
    ~errorDecoder=unitDecoder,
  )->Promise.then(result => {
    switch result {
    | Ok(depositRequest) => Promise.resolve(depositRequest)
    | Error(_) => reject(Failure("Unexpected error on attempt to createDepositRequest"))
    }
  })
}

let finilizeDepositRequest = (params: FinilizeRequestDepositParams.t): Promise.t<
  result<unit, unit>,
> => {
  let unitDecoder = (_: Js.Json.t) => ()
  let payload = Some(FinilizeRequestDepositParams.encode(params))
  post(
    ~path=`/api/deposit-requests/finilize`,
    ~payload,
    ~okDecoder=unitDecoder,
    ~errorDecoder=unitDecoder,
  )
}
