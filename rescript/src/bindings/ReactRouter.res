module Link = {
  @module("react-router-dom") @react.component
  external make: (
    ~children: React.element,
    ~style: ReactDOM.Style.t=?,
    ~to: string,
  ) => React.element = "Link"
}

@module("react-router-dom")
external useParams: unit => 'a = "useParams"

module History = {
  type t

  @send
  external push: (t, string) => unit = "push"
}

@module("react-router-dom")
external useHistory: unit => History.t = "useHistory"

module BrowserRouter = {
  @module("react-router-dom") @react.component
  external make: (~children: React.element) => React.element = "BrowserRouter"
}

module Switch = {
  @module("react-router-dom") @react.component
  external make: (~children: React.element) => React.element = "Switch"
}

module Route = {
  @module("react-router-dom") @react.component
  external make: (~children: React.element, ~path: string, ~exact: bool=?) => React.element =
    "Route"
}
