import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import { useMemo } from 'react';
import Navbar from '../components/Navbar';
import { MyContextProvider } from '../MyContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    }
  }), [prefersDarkMode]);

  return (
    <ThemeProvider theme={theme}>
      <MyContextProvider>
        <Navbar />
        <Component {...pageProps} />
      </MyContextProvider>
    </ThemeProvider>
  )
}

export default MyApp;
