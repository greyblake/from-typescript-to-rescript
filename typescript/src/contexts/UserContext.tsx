import React from 'react';

import type { CurrentUserView } from 'types';
import { RemoteData } from 'remoteData';

const UserContext = React.createContext<RemoteData<CurrentUserView, Error>>(RemoteData.newLoading());

export { UserContext };
