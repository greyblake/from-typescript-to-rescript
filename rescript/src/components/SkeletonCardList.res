@react.component
let make = () => {
  let boxStyle = ReactDOM.Style.make(~flexGrow="1", ())

  let buildCardItem = (index: int) => {
    <Mui.Grid item=true xs={12} md={6} lg={4} key={Js.Int.toString(index)}>
      <Mui.Skeleton variant=#rectangular height=100 /> <Mui.Skeleton />
    </Mui.Grid>
  }

  let items = [1, 2, 3, 4, 5]->Belt.Array.map(buildCardItem)->React.array

  <Mui.Box sx=boxStyle> <Mui.Grid container=true spacing=2> items </Mui.Grid> </Mui.Box>
}
