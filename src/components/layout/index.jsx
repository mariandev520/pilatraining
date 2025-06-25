// src/components/layout/index.jsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, useTheme, useMediaQuery, Toolbar } from '@mui/material';
import { motion } from 'framer-motion';

// Importaciones del sistema de layout
import { StyledAppBar, StyledDrawer, MainContent } from './Sidebar.styled';
import SidebarMenu from './SidebarMenu';
import { menuItems } from './menuItems';

export default function Sidebar({ children }) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [openSubMenu, setOpenSubMenu] = useState({});

  const drawerWidth = isMinimized ? 60 : 240;

  useEffect(() => {
      const currentPath = router.pathname;
      const parentMenu = menuItems.find(item => item.subItems?.some(sub => currentPath.startsWith(sub.path)));
      if (parentMenu) {
          setOpenSubMenu(prev => ({ ...prev, [parentMenu.path]: true }));
      }
  }, [router.pathname]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMinimizeToggle = () => setIsMinimized(!isMinimized);
  const handleSubMenuToggle = (path) => setOpenSubMenu(prev => ({ ...prev, [path]: !prev[path] }));
  
  const drawerContent = (
    // Aquí podrías usar los componentes SidebarHeader, SidebarMenu, SidebarFooter
    <SidebarMenu
      currentPath={router.pathname}
      isMinimized={isMinimized}
      openSubMenu={openSubMenu}
      onSubMenuToggle={handleSubMenuToggle}
    />
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Lógica del AppBar móvil */}
      
      <StyledDrawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{ '& .MuiDrawer-paper': { width: isMobile ? 240 : drawerWidth } }}
      >
        <Toolbar /> {/* Para alinear con el AppBar */}
        {drawerContent}
        {/* Aquí iría el botón de minimizar, que llama a handleMinimizeToggle */}
      </StyledDrawer>

      <MainContent drawerwidth={isMobile ? 0 : drawerWidth}>
         <motion.div
           key={router.pathname}
           initial={{ opacity: 0, y: 15 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.3, ease: "easeInOut" }}
         >
           {children}
         </motion.div>
      </MainContent>
    </Box>
  );
}