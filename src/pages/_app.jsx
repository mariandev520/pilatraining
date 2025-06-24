import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Sidebar from '../components/layout';
import '../styles/globals.css';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import '../styles/globals.css';

// Define el tema aquí, una sola vez
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6baf',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: 0.5,
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Efecto para manejar la navegación desde la página de verificación
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (router.pathname === '/verificacion' && url !== '/verificacion') {
        // Mostrar mensaje o redirigir si es necesario
        alert('No puedes navegar a otras secciones desde la pantalla de verificación');
        router.push('/verificacion');
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Si la ruta actual es /login o /verificacion, no mostrar el sidebar
  if (
    router.pathname === '/' ||
    router.pathname === '/login' ||
    router.pathname === '/verificacion'
  ) {
    return <Component {...pageProps} />;
  }

  // En cualquier otra ruta, envolvemos con el Sidebar
  return (
    <ThemeProvider theme={theme}>
    <Sidebar>
      <Component {...pageProps} />
    </Sidebar>
    </ThemeProvider>
  );
}

export default MyApp;
