module D = Json.Decode
module E = Json.Encode

// Helper functions to decode variant/enum types.
%%private(
  let decodeDict = (json: Js.Json.t): Js.Dict.t<'a> => {
    switch Js.Json.classify(json) {
    | Js.Json.JSONObject(value) => value
    | _ => raise(D.DecodeError(`Expected to be a dictionary: ${Json.stringify(json)}`))
    }
  }
)

let pickTag = (json: Js.Json.t) => {
  let tagJson = json->decodeDict->Js.Dict.get("tag")
  switch tagJson {
  | Some(tagValue) => D.string(tagValue)
  | None => raise(D.DecodeError(`Expected to have field "tag" on: ${Json.stringify(json)}`))
  }
}
let pickContent = (json: Js.Json.t): Js.Json.t => {
  let contentJson = json->decodeDict->Js.Dict.get("content")
  switch contentJson {
  | Some(content) => content
  | None => raise(D.DecodeError(`Expected to have field "content" on: ${Json.stringify(json)}`))
  }
}

let decodeBig = (json: Js.Json.t): Big.t => {
  json->D.string->Big.fromString
}

let encodeBig = (big: Big.t): Js.Json.t => {
  big->Big.toString->E.string
}
