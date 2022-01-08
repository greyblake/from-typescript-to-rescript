import { NearNetworkId } from "near"
import { assertNever } from "./assertNever";

function nearTransactionUrl(networkId: NearNetworkId, hash: string) {
    switch (networkId) {
        case "mainnet": return `https://explorer.near.org/transactions/${hash}`;
        case "testnet": return `https://explorer.testnet.near.org/transactions/${hash}`;
        default:
            return assertNever(networkId);
    }
}

function nearAccountUrl(networkId: NearNetworkId, account: string) {
    switch (networkId) {
        case "mainnet": return `https://explorer.near.org/accounts/${account}`;
        case "testnet": return `https://explorer.testnet.near.org/accounts/${account}`;
        default:
            return assertNever(networkId);
    }
}

export { nearTransactionUrl, nearAccountUrl };
