import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import Sidebar from './sidebar';
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Efecto para manejar la navegación desde la página de verificación
  useEffect(() => {
    const handleRouteChange = (url: string) => {
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
  if (router.pathname === '/' || router.pathname === '/login' || router.pathname === '/verificacion') {
    return <Component {...pageProps} />;
  }

  // En cualquier otra ruta, envolvemos con el Sidebar
  return (
    <Sidebar>
      <Component {...pageProps} />
    </Sidebar>
  );
}

export default MyApp;