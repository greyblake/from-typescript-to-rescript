import React from 'react';

import Big from 'big.js';

import {
    Typography, Container, FormControl, FormHelperText, Button,
    Tooltip, CircularProgress, Grid, Toolbar, Stack, TextField, Box, Alert, AlertTitle,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useLocation } from 'react-router-dom';
import { Link as RouterLink } from "react-router-dom";

import type { CreateRequestDepositParams } from 'types';
import type { NearEnv } from 'near';
import { RemoteData } from 'remoteData';
import { ApiClient } from 'apiClient';
import { ApplicationBar } from 'components/applicationBarV2';
import { Result } from 'result';

const useStyles = makeStyles({
    paper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
});


// Take from example: https://reactrouter.com/web/example/query-parameters
function useQuery(): URLSearchParams {
    return new URLSearchParams(useLocation().search);
}


interface DepositPageProps {
    nearEnv: RemoteData<NearEnv, Error>,
    loadMainState: () => void,
}

function DepositPage(props: DepositPageProps) {
    const { nearEnv, loadMainState } = props;
    const classes = useStyles();

    const content = (
        <>
            <Toolbar>
                <Stack direction="row" spacing={2}>
                    <RouterLink to="/deposit">Deposit</RouterLink>
                    <RouterLink to="/withdraw">Withdraw</RouterLink>
                </Stack>
            </Toolbar>
            <Container maxWidth="md" className={classes.paper}>
                <Grid container spacing={0} direction="column" alignItems="center" justifyContent="center" >
                    <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
                        Deposit NEAR
                    </Typography>
                    <MainContent nearEnvData={nearEnv} loadMainState={loadMainState}/>
                </Grid>
            </Container>
        </>
    );

    return <ApplicationBar title="Deposit NEAR" content={content}/>;
}

interface MainContentProps {
    nearEnvData: RemoteData<NearEnv, Error>,
    loadMainState: () => void,
}

function MainContent({nearEnvData, loadMainState}: MainContentProps) {
    const query = useQuery();
    const transactionHash = query.get('transactionHashes');

    if (transactionHash) {
        return <FinalizeTransaction transactionHash={transactionHash} loadMainState={loadMainState} />;
    } else {
        // Init deposit
        return nearEnvData.match({
            notAsked: () => <CircularProgress disableShrink />,
            loading: () => <CircularProgress disableShrink />,
            failure: (_) => <CircularProgress disableShrink />,
            success: (nearEnv) => {
                if (nearEnv.walletAccount.isSignedIn()) {
                    return <DepositForm nearEnv={nearEnv}/>;
                } else {
                    return <ConnectNearWallet nearEnv={nearEnv} />
                }
            }
        });
    }
}

interface FinalizeTransactionProps {
    transactionHash: string,
    loadMainState: () => void,
}

function FinalizeTransaction({transactionHash, loadMainState}: FinalizeTransactionProps) {
    let [depositRequestData, setDepositRequestData] = React.useState(RemoteData.newNotAsked<{}, Error>());

    React.useEffect(() => {
        const apiClient = new ApiClient();
        apiClient.finilizeDepositRequest({transactionHash}).then(() => {
            setDepositRequestData(RemoteData.newSuccess({}));
            loadMainState();
        });
    }, [transactionHash, loadMainState]);

    const renderLoading = () => {
        return <>
            <CircularProgress disableShrink />
            <p>Almost there! We are verifying your transaction... </p>
        </>;
    }

    return depositRequestData.match({
        notAsked: renderLoading,
        loading: renderLoading,
        failure: (_) => <>We're sorry. An error has occurred. Please contract support providing the transaction hash: ${transactionHash}</>,

        // TODO: Display proper message and transaction details.
        success:  (_) => {
            return (
                <Alert severity="success">
                    <AlertTitle> Success! 🎉🎉🎉 </AlertTitle>
                    <p>Congratulation! You successfully deposited!</p>
                    <p>Now you can <RouterLink to='/orders/new'>create orders to promote your tweets!</RouterLink></p>
                </Alert>
            );
        },
    });
}


function ConnectNearWallet({nearEnv}: {nearEnv: NearEnv}) {
    const handler = () => {
        nearEnv.walletAccount.requestSignIn(
            nearEnv.config.contractName,
            "Inhyped"
        );
    };

    return <>
        <p>To proceed please connect your NEAR account</p>

        <Button variant="contained" color="primary" onClick={handler}>
            Connect NEAR account
        </Button>
    </>;
}


interface DepositFormParams {
    amount: string,
}

interface DepositFormErrors {
    amount: string | null,
}

function defaultDepositFormParams(): DepositFormParams {
    return {
        amount: "10",
    };
}

function defaultDepositFormErrors(): DepositFormErrors {
    return {
        amount: null,
    };
}

function DepositForm({nearEnv}: {nearEnv: NearEnv}) {
    const [formParams, setFormParams] = React.useState<DepositFormParams>(defaultDepositFormParams);
    const [formErrors, setFormErrors] = React.useState<DepositFormErrors>(defaultDepositFormErrors);

    const handleAmountChange = (event: any) => {
        const amount = event.target.value;
        setFormParams(params  => ({ ...params, amount }));
    };

    const handleClick = () => {
        const result = validateDepositFormParams(formParams);
        result.match({
            ok: (validParams: CreateRequestDepositParams) => {
                // Create a deposit token
                const apiClient = new ApiClient();
                apiClient.createDepositRequest(validParams).then((depositRequest) => {
                    // SUBMIT TO NEAR
                    const contract = nearEnv.contract;
                    const BOATLOAD_OF_GAS = Big(3).times(10 ** 13).toFixed();
                    contract.deposit(
                        // function arguments
                        { token: depositRequest.token },

                        // Gas limit
                        BOATLOAD_OF_GAS,

                        // Deposit attached
                        Big(depositRequest.amount).times(10 ** 24).toFixed()
                    ).then(() => {
                      console.log("Deposited!")
                    });
                });
            },
            err: (errors: DepositFormErrors) => setFormErrors(errors),
        });
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <TextField fullWidth required id="amount" label="Amount" value={formParams.amount} onChange={handleAmountChange} error={!!formErrors.amount}/>
                        { formErrors.amount ?
                            <FormHelperText>{formErrors.amount}</FormHelperText>
                            :
                            <FormHelperText>Amount of NEAR you want to deposit</FormHelperText>
                        }
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Grid container justifyContent="center">
                        <Tooltip title="You will be redirected to NEAR wallet page to authorize the tranfer." aria-label="add">
                            <Button variant="contained" color="primary" onClick={handleClick}>
                                Deposit with NEAR
                            </Button>
                        </Tooltip>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

function validateDepositFormParams(params: DepositFormParams): Result<CreateRequestDepositParams, DepositFormErrors> {
    const amountResult = validateAmount(params.amount);
    if (amountResult.isOk()) {
        return Result.newOk({
            amount: amountResult.unwrap(),
        });
    } else {
        return Result.newErr({
            amount: amountResult.err(),
        });
    }
}

function validateAmount(amountString: string): Result<string, string> {
    const trimmed = amountString.trim();

    if (trimmed === "") {
        return Result.newErr("Cannot be empty");
    }

    let amount;
    try  {
        amount = Big(amountString);
    } catch {
        return Result.newErr("Is invalid");
    }

    // NOTE: Big comparison does not work properly so we have to fallback on number
    if (amount.toNumber() < 0.1) {
        return Result.newErr("The minimal amount is 0.1 NEAR");
    }
    if (amount.toNumber() > 1000) {
        return Result.newErr("The maximum amount is 1000 NEAR");
    }

    return Result.newOk(trimmed);
}


export { DepositPage };
