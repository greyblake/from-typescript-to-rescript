import React from 'react';
import Big from 'big.js';

import type { CurrentUserView } from 'types';
import { ApplicationBar } from 'components/applicationBarV2';
import { ApiClient } from 'apiClient';
import { RemoteData } from 'remoteData';
import { Result } from 'result';
import { formatNearAmount } from 'utils/format';
import { assertNever } from 'utils/assertNever';
import type { NearNetworkId } from 'near';
import type { WithdrawParams, WithdrawResponseView, WithdrawErrorView } from 'types/ledger';
import { ExternalLink } from 'components/externalLink';
import { Link as RouterLink } from "react-router-dom";

import {
    Typography, Container, FormControl, TextField, FormHelperText,
    Grid, Box, Toolbar, Alert, AlertTitle, Stack,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {nearAccountUrl, nearTransactionUrl} from 'utils/near';

interface WithdrawPageProps {
    nearNetworkId: NearNetworkId,
    loadMainState: () => void,
    currentUser: CurrentUserView,
}

function WithdrawPage(props: WithdrawPageProps) {
    const { currentUser, nearNetworkId, loadMainState } = props;
    return <ApplicationBar
        content={<Content availableBalance={currentUser.balance} nearNetworkId={nearNetworkId} loadMainState={loadMainState}/>}
        title="Withdraw NEAR"
    />;
}

interface ContentProps {
    availableBalance: Big,
    nearNetworkId: NearNetworkId,
    loadMainState: () => void,
}

function Content(props: ContentProps) {
    const { availableBalance, nearNetworkId, loadMainState } = props;
    return (
        <>
            <Toolbar>
                <Stack direction="row" spacing={2}>
                    <RouterLink to="/deposit">Deposit</RouterLink>
                    <RouterLink to="/withdraw">Withdraw</RouterLink>
                </Stack>
            </Toolbar>
            <Container>
                <Typography component="h1" variant="h4" align="center" color="textPrimary" gutterBottom>
                    Withdraw NEAR
                </Typography>
                <WithdrawForm availableBalance={availableBalance} nearNetworkId={nearNetworkId} loadMainState={loadMainState}/>
            </Container>
        </>
    );
}

interface FormParams {
    recipient: string,
    amount: string,
}

function defaultFormParams(): FormParams {
    return {
        recipient: "",
        amount: "",
    };
}

interface FormErrors {
    recipient: string | null;
    amount: string | null;
}

function defaultFormErrors(): FormErrors {
    return {
        recipient: null,
        amount: null,
    };
}

function validate(params: FormParams, opts: { availableBalance: Big, nearNetworkId: NearNetworkId }): Result<WithdrawParams, FormErrors> {
    const recipientResult = validateRecipient(params.recipient, opts);
    const amountResult = validateAmount(params.amount, opts);

    if (recipientResult.isOk() && amountResult.isOk()) {
        return Result.newOk({
            recipientNearAccountId: recipientResult.unwrap(),
            amount: amountResult.unwrap(),
        });
    } else {
        return Result.newErr({
            recipient: recipientResult.err(),
            amount: amountResult.err(),
        });
    }
}

function validateRecipient(recipient: string, {nearNetworkId}: {nearNetworkId: NearNetworkId}): Result<string, string> {
    const sanitizedRecipient = recipient.trim();
    if (sanitizedRecipient === "") {
        return Result.newErr("Cannot be empty");
    }
    const regexp = accountAddressRegexpforNearNetwork(nearNetworkId);
    if (sanitizedRecipient.match(regexp)) {
        return Result.newOk(sanitizedRecipient);
    } else {
        return Result.newErr("Is invalid");
    }
}

function accountAddressRegexpforNearNetwork(nearNetworkId: NearNetworkId): RegExp {
    switch (nearNetworkId) {
        case "mainnet": return /^[a-zA-Z0-9-_]+\.near$/;
        case "testnet": return /^[a-zA-Z0-9-_]+\.testnet$/;
        default:
            return assertNever(nearNetworkId);
    }
}

function validateAmount(amountString: string, opts: { availableBalance: Big }): Result<string, string> {
    const { availableBalance } = opts;

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
        return Result.newErr("The minimal amount for withdrawal is 0.1 NEAR");
    }
    if (amount.toNumber() > 20) {
        return Result.newErr("The maximum amount for withdrawal is 20 NEAR");
    }

    if (amount.toNumber() > availableBalance.toNumber()) {
        return Result.newErr(`You have only ${formatNearAmount(availableBalance)} available`);
    }

    return Result.newOk(trimmed);
}

interface WithdrawFormProps {
    availableBalance: Big,
    nearNetworkId: NearNetworkId,
    loadMainState: () => void,
}

function WithdrawForm(props: WithdrawFormProps) {
    const { availableBalance, nearNetworkId, loadMainState } = props;

    const [formParams, setFormParams] = React.useState<FormParams>(defaultFormParams);
    const [formErrors, setFormErrors] = React.useState<FormErrors>(defaultFormErrors);
    const [withdrawResponse, setWithdrawResponse] = React.useState<RemoteData<WithdrawResponseView, string>>(RemoteData.newNotAsked());

    const handleRecipientChange = (event: any) => {
        const recipient = event.target.value;
        setFormParams(params  => ({ ...params,  recipient }));
    };

    const handleAmountChange = (event: any) => {
        const amount = event.target.value;
        setFormParams(params  => ({ ...params, amount }));
    };

    const handleClick = (_event: any) => {
        const result = validate(formParams, { availableBalance, nearNetworkId });
        result.match({
            ok: (params: WithdrawParams) => {
                setFormErrors(defaultFormErrors());
                setWithdrawResponse(RemoteData.newLoading());
                const apiClient = new ApiClient();
                apiClient.withdraw(params).then((withdrawResult) => {
                    withdrawResult.match({
                        ok: (resp) => {
                            setWithdrawResponse(RemoteData.newSuccess(resp));
                            loadMainState();
                        },
                        err: (err) => {
                            const errMsg = formatWithdrawError(err);
                            setFormErrors(convertWithdrawErrorViewToFormErrors(err));
                            setWithdrawResponse(RemoteData.newFailure(errMsg));
                        }
                    });
                })
                .catch((_) => setWithdrawResponse(RemoteData.newFailure("We are sorry. Something went wrong.")));
            },
            err: (errors: FormErrors) => {
                setFormErrors(errors);
            }
        });
    };

    const renderForm = (isLoading: boolean, commonError: string|null) => {
        const errorGridItem = commonError ?
            (
                <Grid item xs={12}>
                    <Alert severity="error">
                        <AlertTitle>Withdrawal failed</AlertTitle>
                        {commonError}
                    </Alert>
                </Grid>
            ) : (<></>);


        return (
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <TextField fullWidth required id="recipient" label="Recipient account" value={formParams.recipient} onChange={handleRecipientChange} error={!!formErrors.recipient}  disabled={isLoading}/>
                            { formErrors.recipient ?
                                <FormHelperText>{formErrors.recipient}</FormHelperText>
                                :
                                <FormHelperText>NEAR account address</FormHelperText>
                            }
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <TextField fullWidth required id="amount" label="Amount" value={formParams.amount} onChange={handleAmountChange} error={!!formErrors.amount} disabled={isLoading}/>
                            { formErrors.amount ?
                                <FormHelperText>{formErrors.amount}</FormHelperText>
                                :
                                <FormHelperText>You have <strong>{formatNearAmount(Big(availableBalance))}</strong> available for withdrawal</FormHelperText>
                            }
                        </FormControl>
                    </Grid>
                    { errorGridItem }
                    <Grid item xs={12}>
                        <Grid container justifyContent="center">
                            <LoadingButton variant="contained" color="primary" onClick={handleClick} disabled={isLoading} loading={isLoading}>
                                Withdraw
                            </LoadingButton>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return withdrawResponse.match({
        notAsked: () => renderForm(false, null),
        loading: () => renderForm(true, null),
        failure: (errMsg) => renderForm(false, errMsg),
        success: (response) => Success({response, nearNetworkId}),
    });
}

interface SuccessProps {
    response: WithdrawResponseView,
    nearNetworkId: NearNetworkId,
}

function Success(props: SuccessProps) {
    const { nearNetworkId, response } = props;
    const { amount, nearTransactionHash, recipientNearAccountId } = response;
    return (
        <Box>
            <Alert severity="success">
                <AlertTitle> Success! 🎉🎉🎉 </AlertTitle>
                <p>Amount of {formatNearAmount(Big(amount))} is withdrawn to {linkToNearAccount(nearNetworkId, recipientNearAccountId)}.</p>
                <p>Transaction {linkToNearTransaction(nearNetworkId, nearTransactionHash)}</p>
            </Alert>
        </Box>
    );
}

function linkToNearAccount(nearNetworkId: NearNetworkId, account: string): React.ReactNode {
    const url = nearAccountUrl(nearNetworkId, account);
    return <ExternalLink href={url}>{account}</ExternalLink>;
}

function linkToNearTransaction(nearNetworkId: NearNetworkId, hash: string): React.ReactNode {
    const url = nearTransactionUrl(nearNetworkId, hash);
    return <ExternalLink href={url}>{hash}</ExternalLink>;
}

function convertWithdrawErrorViewToFormErrors(error: WithdrawErrorView): FormErrors {
    const formErrors = defaultFormErrors();

    switch (error.tag) {
        case "InvalidRecipient": {
            return { ...formErrors, recipient: "Is invalid" };
        }
        case "RecipientAccountDoesNotExist": {
            const { recipientAccountId } = error.content;
            return { ...formErrors, recipient: `Account ${recipientAccountId} does not exist` };
        }
        case "RequestedAmountTooSmall": {
            const { minAmount } = error.content;
            return { ...formErrors, amount: `The minimal amount for withdrawal is ${minAmount} NEAR` };
        }
        case "RequestedAmountTooHigh": {
            const { maxAmount } = error.content;
            return { ...formErrors, amount: `The maximum amount for withdrawal is ${maxAmount} NEAR` };
        }
        case "InsufficientFunds": {
            const { availableBalance } = error.content;
            return { ...formErrors, amount: `Available balance is not sufficient: ${formatNearAmount(Big(availableBalance))}` };
        }
        default:
            return assertNever(error);
    }
}

function formatWithdrawError(error: WithdrawErrorView): string {
    switch (error.tag) {
        case "InvalidRecipient": {
            return "Recipient is invalid";
        }
        case "RecipientAccountDoesNotExist": {
            const { recipientAccountId } = error.content;
            return `Recipient account ${recipientAccountId} does not exist`;
        }
        case "RequestedAmountTooSmall": {
            const { minAmount, requestedAmount } = error.content;
            return `The minimal amount for withdrawal is ${minAmount} NEAR, but was requested only ${requestedAmount} NEAR`;
        }
        case "RequestedAmountTooHigh": {
            const { maxAmount, requestedAmount } = error.content;
            return `The maximum amount for withdrawal is ${maxAmount} NEAR, but was requested ${requestedAmount} NEAR`;
        }
        case "InsufficientFunds": {
            const { availableBalance, requestedAmount } = error.content;
            return `Available balance is ${formatNearAmount(Big(availableBalance))}, what is not sufficient to withdraw ${formatNearAmount(Big(requestedAmount))}`;
        }
        default:
            return assertNever(error);
    }
}


export { WithdrawPage };
