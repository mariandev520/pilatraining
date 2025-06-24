// src/components/layout/Sidebar.styled.js
import { styled } from '@mui/material/styles';
import { AppBar, Drawer, Toolbar, ListItemButton, ListItemText, Box } from '@mui/material';

// --- Paleta de Colores y Utilidades ---
export const menuColors = {
  '/Dashboard': '#2196F3',
  '/clientes': 'rgb(124, 77, 255)',
  '/actividades': 'rgb(76, 175, 80)', // Color para el grupo padre
  // ...resto de colores...
};

export const colorWithOpacity = (color, opacity) => {
    // ...misma función de utilidad que tenías...
    // Fallback por si acaso
    return `rgba(33, 150, 243, ${opacity})`;
};

// --- Componentes Styled ---

export const StyledAppBar = styled(AppBar)({
  background: 'linear-gradient(135deg, rgba(62,81,181,0.95) 0%, rgba(48,63,159,0.95) 100%)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
});

export const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,248,248,0.98) 100%)',
    borderRight: '1px solid rgba(0,0,0,0.05)',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  }
}));

export const StyledListItemButton = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'selected' && prop !== 'itemcolor' && prop !== 'isSubItem',
})(({ theme, selected, itemcolor = '#2196F3', isSubItem }) => ({
    // ...misma definición de estilos que tenías...
    ...(selected && {
        // ...
    })
}));

export const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    // ...misma definición de estilos...
    fontWeight: 500,
    fontSize: '0.85rem',
  }
}));

export const MainContent = styled('main')(({ theme, drawerwidth }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  marginLeft: 0,
  width: `calc(100% - ${drawerwidth}px)`,
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: theme.spacing(2),
    marginTop: '56px',
  },
  backgroundColor: '#f9fafd',
  minHeight: '100vh',
}));