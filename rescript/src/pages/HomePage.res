open Mui

let renderHelloContent = () => {
  let inhypedIconStyle = ReactDOM.Style.make(
    ~width="100px",
    ~height="100px",
    ~marginRight="4px",
    ~position="relative",
    ~top="12px",
    (),
  )

  <Container maxWidth=#sm>
    <Toolbar />
    <Typography component=#h1 variant=#h2 align=#center gutterBottom={true}>
      <InhypedIcon sx={inhypedIconStyle} /> {React.string("Inhyped")}
    </Typography>
    <Typography variant=#h5 align=#center color=#textSecondary paragraph={true}>
      {React.string(
        "Easy way to promote your tweets or earn crypto by using your twitter account.",
      )}
    </Typography>
    <Grid container={true} spacing={2} justifyContent="center">
      <Grid item={true}>
        <a href="/api/login/twitter/start" target="_blank" rel="noopener noreferrer">
          <Button variant=#contained color=#primary>
            {React.string("Continue with Twitter")}
          </Button>
        </a>
      </Grid>
    </Grid>
  </Container>
}

@react.component
let make = (~state: [#loading | #notLoggedIn]) => {
  switch state {
  | #loading => <> </>
  | #notLoggedIn => renderHelloContent()
  }
}
