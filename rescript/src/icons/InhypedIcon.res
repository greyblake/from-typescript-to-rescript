@module("./svg/inhyped-icon.svg") external inhypedIconSvg: string = "default"

type fontSize = [#inherit | #medium | #large | #small]

@react.component
let make = (~sx: option<ReactDOM.Style.t>=?, ~fontSize: option<fontSize>=?) => {
  let embedStyle = ReactDOM.Style.make(~height="100%", ())

  <Mui.SvgIcon component="object" ?sx ?fontSize>
    <embed type_="image/svg+xml" src={inhypedIconSvg} style=embedStyle />
  </Mui.SvgIcon>
}
