let useLocalStorage = (
  key: string,
  defaultValue: 'a,
  decoder: Js.Json.t => 'a,
  encoder: 'a => Js.Json.t,
): ('a, ('a => 'a) => unit) => {
  let (storedValue, setStoredValue) = React.useState(() => {
    try {
      let maybeContent = LocalStorage.getItem(key)->Js.Nullable.toOption
      switch maybeContent {
      | None => defaultValue
      | Some(content) =>
        switch Json.parse(content) {
        | None => defaultValue
        | Some(json) => json->decoder
        }
      }
    } catch {
    | err => {
        Js.Console.error2(`Failed to read key "${key}" from localStorage: `, err)
        defaultValue
      }
    }
  })

  let setValue = (set: 'a => 'a): unit => {
    try {
      setStoredValue(oldValue => {
        let newValue = set(oldValue)
        let jsonStr = newValue->encoder->Json.stringify
        LocalStorage.setItem(key, jsonStr)
        newValue
      })
    } catch {
    | err => Js.Console.error2(`Failed to set key "${key}" in localStorage: `, err)
    }
  }

  (storedValue, setValue)
}
