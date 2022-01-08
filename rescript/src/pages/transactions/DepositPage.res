type formParams = {amount: string}

type formErrors = {amount: option<string>}

let emptyFormParams = (): formParams => {
  {
    amount: "",
  }
}

let emptyformErrors = (): formErrors => {
  {
    amount: None,
  }
}

let validateAmount = (amount: string): result<Big.t, string> => {
  switch Big.parse(amount) {
  | Some(amount) =>
    if Big.gt(amount, Big.fromString("1000")) {
      Error("The maximum amount is 1000 NEAR")
    } else if Big.lt(amount, Big.fromString("0.01")) {
      Error("The minimal amount is 0.1 NEAR")
    } else {
      Ok(amount)
    }
  | None => Error("Invalid")
  }
}

let validate = (formParams: formParams): result<Types.CreateRequestDepositParams.t, formErrors> => {
  let {amount} = formParams
  let amountResult = validateAmount(amount)
  switch amountResult {
  | Ok(amount) => Ok({amount: amount})
  | Error(amountError) => Error({amount: Some(amountError)})
  }
}

// NEAR
//
type nearContext = {
  config: Types.NearConfigView.t,
  near: NearApi.Near.t,
  walletConnection: NearApi.WalletConnection.t,
  contract: InhypedContract.t,
}

let setupNearContext = (config: Types.NearConfigView.t): Promise.t<nearContext> => {
  let {contractName, helperUrl, networkId, nodeUrl, walletUrl} = config
  let keyStore = NearApi.BrowserLocalStorageKeyStore.make()
  let conf = NearApi.NearConfig.make(
    ~helperUrl,
    ~networkId=Types.NearNetworkId.toString(networkId),
    ~walletUrl,
    ~nodeUrl,
    ~keyStore,
    ~headers=Js.Dict.fromArray([]),
    (),
  )

  NearApi.connect(conf)->Promise.then(near => {
    let walletConnection = NearApi.WalletConnection.make(near, None)
    let account = NearApi.WalletConnection.account(walletConnection)
    let contract = InhypedContract.make(account, contractName)
    let context = {
      config: config,
      near: near,
      walletConnection: walletConnection,
      contract: contract,
    }
    Promise.resolve(context)
  })
}

let getQueryParam = (paramName: string): option<string> => {
  let searchParamsStr = {
    open Webapi.Dom
    window->Window.location->Location.search
  }
  let searchParams = Webapi.Url.URLSearchParams.make(searchParamsStr)
  // TODO: swap (paramName, searchParams) once a new version of bs-webapi is released
  Webapi.Url.URLSearchParams.get(paramName, searchParams)
}

module ConnectNearWallet = {
  @react.component
  let make = (~nearContext: nearContext) => {
    let handler = () => {
      NearApi.WalletConnection.requestSignIn(
        nearContext.walletConnection,
        nearContext.config.contractName,
        "Inhyped",
      )->ignore
    }

    <>
      <p> {React.string("To proceed please connect your NEAR account")} </p>
      <Mui.Button variant=#contained color=#primary onClick={handler}>
        {React.string("Connect NEAR account")}
      </Mui.Button>
    </>
  }
}

module DepositForm = {
  open Mui

  @react.component
  let make = (~nearContext: nearContext) => {
    let (formParams, setFormParams) = React.useState(emptyFormParams)
    let (formErrors, setFormErrors) = React.useState(emptyformErrors)

    let handleAmountChange = event => {
      let amount = event.target.value
      setFormParams(_ => {amount: amount})
    }

    let helperTextOrError = (helperText: string, error: option<string>) => {
      switch error {
      | Some(errMsg) => <FormHelperText> <b> {React.string(errMsg)} </b> </FormHelperText>
      | None => <FormHelperText> {React.string(helperText)} </FormHelperText>
      }
    }

    let handleClick = () => {
      switch validate(formParams) {
      | Ok(validParams) =>
        Api.createDepositRequest(validParams)
        ->Promise.then(depositRequest => {
          let amountInYoctoNear = Big.times(
            depositRequest.amount,
            Big.fromString("1000000000000000000000000"),
          )
          InhypedContract.deposit(
            nearContext.contract,
            ~token=depositRequest.token,
            ~amount=Big.toFixed(amountInYoctoNear, 0),
          )
        })
        ->ignore
      | Error(errors) => setFormErrors(_ => errors)
      }
    }

    <Box sx={ReactDOM.Style.make(~flexGrow="1", ())}>
      <Grid container=true spacing=2>
        <Grid item=true xs=12>
          <FormControl fullWidth=true>
            <TextField
              fullWidth=true
              required=true
              id="amount"
              label="Amount"
              value={formParams.amount}
              onChange={handleAmountChange}
              error={Belt.Option.isSome(formErrors.amount)}
            />
            {helperTextOrError(`Amount of Ⓝ  you want to deposit`, formErrors.amount)}
          </FormControl>
        </Grid>
        <Grid item=true xs=12>
          <Grid container=true justifyContent="center">
            <Tooltip
              title={React.string(
                "You will be redirected to NEAR wallet page to authorize the transfer.",
              )}>
              <Button variant=#contained color=#primary onClick={handleClick}>
                {React.string("Deposit with NEAR")}
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  }
}

module FinalizeTransaction = {
  open Types
  open AsyncData
  open Mui

  @react.component
  let make = (~transactionHash: NearTransactionHash.t) => {
    let {reloadUser} = React.useContext(UserContext.context)
    let (depositState, setDepositState) = React.useState(_ => NotAsked)

    React.useEffect2(() => {
      Api.finilizeDepositRequest({transactionHash: transactionHash})
      ->Promise.then(_ => {
        setDepositState(_ => Done(Ok()))
        reloadUser()
        Promise.resolve()
      })
      ->Promise.catch(err => {
        Js.Console.error2("Error on attempt to finalize deposit transaction: ", err)
        setDepositState(_ => Done(Error()))
        Promise.resolve()
      })
      ->ignore
      None
    }, (transactionHash, reloadUser))

    switch depositState {
    | NotAsked
    | Loading => <>
        <CircularProgress disableShrink=true />
        <p> {React.string(`Almost there! We are verifying your transaction... `)} </p>
      </>
    | Done(Error(_)) =>
      // TODO: Add links to telegram chats, support email, etc..
      let hash = NearTransactionHash.toString(transactionHash)
      React.string(
        `We're sorry. An error has occurred. Please contract support providing the transaction hash: ${hash}`,
      )
    | Done(Ok(_)) =>
      <Alert severity=#success>
        <AlertTitle> {React.string(`Success! 🎉🎉🎉 `)} </AlertTitle>
        <p> {React.string(`Congratulation! You successfully deposited!`)} </p>
        <p>
          {React.string(`Now you can `)}
          <ReactRouter.Link to="/orders/new">
            {React.string(`create orders to promote your tweets!`)}
          </ReactRouter.Link>
        </p>
      </Alert>
    }
  }
}

module MainContent = {
  @react.component
  let make = (~nearContext: nearContext) => {
    let transactionHash =
      getQueryParam("transactionHashes")->Belt.Option.map(Types.NearTransactionHash.fromString)

    switch transactionHash {
    | Some(transactionHash) => <FinalizeTransaction transactionHash />
    | None =>
      if NearApi.WalletConnection.isSignedIn(nearContext.walletConnection) {
        <DepositForm nearContext />
      } else {
        <ConnectNearWallet nearContext />
      }
    }
  }
}

module MainWithNearSetup = {
  open AsyncData
  open Mui

  @react.component
  let make = (~nearConfig: Types.NearConfigView.t) => {
    let (nearContext, setNearContext) = React.useState(_ => Loading)

    React.useEffect0(() => {
      setupNearContext(nearConfig)
      ->Promise.then(ctx => {
        setNearContext(_ => Done(Ok(ctx)))
        Promise.resolve()
      })
      ->Promise.catch(err => {
        Js.Console.error(err)
        setNearContext(_ => Done(Error(err)))
        Promise.resolve()
      })
      ->ignore
      None
    })

    switch nearContext {
    | NotAsked
    | Loading =>
      <CircularProgress disableShrink={true} />
    | Done(Ok(context)) => <MainContent nearContext=context />
    | Done(Error(_)) =>
      <Alert severity=#error>
        <AlertTitle> {React.string("Error")} </AlertTitle>
        {React.string("Could not connect to the smart contract.")}
      </Alert>
    }
  }
}

@react.component
let make = (~nearConfig: Types.NearConfigView.t) => {
  open Mui

  <ApplicationBar title="Deposit NEAR">
    <Toolbar>
      <Stack direction="row" spacing={2}>
        <ReactRouter.Link to="/deposit"> {React.string("Deposit")} </ReactRouter.Link>
        <ReactRouter.Link to="/withdraw"> {React.string("Withdraw")} </ReactRouter.Link>
      </Stack>
    </Toolbar>
    <Container maxWidth=#md>
      <Grid
        container={true} spacing={0} direction="column" alignItems="center" justifyContent="center">
        <Typography component=#h1 variant=#h4 align=#center color=#textPrimary gutterBottom={true}>
          {React.string("Deposit NEAR")}
        </Typography>
        <MainWithNearSetup nearConfig />
      </Grid>
    </Container>
  </ApplicationBar>
}
