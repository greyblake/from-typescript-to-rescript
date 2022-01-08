open AsyncData
open Types

type userContextValue = {
  user: AsyncData.t<option<CurrentUserView.t>>,
  reloadUser: unit => unit,
}

let context: React.Context.t<userContextValue> = React.createContext({
  user: Loading,
  reloadUser: () => (),
})

module Provider = {
  let provider = React.Context.provider(context)

  @react.component
  let make = (~children) => {
    let (user, setUser) = React.useState(_ => Loading)

    let reloadUser = React.useCallback0(() => {
      Api.getSeed()
      ->Promise.then(seedData => {
        let {currentUser} = seedData
        setUser(_ => Done(Some(currentUser)))
        Promise.resolve()
      })
      ->Promise.catch(err => {
        Js.Console.error2("Error on attempt to get seed data: ", err)
        setUser(_ => Done(None))
        Promise.resolve()
      })
      ->ignore
    })

    React.useEffect0(() => {
      reloadUser()
      None
    })

    let value = {user: user, reloadUser: reloadUser}

    React.createElement(provider, {"value": value, "children": children})
  }
}
