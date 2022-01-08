module SvgIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~component: string=?,
    ~sx: ReactDOM.Style.t=?,
    ~fontSize: fontSize=?,
  ) => React.element = "SvgIcon"
}

module LaunchIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/icons-material/Launch") @react.component
  external make: (~fontSize: fontSize=?, ~sx: ReactDOM.Style.t=?) => React.element = "default"
}

module AddCircleOutlineIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/icons-material/AddCircleOutline") @react.component
  external make: (~fontSize: fontSize=?, ~sx: ReactDOM.Style.t=?) => React.element = "default"
}

module TaskOutlinedIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/icons-material/TaskOutlined") @react.component
  external make: (~fontSize: fontSize=?, ~sx: ReactDOM.Style.t=?) => React.element = "default"
}

module WorkIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/icons-material/Work") @react.component
  external make: (~fontSize: fontSize=?, ~sx: ReactDOM.Style.t=?) => React.element = "default"
}

module AssignmentIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/icons-material/Assignment") @react.component
  external make: (~fontSize: fontSize=?, ~sx: ReactDOM.Style.t=?) => React.element = "default"
}

module AccountBalanceWalletIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/icons-material/AccountBalanceWallet") @react.component
  external make: (~fontSize: fontSize=?, ~sx: ReactDOM.Style.t=?) => React.element = "default"
}

module MenuIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/icons-material/Menu") @react.component
  external make: (~fontSize: fontSize=?, ~sx: ReactDOM.Style.t=?) => React.element = "default"
}

module ChevronLeftIcon = {
  type fontSize = [#inherit | #medium | #large | #small]

  @module("@mui/icons-material/ChevronLeft") @react.component
  external make: (~fontSize: fontSize=?, ~sx: ReactDOM.Style.t=?) => React.element = "default"
}

module Link = {
  type underline = [#none | #hover | #always]

  @module("@mui/material") @react.component
  external make: (
    ~href: string,
    ~target: string=?,
    ~rel: string=?,
    ~underline: underline=?,
    ~children: React.element,
  ) => React.element = "Link"
}

module Skeleton = {
  type variant = [#text | #rectangular | #circular]

  @module("@mui/material") @react.component
  external make: (~variant: variant=?, ~height: int=?) => React.element = "Skeleton"
}

module Grid = {
  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~style: ReactDOM.Style.t=?,
    ~item: bool=?,
    ~container: bool=?,
    ~spacing: int=?,
    ~xs: int=?,
    ~md: int=?,
    ~lg: int=?,
    ~key: string=?,
    ~justifyContent: string=?,
    ~direction: string=?,
    ~alignItems: string=?,
  ) => React.element = "Grid"
}

module Box = {
  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~component: string=?,
    ~sx: ReactDOM.Style.t=?,
    ~flexGrow: int=?,
  ) => React.element = "Box"
}

module Container = {
  type breakpoint = [#xs | #sm | #md | #lg | #xl]

  @module("@mui/material") @react.component
  external make: (~children: React.element, ~maxWidth: breakpoint=?) => React.element = "Container"
}

module Card = {
  @module("@mui/material") @react.component
  external make: (~children: React.element, ~style: ReactDOM.Style.t=?) => React.element = "Card"
}

module CardContent = {
  @module("@mui/material") @react.component
  external make: (~children: React.element) => React.element = "CardContent"
}

module CardActions = {
  @module("@mui/material") @react.component
  external make: (~children: React.element, ~style: ReactDOM.Style.t=?) => React.element =
    "CardActions"
}

module Typography = {
  type variant = [
    | #button
    | #caption
    | #h1
    | #h2
    | #h3
    | #h4
    | #h5
    | #h6
    | #inherit
    | #subtitle1
    | #subtitle2
    | #body1
    | #body2
    | #overline
  ]
  type component = [#p | #span | #div | #h1 | #h2 | #h3 | #h4 | #h5 | #h6 | #h7]
  type align = [#inherit | #left | #center | #right | #justify]
  type color = [
    | #"text.secondary"
    | #"text.primary"
    | #textPrimary
    | #textSecondary
    | #inherit
    | #black
  ]

  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~style: ReactDOM.Style.t=?,
    ~sx: ReactDOM.Style.t=?,
    ~variant: variant=?,
    ~component: component=?,
    ~align: align=?,
    ~gutterBottom: bool=?,
    ~color: color=?,
    ~paragraph: bool=?,
    ~noWrap: bool=?,
  ) => React.element = "Typography"
}

module Toolbar = {
  @module("@mui/material") @react.component
  external make: (~children: React.element=?, ~sx: ReactDOM.Style.t=?) => React.element = "Toolbar"
}

module Stack = {
  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~direction: string=?,
    ~spacing: int=?,
  ) => React.element = "Stack"
}

module CircularProgress = {
  @module("@mui/material") @react.component
  external make: (~disableShrink: bool=?) => React.element = "CircularProgress"
}

module Button = {
  type color = [#primary | #secondary]

  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~onClick: 'event => unit=?,
    ~size: [#small | #medium | #large]=?,
    ~variant: [#contained | #outlined | #text]=?,
    ~color: color=?,
  ) => React.element = "Button"
}

module LoadingButton = {
  type color = [#primary | #secondary]

  @module("@mui/lab") @react.component
  external make: (
    ~children: React.element,
    ~onClick: 'event => unit=?,
    ~size: [#small | #medium | #large]=?,
    ~variant: [#contained | #outlined | #text]=?,
    ~color: color=?,
    ~disabled: bool=?,
    ~loading: bool=?,
  ) => React.element = "LoadingButton"
}

module Alert = {
  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~severity: [#error | #info | #success | #warning]=?,
  ) => React.element = "Alert"
}

module AlertTitle = {
  @module("@mui/material") @react.component
  external make: (~children: React.element) => React.element = "AlertTitle"
}

module Chip = {
  @module("@mui/material") @react.component
  external make: (
    ~label: React.element,
    ~size: [#small | #medium]=?,
    ~icon: React.element=?,
  ) => React.element = "Chip"
}

module Tooltip = {
  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~arrow: bool=?,
    ~title: React.element=?,
  ) => React.element = "Tooltip"
}

module FormControl = {
  @module("@mui/material") @react.component
  external make: (~children: React.element, ~fullWidth: bool=?, ~error: bool=?) => React.element =
    "FormControl"
}

// In TS: it would be React.ChangeEvent<HTMLInputElement>
type changeEventTarget = {value: string}
type changeEvent = {target: changeEventTarget}

module TextField = {
  @module("@mui/material") @react.component
  external make: (
    ~label: string,
    ~value: string=?,
    ~onChange: changeEvent => unit=?,
    ~fullWidth: bool=?,
    ~required: bool=?,
    ~id: string=?,
    ~disabled: bool=?,
    ~error: bool=?,
  ) => React.element = "TextField"
}

module FormHelperText = {
  @module("@mui/material") @react.component
  external make: (~children: React.element) => React.element = "FormHelperText"
}

module List = {
  @module("@mui/material") @react.component
  external make: (~children: React.element) => React.element = "List"
}

module ListItem = {
  @module("@mui/material") @react.component
  external make: (~children: React.element, ~button: bool=?) => React.element = "ListItem"
}

module ListItemIcon = {
  @module("@mui/material") @react.component
  external make: (~children: React.element) => React.element = "ListItemIcon"
}

module ListItemText = {
  @module("@mui/material") @react.component
  external make: (~primary: string) => React.element = "ListItemText"
}

module Avatar = {
  @module("@mui/material") @react.component
  external make: (~src: string=?) => React.element = "Avatar"
}

module IconButton = {
  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~color: string=?,
    ~edge: string=?,
    ~sx: ReactDOM.Style.t=?,
    ~onClick: ReactEvent.Mouse.t => unit=?,
  ) => React.element = "IconButton"
}

module Menu = {
  @module("@mui/material") @react.component
  external make: (
    ~children: React.element,
    ~_open: bool,
    ~id: string=?,
    ~anchorEl: 'a=?,
    ~anchorOrigin: 'b=?,
    ~transformOrigin: 'b=?,
    ~keepMounted: bool=?,
    ~onClose: unit => unit=?,
  ) => React.element = "Menu"
}

module MenuItem = {
  @module("@mui/material") @react.component
  external make: (~children: React.element) => React.element = "MenuItem"
}

module AppBar = {
  @module("@mui/material") @react.component
  external make: (~children: React.element, ~position: string=?) => React.element = "AppBar"
}
