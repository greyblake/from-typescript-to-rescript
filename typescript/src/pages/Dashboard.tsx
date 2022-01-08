import React from 'react';

import { Typography, Container, Toolbar } from '@mui/material';
import type { CurrentUserView } from 'types';
import { ApplicationBar } from 'components/applicationBarV2';
import { Link as RouterLink } from 'react-router-dom';

function DashboardPage({currentUser}: {currentUser: CurrentUserView}) {
    const content = (
        <main>
            <div>
                <Toolbar />
                <Container maxWidth="md">
                    <Typography component="h3" variant="h3" align="center" color="textPrimary" gutterBottom>
                        Hello {currentUser.name}
                    </Typography>
                    <Typography component="h4" variant="h4" align="center" color="textPrimary" gutterBottom>
                        <RouterLink to="/deposit"> Start by depositing some NEAR to your balance in order to promote your tweets. </RouterLink>
                    </Typography>
                    <Typography component="h4" variant="h4" align="center" color="textPrimary" gutterBottom>
                        OR
                    </Typography>
                    <Typography component="h4" variant="h4" align="center" color="textPrimary" gutterBottom>
                        <RouterLink to="/tasks/claimable">Check available tasks if you want to earn NEAR</RouterLink>
                    </Typography>
                </Container>
            </div>
        </main>
    );

    return <ApplicationBar
        title="Welcome"
        content={content}
    />;
}

export { DashboardPage };
