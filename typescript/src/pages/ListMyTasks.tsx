import React from 'react';

import type { TaskWithTweetView } from 'types';

import {
    Typography, Container, Button,
    Grid, Box, Card, CardContent, CardActions, Toolbar, Stack
} from '@mui/material';
import { Link } from "react-router-dom";

import { ApiClient } from 'apiClient';
import { RemoteData } from 'remoteData';
import { formatNearAmount4 } from 'utils/format';
import { shortenTweetText } from 'utils/tweet';
import { ApplicationBar } from 'components/applicationBarV2';
import { SkeletonCardList } from 'components/SkeletonCardList';

function ListMyTasksPage() {
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
                    My Tasks
                </Typography>
                <MainContent />
            </Container>
        </>
    );

    return <ApplicationBar
        title="My Tasks"
        content={content}
    />;
}

function MainContent() {
    let [myTasks, setMyTasks] = React.useState(RemoteData.newNotAsked<Array<TaskWithTweetView>, Error>());

    React.useEffect(() => {
        const apiClient = new ApiClient();
        apiClient.getMyTasks().then((tasks) => {
            setMyTasks(RemoteData.newSuccess(tasks));
        }).catch(err => setMyTasks(RemoteData.newFailure(err)))
    }, []);

    return myTasks.match({
        notAsked: () => <SkeletonCardList />,
        loading: () => <SkeletonCardList />,
        failure: (_) => <>Oops. Something went wrong.</>,
        success:  (tasks) => {
            return <TaskList tasks={tasks} />
        },
    });
}

function TaskList(props: {tasks: Array<TaskWithTweetView>}) {
    const taskGridElements = props.tasks.map((task) => {
        return (
            <Grid item xs={12} md={6} lg={4} key={task.task.id}>
                <MyTask task={task}  />
            </Grid>
        );
    });

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                {taskGridElements}
            </Grid>
        </Box>
    );
}


function MyTask(props: {task: TaskWithTweetView}) {
    const { task, tweet } = props.task;
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary">
                    Reward: {formatNearAmount4(task.contractorReward)}
                </Typography>
                <Typography color="textSecondary">
                    Status: {task.status}
                </Typography>
                <Typography variant="body2" component="p">
                    {shortenTweetText(tweet.text)}
                </Typography>
            </CardContent>
            <CardActions>
                <Button size="small">
                    <Link to={`/tasks/${task.id}`}>Task details</Link>
                </Button>
            </CardActions>
        </Card>
    );
}


export { ListMyTasksPage };
