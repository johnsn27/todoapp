import React from "react"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { orange } from "@mui/material/colors"

let theme = createTheme({
  // Theme customization goes here as usual, including tonalOffset and/or
  // contrastThreshold as the augmentColor() function relies on these
})

theme = createTheme({
  status: {
    active: theme.palette.augmentColor({
      color: {
        main: orange[500],
      },
      name: "active",
    }),
  },
})

const App = ({ Component, pageProps }) => {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
export default App
