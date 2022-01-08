open AsyncData
open ReactRouter

module AppRouter = {
  @react.component
  let make = (~seed: Types.SeedView.t) => {
    let {currentUser, nearConfig} = seed

    <BrowserRouter>
      <Switch>
        <Route exact=true path="/deposit"> <DepositPage nearConfig /> </Route>
        <Route exact=true path="/withdraw">
          <WithdrawPage
            availableBalance={currentUser.balance} nearNetworkId={nearConfig.networkId}
          />
        </Route>
        <Route exact=true path="/orders/new"> <NewOrderPage /> </Route>
        <Route exact=true path="/orders/my"> <ListMyOrdersPage /> </Route>
        <Route exact=true path="/tasks/claimable"> <ListClaimableTasksPage /> </Route>
        <Route exact=true path="/tasks/my"> <ListMyTasksPage /> </Route>
        <Route exact=true path="/tasks/:taskId"> <MyTaskPage /> </Route>
        <Route exact=true path="/"> <DashboardPage userName={currentUser.name} /> </Route>
      </Switch>
    </BrowserRouter>
  }
}

module Providers = {
  @react.component
  let make = (~children: React.element) => {
    <UserContext.Provider>
      <ApplicationBarContext.Provider> {children} </ApplicationBarContext.Provider>
    </UserContext.Provider>
  }
}

@genType @react.component
let make = () => {
  let (seed, setSeed) = React.useState(_ => Loading)

  let loadMainState = React.useCallback0(() => {
    Api.getSeed()
    ->Promise.then(seed => {
      setSeed(_ => Done(Ok(seed)))
      Promise.resolve()
    })
    ->Promise.catch(_err => {
      setSeed(_ => Done(Error()))
      Promise.resolve()
    })
    ->ignore
  })

  React.useEffect1(() => {
    loadMainState()
    None
  }, [loadMainState])

  <Providers>
    {switch seed {
    | NotAsked
    | Loading =>
      <HomePage state=#loading />
    | Done(Error(_)) => <HomePage state=#notLoggedIn />
    | Done(Ok(seed)) => <AppRouter seed />
    }}
  </Providers>
}
