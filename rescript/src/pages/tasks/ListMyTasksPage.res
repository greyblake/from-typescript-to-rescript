module MainContent = {
  open AsyncData
  open Promise
  open Types

  let renderMyTask = (taskWithTweet: TaskWithTweetView.t) => {
    open Mui

    let {task, tweet} = taskWithTweet
    <Card>
      <CardContent>
        <Typography color=#"text.secondary">
          {("Reward: " ++ Format.formatNearAmount4(task.contractorReward))->React.string}
        </Typography>
        <Typography color=#"text.secondary">
          {("Status: " ++ TaskStatusView.display(task.status))->React.string}
        </Typography>
        <Typography variant=#body2 component=#p>
          {tweet.text->Tweet.shortenTweetText->React.string}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size=#small>
          <ReactRouter.Link to={`/tasks/${task.id->TaskId.toString}`}>
            {"Task details"->React.string}
          </ReactRouter.Link>
        </Button>
      </CardActions>
    </Card>
  }

  let renderTaskList = (tasks: array<TaskWithTweetView.t>) => {
    let taskItems =
      tasks
      ->Belt.Array.map(task => {
        let key = TaskId.toString(task.task.id)
        <Mui.Grid item={true} xs={12} md={6} lg={4} key> {renderMyTask(task)} </Mui.Grid>
      })
      ->React.array

    let boxStyle = ReactDOM.Style.make(~flexGrow="1", ())
    <Mui.Box sx=boxStyle> <Mui.Grid container={true} spacing={2}> taskItems </Mui.Grid> </Mui.Box>
  }

  @react.component
  let make = () => {
    let (myTasks, setMyTasks) = React.useState(_ => Loading)

    React.useEffect0(() => {
      Api.getMyTasks()
      ->then(tasks => tasks->(tasks => (_ => Done(tasks))->setMyTasks->resolve))
      ->ignore
      None
    })

    switch myTasks {
    | NotAsked
    | Loading =>
      <SkeletonCardList />
    | Done(tasks) => renderTaskList(tasks)
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
        {React.string("My Tasks")}
      </Mui.Typography>
      <MainContent />
    </Mui.Container>
  </ApplicationBar>
}
