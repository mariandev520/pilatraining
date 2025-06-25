// src/pages/_app.jsx
import { useRouter } from 'next/router';
import Sidebar from '../components/layout'; // RUTA CORREGIDA
import { useEffect } from 'react';
import '../styles/globals.css'; // Asegúrate de que los estilos globales están importados

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Tu lógica para manejar cambios de ruta
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (router.pathname === '/verificacion' && url !== '/verificacion') {
        alert('No puedes navegar a otras secciones desde la pantalla de verificación');
        router.push('/verificacion');
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Si la ruta es la raíz, el login o la verificación, no mostramos el sidebar
  if (router.pathname === '/' || router.pathname === '/login' || router.pathname === '/verificacion') {
    return <Component {...pageProps} />;
  }

  // Para todas las demás páginas, las envolvemos con el Sidebar
  return (
    <Sidebar>
      <Component {...pageProps} />
    </Sidebar>
  );
}

export default MyApp;