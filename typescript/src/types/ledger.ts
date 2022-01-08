
interface WithdrawParams {
    recipientNearAccountId: string;
    amount: string;
}

type WithdrawErrorView =
    | { tag: "InvalidRecipient" }
    | { tag: "RecipientAccountDoesNotExist",
        content: {
            recipientAccountId: string,
        }
    }
    | { tag: "RequestedAmountTooSmall";
        content: {
            minAmount: string;
            requestedAmount: string;
        };
    }
    | { tag: "RequestedAmountTooHigh";
        content: {
            maxAmount: string;
            requestedAmount: string;
        };
    }
    | { tag: "InsufficientFunds";
        content: {
            availableBalance: string;
            requestedAmount: string;
        };
    };

interface WithdrawResponseView {
    nearTransactionHash: string;
    amount: string;
    recipientNearAccountId: string;
}

export type { WithdrawParams, WithdrawErrorView, WithdrawResponseView };
