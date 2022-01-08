import type {
    ApiErrorView,
    CurrentUserView, CurrentUserViewRaw,
    SeedView, SeedViewRaw,
    CreateRequestDepositParams, DepositRequestView,
    FinilizeRequestDepositParams, CreateRetweetOrderParams,
    ClaimableRetweetOrderView, TaskView, ClaimTaskErrorView, TaskWithTweetView,
    CheckTaskPerformanceErrorView, CreateRetweetOrderErrorView, ExtendedRetweetOrderView
} from './types';

import type {
    WithdrawParams, WithdrawResponseView, WithdrawErrorView
} from './types/ledger';
import { Result } from 'result';
import Big from 'big.js';

class ApiClient {
    getSeed(): Promise<SeedView | null> {
        const headers = {'Content-Type': 'application/json'};
        return fetch("/api/seed", { headers })
            .then(async (response) => {
                if (response.ok) {
                    let seedViewRaw = await response.json();
                    return convertSeedViewRawToSeedView(seedViewRaw);
                } else {
                    return null;
                }
            });
    }

    createDepositRequest(params: CreateRequestDepositParams): Promise<DepositRequestView> {
        const headers = {'Content-Type': 'application/json'};
        return fetch('/api/deposit-requests', {
            headers,
            method: 'POST',
            body: JSON.stringify(params),
        }).then((response) => {
            if (response.ok) {
                return response.json() as Promise<DepositRequestView>;
            } else {
                throw new Error("Failed to create DepositRequest");
            }
        });
    }

    finilizeDepositRequest(params: FinilizeRequestDepositParams): Promise<{}> {
        const headers = {'Content-Type': 'application/json'};
        return fetch('/api/deposit-requests/finilize', {
            headers,
            method: 'POST',
            body: JSON.stringify(params),
        }).then((response) => {
            if (response.ok) {
                return Promise.resolve({});
            } else {
                return Promise.reject();
            }
        });
    }

    createRetweetOrder(params: CreateRetweetOrderParams): Promise<Result<ExtendedRetweetOrderView, CreateRetweetOrderErrorView>> {
        return post('/api/retweet-orders', params);
    }

    getMyRetweetOrders(): Promise<Array<ExtendedRetweetOrderView>> {
        return get("/api/retweet-orders/my");
    }

    getClaimableRetweetOrders(): Promise<Array<ClaimableRetweetOrderView>> {
        return get("/api/retweet-orders/claimable");
    }

    claimOrderTask(retweetOrderId: string): Promise<Result<TaskView, ClaimTaskErrorView>> {
        return post(`/api/retweet-orders/${retweetOrderId}/claim-task`);
    }

    getMyTasks(): Promise<Array<TaskWithTweetView>> {
        return get('/api/tasks/my');
    }

    getMyTask(taskId: string): Promise<TaskWithTweetView> {
        return get(`/api/tasks/${taskId}`);
    }

    checkTaskPerformance(taskId: string): Promise<Result<TaskView, CheckTaskPerformanceErrorView>> {
        return post(`/api/tasks/${taskId}/check-performance`);
    }

    withdraw(params: WithdrawParams): Promise<Result<WithdrawResponseView, WithdrawErrorView>> {
        return post('/api/withdraw', params);
    }
}

function get<T>(path: string): Promise<T> {
    const headers = {'Content-Type': 'application/json'};
    return fetch(path, { headers })
        .then(async (response) => {
            if (response.ok) {
                return (await response.json() as T);
            } else {
                return Promise.reject(response);
            }
        });
}

function post<Params, Response, Err>(path: string, params: Params|undefined = undefined): Promise<Result<Response, Err>> {
    const options = {
        headers: {'Content-Type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(params),
    }
    return fetch(path, options)
        .then(async (response) => {
            if (response.ok) {
                const responsePayload = await response.json() as Response;
                return Result.newOk(responsePayload);
            } else if (response.status === 400) {
                const apiError = await response.json() as ApiErrorView<Err>;
                switch (apiError.tag) {
                    case "Validation":
                        return Result.newErr(apiError.content);
                    default:
                        return Promise.reject(response);
                }
            } else {
                return Promise.reject(response);
            }
        });
}

function convertCurrentUserViewRawToCurrentUserView(raw: CurrentUserViewRaw): CurrentUserView {
    return {
        ...raw,
        balance: Big(raw.balance)
    };
}

function convertSeedViewRawToSeedView(raw: SeedViewRaw): SeedView {
    return {
        ...raw,
        currentUser: convertCurrentUserViewRawToCurrentUserView(raw.currentUser)
    };
}


export { ApiClient };
