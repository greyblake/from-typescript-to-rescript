import React from 'react';

import { Button, Typography, Grid, Container, Toolbar, Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ApplicationBar } from 'components/applicationBar';
import { assertNever } from 'utils/assertNever';
import { InhypedIcon } from 'icons/InhypedIcon';

const useStyles = makeStyles({
  icon: {
    marginRight: '8px',
  },
  heroContent: {
    padding: '32px 0px 24px',
  },
  heroButtons: {
    marginTop: '16px',
  },
});


type State = "loading" | "notLoggedIn";

interface HomePageProps {
    state: State,
}

function HomePage(props: HomePageProps) {
    const { state } = props;
    return (
        <>
            <ApplicationBar user={null}/>
            <main>
                <Content state={state} />
            </main>
        </>
    );
}

function Content({state}: {state: State}) {
    switch (state) {
        case "loading": return <LoadingContent />;
        case "notLoggedIn": return <HelloContent />;
        default:
            return assertNever(state);
    }
}


function LoadingContent() {
    return (
        <Container maxWidth="sm">
            <Toolbar />
            <Skeleton variant="rectangular" height={118} />
            <Skeleton />
            <Skeleton width="70%"/>
        </Container>
    );
}

function HelloContent() {
    const classes = useStyles();

    return (
        <div className={classes.heroContent}>
            <Container maxWidth="sm">
                <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
                    <InhypedIcon sx={{width: '100px', height: '100px', marginRight: '4px', position: 'relative', top: '12px'}}/>
                    Inhyped
                </Typography>
                <Typography variant="h5" align="center" color="textSecondary" paragraph>
                    Easy way to promote your tweets or earn crypto by using your twitter account.
                </Typography>
                <div className={classes.heroButtons}>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item>
                            <a href="/api/login/twitter/start" target="_blank" rel="noopener noreferrer">
                                <Button variant="contained" color="primary">
                                Continue with Twitter
                                </Button>
                            </a>
                        </Grid>
                    </Grid>
                </div>
            </Container>
        </div>
    );
}

export { HomePage };
