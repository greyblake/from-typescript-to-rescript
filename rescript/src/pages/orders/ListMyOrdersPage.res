open Types

module ProgressChip = {
  @react.component
  let make = (~performed: int, ~total: int) => {
    let label = `${Belt.Int.toString(performed)} / ${Belt.Int.toString(total)}`->React.string
    let icon = <Mui.TaskOutlinedIcon />
    let tooltipText =
      `${Belt.Int.toString(performed)} out of ${Belt.Int.toString(
          total,
        )} tasks are performed`->React.string
    <Mui.Tooltip title={tooltipText} arrow={true}>
      <Mui.Chip label icon size=#small />
    </Mui.Tooltip>
  }
}

module MyRetweetOrder = {
  open Mui

  @react.component
  let make = (~extOrder: ExtendedRetweetOrderView.t) => {
    let {retweetOrder, tweet, details} = extOrder

    <Card style={ReactDOM.Style.make(~width="100%", ())}>
      <CardContent>
        <Grid container={true}>
          <Grid item={true} xs={8}>
            <Typography
              color=#"text.secondary" style={ReactDOM.Style.make(~whiteSpace="nowrap", ())}>
              {("Budget: " ++ Format.formatNearAmount4(retweetOrder.budget))->React.string}
            </Typography>
          </Grid>
          <Grid item={true} xs={4}>
            <Grid container={true} justifyContent="flex-end">
              <ProgressChip
                performed={details.numberOfTasksPerformed} total={retweetOrder.numberOfTasks}
              />
            </Grid>
          </Grid>
        </Grid>
        <Typography variant=#body2 component=#p>
          {tweet.text->Tweet.shortenTweetText->React.string}
        </Typography>
      </CardContent>
      <CardActions>
        <ExternalLink href={Tweet.tweetUrl(tweet.id)}> {"Open Tweet"->React.string} </ExternalLink>
      </CardActions>
    </Card>
  }
}

module MainContent = {
  open AsyncData

  let tap = (x, f) => {
    f(x)
    x
  }

  let renderOrderList = (orders: array<ExtendedRetweetOrderView.t>) => {
    open Mui

    let orderElements =
      orders
      ->Belt.Array.map(order => {
        let key = order.retweetOrder.id->RetweetOrderId.toString
        <Grid item={true} xs={12} md={6} lg={4} key style={ReactDOM.Style.make(~width="100%", ())}>
          <MyRetweetOrder extOrder=order />
        </Grid>
      })
      ->React.array

    <Box sx={ReactDOM.Style.make(~flexGrow="1", ())}>
      <Grid container={true} spacing={2}> {orderElements} </Grid>
    </Box>
  }

  let cmpString = (a: string, b: string): int => {
    let cmpResult = Js.String.localeCompare(a, b)
    if cmpResult > 0.0 {
      1
    } else if cmpResult < 0.0 {
      -1
    } else {
      0
    }
  }

  let sortByCreatedAt = (orders: array<ExtendedRetweetOrderView.t>): array<
    ExtendedRetweetOrderView.t,
  > => {
    let cmpByCreatedAt = (a: ExtendedRetweetOrderView.t, b: ExtendedRetweetOrderView.t) =>
      cmpString(a.retweetOrder.createdAt, b.retweetOrder.createdAt)
    orders->Belt.SortArray.stableSortBy(cmpByCreatedAt)
  }

  @react.component
  let make = () => {
    let (orders, setOrders) = React.useState(_ => Loading)

    React.useEffect0(() => {
      Api.getMyRetweetOrders()
      ->Promise.then(orders =>
        orders->(orders => (_ => Done(Ok(orders->sortByCreatedAt)))->setOrders->Promise.resolve)
      )
      ->Promise.catch(err =>
        err->tap(Js.log)->(err => (_ => Done(Error(err)))->setOrders->Promise.resolve)
      )
      ->ignore
      None
    })

    switch orders {
    | NotAsked
    | Loading =>
      <SkeletonCardList />
    | Done(Error(_)) => <> {React.string("Ooops. Something went wront")} </>
    | Done(Ok(orders)) => renderOrderList(orders)
    }
  }
}

@react.component
let make = () => {
  open Mui
  <ApplicationBar title="My Orders">
    <Toolbar>
      <Stack direction="row" spacing={2}>
        <ReactRouter.Link to="/orders/new" style={ReactDOM.Style.make(~textDecoration="none", ())}>
          <Button variant=#contained color=#primary>
            <div
              style={ReactDOM.Style.make(
                ~display="flex",
                ~alignItems="center",
                ~flexWrap="wrap",
                (),
              )}>
              <AddCircleOutlineIcon />
              <span style={ReactDOM.Style.make(~marginLeft="4px", ())}>
                {"New Order"->React.string}
              </span>
            </div>
          </Button>
        </ReactRouter.Link>
      </Stack>
    </Toolbar>
    <Container>
      <Typography component=#h1 variant=#h4 align=#center gutterBottom=true>
        {React.string("My Orders")}
      </Typography>
      <MainContent />
    </Container>
  </ApplicationBar>
}
