module UnstyledLink = {
  @react.component
  let make = (~to: string, ~children: React.element) => {
    let style = ReactDOM.Style.make(~textDecoration="none", ())
    <ReactRouter.Link to style> {children} </ReactRouter.Link>
  }
}

module MenuItems = {
  open Mui

  type menuItem = {
    path: string,
    name: string,
    icon: React.element,
  }

  @react.component
  let make = () => {
    let menuItems: array<menuItem> = [
      {path: "/orders/my", name: "Orders", icon: <WorkIcon />},
      {path: "/tasks/claimable", name: "Tasks", icon: <AssignmentIcon />},
      {path: "/deposit", name: "Transactions", icon: <AccountBalanceWalletIcon />},
    ]

    let menuLinks = Belt.Array.map(menuItems, menuItem => {
      let {path, name, icon} = menuItem
      <UnstyledLink to=path key=name>
        <ListItem button={true} key=name>
          <ListItemIcon> {icon} </ListItemIcon> <ListItemText primary=name />
        </ListItem>
      </UnstyledLink>
    })

    <List> {React.array(menuLinks)} </List>
  }
}

module UserBalance = {
  open Mui

  @react.component
  let make = (~amount: option<Big.t>) => {
    switch amount {
    | Some(balance) =>
      <Tooltip arrow=true title={React.string(Format.formatNearAmount4(balance))}>
        <span> {React.string(`Balance: ` ++ Format.formatNearAmount(balance))} </span>
      </Tooltip>
    | _ => <span> {React.string(`Balance: ... `)} </span>
    }
  }
}

module RightSide = {
  open Mui

  let asyncOptionMap = (asyncOption, f) => {
    asyncOption->AsyncData.map(maybeValue => {
      maybeValue->Belt.Option.map(f)
    })
  }

  type origin = {
    horizontal: string,
    vertical: string,
  }

  @react.component
  let make = () => {
    let {user: asyncUser} = React.useContext(UserContext.context)
    let maybeUser = switch asyncUser {
    | Done(Some(user)) => Some(user)
    | _ => None
    }

    let amount = Belt.Option.map(maybeUser, u => u.balance)
    let avatarUrl = Belt.Option.map(maybeUser, u => u.profileImageUrl)

    let (anchorEl, setAnchorEl) = React.useState(_ => None)
    let isOpen = Belt.Option.isSome(anchorEl)

    let handleMenu = e => {
      let ct = ReactEvent.Mouse.currentTarget(e)
      setAnchorEl(_ => Some(ct))
    }
    let handleClose = () => {
      setAnchorEl(_ => None)
    }

    let origin: origin = {
      vertical: "top",
      horizontal: "right",
    }

    <>
      <UserBalance amount />
      <IconButton onClick={handleMenu} color="inherit"> <Avatar src=?avatarUrl /> </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl
        _open=isOpen
        anchorOrigin=origin
        transformOrigin=origin
        keepMounted=true
        onClose=handleClose>
        <MenuItem>
          <ReactRouter.Link to="/deposit" style={ReactDOM.Style.make(~textDecoration="none", ())}>
            {React.string("Deposit")}
          </ReactRouter.Link>
        </MenuItem>
      </Menu>
    </>
  }
}

module StyledAppBar = {
  @module("./ApplicationBar/styledComponents") @react.component
  external make: (~children: React.element, ~_open: bool, ~position: string=?) => React.element =
    "StyledAppBar"
}

module StyledAppDrawer = {
  @module("./ApplicationBar/styledComponents") @react.component
  external make: (
    ~children: React.element,
    ~_open: bool,
    ~anchor: string=?,
    ~variant: string=?,
  ) => React.element = "StyledAppDrawer"
}

module AppBar = {
  open Mui

  @react.component
  let make = (~isOpen: bool, ~onClick: ReactEvent.Mouse.t => unit, ~title: string) => {
    let iconButtonStyle = if isOpen {
      ReactDOM.Style.make(~marginRight="36px", ~display="none", ())
    } else {
      ReactDOM.Style.make(~marginRight="36px", ())
    }

    <StyledAppBar position="absolute" _open={isOpen}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onClick} sx=iconButtonStyle>
          <MenuIcon />
        </IconButton>
        <Typography
          component=#h1
          variant=#h6
          color=#inherit
          noWrap=true
          sx={ReactDOM.Style.make(~flexGrow="1", ())}>
          {React.string(title)}
        </Typography>
        <RightSide />
      </Toolbar>
    </StyledAppBar>
  }
}

module AppDrawer = {
  open Mui

  @react.component
  let make = (~isOpen: bool, ~onClick: ReactEvent.Mouse.t => unit) => {
    let toolbarStyle = ReactDOM.Style.make(
      ~display="flex",
      ~alignItems="center",
      ~justifyContent="space-between",
      ~paddingLeft="1px",
      ~paddingRight="1px",
      ~backgroundColor="#FFFFFF",
      (),
    )
    let boxStyle = ReactDOM.Style.make(
      ~display="flex",
      ~alignItems="center",
      ~justifyContent="start",
      (),
    )

    <StyledAppDrawer anchor="left" _open={isOpen} variant="permanent">
      <Toolbar sx=toolbarStyle>
        <Box sx=boxStyle>
          <InhypedIcon
            fontSize=#large sx={ReactDOM.Style.make(~marginLeft="4px", ~marginRight="12px", ())}
          />
          <Typography variant=#h6 color=#black> {React.string("Inhyped")} </Typography>
        </Box>
        <IconButton onClick={onClick}> <ChevronLeftIcon /> </IconButton>
      </Toolbar>
      <MenuItems />
    </StyledAppDrawer>
  }
}

@react.component
let make = (~title: string, ~children: React.element) => {
  let {isOpen, setIsOpen} = React.useContext(ApplicationBarContext.context)
  let toggleDrawer = _ => setIsOpen(prevIsOpen => !prevIsOpen)

  <Mui.Box sx={ReactDOM.Style.make(~display="flex", ())}>
    <AppBar isOpen={isOpen} onClick={toggleDrawer} title={title} />
    <AppDrawer isOpen={isOpen} onClick={toggleDrawer} />
    <Mui.Box
      component="main"
      sx={ReactDOM.Style.make(~flexGrow="1", ~height="100vh", ~overflow="auto", ())}>
      <Mui.Toolbar /> {children}
    </Mui.Box>
  </Mui.Box>
}
