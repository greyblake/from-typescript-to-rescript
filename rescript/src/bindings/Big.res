type t

@send
external toFixed: (t, int) => string = "toFixed"

// Returns true if the value of &a greater
// than the value of &b, otherwise returns false
@send
external gt: (t, t) => bool = "gt"

// Returns true if the value of &a is less than
// the value of &b, otherwise returns false.
@send
external lt: (t, t) => bool = "lt"

// / Returns a Big number whose
// value is the division of &a by &b
@send
external div: (t, t) => t = "div"

// Converters
// Big number constructor from a float
@module("big.js")
external makeFromFloat: float => t = "Big"
let fromFloat = makeFromFloat

@module("big.js")
external makeFromString: string => t = "Big"
let fromString = makeFromString

@module("big.js")
external fromInt: int => t = "Big"

@send
external toString: t => string = "toString"

@send
external times: (t, t) => t = "times"

// More
//
let parse = (value: string): option<t> => {
  try {
    Some(fromString(value))
  } catch {
  | Js.Exn.Error(_) => None
  }
}
