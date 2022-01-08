import React from 'react';
import './App.css';

import { HomePage } from './pages/Home';
import { DashboardPage } from './pages/Dashboard';
import { DepositPage } from './pages/Deposit';
import { NewOrderPage } from './pages/NewOrder';
import { ListMyOrdersPage } from './pages/ListMyOrders';
import { ListClaimableTasksPage } from './pages/ListClaimableTasks';
import { ListMyTasksPage } from './pages/ListMyTasks';
import { MyTaskPage } from './pages/MyTask';
import { WithdrawPage } from './pages/Withdraw';

import type { CurrentUserView, NearConfigView, SeedView } from './types';
import { ApiClient } from './apiClient';
import { setupNear } from './near';
import type { NearEnv } from './near';
import { RemoteData } from 'remoteData';
import { ApplicationBarContext } from 'components/applicationBarV2';
import { useLocalStorage } from 'hooks';
import { UserContext } from 'contexts/UserContext';

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';

function App() {
    const [nearEnv, setNearEnv] = React.useState(RemoteData.newNotAsked<NearEnv, Error>());
    const [seed, setSeed] = React.useState(RemoteData.newNotAsked<SeedView, Error>());
    const [isApplicationBarOpen, setIsApplicationBarOpen] = useLocalStorage("isApplicationBarOpen", true);

    const loadMainState = React.useCallback(() => {
        const apiClient = new ApiClient();
        apiClient.getSeed().then((data) => {
            if (data !== null) {
                setSeed(RemoteData.newSuccess(data));

                setupNear(data.nearConfig).then((nearEnv) => {
                    setNearEnv(RemoteData.newSuccess(nearEnv));
                });
            } else {
                setSeed(RemoteData.newFailure(new Error("Not logged in")));
            }
        });
    }, []);

    React.useEffect(() => {
        loadMainState();
    }, [loadMainState]);

    const userData = seed.mapSuccess(seedData => seedData.currentUser);

    return (
        <UserContext.Provider value={userData}>
            <ApplicationBarContext.Provider value={{isOpen: isApplicationBarOpen, setIsOpen: setIsApplicationBarOpen}}>
            {
                seed.match({
                    notAsked: () => <HomePage state="loading" />,
                    loading: () => <HomePage state="loading" />,
                    failure: (err) => <HomePage state="notLoggedIn" />,
                    success: (seed) => <AppRouter currentUser={seed.currentUser} nearEnv={nearEnv} nearConfig={seed.nearConfig} loadMainState={loadMainState} />,
                })
            }
            </ApplicationBarContext.Provider>
        </UserContext.Provider>
    );

}


interface AppRouterProps {
    currentUser: CurrentUserView,
    nearEnv: RemoteData<NearEnv, Error>,
    nearConfig: NearConfigView,
    loadMainState: () => void,
}

function AppRouter({currentUser, nearEnv, nearConfig, loadMainState}: AppRouterProps) {
    return (
        <Router>
            <Switch>
                <Route exact path="/deposit">
                    <DepositPage nearEnv={nearEnv} loadMainState={loadMainState} />
                </Route>
                <Route exact path="/withdraw">
                    <WithdrawPage currentUser={currentUser} nearNetworkId={nearConfig.networkId} loadMainState={loadMainState} />
                </Route>
                <Route exact path="/orders/new">
                    <NewOrderPage loadMainState={loadMainState}/>
                </Route>
                <Route exact path="/orders/my">
                    <ListMyOrdersPage />
                </Route>
                <Route exact path="/tasks/claimable">
                    <ListClaimableTasksPage />
                </Route>
                <Route exact path="/tasks/my">
                    <ListMyTasksPage />
                </Route>
                <Route exact path="/tasks/:taskId">
                    <MyTaskPage/>
                </Route>
                <Route exact path="/">
                    <DashboardPage currentUser={currentUser} />
                </Route>
            </Switch>
        </Router>
    );
}

export { App };
