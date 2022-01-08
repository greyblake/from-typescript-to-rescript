import Big from 'big.js';
import { NearNetworkId } from 'near';

export type ApiErrorView<VE> =
    | { tag: "Internal" }
    | { tag: "Unauthorized" }
    | { tag: "Validation", content: VE }
    | { tag: "Malformed" }
    | { tag: "NotFound" };

interface CurrentUserViewRaw {
    name: string;
    profileImageUrl: string;
    balance: string;
}

interface CurrentUserView {
    name: string;
    profileImageUrl: string;
    balance: Big;
}

interface NearConfigView {
    contractName: string;
    helperUrl: string;
    networkId: NearNetworkId;
    nodeUrl: string;
    walletUrl: string;
}

interface SeedView {
    currentUser: CurrentUserView;
    nearConfig: NearConfigView;
}

interface SeedViewRaw {
    currentUser: CurrentUserViewRaw;
    nearConfig: NearConfigView;
}

// Request deposits
//
interface CreateRequestDepositParams {
    amount: string;
}
interface DepositRequestView {
    token: string;
    amount: string;
}
interface FinilizeRequestDepositParams {
    transactionHash: string;
}

// Tweet
interface TweetView {
    id: string;
    text: string;
    authorTwitterAccountId: number,
    tweetCreatedAt: string,
}

// Retweet orders
//
interface MyRetweetOrderView {
    id: string;
    tweetId: string;
    budget: string;
    numberOfTasks: number;
    createdAt: string;
    updatedAt: string;
}
interface ExtendedRetweetOrderView {
    retweetOrder: MyRetweetOrderView;
    tweet: TweetView;
    details: RetweetOrderDetailsView;
}
interface RetweetOrderDetailsView {
    numberOfTasksPerformed: number;
}

interface CreateRetweetOrderParams {
    tweetId: string;
    budget: string;
    numberOfTasks: number;
}

// Claimable orders and tasks
//
interface ClaimableRetweetOrderView {
    id: string,
    reward: string,
    tweet: TweetView
}

type TaskStatusView = "Claimed" | "Abandoned" | "Performed" | "Bungled" | "Verified" | "PaidOut";

interface TaskView {
    id: string,
    orderId: string,
    status: TaskStatusView,
    contractorReward: string,
}

type ClaimTaskErrorView =
    | { tag: "UserAlreadyHasTask", content: { taskId: string } }
    | { tag: "OrderNotFound" }
    | { tag: "OrderIsNotActive" }
    | { tag: "OrderHasNoFreeTaskSlots" };

type CreateRetweetOrderErrorView = {
    tag: "NotEnoughAvailableBalance";
    content: {
        availableBalance: string;
        budget: string;
    };
} | {
    tag: "ActiveOrderAlreadyExists";
} | {
    tag: "FailedToObtainTweet";
} | {
    tag: "InvalidBudget";
} | {
    tag: "InvalidNumberOfTasks";
};

interface TaskWithTweetView {
    task: TaskView,
    tweet: TweetView,
}

type CheckTaskPerformanceErrorView = "UnexpectedTaskStatus" | "TaskNotPerformed";

export type {
    CurrentUserView, CurrentUserViewRaw, NearConfigView,
    SeedView, SeedViewRaw,
    CreateRequestDepositParams, DepositRequestView, FinilizeRequestDepositParams,
    TweetView, MyRetweetOrderView, CreateRetweetOrderParams,
    ClaimableRetweetOrderView, TaskStatusView, TaskView, CreateRetweetOrderErrorView, ClaimTaskErrorView,
    TaskWithTweetView, CheckTaskPerformanceErrorView,
    ExtendedRetweetOrderView, RetweetOrderDetailsView,
};


