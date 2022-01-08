@react.component
let make = (~userName: string) => {
  open Mui

  <ApplicationBar title="Welcome">
    <main>
      <div>
        <Toolbar />
        <Container maxWidth=#md>
          <Typography
            component=#h3 variant=#h3 align=#center color=#"text.primary" gutterBottom={true}>
            {React.string("Hello " ++ userName)}
          </Typography>
          <Typography
            component=#h4 variant=#h4 align=#center color=#"text.primary" gutterBottom={true}>
            <ReactRouter.Link to="/deposit">
              {React.string(
                "Start by depositing some NEAR to your balance in order to promote your tweets.",
              )}
            </ReactRouter.Link>
          </Typography>
          <Typography
            component=#h4 variant=#h4 align=#center color=#"text.primary" gutterBottom={true}>
            {React.string("OR")}
          </Typography>
          <Typography
            component=#h4 variant=#h4 align=#center color=#"text.primary" gutterBottom={true}>
            <ReactRouter.Link to="/tasks/claimable">
              {React.string("Check available tasks if you want to earn NEAR")}
            </ReactRouter.Link>
          </Typography>
        </Container>
      </div>
    </main>
  </ApplicationBar>
}
