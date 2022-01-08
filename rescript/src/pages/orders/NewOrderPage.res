let parseTweetId = (tweetUrl: string): option<Types.TweetId.t> => {
  let regex = %re("/https:\/\/(?:mobile\.)?twitter\.com\/.*\/status\/(\d+)/i")
  Js.Re.exec_(regex, tweetUrl)->Belt.Option.flatMap(result => {
    Js.Re.captures(result)->(
      matches => matches[1]->Js.Nullable.toOption->Belt.Option.map(Types.TweetId.fromString)
    )
  })
}

let parseInt = (value: string): option<int> => {
  Belt.Int.fromString(value)
}

type formParams = {
  tweetUrl: string,
  budget: string,
  numberOfTasks: string,
  taskCost: option<Big.t>,
}

type formErrors = {
  tweetUrl: option<string>,
  budget: option<string>,
  numberOfTasks: option<string>,
  taskCost: option<string>,
}

let emptyFormParams = (): formParams => {
  {
    tweetUrl: "",
    budget: "",
    numberOfTasks: "",
    taskCost: None,
  }
}

let emptyFormErrors = (): formErrors => {
  tweetUrl: None,
  budget: None,
  numberOfTasks: None,
  taskCost: None,
}

let validateTweetUrl = (tweetUrl: string): result<Types.TweetId.t, string> => {
  switch parseTweetId(tweetUrl) {
  | Some(tweetId) => Ok(tweetId)
  | None => Error("Tweet URL is invalid")
  }
}

let validateBudget = (budget: string): result<Big.t, string> => {
  switch Big.parse(budget) {
  | Some(budget) =>
    if Big.gt(budget, Big.fromString("1000")) {
      Error("Uh. Is it not too much? Take it easy.")
    } else if Big.lt(budget, Big.fromString("0.01")) {
      Error("Budget must be greater than 0.01 NEAR")
    } else {
      Ok(budget)
    }
  | None => Error("Invalid")
  }
}

let validateNumberOfTasks = (value: string): result<int, string> => {
  switch parseInt(value) {
  | None => Error("Invalid")
  | Some(number) =>
    if number < 1 {
      Error("Must not be less than 1")
    } else if number > 10_000 {
      Error("Sorry. 10K is maximum at the moment")
    } else {
      Ok(number)
    }
  }
}

let validateTaskCost = (taskCost: option<Big.t>): result<unit, string> => {
  switch taskCost {
  | Some(cost) =>
    if Big.lt(cost, Big.fromString("0.001")) {
      Error("Can not be less than 0.001 Ⓝ. Please adjust Budget or Number of retweets.")
    } else {
      Ok()
    }
  | None => Ok()
  }
}

let getError = (result: result<'a, 'e>): option<'e> => {
  switch result {
  | Ok(_) => None
  | Error(err) => Some(err)
  }
}

let validate = (params: formParams): result<Types.CreateRetweetOrderParams.t, formErrors> => {
  let {tweetUrl, budget, numberOfTasks, taskCost} = params

  let tweetUrlRes = validateTweetUrl(tweetUrl)
  let budgetRes = validateBudget(budget)
  let numberOfTasksRes = validateNumberOfTasks(numberOfTasks)
  let taskCostRes = validateTaskCost(taskCost)

  switch (tweetUrlRes, budgetRes, numberOfTasksRes, taskCostRes) {
  | (Ok(tweetId), Ok(budget), Ok(numberOfTasks), Ok()) =>
    Ok({
      tweetId: tweetId,
      budget: budget,
      numberOfTasks: numberOfTasks,
    })
  | _ =>
    Error({
      tweetUrl: getError(tweetUrlRes),
      budget: getError(budgetRes),
      numberOfTasks: getError(numberOfTasksRes),
      taskCost: getError(taskCostRes),
    })
  }
}

let convertCreateOrderErrorToFormErrors = (
  err: Types.CreateRetweetOrderErrorView.t,
): formErrors => {
  open Types.CreateRetweetOrderErrorView
  switch err {
  | NotEnoughAvailableBalance({budget: _, availableBalance}) => {
      let msg = `You have only ${Format.formatNearAmount4(availableBalance)} available`
      {...emptyFormErrors(), budget: Some(msg)}
    }
  | InvalidBudget => {...emptyFormErrors(), budget: Some("Invalid")}
  | ActiveOrderAlreadyExists => {
      ...emptyFormErrors(),
      tweetUrl: Some("An active order with this tweet already exist"),
    }
  | FailedToObtainTweet => {
      ...emptyFormErrors(),
      tweetUrl: Some("It looks like the tweet does not exist or not available for public"),
    }
  | InvalidNumberOfTasks => {...emptyFormErrors(), numberOfTasks: Some("Invalid")}
  }
}

module OrderForm = {
  open Mui

  @react.component
  let make = () => {
    let {reloadUser} = React.useContext(UserContext.context)
    let (formParams, setFormParams) = React.useState(emptyFormParams)
    let (formErrors, setFormErrors) = React.useState(emptyFormErrors)

    // Set taskCost when budget or numberOfTasks change
    React.useEffect2(() => {
      let taskCost = switch (Big.parse(formParams.budget), parseInt(formParams.numberOfTasks)) {
      | (Some(budget), Some(numberOfTasks)) => {
          let number = Big.fromInt(numberOfTasks)
          let cost = Big.div(budget, number)
          Some(cost)
        }
      | _ => None
      }
      setFormParams(oldParams => {...oldParams, taskCost: taskCost})

      None
    }, (formParams.budget, formParams.numberOfTasks))

    let history = ReactRouter.useHistory()
    let navigateTo = (path: string) => {
      ReactRouter.History.push(history, path)
    }

    let handleTweetUrlChange = (event: Mui.changeEvent) => {
      let tweetUrl = event.target.value
      setFormParams(oldParams => {...oldParams, tweetUrl: tweetUrl})
    }

    let handleNumberOfTasksChange = (event: Mui.changeEvent) => {
      let numberOfTasks = event.target.value
      setFormParams(oldParams => {...oldParams, numberOfTasks: numberOfTasks})
    }

    let handleBudgetChange = (event: Mui.changeEvent) => {
      let budget = event.target.value
      setFormParams(oldParams => {...oldParams, budget: budget})
    }

    let clickHandler = () => {
      switch validate(formParams) {
      | Ok(validParams) =>
        Api.createRetweetOrder(validParams)
        ->Promise.then(result => {
          switch result {
          | Ok(_) => {
              reloadUser()
              navigateTo("/orders/my")
            }
          | Error(error) => {
              let errors = convertCreateOrderErrorToFormErrors(error)
              setFormErrors(_ => errors)
            }
          }
          Promise.resolve()
        })
        ->ignore
      | Error(errors) => setFormErrors(_ => errors)
      }
    }

    let helperTextOrError = (helperText: string, error: option<string>) => {
      switch error {
      | Some(errMsg) => <FormHelperText> <b> {React.string(errMsg)} </b> </FormHelperText>
      | None => <FormHelperText> {React.string(helperText)} </FormHelperText>
      }
    }

    let costToString = (taskCost: option<Big.t>): string => {
      switch taskCost {
      | Some(cost) => Format.formatNearAmount4(cost)
      | None => ""
      }
    }

    <Box flexGrow=1>
      <Grid container={true} spacing={2}>
        <Grid item={true} xs={12}>
          <FormControl fullWidth=true error={Belt.Option.isSome(formErrors.tweetUrl)}>
            <TextField
              fullWidth=true
              required=true
              id="tweet-url"
              label="Tweet URL"
              onChange={handleTweetUrlChange}
              value={formParams.tweetUrl}
            />
            {helperTextOrError("URL of Tweet you want to promote", formErrors.tweetUrl)}
          </FormControl>
        </Grid>
        <Grid item=true xs={12} md={4}>
          <FormControl fullWidth=true error={Belt.Option.isSome(formErrors.budget)}>
            <TextField
              fullWidth=true
              required=true
              id="budget"
              label=`Budget Ⓝ`
              onChange={handleBudgetChange}
              value={formParams.budget}
            />
            {helperTextOrError("Maximum budget you want to spend", formErrors.budget)}
          </FormControl>
        </Grid>
        <Grid item=true xs={12} md={4}>
          <FormControl fullWidth=true error={Belt.Option.isSome(formErrors.numberOfTasks)}>
            <TextField
              fullWidth=true
              required=true
              id="number-of-tasks"
              label="Number of retweets"
              onChange={handleNumberOfTasksChange}
              value={formParams.numberOfTasks}
            />
            {helperTextOrError(
              "Number of retweets you want to get for the given budget",
              formErrors.numberOfTasks,
            )}
          </FormControl>
        </Grid>
        <Grid item=true xs={12} md={4}>
          <FormControl fullWidth=true error={Belt.Option.isSome(formErrors.numberOfTasks)}>
            <TextField
              fullWidth=true
              disabled=true
              id="retweet-cost"
              label="Retweet cost (calculated autmatically)"
              value={costToString(formParams.taskCost)}
            />
            {helperTextOrError(
              "Cost of a single retweet. Calculated automatically based on Budget and Number of Retweets",
              formErrors.taskCost,
            )}
          </FormControl>
        </Grid>
        <Grid item=true xs={12}>
          <Grid container=true justifyContent="center">
            <Button variant=#contained color=#primary onClick={clickHandler}>
              {React.string("Create Retweet Order")}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  }
}

@react.component
let make = () => {
  open Mui

  <ApplicationBar title="Create New Order">
    <Container>
      <Toolbar />
      <Typography component=#h1 variant=#h4 align=#center gutterBottom=true>
        {React.string("Create retweet order")}
      </Typography>
      <OrderForm />
    </Container>
  </ApplicationBar>
}
