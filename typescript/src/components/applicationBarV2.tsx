import React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';

import { Avatar, Menu, MenuItem } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';


import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import Big from 'big.js';

import { Toolbar, IconButton, Typography, Tooltip,
    AppBar as MuiAppBar,
    Drawer as MuiDrawer,
    AppBarProps as MuiAppBarProps ,
} from '@mui/material';

import { InhypedIcon } from 'icons/InhypedIcon';
import { formatNearAmount, formatNearAmount4 } from 'utils/format';
import { UserContext } from 'contexts/UserContext';
import { RemoteData } from 'remoteData';


const ApplicationBarContext = React.createContext({
    isOpen: true,
    setIsOpen: (val: boolean) => {},
});


interface ApplicationProps {
    content: React.ReactNode,
    title: string,
}

function ApplicationBar(props: ApplicationProps) {
    const { isOpen, setIsOpen } = React.useContext(ApplicationBarContext);
    const toggleDrawer = () => setIsOpen(!isOpen);

    return (
        <Box sx={{ display: 'flex' }}>

            {/* AppBar */}

            <StyledAppBar position="absolute" open={isOpen}>
                <Toolbar
                    sx={{
                      pr: '24px', // keep right padding when drawer closed
                    }}
                >
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            marginRight: '36px',
                            ...(isOpen && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        noWrap
                        sx={{ flexGrow: 1 }}
                    >
                        {props.title}
                    </Typography>

                    <RightSide />
                </Toolbar>
            </StyledAppBar>


            {/* Drawer*/}

            <AppDrawer anchor="left" open={isOpen} variant="permanent">
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: [1],
                        backgroundColor: '#FFFFFF',
                    }}
                >
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
                        <InhypedIcon fontSize="large" sx={{marginLeft: '4px', marginRight: '12px'}} />
                        <Typography variant="h6" color="black">Inhyped</Typography>
                    </Box>
                    <IconButton onClick={toggleDrawer}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <MenuItems />
            </AppDrawer>


            {/* Main content */}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                }}
            >
                <Toolbar />
                {props.content}
            </Box>

        </Box>
    );
}

const UnstyledLink = styled(RouterLink)`
    text-decoration: none;

    &:focus, &:hover, &:visited, &:link, &:active {
        text-decoration: none;
    }
`;


function MenuItems() {
    return (
        <List>
            <UnstyledLink to="/orders/my">
                <ListItem button key="Orders">
                    <ListItemIcon>
                        <WorkIcon />
                    </ListItemIcon>
                    <ListItemText primary="Orders" />
                </ListItem>
            </UnstyledLink>

            <UnstyledLink to="/tasks/claimable">
                <ListItem button key="Tasks">
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText primary="Tasks" />
                </ListItem>
            </UnstyledLink>

            <UnstyledLink to="/deposit">
                <ListItem button key="Transactions">
                    <ListItemIcon>
                        <AccountBalanceWalletIcon />
                    </ListItemIcon>
                    <ListItemText primary="Transactions" />
                </ListItem>
            </UnstyledLink>

        </List>
    );
}

const drawerWidth: number = 240;


const AppDrawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        ...(!open && {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        }),
        },
    }),
);


interface StyledAppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const StyledAppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<StyledAppBarProps>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));



function UserBalance({amountData}: {amountData: RemoteData<Big, Error>}) {
    const loadingBalance = <span> Balance: ... </span>;

    return amountData.match({
        success: amount => {
            return (
                <Tooltip arrow title={formatNearAmount4(amount)}>
                    <span>Balance: {formatNearAmount(amount)}</span>
                </Tooltip>
            );
        },
        notAsked: () => loadingBalance,
        loading: () => loadingBalance,
        failure: (_) => loadingBalance,
    });
}

function RightSide() {
    const userData = React.useContext(UserContext);
    const amountData = userData.mapSuccess(u => u.balance);
    const avatarUrl = userData.match({
        success: u => u.profileImageUrl,
        notAsked: () => undefined,
        loading: () => undefined,
        failure: () => undefined,
    });

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
            <UserBalance amountData={amountData} />
            <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
            >
                <Avatar src={avatarUrl} />
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
            >
                <MenuItem component={RouterLink} to='/deposit'>Deposit</MenuItem>
            </Menu>
        </>
    );
}

export { ApplicationBar, ApplicationBarContext};
