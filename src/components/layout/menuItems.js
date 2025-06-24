// src/components/layout/menuItems.js
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
// ...importa todos los iconos que necesites...
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics';

export const menuItems = [
  { path: '/Dashboard', icon: <DashboardIcon fontSize="small"/>, label: 'Panel' },
  { path: '/clientes', icon: <PeopleIcon fontSize="small"/>, label: 'Clientes' },
  {
    path: '/actividades', // Ruta base para el grupo
    icon: <FitnessCenterIcon fontSize="small"/>,
    label: 'Actividades',
    subItems: [
      { path: '/camaspilates', icon: <SportsGymnasticsIcon fontSize="small"/>, label: 'Pilates' },
      // ...otros sub-items aquí...
    ]
  },
  // ...otros items del menú...
];