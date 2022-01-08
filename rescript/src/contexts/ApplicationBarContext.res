type t = {
  isOpen: bool,
  setIsOpen: (bool => bool) => unit,
}

exception ContextError(string)

let context: React.Context.t<t> = React.createContext({
  isOpen: true,
  setIsOpen: _ => {
    raise(ContextError("ApplicationBarContext is not yet initialized"))
  },
})

module Provider = {
  let provider = React.Context.provider(context)

  @react.component
  let make = (~children) => {
    let (isOpen, setIsOpen) = Hooks.useLocalStorage(
      "inhypedAppBarOpen",
      true,
      Json.Decode.bool,
      Json.Encode.bool,
    )
    let ctx: t = {isOpen: isOpen, setIsOpen: setIsOpen}
    React.createElement(provider, {"value": ctx, "children": children})
  }
}
