import React from 'react';

import type { ExtendedRetweetOrderView } from 'types';

import { styled } from '@mui/material/styles';
import {
    Typography, Container, Button,
    Grid, Box, Card, CardContent, CardActions, Toolbar, Chip, Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';
import * as _ from 'lodash';

import { ApiClient } from 'apiClient';
import { RemoteData } from 'remoteData';
import { tweetUrl, shortenTweetText } from 'utils/tweet';
import { formatNearAmount4 } from 'utils/format';
import { ApplicationBar } from 'components/applicationBarV2';
import { Link as RouterLink } from 'react-router-dom';
import { ExternalLink } from 'components/externalLink';
import { SkeletonCardList } from 'components/SkeletonCardList';

const UnstyledLink = styled(RouterLink)`
    text-decoration: none;

    &:focus, &:hover, &:visited, &:link, &:active {
        text-decoration: none;
    }
`;

function ListMyOrdersPage() {
    const content = (
        <>
            <Toolbar>
                <UnstyledLink to="/orders/new">
                    <Button variant="contained" color="primary">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}>
                            <AddCircleOutlineIcon /> <span style={{marginLeft: '4px'}}>New Order</span>
                        </div>
                    </Button>
                </UnstyledLink >
            </Toolbar>
            <Container>
                <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
                    My Orders
                </Typography>
                <MainContent />
            </Container>
        </>
    );

    return (
        <ApplicationBar
            content={content}
            title="My Orders"
        />
    );
}


function MainContent() {
    let [myOrders, setMyOrders] = React.useState(RemoteData.newNotAsked<Array<ExtendedRetweetOrderView>, Error>());

    React.useEffect(() => {
        const apiClient = new ApiClient();
        apiClient.getMyRetweetOrders().then((orders) => {
            const sortedOrders = _.sortBy(orders, (o) => o.retweetOrder.createdAt).reverse();
            setMyOrders(RemoteData.newSuccess(sortedOrders));
        }).catch(err => setMyOrders(RemoteData.newFailure(err)))
    }, []);

    return myOrders.match({
        notAsked: () => <SkeletonCardList />,
        loading: () => <SkeletonCardList />,
        failure: (_) => <>Oops. Something went wrong.</>,
        success:  (orders) => {
            return <OrderList orders={orders} />
        },
    });
}

function OrderList(props: {orders: Array<ExtendedRetweetOrderView>}) {
    const orderItems = props.orders.map((order) => {
        return (
            <Grid item lg={4} md={6} key={order.retweetOrder.id} style={{ width: '100%' }}>
                <MyRetweetOrder extOrder={order}  />
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


function MyRetweetOrder(props: {extOrder: ExtendedRetweetOrderView}) {
    const { retweetOrder, tweet, details } = props.extOrder;
    return (
        <Card style={{ width: '100%' }}>
            <CardContent>
                <Grid container>
                    <Grid item xs={8}>
                        <Typography color="textSecondary" style={{ whiteSpace: 'nowrap' }}>
                            Budget: {formatNearAmount4(retweetOrder.budget)}
                        </Typography>
                    </Grid>
                    <Grid item xs={4}>
                        <Grid container justifyContent="flex-end">
                            <ProgressChip performed={details.numberOfTasksPerformed} total={retweetOrder.numberOfTasks} />
                        </Grid>
                    </Grid>
                </Grid>
                <Typography variant="body2" component="p">
                    {shortenTweetText(tweet.text)}
                </Typography>
            </CardContent>
            <CardActions>
                <ExternalLink href={tweetUrl(retweetOrder.tweetId)}>Open Tweet</ExternalLink>
            </CardActions>
        </Card>
    );
}

interface ProgressChipProps {
    performed: number,
    total: number,
}

function ProgressChip(props: ProgressChipProps) {
    const { performed, total } = props;

    const label = `${performed} / ${total}`;
    const icon = <TaskOutlinedIcon />;
    const tooltipText = `${performed} out of ${total} tasks are performed`;
    return (
        <Tooltip arrow title={tooltipText}>
            <Chip label={label} icon={icon} size="small"/>
        </Tooltip>
    );
}

export { ListMyOrdersPage };
