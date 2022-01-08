import {
    Skeleton, Grid, Box,
} from '@mui/material';

function SkeletonCardList() {
    const items = [1, 2, 3, 4, 5].map((index) => {
        return (
            <Grid item xs={12} md={6} lg={4} key={index}>
                <Skeleton variant="rectangular" height={100} />
                <Skeleton />
            </Grid>
        );
    });

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Grid container spacing={2}>
                {items}
            </Grid>
        </Box>
    );
}

export { SkeletonCardList };
