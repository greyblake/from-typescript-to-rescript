open Types

let cmpByReward = (a: ClaimableRetweetOrderView.t, b: ClaimableRetweetOrderView.t): int => {
  if Big.gt(a.reward, b.reward) {
    1
  } else if Big.gt(b.reward, a.reward) {
    -1
  } else {
    0
  }
}

let sortByReward = (orders: array<ClaimableRetweetOrderView.t>): array<
  ClaimableRetweetOrderView.t,
> => {
  orders->Belt.SortArray.stableSortBy(cmpByReward)->Belt.Array.reverse
}

module ClaimTaskButton = {
  open Mui

  @react.component
  let make = (~orderId: RetweetOrderId.t) => {
    let history = ReactRouter.useHistory()
    let navigateToTask = (TaskId.TaskId(id)) => {
      ReactRouter.History.push(history, `/tasks/${id}`)
    }

    let logError = (err: 'e) => {
      Js.log(err)
    }

    let onClick = () => {
      Api.claimOrderTask(orderId)
      ->Promise.then(claimResult => {
        switch claimResult {
        | Ok(task) => navigateToTask(task.id)
        | Error(ClaimTaskErrorView.UserAlreadyHasTask(taskId)) => navigateToTask(taskId)
        | Error(err) => logError(err)
        }->Promise.resolve
      })
      // TODO: catch error and show error message to user
      ->ignore
    }

    <Button size=#small color=#primary variant=#contained onClick> {"CLAIM"->React.string} </Button>
  }
}

module ClaimableOrder = {
  open Mui

  @react.component
  let make = (~order: ClaimableRetweetOrderView.t) => {
    let {reward, tweet} = order
    let tweetUrl = tweet.id->Tweet.tweetUrl
    let actionsStyle = ReactDOM.Style.make(~justifyContent="space-between", ())
    <Card>
      <CardContent>
        <Typography color=#"text.secondary">
          {React.string("Reward: " ++ Format.formatNearAmount4(reward))}
        </Typography>
        <Typography variant=#body2 component=#p>
          {tweet.text->Tweet.shortenTweetText->React.string}
        </Typography>
      </CardContent>
      <CardActions style=actionsStyle>
        <ClaimTaskButton orderId=order.id />
        <ExternalLink href={tweetUrl}> {"Open Tweet"->React.string} </ExternalLink>
      </CardActions>
    </Card>
  }
}

module ClaimableOrderList = {
  open Mui

  @react.component
  let make = (~orders: array<ClaimableRetweetOrderView.t>) => {
    let orderElements =
      orders
      ->Belt.Array.map(order => {
        let key = order.id->RetweetOrderId.toString
        <Grid item={true} xs={12} md={6} lg={4} key> <ClaimableOrder order /> </Grid>
      })
      ->React.array

    let boxStyle = ReactDOM.Style.make(~flexGrow="1", ())
    <Box sx=boxStyle> <Grid container={true} spacing={2}> {orderElements} </Grid> </Box>
  }
}

module MainContent = {
  @react.component
  let make = () => {
    open AsyncData
    open Promise

    let (claimableOrders, setClaimableOrders) = React.useState(_ => NotAsked)
    let setOrders = orders => setClaimableOrders(_ => orders)

    React.useEffect0(() => {
      Api.getClaimableRetweetOrders()
      ->then(orders => setOrders(Done(Ok(sortByReward(orders))))->resolve)
      ->catch(err => setOrders(Done(Error(err)))->resolve)
      ->ignore
      None
    })

    switch claimableOrders {
    | NotAsked
    | Loading =>
      <SkeletonCardList />
    | Done(Ok(orders)) => <ClaimableOrderList orders />
    | Done(Error(_)) => "Oops. Something went wrong"->React.string
    }
  }
}

@react.component
let make = () => {
  <ApplicationBar title="Task">
    <Mui.Toolbar>
      <Mui.Stack direction="row" spacing={2}>
        <ReactRouter.Link to="/tasks/claimable"> {React.string("New tasks")} </ReactRouter.Link>
        <ReactRouter.Link to="/tasks/my"> {React.string("Past tasks")} </ReactRouter.Link>
      </Mui.Stack>
    </Mui.Toolbar>
    <Mui.Container>
      <Mui.Typography component=#h1 variant=#h4 align=#center gutterBottom=true>
        {React.string("Available Tasks")}
      </Mui.Typography>
      <MainContent />
    </Mui.Container>
  </ApplicationBar>
}
