import React from 'react';

import type { CreateRetweetOrderParams, CreateRetweetOrderErrorView, ExtendedRetweetOrderView } from 'types';
import { makeStyles } from '@mui/styles';
import { ApplicationBar } from 'components/applicationBarV2';
import { ApiClient } from 'apiClient';
import { Result } from 'result';
import Big from 'big.js';
import { assertNever } from "utils/assertNever";

import {
    Typography, Container, FormControl, TextField, FormHelperText,
    Grid, Box, Button, Toolbar,
} from '@mui/material';
import { useHistory } from "react-router-dom";
import {formatNearAmount, formatNearAmount4} from 'utils/format';

const useStyles = makeStyles((theme) => ({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    formContainer: {
        marginTop: '24px',
    },
}));

interface NewOrderPageProps {
    loadMainState: () => void,
}

function NewOrderPage(props: NewOrderPageProps) {
    const { loadMainState } = props;

    const content = (
        <Container>
            <Toolbar />
            <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
                Create retweet order
            </Typography>
            <OrderForm loadMainState={loadMainState}/>
        </Container>
    );

    return <ApplicationBar
        content={content}
        title="Create New Order"
    />;
}

interface FormParams {
    tweetUrl: string;
    budget: string;
    numberOfTasks: string;
    taskCost: Big | null;
}

interface FormErrors {
    tweetUrl: string | null;
    budget: string | null;
    numberOfTasks: string | null;
    taskCost: string | null;
}

function newFormErrors(): FormErrors {
    return {
        tweetUrl: null,
        budget: null,
        numberOfTasks: null,
        taskCost: null,
    };
}

function validate(params: FormParams): Result<CreateRetweetOrderParams, FormErrors> {
    const { tweetUrl, budget, numberOfTasks, taskCost } = params;

    const formErrors: FormErrors = newFormErrors();

    // Tweet URL
    const tweetId = parseTweetId(tweetUrl);
    if (!tweetId) {
        formErrors.tweetUrl = "Tweet URL is invalid";
    }

    // Budget
    const parsedBudget = parseFloat(budget);
    if (Number.isNaN(parsedBudget)) {
        formErrors.budget = "Invalid";
    } else if (parsedBudget < 0.01) {
        formErrors.budget = "Budget must be greater than 0.01 NEAR";
    } else if (parsedBudget > 1000) {
        formErrors.budget = "Uh. Is it not too much? Take it easy.";
    }

    // Number of tasks
    const parsedNumberOfTasks = parseInt(numberOfTasks);
    if (Number.isNaN(parsedNumberOfTasks)) {
        formErrors.numberOfTasks = "Invalid";
    } else if (parsedNumberOfTasks < 1) {
        formErrors.numberOfTasks = "Must not be less than 1";
    } else if (parsedNumberOfTasks > 10_000) {
        formErrors.numberOfTasks = "Sorry. 10K is maximum at the moment";
    }

    // If taskCost is null, then the problem is either with Budger or numberOfTasks, which is handled by corresponding validation.
    if (taskCost && taskCost.toNumber() < 0.001) {
        formErrors.taskCost = "Can not be less than 0.001 Ⓝ. Please adjust Budget or Number of retweets.";
    }

    if (formErrors.tweetUrl || formErrors.budget || formErrors.numberOfTasks || formErrors.taskCost) {
        return Result.newErr(formErrors);
    } else {
        return Result.newOk({
            tweetId: tweetId as string, // tweetId presence was verified before
            budget,
            numberOfTasks: parsedNumberOfTasks,
        });
    }
}

interface OrderFormProps {
    loadMainState: () => void,
}

function OrderForm(props: OrderFormProps) {
    const { loadMainState } = props;

    const classes = useStyles();
    const history = useHistory();

    const defaultFormParams: FormParams = {
        tweetUrl: "",
        budget: "",
        numberOfTasks: "",
        taskCost: null,
    };
    const defaultFormErrors: FormErrors = {
        tweetUrl: null,
        budget: null,
        numberOfTasks: null,
        taskCost: null,
    };

    const [formParams, setFormParams] = React.useState<FormParams>(defaultFormParams);
    const [formErrors, setFormErrors] = React.useState<FormErrors>(defaultFormErrors);

    const handleTweetUrlChange = (event: any) => {
        const tweetUrl = event.target.value;
        setFormParams({ ...formParams, tweetUrl });
    };
    const handleBudgetChange = (event: any) => {
        const budget = event.target.value;
        setFormParams({ ...formParams, budget });
    };
    const handleNumberOfTasksChange = (event: any) => {
        const numberOfTasks = event.target.value;
        setFormParams({ ...formParams, numberOfTasks });
    };

    // Calculate cost of a single retweet
    React.useEffect(() => {
        //const  { numberOfTasks, budget } = formParams;
        try {
            let tasks: Big = Big(formParams.numberOfTasks);
            let totalAmount: Big = Big(formParams.budget);
            let taskCost: Big = Big(totalAmount.toNumber() / tasks.toNumber());
            setFormParams({ ...formParams, taskCost });
        } catch (err) {
            setFormParams({ ...formParams, taskCost: null });
        }
    // eslint-disable-next-line
    }, [formParams.numberOfTasks, formParams.budget]);

    const clickHandler = (event: any) => {
        const result = validate(formParams);
        result.match({
            ok: (params: CreateRetweetOrderParams) => {
                const apiClient = new ApiClient();
                apiClient.createRetweetOrder(params).then((result) => {
                    result.match({
                        ok: (order: ExtendedRetweetOrderView) => {
                            loadMainState();
                            history.push('/orders/my');
                        },
                        err: (error: CreateRetweetOrderErrorView) => {
                            setFormErrors(convertCreateOrderErrorToFormErrors(error));
                        },
                    });
                });
            },
            err: (errors: FormErrors) => {
                setFormErrors(errors);
            }
        });
    };

    return (
        <div className={classes.formContainer}>
            <Box sx={{ flexGrow: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl fullWidth error={!!formErrors.tweetUrl}>
                        <TextField fullWidth required id="tweet-url" label="Tweet URL" onChange={handleTweetUrlChange} value={formParams.tweetUrl}/>
                        { formErrors.tweetUrl === null
                           ?  <FormHelperText id="tweet-url-helper">URL of Tweet you want to promote</FormHelperText>
                           :  <FormHelperText id="tweet-url-error"><b>{formErrors.tweetUrl}</b></FormHelperText>
                        }
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!formErrors.budget}>
                        <TextField fullWidth required id="budget" label="Budget Ⓝ" onChange={handleBudgetChange} value={formParams.budget}/>
                        { formErrors.budget === null
                           ?  <FormHelperText id="budget-helper">Maximum budget you want to spend</FormHelperText>
                           :  <FormHelperText id="budget-error"><b>{formErrors.budget}</b></FormHelperText>
                        }
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!formErrors.numberOfTasks}>
                        <TextField fullWidth required id="number-of-tasks" label="Number of retweets" onChange={handleNumberOfTasksChange} value={formParams.numberOfTasks}/>
                        { formErrors.numberOfTasks === null
                           ?  <FormHelperText id="number-of-tasks-helper">Number of retweets you want to get for the given budget</FormHelperText>
                           :  <FormHelperText id="number-of-tasks-error"><b>{formErrors.numberOfTasks}</b></FormHelperText>
                        }
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth error={!!formErrors.numberOfTasks}>
                        <TextField fullWidth disabled id="retweet-cost" label="Retweet cost (calculated autmatically)" value={formParams.taskCost ? formatNearAmount4(formParams.taskCost) : ""}/>
                        { formErrors.taskCost === null
                            ? <FormHelperText id="retweet-cost-helper">Cost of a single retweet. Calculated automatically based on <i>Budget</i> and <i>Number of Retweets</i></FormHelperText>
                            : <FormHelperText id="number-of-tasks-error"><b>{formErrors.taskCost}</b></FormHelperText>
                        }
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Grid container justifyContent="center">
                        <Button variant="contained" color="primary" onClick={clickHandler}>
                            Create Retweet Order
                        </Button>
                    </Grid>
                </Grid>
              </Grid>
            </Box>
        </div>
    );
}

function parseTweetId(tweetUrl: string): string | null {
    const regex = /https:\/\/twitter\.com\/.*\/status\/(\d+)/i;
    const mat = tweetUrl.match(regex);
    if (!!mat && !!mat[1]) {
        return mat[1];
    } else {
        return null;
    }
}

function convertCreateOrderErrorToFormErrors(error: CreateRetweetOrderErrorView): FormErrors {
    const formErrors: FormErrors = newFormErrors();

    switch (error.tag) {
        case "NotEnoughAvailableBalance": {
            const availableBalance = Big(error.content.availableBalance);
            return { ...formErrors, budget: `You have only ${formatNearAmount(availableBalance)} available` };
        }
        case "ActiveOrderAlreadyExists": {
            return { ...formErrors, tweetUrl: "An active order with this tweet already exist" };
        }
        case "FailedToObtainTweet": {
            return { ...formErrors, tweetUrl: "It looks like the tweet does not exist or not available for public" };
        }
        case "InvalidBudget": {
            return { ...formErrors, budget: "Invalid" };
        }
        case "InvalidNumberOfTasks": {
            return { ...formErrors, numberOfTasks: "Invalid" };
        }
        default:
            return assertNever(error);
    }
}


export { NewOrderPage };
