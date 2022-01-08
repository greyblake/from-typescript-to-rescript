open Types

let explainTaskStatus = (status: TaskStatusView.t): string => {
  switch status {
  | Claimed => "Please retweet the tweet in order to earn the reward."
  | Abandoned => "The task was claimed, but was not performed within reasonable time"
  | Performed => "You have performed the task. Once it is verified you will get your reward"
  | Bungled => "You had retweeted the tweet, but later undid."
  | Verified => "Your task is verified. Wait for the reward to come soon!"
  | PaidOut => "You have performed the task and got your reward."
  }
}

module TweetCard = {
  @react.component
  let make = (~tweet: TweetView.t) => {
    <Mui.Card>
      <Mui.CardContent>
        <Mui.Typography variant=#body2 component=#p>
          {tweet.text->Tweet.shortenTweetText->React.string}
        </Mui.Typography>
      </Mui.CardContent>
      <Mui.CardActions>
        <ExternalLink href={Tweet.tweetUrl(tweet.id)}> {React.string("Open Tweet")} </ExternalLink>
      </Mui.CardActions>
    </Mui.Card>
  }
}

module MyTask = {
  open AsyncData

  @react.component
  let make = (~task: TaskWithTweetView.t, ~onTaskChanged: TaskView.t => unit) => {
    let {task, tweet} = task
    let (checkState, setCheckState) = React.useState(_ => NotAsked)

    React.useEffect1(() => {
      switch checkState {
      | Done(Ok(Ok(t: TaskView.t))) => onTaskChanged(t)
      | _ => ()
      }
      None
    }, [checkState])

    let confirmAction = if task.status === Claimed {
      let onClick = _event => {
        setCheckState(_ => Loading)

        Api.checkTaskPerformance(task.id)
        ->Promise.then(task => setCheckState(_ => Done(Ok(task)))->Promise.resolve)
        ->Promise.catch(err => setCheckState(_ => Done(Error(err)))->Promise.resolve)
        ->ignore
      }

      switch checkState {
      | NotAsked =>
        <Mui.Button onClick size=#small variant=#contained>
          {"I did retweet"->React.string}
        </Mui.Button>
      | Loading => <Mui.CircularProgress disableShrink=true />
      | Done(Ok(Ok(_: TaskView.t))) =>
        <Mui.Alert severity=#success>
          {"You did it! It will take 24h-48h until you get your reward."->React.string}
        </Mui.Alert>
      | Done(Ok(Error(TaskNotPerformed))) =>
        <Mui.Alert severity=#warning>
          {"It does not look like you have performed the task."->React.string}
        </Mui.Alert>
      | Done(_) =>
        <Mui.Alert severity=#error>
          {"Oops. Something went wrong. Try to reload?"->React.string}
        </Mui.Alert>
      }
    } else {
      <> </>
    }

    <>
      {("Reward: " ++ Format.formatNearAmount4(task.contractorReward))->React.string}
      <br />
      {`Status: ${TaskStatusView.display(task.status)}`->React.string}
      <Mui.Typography color=#"text.secondary">
        {task.status->explainTaskStatus->React.string}
      </Mui.Typography>
      <br />
      confirmAction
      <br />
      <TweetCard tweet />
    </>
  }
}

type asyncTask = AsyncData.t<TaskWithTweetView.t>
module MainContent = {
  @react.component
  let make = (~taskId: TaskId.t) => {
    open AsyncData
    open Promise

    let (myTask: asyncTask, setMyTask) = React.useState(() => Loading)

    React.useEffect1(() => {
      Api.getMyTask(taskId)->then(task => task->(t => (_ => Done(t))->setMyTask->resolve))->ignore
      None
    }, [taskId])

    let onTaskChanged = (newTask: TaskView.t) => {
      setMyTask(prevData => {
        prevData->AsyncData.map(prevTaskAndTweet => {
          {
            ...prevTaskAndTweet,
            task: newTask,
          }
        })
      })
    }

    switch myTask {
    | NotAsked | Loading => <Mui.CircularProgress disableShrink=true />
    | Done(task) => <MyTask task onTaskChanged />
    }
  }
}

type urlParams = {taskId: string}
@react.component
let make = () => {
  let {taskId}: urlParams = ReactRouter.useParams()
  let taskId = TaskId.TaskId(taskId)

  <ApplicationBar title="Task">
    <Mui.Toolbar>
      <Mui.Stack direction="row" spacing={2}>
        <ReactRouter.Link to="/tasks/claimable"> {React.string("New tasks")} </ReactRouter.Link>
        <ReactRouter.Link to="/tasks/my"> {React.string("Past tasks")} </ReactRouter.Link>
      </Mui.Stack>
    </Mui.Toolbar>
    <Mui.Container>
      <Mui.Typography component=#h1 variant=#h4 align=#center gutterBottom=true>
        {React.string("Task")}
      </Mui.Typography>
      <MainContent taskId />
    </Mui.Container>
  </ApplicationBar>
}
