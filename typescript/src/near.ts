import * as nearAPI from "near-api-js"
import type { NearConfigView } from 'types';

// Resources:
// * https://github.com/near-examples/guest-book/blob/master/src/App.js#L30-L43
// * https://docs.near.org/docs/api/naj-quick-reference#call-contract
// * https://github.com/mehtaphysical/near-js/blob/dd0e1ad79990844764c42c7dd3728a8c69f29eae/packages/near-transaction-manager/src/sender/WalletTransactionSender.ts#L61-L72
// * https://github.com/ref-finance/ref-ui/blob/e445129d524021d48d0ff13cf59bb52532a8fe00/src/services/near.ts#L84-L105


// const [nearConfig, setNearConfig] = React.useState<NearConfigView | null>(null);
// const [near, setNear] = React.useState<nearAPI.Near | null>(null);
// const [nearContract, setNearContract] = React.useState<nearAPI.Contract | null>(null);
// const [nearWalletAccount, setNearWalletAccount]


interface DepositMethoArgs {
    token: string,
}

interface ContractChangeMethods {
    deposit: (args: DepositMethoArgs, gasLimit: string, amount: string) => Promise<any>;
}

type AppContract = nearAPI.Contract & ContractChangeMethods;

type NearNetworkId = "mainnet" | "testnet";

interface NearEnv {
    config: NearConfigView;
    near: nearAPI.Near;
    walletConnection: nearAPI.WalletConnection;
    walletAccount: nearAPI.WalletConnection;
    contract: AppContract;
}

async function setupNear(config: NearConfigView): Promise<NearEnv> {
    const near = await nearAPI.connect(
        Object.assign(
            { deps: { keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore() } },
            config
        )
    );
    const walletConnection = new nearAPI.WalletConnection(near, null);
    const walletAccount = new nearAPI.WalletAccount(near, null);

    const contract = new nearAPI.Contract(walletConnection.account(), config.contractName, {
        viewMethods: [],
        changeMethods: ['deposit'],
        // sender: walletAccount.getAccountId(),
    }) as AppContract;

    return {
        config,
        near,
        walletConnection,
        walletAccount,
        contract,
    };
}

export {
    setupNear,
};

export type { NearEnv, NearNetworkId };
