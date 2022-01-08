import React from 'react';
import { ClaimableRetweetOrderView, TaskView } from "types";
import {
    Typography, Container, Button,
    Grid, Box, Card, CardContent, CardActions, Toolbar, Stack,
} from '@mui/material';
import { useHistory } from "react-router-dom";
import Big from 'big.js';

import { ApiClient } from 'apiClient';
import { RemoteData } from 'remoteData';
import { formatNearAmount4 } from 'utils/format';
import { tweetUrl, shortenTweetText } from 'utils/tweet';
import { ApplicationBar } from 'components/applicationBarV2';
import { Link } from "react-router-dom";
import { ExternalLink } from 'components/externalLink';
import { SkeletonCardList } from 'components/SkeletonCardList';

function ListClaimableTasksPage() {
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
                    Available Tasks
                </Typography>
                <MainContent />
            </Container>
        </>
    )
    return (
        <ApplicationBar
            content={content}
            title="Available Tasks"
        />
    );
}


function MainContent() {
    let [claimableOrders, setClaimableOrders] = React.useState(RemoteData.newNotAsked<Array<ClaimableRetweetOrderView>, Error>());

    React.useEffect(() => {
        const apiClient = new ApiClient();
        apiClient.getClaimableRetweetOrders().then((claimableOrders) => {
            const sortedClaimableOrders = claimableOrders.sort(cmpByReward).reverse();
            setClaimableOrders(RemoteData.newSuccess(sortedClaimableOrders));
        }).catch(err => {
            console.log(err);
            setClaimableOrders(RemoteData.newFailure(err));
        });
    }, []);

    return claimableOrders.match({
        notAsked: () => <SkeletonCardList />,
        loading: () => <SkeletonCardList />,
        failure: (_) => <>Oops. Something went wrong.</>,
        success:  (orders) => {
            return <ClaimableOrderList claimableOrders={orders} />
        },
    });
}

function ClaimableOrderList(props: {claimableOrders: Array<ClaimableRetweetOrderView>}) {
    const orderItems = props.claimableOrders.map((claimableOrder) => {
        return (
            <Grid item xs={12} md={6} lg={4} key={claimableOrder.id}>
                <ClaimableOrder claimableOrder={claimableOrder}  />
            </Grid>
        );
    });

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                {orderItems}
            </Grid>
        </Box>
    );
}


function ClaimableOrder(props: {claimableOrder: ClaimableRetweetOrderView}) {
    const { id, reward, tweet } = props.claimableOrder;
    return (
        <Card>
            <CardContent>
                <Typography color="textSecondary">
                    Reward: {formatNearAmount4(reward)}
                </Typography>
                <Typography variant="body2" component="p">
                    {shortenTweetText(tweet.text)}
                </Typography>
            </CardContent>
            <CardActions>
                <ClaimTaskButton orderId={id} />
                 &nbsp;&nbsp;&nbsp;
                <ExternalLink href={tweetUrl(tweet.id)}>Open Tweet</ExternalLink>
            </CardActions>
        </Card>
    );
}

function ClaimTaskButton(props: {orderId: string}) {
    const { orderId } = props;
    const history = useHistory();

    const showErrorAlert = () => {
        alert("Ooops! An error has occurred. Maybe try to reload?");
    };
    const navigateToTask = (taskId: string) => {
        history.push(`/tasks/${taskId}`);
    };

    const handler = () => {
        const apiClient = new ApiClient();
        apiClient.claimOrderTask(orderId).then((taskResult) => {
            taskResult.match({
                ok: (task: TaskView) => {
                    navigateToTask(task.id);
                },
                err: (error) => {
                    switch (error.tag) {
                        case "UserAlreadyHasTask":
                            navigateToTask(error.content.taskId);
                            break;
                        default:
                            console.log(error);
                            showErrorAlert();
                    }
                }
            });
        }).catch((err) => { console.log(err); showErrorAlert() });
    };

    return (
        <Button size="small" color="primary" variant="contained" onClick={handler}>
            &nbsp; CLAIM &nbsp;
        </Button>
    );
}

function cmpByReward(orderA: ClaimableRetweetOrderView, orderB: ClaimableRetweetOrderView): number {
    const rewardA = Big(orderA.reward).toNumber();
    const rewardB = Big(orderB.reward).toNumber();
    if (rewardA > rewardB) {
        return 1;
    } else if (rewardA < rewardB) {
        return -1;
    } else {
        return 0;
    }
}

export { ListClaimableTasksPage };
