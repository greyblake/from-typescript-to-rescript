@react.component
let make = (~children: React.element, ~href: string) => {
  let iconStyle = ReactDOM.Style.make(~verticalAlign="middle", ~marginLeft="4px", ())

  <Mui.Link href target="_blank" rel="noopener" underline=#hover>
    children <Mui.LaunchIcon fontSize=#small sx=iconStyle />
  </Mui.Link>
}
