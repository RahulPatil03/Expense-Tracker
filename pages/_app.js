import Navbar from '../components/Navbar';
import { MyContextProvider } from '../MyContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <MyContextProvider>
      <Navbar />
      <Component {...pageProps} />
    </MyContextProvider>
  )
}

export default MyApp;
