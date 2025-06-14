import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  styled,
  Collapse,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import ClassIcon from '@mui/icons-material/Class';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';
import { motion, AnimatePresence } from 'framer-motion';

// Colores personalizados para cada menú (basados en cardData)
const menuColors = {
  '/Dashboard': '#2196F3', // Azul estándar para el dashboard
  '/clientes': 'rgb(124, 77, 255)', // Púrpura
  '/actividades': 'rgb(76, 175, 80)', // Verde
  '/camaspilates': 'rgb(76, 175, 80)', // Verde para submenu pilates (ajustado path)
  '/yoga': 'rgb(76, 175, 80)', // Verde para submenu yoga (ajustado path)
  '/stretching': 'rgb(76, 175, 80)', // Verde para submenu stretching (ajustado path)
  '/profesor': 'rgb(255, 193, 7)', // Amarillo
  '/RegistroPagos': 'rgb(33, 150, 243)', // Azul
  '/infoclases': 'rgb(244, 67, 54)', // Rojo
  '/calendario': 'rgb(171, 17, 130)', // Rosa
  '/verificaciondiaria': '#FF5722', // Naranja para verificación (Ejemplo, ajusta si tienes color definido)
};

// Componentes de estilo personalizado
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(62,81,181,0.95) 0%, rgba(48,63,159,0.95) 100%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 24px rgba(0,0,0,0.15)'
  }
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,248,248,0.98) 100%)',
    borderRight: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '2px 0 15px rgba(0,0,0,0.03)',
    // La transición del ancho ya está aquí, clave para la animación expandir/minimizar
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen, // O leavingScreen según preferencia
    }),
    overflowX: 'hidden' // Previene contenido desbordado horizontalmente durante la transición
  }
}));

// Función de utilidad para convertir colores a su versión con opacidad
const colorWithOpacity = (color, opacity) => {
  if (color?.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
  }
  const hex = (color || '#2196F3').replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  // Fallback si el formato no es reconocido
  return `rgba(33, 150, 243, ${opacity})`; // Usando azul como default
};

// StyledListItemButton con colores dinámicos basados en el menú
const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'itemcolor' && prop !== 'isSubItem',
})(({ theme, selected, itemcolor = '#2196F3', isSubItem }) => ({ // Default color azul
  borderRadius: '6px',
  margin: '2px 4px',
  padding: `6px ${isSubItem ? theme.spacing(3) : theme.spacing(1)}`, // Más indentación para subitems
  transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)', // Transición más rápida
  minHeight: '36px', // Altura mínima consistente
  '&:hover': {
    backgroundColor: `${colorWithOpacity(itemcolor, 0.15)} !important`,
    transform: 'translateX(3px)', // Sutil movimiento al hacer hover
    '& .MuiListItemIcon-root': {
      color: itemcolor,
      transform: 'scale(1.05)', // Ícono ligeramente más grande en hover
    },
    '& .MuiListItemText-root .MuiTypography-root': { // Target más específico para el texto
      color: itemcolor,
      fontWeight: 500, // Ligeramente más énfasis en hover
    }
  },
  ...(selected && {
    backgroundColor: `${colorWithOpacity(itemcolor, 0.2)} !important`,
    '& .MuiListItemIcon-root': {
      color: itemcolor
    },
    '& .MuiListItemText-root .MuiTypography-root': { // Target más específico
      fontWeight: 600,
      color: itemcolor
    }
  })
}));


const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif', // Fuentes estándar
    fontWeight: 500,
    fontSize: '0.85rem',
    color: theme.palette.text.secondary, // Color secundario por defecto
    whiteSpace: 'nowrap', // Evita que el texto se rompa en dos líneas al minimizar
    overflow: 'hidden', // Oculta el texto que desborda
    textOverflow: 'ellipsis', // Añade puntos suspensivos (...) si el texto es muy largo
    transition: 'color 0.2s ease' // Transición suave de color
  }
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: '56px', // Altura estándar para móvil
  display: 'flex',
  justifyContent: 'space-between',
  background: 'linear-gradient(135deg, rgba(62,81,181,0.98) 0%, rgba(48,63,159,0.98) 100%)',
  color: theme.palette.common.white,
  paddingLeft: theme.spacing(1.5), // Ajuste de padding
  paddingRight: theme.spacing(1.5),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center', // Centrado por defecto
  height: '48px', // Altura fija para la barra del logo/minimizar
  padding: theme.spacing(0, 1), // Padding horizontal
}));

const menuItems = [
  { path: '/Dashboard', icon: <DashboardIcon fontSize="small"/>, label: 'Panel' },
  { path: '/clientes', icon: <PeopleIcon fontSize="small"/>, label: 'Clientes' },
  {
    path: '/actividades',
    icon: <FitnessCenterIcon fontSize="small"/>,
    label: 'Menu Actividades',
    subItems: [
      { path: '/camaspilates', icon: <SportsGymnasticsIcon fontSize="small"/>, label: 'Pilates' }
    ]
  },
  { path: '/menuactividades', icon: <PeopleIcon fontSize="small"/>, label: 'Actividades' },
  { path: '/profesor', icon: <PersonIcon fontSize="small"/>, label: 'Profesores' },
  { path: '/RegistroPagos', icon: <PaymentIcon fontSize="small"/>, label: 'Pagos' },
  { path: '/calendario', icon: <PaymentIcon fontSize="small"/>, label: 'Proveedores' },
  { path: '/infoclases', icon: <ClassIcon fontSize="small"/>, label: 'Clases' },
  { path: '/verificaciondiaria', icon: <VerifiedUserIcon fontSize="small"/>, label: 'Clases Verificadas' },
];

const Sidebar = ({ children }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isFullHD = useMediaQuery('(min-width:1920px)');

  const [isClient, setIsClient] = useState(false); // Estado para controlar la hidratación
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Estado inicial minimizado = false
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [logoHovered, setLogoHovered] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState({});

  // --- AJUSTE HIDRATACIÓN ---
  // Ancho por defecto o inicial ANTES de la hidratación
  const initialDrawerWidth = 170; // Puedes ajustar este valor base
  // Calcula el ancho objetivo DESPUÉS de la hidratación
  const targetDrawerWidth = isMinimized ? 60 : (isFullHD ? 180 : 170); // Ajuste ligero al minimizado
  // Usa el ancho objetivo solo cuando estamos en el cliente, sino usa el inicial
  const drawerWidth = isClient ? targetDrawerWidth : initialDrawerWidth;
  // --- FIN AJUSTE ---

  useEffect(() => {
    // Este efecto solo se ejecuta en el cliente, marcando que la hidratación ocurrió
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false); // Cierra drawer móvil al cambiar ruta
      setIsMinimized(false); // Asegura que en móvil no esté minimizado
    }

    // Auto-expande submenús basados en la ruta actual
    const currentPath = router.pathname;
    let anySubMenuActive = false;
    const nextOpenSubMenu = { ...openSubMenu }; // Copia para evitar mutación directa

    menuItems.forEach(item => {
      if (item.subItems) {
        const hasActiveSubitem = item.subItems.some(subItem =>
          currentPath === subItem.path || currentPath.startsWith(subItem.path + '/')
        );
        if (hasActiveSubitem && !openSubMenu[item.path]) { // Solo expande si no estaba abierto
            nextOpenSubMenu[item.path] = true;
            anySubMenuActive = true;
        }
        // Opcional: Colapsar otros submenús si uno está activo
        // else if (!hasActiveSubitem && openSubMenu[item.path]) {
        //    nextOpenSubMenu[item.path] = false;
        // }
      }
    });
    // Actualiza el estado si hubo cambios
    // if (anySubMenuActive) { // O una lógica más compleja si necesitas colapsar otros
       setOpenSubMenu(nextOpenSubMenu);
    // }

  }, [router.pathname, isMobile]); // Dependencias del efecto

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMinimizeToggle = () => {
    if (!isMobile) { // Solo permitir minimizar en escritorio
        setIsMinimized(!isMinimized);
    }
  };

  const handleLogout = () => setLogoutDialogOpen(true);
  const confirmLogout = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('csrfToken');
      sessionStorage.removeItem('tokenExpires');
      localStorage.removeItem('usuario');
    }
    router.push('/');
    setLogoutDialogOpen(false);
  };
  const cancelLogout = () => setLogoutDialogOpen(false);

  const handleSubMenuToggle = (path) => {
    setOpenSubMenu(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Animaciones Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { x: -10, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 15, stiffness: 100 } },
  };
  const subItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  };


  // --- AJUSTE HIDRATACIÓN ---
  // Renderizado Placeholder ANTES de que isClient sea true
  if (!isClient) {
    // Muestra una estructura mínima SIN anchos dinámicos que dependan del cliente
    // Esto evita el salto visual durante la hidratación
    return (
       <Box sx={{ display: 'flex' }}>
          {/* Placeholder simple para el nav en escritorio, usa ancho INICIAL */}
          {!isMobile && <Box component="nav" sx={{ width: initialDrawerWidth , flexShrink: { md: 0 } }} aria-label="navegación del menú placeholder" />}
          {/* Contenido principal ocupando el espacio */}
          <Box component="main" sx={{ flexGrow: 1, p: { xs: 1.5, md: 2.5 }, mt: isMobile ? '56px' : 0 }}>
             {/* Puedes poner un loader aquí si lo deseas */}
             {children}
          </Box>
       </Box>
    );
  }
  // --- FIN AJUSTE ---


  // ---- Contenido del Drawer (Renderizado solo en cliente) ----
  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Logo / Título */}
      <Toolbar sx={{
          minHeight: { xs: '52px', md: '48px' }, // Altura ajustada
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMinimized ? 'center' : 'flex-start',
          px: isMinimized ? 0.5 : 1.5, // Menos padding minimizado
          py: 0,
          backgroundColor: 'rgba(245, 247, 250, 0.5)', // Fondo sutil
        }}
       >
        <AnimatePresence>
          <motion.div
            key={isMinimized ? 'minimizedLogo' : 'fullLogo'} // Key para animar cambio
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }} // Animación de salida
            transition={{ duration: 0.2 }}
            style={{ width: '100%', display: 'flex', justifyContent: isMinimized ? 'center' : 'flex-start' }}
          >
             {isMinimized ? (
               <LogoContainer
                 onMouseEnter={() => setLogoHovered(true)}
                 onMouseLeave={() => setLogoHovered(false)}
                 sx={{ justifyContent: 'center' }}
               >
                 <motion.div
                   animate={{ scale: logoHovered ? 1.15 : 1, rotate: logoHovered ? 10 : 0 }}
                   transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                 >
                   <FitnessCenterIcon sx={{ fontSize: '1.5rem', color: '#3f51b5', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }} />
                 </motion.div>
               </LogoContainer>
             ) : (
                <LogoContainer
                  onMouseEnter={() => setLogoHovered(true)}
                  onMouseLeave={() => setLogoHovered(false)}
                  sx={{ justifyContent: 'flex-start', alignItems: 'flex-start', flexDirection: 'column', pl: 0.5 }} // Alineación izquierda
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0 }}>
                        <motion.div
                            style={{ display: 'inline-flex', marginRight: '6px' }}
                            animate={{ rotate: logoHovered ? [-5, 5, -2, 0] : 0, scale: logoHovered ? 1.05 : 1 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                        >
                            <FitnessCenterIcon sx={{ fontSize: '1.1rem', color: '#3f51b5', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }} />
                        </motion.div>
                        <Typography variant="subtitle1" component="div" sx={{ fontFamily: '"Roboto", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#3f51b5', letterSpacing: '0.5px', lineHeight: 1.2 }}>
                           ADMINISTRA
                        </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '0.65rem', color: '#757575', opacity: 0.9, fontFamily: '"Roboto", sans-serif', letterSpacing: '0.5px', ml: '20px', // Ajustar alineación
                     mt: '-2px', lineHeight: 1 }}>
                      Training
                    </Typography>
                </LogoContainer>
             )}
          </motion.div>
        </AnimatePresence>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />

      {/* Lista de Menús Principales */}
      <List
        component={motion.ul}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          px: 1,
          pt: 0.5,
          pb: 0,
          flexGrow: 1, // Ocupa el espacio restante
          overflowY: 'auto', // Scroll si es necesario
          overflowX: 'hidden',
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '4px' },
        }}
      >
        {menuItems.map((item, index) => {
          const menuColor = menuColors[item.path] || menuColors[item.subItems?.find(sub => router.pathname.startsWith(sub.path))?.path] || '#2196F3'; // Color del padre o del hijo activo
          const isCurrentPath = router.pathname === item.path;
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const hasActiveSubItem = hasSubItems && item.subItems.some(
            subItem => router.pathname === subItem.path || router.pathname.startsWith(subItem.path + '/')
          );
          const isSelected = isCurrentPath || hasActiveSubItem;
          const itemKey = item.path || `item-${index}`; // Clave única

          return (
            <React.Fragment key={itemKey}>
              <motion.li variants={itemVariants} style={{ listStyle: 'none', marginBottom: '2px' }}>
                {hasSubItems ? (
                  // Botón para Items con Submenú
                  <StyledListItemButton
                    onClick={() => handleSubMenuToggle(item.path)}
                    selected={isSelected}
                    itemcolor={menuColor} // Pasar color dinámico
                    sx={{ justifyContent: isMinimized ? 'center' : 'space-between' }} // Asegura espacio para icono expandir
                    onMouseEnter={() => setHoveredItem(itemKey)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                     <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}> {/* Contenedor para icono y texto */}
                        <motion.div
                          animate={{ scale: hoveredItem === itemKey ? 1.1 : 1, rotate: hoveredItem === itemKey ? 3 : 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        >
                          <ListItemIcon sx={{ minWidth: isMinimized ? 'auto' : '32px', color: isSelected ? menuColor : theme.palette.text.secondary, fontSize: '1rem', mr: isMinimized ? 0 : 0.5 }}>
                            {item.icon}
                          </ListItemIcon>
                        </motion.div>
                        {!isMinimized && <StyledListItemText primary={item.label} sx={{ ml: 0.5, '& .MuiTypography-root': { color: isSelected ? menuColor : 'inherit', fontWeight: isSelected ? 600 : 500 } }} />}
                     </Box>
                    {!isMinimized && ( // Icono de expandir solo si no está minimizado
                        <motion.div
                         key={openSubMenu[item.path] ? 'less' : 'more'}
                         initial={{ rotate: -90 }}
                         animate={{ rotate: 0 }}
                         transition={{ duration: 0.2}}
                        >
                         {openSubMenu[item.path] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </motion.div>
                    )}
                  </StyledListItemButton>
                ) : (
                  // Link para Items sin Submenú
                  <Link href={item.path} passHref legacyBehavior>
                    <StyledListItemButton
                      component="a" // Importante para Link legacyBehavior
                      selected={isSelected}
                      itemcolor={menuColor} // Pasar color dinámico
                      sx={{ justifyContent: isMinimized ? 'center' : 'flex-start' }}
                      onMouseEnter={() => setHoveredItem(itemKey)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        animate={{ scale: hoveredItem === itemKey ? 1.1 : 1, rotate: hoveredItem === itemKey ? 3 : 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      >
                        <ListItemIcon sx={{ minWidth: isMinimized ? 'auto' : '32px', color: isSelected ? menuColor : theme.palette.text.secondary, fontSize: '1rem', mr: isMinimized ? 0 : 0.5 }}>
                          {item.icon}
                        </ListItemIcon>
                      </motion.div>
                      {!isMinimized && <StyledListItemText primary={item.label} sx={{ ml: 0.5, '& .MuiTypography-root': { color: isSelected ? menuColor : 'inherit', fontWeight: isSelected ? 600 : 500 } }} />}
                    </StyledListItemButton>
                  </Link>
                )}
              </motion.li>

              {/* Submenú Colapsable */}
              {hasSubItems && !isMinimized && ( // No mostrar submenú si está minimizado
                <Collapse in={openSubMenu[item.path] || false} timeout="auto" unmountOnExit>
                  <List component="ul" disablePadding sx={{ pl: 1.5 /* Indentación base submenú */ }}>
                    {item.subItems.map((subItem, subIndex) => {
                      const subMenuColor = menuColors[subItem.path] || menuColor; // Color específico o hereda del padre
                      const isCurrentSubPath = router.pathname === subItem.path;
                      const subItemKey = subItem.path || `sub-${index}-${subIndex}`;

                      return (
                        <motion.li
                            key={subItemKey}
                            variants={subItemVariants} // Usar variante de subitem
                            style={{ listStyle: 'none', marginBottom: '1px' }}
                            >
                          <Link href={subItem.path} passHref legacyBehavior>
                            <StyledListItemButton
                              component="a"
                              selected={isCurrentSubPath}
                              itemcolor={subMenuColor}
                              isSubItem={true} // Marcar como subitem para estilo
                              sx={{ pl: 3, py: 0.5 /* Padding vertical menor */, minHeight: '32px' }} // Padding izquierdo mayor
                              onMouseEnter={() => setHoveredItem(subItemKey)}
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <motion.div
                                animate={{ scale: hoveredItem === subItemKey ? 1.05 : 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                              >
                                <ListItemIcon sx={{ minWidth: '28px', color: isCurrentSubPath ? subMenuColor : '#9e9e9e' /* Gris más claro para subitems */, fontSize: '0.9rem', mr: 0.5 }}>
                                  {subItem.icon}
                                </ListItemIcon>
                              </motion.div>
                              <StyledListItemText
                                primary={subItem.label}
                                sx={{ ml: 0.5, '& .MuiTypography-root': { fontSize: '0.8rem' /* Texto subitem más pequeño */, color: isCurrentSubPath ? subMenuColor : 'inherit', fontWeight: isCurrentSubPath ? 600 : 500 } }}
                              />
                            </StyledListItemButton>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </React.Fragment>
          );
        })}
      </List>

      {/* Sección Inferior: Logout y Usuario */}
      <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        {/* Botón Logout */}
        <List sx={{ px: 1, pb: 0.5 }}>
            <motion.li style={{ listStyle: 'none' }} whileHover={{ scale: 1.01 }}>
                <ListItem disablePadding component="div">
                <StyledListItemButton
                    onClick={handleLogout}
                    itemcolor={theme.palette.error.main} // Usar color de error para hover/selected
                    sx={{
                    justifyContent: isMinimized ? 'center' : 'flex-start',
                    py: 0.75, minHeight: '36px',
                    '&:hover': { // Estilo hover específico para logout
                        backgroundColor: 'rgba(211, 47, 47, 0.1) !important',
                        '& .MuiListItemIcon-root': { color: theme.palette.error.main },
                        '& .MuiListItemText-root .MuiTypography-root': { color: theme.palette.error.dark }
                    }
                    }}
                    onMouseEnter={() => setHoveredItem('logout')}
                    onMouseLeave={() => setHoveredItem(null)}
                >
                    <motion.div
                        animate={{ rotate: hoveredItem === 'logout' ? 5 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                    <ListItemIcon sx={{ minWidth: isMinimized ? 'auto' : '32px', color: theme.palette.error.main, fontSize: '1rem', mr: isMinimized ? 0 : 0.5 }}>
                        <LogoutIcon fontSize="small"/>
                    </ListItemIcon>
                    </motion.div>
                    {!isMinimized && (
                    <StyledListItemText
                        primary="Cerrar Sesión"
                        primaryTypographyProps={{ color: theme.palette.error.dark, fontWeight: 500, fontSize: '0.8rem' }}
                        sx={{ ml: 0.5 }}
                    />
                    )}
                </StyledListItemButton>
                </ListItem>
            </motion.li>
        </List>

        {/* Info Usuario (Solo si no está minimizado y en escritorio) */}
        {!isMinimized && !isMobile && (
            <Box sx={{ p: 1, backgroundColor: 'rgba(245, 247, 250, 0.5)' }}>
                <Box sx={{ p: 0.75, borderRadius: '6px', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ fontSize: '0.9rem', color: theme.palette.primary.main, mr: 0.5 }} />
                            <Typography variant="body2" component="div" sx={{ color: theme.palette.text.secondary, fontWeight: 500, fontSize: '0.75rem' }}>
                                Admin
                            </Typography>
                        </Box>
                    </motion.div>
                </Box>
            </Box>
        )}
      </Box>
    </Box>
  );

  // ---- Renderizado Principal de la App ----
  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar para dispositivos móviles */}
      {isMobile && (
        <StyledAppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
          <StyledToolbar>
            <motion.div whileTap={{ scale: 0.9 }}>
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} size="medium" sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Typography variant="h6" noWrap component="div" sx={{ fontFamily: '"Roboto", sans-serif', fontWeight: 600, letterSpacing: '0.5px', fontSize: '1rem' }}>
                Evolution Fyt
              </Typography>
            </motion.div>
             {/* Placeholder para posible icono a la derecha */}
            <Box sx={{ width: 48 }} />
          </StyledToolbar>
        </StyledAppBar>
      )}

      {/* Sidebar (Drawer) */}
      <Box
        component="nav"
        sx={{
            // Usa el drawerWidth calculado (que ya considera isClient)
            width: { md: drawerWidth },
            flexShrink: { md: 0 },
            // La transición del ancho la maneja el StyledDrawer internamente
        }}
        aria-label="navegación del menú"
      >
        {/* Drawer Temporal (Móvil) */}
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }} // Mejor rendimiento en móviles
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 }, // Ancho fijo móvil
          }}
        >
            {/* Botón Minimizar no es necesario en móvil */}
            {drawerContent}
        </StyledDrawer>

        {/* Drawer Permanente (Escritorio) */}
        <StyledDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
             // El ancho se aplica directamente al MuiDrawer-paper a través de la prop `sx`
             // y se anima por la transición definida en `StyledDrawer`
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open // Siempre abierto en escritorio
        >
            {/* Botón para Minimizar/Expandir */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30px', // Altura reducida
                backgroundColor: 'rgba(245, 247, 250, 0.5)', borderBottom: '1px solid rgba(0,0,0,0.05)', cursor: 'pointer' }}
                onClick={handleMinimizeToggle}
            >
                <motion.div whileTap={{ scale: 0.9 }}>
                    <IconButton size="small" sx={{ p: 0.25 }}>
                        <motion.div
                            key={isMinimized ? 'right' : 'left'} // Animar cambio de icono
                            initial={{ rotate: isMinimized ? 0 : 180 }}
                            animate={{ rotate: isMinimized ? 180 : 0 }}
                            transition={{ type: 'tween', duration: 0.2 }}
                        >
                            {isMinimized ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                        </motion.div>
                    </IconButton>
                </motion.div>
            </Box>
            {drawerContent}
        </StyledDrawer>
      </Box>

      {/* Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 }, // Padding ajustado
          // Calcula el ancho restante, considerando el drawerWidth actual
          width: { md: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { md: 0 }, // El drawer permanente no empuja, el main calcula su ancho
          mt: isMobile ? '56px' : 0, // Margen superior solo en móvil por el AppBar
          // Transición para suavizar el cambio cuando el drawer se minimiza/expande
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen, // O leavingScreen
          }),
          backgroundColor: '#f9fafd', // Un fondo muy sutil para el área de contenido
          minHeight: '100vh' // Asegura que ocupe toda la altura
        }}
      >
         {/* Añadimos un Toolbar fantasma en escritorio para alinear contenido si fuera necesario,
             aunque con mt:0 y p:3 podría no ser necesario. Evaluar según tu diseño. */}
        {/* {!isMobile && <Toolbar sx={{ minHeight: '48px !important' }} />} */}

        {/* Anima la entrada del contenido de la página */}
        <motion.div
           key={router.pathname} // Animar cambio de ruta
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }} // Animación de salida
           transition={{ duration: 0.3, ease: "easeInOut" }}
         >
           {children}
        </motion.div>
      </Box>

        {/* Diálogo de confirmación de cierre de sesión (Modal) */}
        <Dialog
            open={logoutDialogOpen}
            onClose={cancelLogout}
            PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.1)', maxWidth: '380px', width: '90%', overflow: 'hidden' } }}
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
        >
        <AnimatePresence>
            {logoutDialogOpen && ( // Montar/desmontar con animación
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    transition={{ type: 'tween', duration: 0.25 }}
                >
                <DialogTitle id="logout-dialog-title" sx={{ fontFamily: '"Montserrat", sans-serif', fontWeight: 600, color: theme.palette.warning.dark, fontSize: '1.1rem', pt: 3, pb: 1, px: 3 }}>
                    <motion.span initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 150, damping: 15 }}>
                        Cerrar Sesión
                    </motion.span>
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2 }}>
                    <DialogContentText id="logout-dialog-description" sx={{ fontFamily: '"Open Sans", sans-serif', color: theme.palette.text.secondary, fontSize: '0.9rem', lineHeight: 1.6 }}>
                        ¿Estás seguro de que deseas cerrar tu sesión?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, gap: 1.5 }}> {/* Espacio y padding */}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={cancelLogout} color="primary" variant="text" size="medium" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500 }}>
                            Cancelar
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button onClick={confirmLogout} color="error" variant="contained" size="medium" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 500, boxShadow: 'none', '&:hover': { boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)' } }}>
                            Confirmar
                        </Button>
                    </motion.div>
                </DialogActions>
                </motion.div>
            )}
        </AnimatePresence>
        </Dialog>

    </Box>
  );
};

export default Sidebar;