import React from 'react';

import type { TaskStatusView, TaskView, TaskWithTweetView, TweetView, CheckTaskPerformanceErrorView } from 'types';

import {
    Typography, Container, Button, CircularProgress,
    Card, CardContent, CardActions, Alert, Toolbar, Stack
} from '@mui/material';
import { useParams, Link } from "react-router-dom";

import { ApplicationBar } from 'components/applicationBarV2';
import { ApiClient } from 'apiClient';
import { RemoteData } from 'remoteData';
import { tweetUrl } from 'utils/tweet';
import { Result } from 'result';
import { ExternalLink } from 'components/externalLink';

function MyTaskPage() {
    let { taskId } = useParams<{taskId: string}>();

    const content = (
        <>
            <Toolbar>
                <Stack direction="row" spacing={2}>
                    <Link to="/tasks/claimable">New tasks</Link>
                    <Link to="/tasks/my">Past tasks</Link>
                </Stack>
            </Toolbar>
            <Container>
                <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
                    Task
                </Typography>
                <MainContent taskId={taskId}/>
            </Container>
        </>
    );
    return <ApplicationBar title="Task" content={content} />;
}

function MainContent({taskId}: {taskId: string}) {
    let [myTask, setMyTask] = React.useState(RemoteData.newNotAsked<TaskWithTweetView, Error>());

    React.useEffect(() => {
        const apiClient = new ApiClient();
        apiClient.getMyTask(taskId).then((myTask) => {
            setMyTask(RemoteData.newSuccess(myTask));
        }).catch(err => setMyTask(RemoteData.newFailure(err)))
    }, [taskId]);

    const updateTaskCallback = (task: TaskView) => {
        const myUpdatedTask = myTask.mapSuccess(taskWithTweet => ({ ...taskWithTweet, task }));
        setMyTask(myUpdatedTask);
    };

    const renderLoading = () => {
        return <>
            <CircularProgress disableShrink />
            <p>Loading the tasks...</p>
        </>;
    }

    return myTask.match({
        notAsked: renderLoading,
        loading: renderLoading,
        failure: (_) => <>Oops. Something went wrong.</>,
        success:  (taskWithTweet) => {
            return <MyTask taskWithTweet={taskWithTweet} updateTaskCallback={updateTaskCallback} />
        },
    });
}


interface MyTaskProps {
    taskWithTweet: TaskWithTweetView,
    updateTaskCallback: (tv: TaskView) => void,
}

function MyTask({taskWithTweet, updateTaskCallback}: MyTaskProps) {
    const { task, tweet } = taskWithTweet;

    const [checkState, setCheckState] =
        React.useState(RemoteData.newNotAsked<Result<TaskView, CheckTaskPerformanceErrorView>, Error>());

    let confirmButton = <></>;

    if (task.status === "Claimed") {
        const confirmHandler = () => {
            setCheckState(RemoteData.newLoading());
            const apiClient = new ApiClient();
            apiClient.checkTaskPerformance(task.id).then((result) => {
                setCheckState(RemoteData.newSuccess(result));
                // call updateTaskCallback with the received task
                result.mapOk(updateTaskCallback);
            }).catch(err => setCheckState(RemoteData.newFailure(err)));
        };

        const errorAlert = <Alert severity="error">Oops. Something went wrong. Try to reload? 🤕 </Alert>;
        const successAlert = <Alert severity="success">You did it! It will take a while until you get your reward 😀 </Alert>;
        const notPerformedAlert = <Alert severity="warning">It does not look like you have performed the task 😢</Alert>;
        confirmButton = checkState.match({
            notAsked: () => <Button size="small" variant="contained" onClick={confirmHandler}> I did retweet </Button>,
            loading: () => <CircularProgress disableShrink />,
            failure: (_) => errorAlert,
            success: (result) => result.match({
                ok: (task) => successAlert,
                err: (err) => err === "TaskNotPerformed" ? notPerformedAlert : errorAlert,
            })
        });
    }

    return (
        <>
            Reward: {task.contractorReward} Ⓝ
            <br />
            Status: {task.status} <Typography color="text.secondary">{ explainTaskStatus(task.status) }</Typography>
            <br />
            { confirmButton }

            <br />
            <TweetCard tweet={tweet} />
        </>
    );
}

function TweetCard({tweet}: {tweet: TweetView}) {
    return (
        <Card>
            <CardContent>
                <Typography variant="body2" component="p">
                    {tweet.text}
                </Typography>
            </CardContent>
            <CardActions>
                <ExternalLink href={tweetUrl(tweet.id)}>Open Tweet</ExternalLink>
            </CardActions>
        </Card>
    );
}

function explainTaskStatus(status: TaskStatusView): string {
    switch (status) {
        case "Claimed": return "Please retweet the tweet in order to earn the reward.";
        case "Abandoned": return "The task was claimed, but was not performed within reasonable time";
        case "Performed": return "You have performed the task. Once it is verified you will get your reward";
        case "Bungled": return "You had retweeted the tweet, but later undid.";
        case "Verified": return "Your task is verified. Wait for the reward to come soon!";
        case "PaidOut": return "You have performed the task and got your reward.";
        default: throw new Error(`Unknown task status: ${status}`);
    }
}


export { MyTaskPage };
