import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Typography, Toolbar, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';

import type { CurrentUserView } from 'types';
import { formatNearAmount } from 'utils/format';

const useStyles = makeStyles({
  icon: {
    marginRight: "8px",
  },
  balance: {
    marginRight: "8px",
  },
  title: {
      flexGrow: 1,
  },
  menu: {
    marginTop: "20px",
  }
});

interface ApplicationBarProps {
    user: CurrentUserView | null;
}

function ApplicationBar(props: ApplicationBarProps) {
    const classes = useStyles();
    const { user } = props;

    const rightSide = user ? <RightSide user={user} /> : null;

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" color="inherit" className={classes.title}>
                    Inhyped
                </Typography>

                {rightSide}
            </Toolbar>
        </AppBar>
    );
}


interface RightSideProps {
    user: CurrentUserView;
}
function RightSide(props: RightSideProps) {
    const { user } = props;

    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState<EventTarget & HTMLElement | null>(null);
    const open = Boolean(anchorEl);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    return (
        <>
            <span className={classes.balance}>Balance: {formatNearAmount(user.balance)} </span>
            <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <Avatar src={user.profileImageUrl} />
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
              className={classes.menu}
            >
              <MenuItem component={RouterLink} to='/deposit'>Deposit</MenuItem>
              <MenuItem onClick={handleClose} component={RouterLink} to='/withdraw'>Withdraw</MenuItem>
              <MenuItem onClick={handleClose} component={RouterLink} to='/orders/new'>New Order</MenuItem>
              <MenuItem onClick={handleClose} component={RouterLink} to='/orders/my'>My Orders</MenuItem>
              <MenuItem onClick={handleClose} component={RouterLink} to='/tasks/claimable'>Claimable Tasks</MenuItem>
              <MenuItem onClick={handleClose} component={RouterLink} to='/tasks/my'>My Tasks</MenuItem>
            </Menu>

        </>
    );
}

export { ApplicationBar };
