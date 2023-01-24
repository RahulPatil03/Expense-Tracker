import Layout from '@/components/Layout';
import '@/styles/globals.css';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { createContext, useContext, useMemo, useReducer } from 'react';

const AppContext = createContext<any>(null);

const initState = {
  snackbarOpen: false,
  snackbarMessage: '',
  backdropOpen: true
};

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'openSnackbar':
      return { ...state, snackbarMessage: action.message, snackbarOpen: true };
    case 'closeSnackbar':
      return { ...state, snackbarOpen: false };
    case 'toggleBackdrop':
      return { ...state, backdropOpen: action.open };
    case 'deleteRecord':
      return { backdropOpen: false, snackbarMessage: action.message, snackbarOpen: true };
    default:
      return state;
  }
}

export function useAppContext() {
  return useContext(AppContext);
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(() => createTheme({
    palette: {
      mode: prefersDarkMode ? 'dark' : 'light',
    },
  }), [prefersDarkMode]);

  return (
    <SessionProvider session={session}>
      <ThemeProvider theme={theme}>
        <AppContext.Provider value={useReducer(reducer, initState)}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AppContext.Provider>
      </ThemeProvider>
    </SessionProvider>
  );
}
