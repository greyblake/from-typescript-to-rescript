type formParams = {
  recipient: string,
  amount: string,
}

type formErrors = {
  recipient: option<string>,
  amount: option<string>,
}

let emptyFormParams = (): formParams => {
  {
    recipient: "",
    amount: "",
  }
}

let emptyFormErrors = (): formErrors => {
  {
    recipient: None,
    amount: None,
  }
}

let validateRecipient = (recipient: string, ~networkId: Types.NearNetworkId.t): result<
  Types.NearAccountId.t,
  string,
> => {
  open Types
  open Types.NearNetworkId

  let recipient = Js.String.trim(recipient)
  if recipient === "" {
    Error("Cannot be empty")
  } else {
    let regex = switch networkId {
    | Mainnet => %re("/^[a-zA-Z0-9-_]+\.near$/")
    | Testnet => %re("/^[a-zA-Z0-9-_]+\.testnet$/")
    }
    switch Js.Re.exec_(regex, recipient) {
    | Some(_) => recipient->NearAccountId.fromString->Ok
    | None => Error("Is invalid")
    }
  }
}

let getError = (result: result<'a, 'e>): option<'e> => {
  switch result {
  | Ok(_) => None
  | Error(err) => Some(err)
  }
}

let validateAmount = (amount: string, ~availableBalance: Big.t): result<Big.t, string> => {
  let amount = Js.String.trim(amount)
  if amount === "" {
    Error("Cannot be empty")
  } else {
    switch Big.parse(amount) {
    | None => Error("Is invalid")
    | Some(amount) =>
      if Big.lt(amount, Big.fromString("0.1")) {
        Error("The minimal amount for withdrawal is 0.1 NEAR")
      } else if Big.gt(amount, Big.fromString("20")) {
        Error("The maximum amount for withdrawal is 20 NEAR")
      } else if Big.gt(amount, availableBalance) {
        Error(`You have only ${Format.formatNearAmount4(availableBalance)} available`)
      } else {
        Ok(amount)
      }
    }
  }
}

let convertWithdrawErrorViewToFormErrors = (error: Types.WithdrawErrorView.t): formErrors => {
  open Types.WithdrawErrorView
  open Types
  let formatNear = Format.formatNearAmount4

  switch error {
  | InvalidRecipient => {...emptyFormErrors(), recipient: Some("Is invalid")}
  | RecipientAccountDoesNotExist({recipientAccountId}) => {
      ...emptyFormErrors(),
      recipient: Some(`Account ${NearAccountId.toString(recipientAccountId)} does not exist`),
    }
  | RequestedAmountTooSmall({minAmount, requestedAmount: _}) => {
      ...emptyFormErrors(),
      amount: Some(`The minimal amount for withdrawal is ${formatNear(minAmount)}`),
    }
  | RequestedAmountTooHigh({maxAmount, requestedAmount: _}) => {
      ...emptyFormErrors(),
      amount: Some(`The maximum amount for withdrawal is ${formatNear(maxAmount)}`),
    }
  | InsufficientFunds({availableBalance, requestedAmount: _}) => {
      ...emptyFormErrors(),
      amount: Some(`Available balance is ${formatNear(availableBalance)}, what is not sufficient`),
    }
  }
}

let formatWithdrawError = (error: Types.WithdrawErrorView.t): string => {
  open Types.WithdrawErrorView
  open Types
  let formatNear = Format.formatNearAmount4

  switch error {
  | InvalidRecipient => "Recipient is invalid"
  | RecipientAccountDoesNotExist({recipientAccountId}) =>
    `Recipient account ${NearAccountId.toString(recipientAccountId)} does not exist`
  | RequestedAmountTooSmall({minAmount, requestedAmount}) =>
    `The minimal amount for withdrawal is ${formatNear(
        minAmount,
      )}, but was requested only ${formatNear(requestedAmount)}`
  | RequestedAmountTooHigh({maxAmount, requestedAmount}) =>
    `The maximum amount for withdrawal is ${formatNear(maxAmount)}, but was requested ${formatNear(
        requestedAmount,
      )}`
  | InsufficientFunds({availableBalance, requestedAmount}) =>
    `Available balance is ${formatNear(
        availableBalance,
      )}, what is not sufficient to withdraw ${formatNear(requestedAmount)}`
  }
}

let linkToNearAccount = (
  networkId: Types.NearNetworkId.t,
  account: Types.NearAccountId.t,
): React.element => {
  open Types

  let url = Near.nearAccountUrl(networkId, account)
  let account = account->NearAccountId.toString->React.string
  <ExternalLink href={url}> {account} </ExternalLink>
}

let linkToNearTransaction = (
  networkId: Types.NearNetworkId.t,
  hash: Types.NearTransactionHash.t,
): React.element => {
  open Types

  let url = Near.nearTransactionUrl(networkId, hash)
  let hash = hash->NearTransactionHash.toString->React.string
  <ExternalLink href={url}> {hash} </ExternalLink>
}

module Success = {
  open Mui

  @react.component
  let make = (~response: Types.WithdrawResponseView.t, ~nearNetworkId: Types.NearNetworkId.t) => {
    let {amount, nearTransactionHash, recipientNearAccountId} = response

    <Box>
      <Alert severity=#success>
        <AlertTitle> {React.string(`Success! 🎉🎉🎉 `)} </AlertTitle>
        <p>
          {React.string(`Amount of ${Format.formatNearAmount4(amount)} is withdrawn to `)}
          {linkToNearAccount(nearNetworkId, recipientNearAccountId)}
        </p>
        <p>
          {React.string("Transaction ")} {linkToNearTransaction(nearNetworkId, nearTransactionHash)}
        </p>
      </Alert>
    </Box>
  }
}

let validate = (
  params: formParams,
  ~networkId: Types.NearNetworkId.t,
  ~availableBalance: Big.t,
): result<Types.WithdrawParams.t, formErrors> => {
  let recipientResult = validateRecipient(params.recipient, ~networkId)
  let amountResult = validateAmount(params.amount, ~availableBalance)

  switch (recipientResult, amountResult) {
  | (Ok(recipientNearAccountId), Ok(amount)) =>
    Ok({recipientNearAccountId: recipientNearAccountId, amount: amount})
  | _ =>
    Error({
      recipient: getError(recipientResult),
      amount: getError(amountResult),
    })
  }
}

module WithdrawForm = {
  open AsyncData
  open Mui

  let helperTextOrError = (helperText: string, error: option<string>) => {
    switch error {
    | Some(errMsg) => <FormHelperText> <b> {React.string(errMsg)} </b> </FormHelperText>
    | None => <FormHelperText> {React.string(helperText)} </FormHelperText>
    }
  }

  @react.component
  let make = (~nearNetworkId: Types.NearNetworkId.t, ~availableBalance: Big.t) => {
    let {reloadUser} = React.useContext(UserContext.context)

    let (formParams, setFormParams) = React.useState(emptyFormParams)
    let (formErrors, setFormErrors) = React.useState(emptyFormErrors)
    let (withdrawResponse, setWithdrawResponse) = React.useState(_ => NotAsked)

    let handleRecipientChange = (event: Mui.changeEvent) => {
      let recipient = event.target.value
      setFormParams(oldParams => {...oldParams, recipient: recipient})
    }
    let handleAmountChange = (event: Mui.changeEvent) => {
      let amount = event.target.value
      setFormParams(oldParams => {...oldParams, amount: amount})
    }

    let handleSubmit = _ => {
      let validationResult = validate(formParams, ~availableBalance, ~networkId=nearNetworkId)
      switch validationResult {
      | Ok(validWithdrawParams) => {
          setFormErrors(_ => emptyFormErrors())
          setWithdrawResponse(_ => Loading)
          Api.withdraw(validWithdrawParams)
          ->Promise.then(withdrawResult => {
            switch withdrawResult {
            | Ok(resp) => {
                setWithdrawResponse(_ => Done(Ok(resp)))
                reloadUser()
              }
            | Error(error) => {
                setFormErrors(_ => convertWithdrawErrorViewToFormErrors(error))
                let errMsg = formatWithdrawError(error)
                setWithdrawResponse(_ => Done(Error(errMsg)))
              }
            }
            Promise.resolve()
          })
          ->ignore
        }
      | Error(errors) => setFormErrors(_ => errors)
      }
    }

    let renderForm = (~isLoading: bool, ~commonError: option<string>) => {
      let errorGridItem = switch commonError {
      | Some(errMsg) =>
        <Grid item={true} xs={12}>
          <Alert severity=#error>
            <AlertTitle> {React.string("Withdrawal failed")} </AlertTitle> {React.string(errMsg)}
          </Alert>
        </Grid>
      | None => React.null
      }
      <Box sx={ReactDOM.Style.make(~flexGrow="1", ())}>
        <Grid container={true} spacing={2}>
          // Recipient
          <Grid item={true} xs={12}>
            <FormControl fullWidth={true}>
              <TextField
                fullWidth={true}
                required={true}
                id="recipient"
                label="Recipient account"
                value={formParams.recipient}
                onChange={handleRecipientChange}
                error={Belt.Option.isSome(formErrors.recipient)}
                disabled={isLoading}
              />
            </FormControl>
            {helperTextOrError("NEAR account address (e.g. vasya.near)", formErrors.recipient)}
          </Grid>
          // Amount
          <Grid item={true} xs={12}>
            <FormControl fullWidth={true}>
              <TextField
                fullWidth={true}
                required={true}
                id="amount"
                label="Amount"
                value={formParams.amount}
                onChange={handleAmountChange}
                error={Belt.Option.isSome(formErrors.amount)}
                disabled={isLoading}
              />
            </FormControl>
            {helperTextOrError(
              `You have ${Format.formatNearAmount4(availableBalance)} available for withdrawal`,
              formErrors.amount,
            )}
          </Grid>
          {
            // Common error
            errorGridItem
          }
          // Button
          <Grid item={true} xs={12}>
            <Grid container={true} justifyContent="center">
              <LoadingButton
                variant=#contained
                color=#primary
                onClick={handleSubmit}
                disabled={isLoading}
                loading={isLoading}>
                {React.string("Withdraw")}
              </LoadingButton>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    }

    switch withdrawResponse {
    | NotAsked => renderForm(~isLoading=false, ~commonError=None)
    | Loading => renderForm(~isLoading=true, ~commonError=None)
    | Done(Error(errMsg)) => renderForm(~isLoading=false, ~commonError=Some(errMsg))
    | Done(Ok(response)) => <Success response nearNetworkId />
    }
  }
}

@react.component
let make = (~nearNetworkId: Types.NearNetworkId.t, ~availableBalance: Big.t) => {
  open Mui

  <ApplicationBar title="Withdraw NEAR">
    <Toolbar>
      <Stack direction="row" spacing={2}>
        <ReactRouter.Link to="/deposit"> {React.string("Deposit")} </ReactRouter.Link>
        <ReactRouter.Link to="/withdraw"> {React.string("Withdraw")} </ReactRouter.Link>
      </Stack>
    </Toolbar>
    <Container>
      <Typography component=#h1 variant=#h4 align=#center color=#"text.primary" gutterBottom={true}>
        {React.string("Withdraw NEAR")}
      </Typography>
      <WithdrawForm availableBalance nearNetworkId />
    </Container>
  </ApplicationBar>
}
