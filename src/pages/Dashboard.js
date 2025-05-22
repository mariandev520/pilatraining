import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faDumbbell,
  faUserTie,
  faArrowRight,
  faMoneyBill,
  faIdCard,
  faUserPlus,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Link,
  CircularProgress,
  Backdrop,
  useTheme,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { styled } from "@mui/material/styles";

// Componentes con estilos personalizados compactos
const PageContainer = styled(Box)(({ theme }) => ({
  backgroundImage: 'url("/images/pilates-background.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '100vh',
  padding: theme.spacing(3),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    zIndex: 0
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  }
}));

const ContentContainer = styled(Box)({
  position: 'relative', // Cambiado de 'flex' a 'relative'
  zIndex: 1,
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 12px'
});

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Playfair Display", serif',
  fontSize: '2.8rem',
  fontWeight: 700,
  color: theme.palette.primary.dark,
  marginBottom: theme.spacing(1),
  textAlign: 'center',
  [theme.breakpoints.down('md')]: {
    fontSize: '2.2rem'
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.8rem'
  }
}));

const StyledSubtitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Montserrat", sans-serif',
  fontSize: '1.1rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(8),
  textAlign: 'center',
  fontWeight: 300,
  maxWidth: '700px',
  margin: 'auto',
  lineHeight: 3,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    marginBottom: theme.spacing(6)
  }
}));

const StyledMotionPaper = styled(motion(Paper))(({ theme, cardColor }) => {
  // Extraer los componentes RGB del color
  const getColorComponents = (colorStr) => {
    const rgba = colorStr.match(/\d+/g);
    return rgba ? rgba.map(num => parseInt(num, 10)) : [255, 77, 109]; // Default fallback
  };
  
  const colorComponents = getColorComponents(cardColor);
  
  return {
    padding: theme.spacing(2.5),
    display: "flex",
    flexDirection: "column",
    height: "100%",
    borderRadius: "14px",
    background: `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(${colorComponents[0]}, ${colorComponents[1]}, ${colorComponents[2]}, 0.08) 100%)`,
    boxShadow: `0 6px 20px rgba(${colorComponents[0]}, ${colorComponents[1]}, ${colorComponents[2]}, 0.18)`,
    transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
    overflow: 'hidden',
    border: `1.5px solid rgba(${colorComponents[0]}, ${colorComponents[1]}, ${colorComponents[2]}, 0.2)`,
    position: 'relative',
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: `0 10px 25px rgba(${colorComponents[0]}, ${colorComponents[1]}, ${colorComponents[2]}, 0.25)`
    },
    "&::before": {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: cardColor,
      zIndex: 2
    }
  };
});

const IconBox = styled(motion.div)(({ bgColor, theme }) => {
  // Extraer los componentes RGB del color
  const getColorComponents = (colorStr) => {
    const rgba = colorStr.match(/\d+/g);
    return rgba ? rgba.map(num => parseInt(num, 10)) : [255, 77, 109]; // Default fallback
  };
  
  const colorComponents = getColorComponents(bgColor);
  
  return {
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: `rgba(${colorComponents[0]}, ${colorComponents[1]}, ${colorComponents[2]}, 0.1)`,
    transition: "all 0.3s ease",
    display: 'inline-flex',
    marginBottom: '12px',
    "&:hover": {
      backgroundColor: `rgba(${colorComponents[0]}, ${colorComponents[1]}, ${colorComponents[2]}, 0.2)`,
      transform: 'rotate(12deg) scale(1.1)'
    }
  };
});

const StyledLink = styled(Link)(({ theme, linkColor }) => ({
  marginTop: theme.spacing(2),
  display: "inline-flex",
  alignItems: "center",
  fontFamily: '"Montserrat", sans-serif',
  fontWeight: 600,
  fontSize: "0.95rem",
  color: linkColor || theme.palette.primary.dark,
  transition: "all 0.2s ease",
  "&:hover": {
    color: theme.palette.primary.dark,
    transform: 'translateX(5px)'
  },
  cursor: "pointer",
}));

const HighlightBadge = styled(motion.div)(({ theme, badgeColor }) => ({
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  backgroundColor: badgeColor || theme.palette.primary.main,
  color: 'white',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  boxShadow: '0 3px 6px rgba(0,0,0,0.16)',
  zIndex: 3
}));

// Datos de las tarjetas compactas con colores personalizados para cada una
const cardData = [
  {
    icon: faUserPlus,
    title: "Nuevo Cliente",
    description: "Registrar nuevo cliente en el sistema.",
    color: "rgb(255, 77, 109)", // Rosa
    link: "/clientes?nuevo=true",
    badge: faStar,
    actionText: "Crear ahora",
    openInNewTab: false
  },
  {
    icon: faUsers,
    title: "Clientes",
    description: "Gestión de datos de clientes.",
    color: "rgb(124, 77, 255)", // Púrpura
    link: "/clientes",
    badge: faUsers,
    actionText: "Gestionar",
    openInNewTab: false
  },
  {
    icon: faDumbbell,
    title: "Actividades",
    description: "Administrar clases y horarios.",
    color: "rgb(76, 175, 80)", // Verde
    link: "/actividades",
    badge: faDumbbell,
    actionText: "Organizar",
    openInNewTab: false
  },
  {
    icon: faUserTie,
    title: "Profesores",
    description: "Gestión del personal docente.",
    color: "rgb(255, 193, 7)", // Amarillo
    link: "/profesor",
    badge: faUserTie,
    actionText: "Administrar",
    openInNewTab: false
  },
  {
    icon: faMoneyBill,
    title: "Pagos",
    description: "Seguimiento de abonos.",
    color: "rgb(33, 150, 243)", // Azul
    link: "/RegistroPagos",
    badge: faMoneyBill,
    actionText: "Registrar",
    openInNewTab: false
  },
  {
    icon: faIdCard,
    title: "Clases",
    description: "Control de asistencia.",
    color: "rgb(244, 67, 54)", // Rojo
    link: "/infoclases",
    badge: faIdCard,
    actionText: "Controlar",
    openInNewTab: false
  },
  {
    icon: faIdCard,
    title: "Verificador",
    description: "Fijar Verificador.",
    color: "rgb(5, 35, 208)", // Rojo
    link: "/verificacion",
    badge: faIdCard,
    actionText: "Verificador de clases",
    openInNewTab: true
  },
  {
    icon: faIdCard,
    title: "Calendario",
    description: "Calendario",
    color: "rgb(171, 17, 130)", // Rosa
    link: "/infoclases",
    badge: faIdCard,
    actionText: "Calendario",
    openInNewTab: false
  },
  {
    icon: faIdCard,
    title: "Ayuda",
    description: "Guia del Dasb Evolution",
    color: "rgb(98, 5, 219)", // Púrpura
    link: "/https://landing-sand-three-46.vercel.app/help",
    badge: faIdCard,
    actionText: "Manual de Usuario",
    openInNewTab: false
  },
];

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
  const [isClient, setIsClient] = useState(false);
  const theme = useTheme();

  // Marcar cuando estamos en el cliente (hidratación completa)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cargar fuentes personalizadas
  useEffect(() => {
    // Solo cargar fuentes en el cliente para evitar problemas de SSR
    if (!isClient) return;
    
    const linkPlayfair = document.createElement('link');
    linkPlayfair.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap';
    linkPlayfair.rel = 'stylesheet';
    
    const linkMontserrat = document.createElement('link');
    linkMontserrat.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&display=swap';
    linkMontserrat.rel = 'stylesheet';
    
    document.head.appendChild(linkPlayfair);
    document.head.appendChild(linkMontserrat);
    
    return () => {
      document.head.removeChild(linkPlayfair);
      document.head.removeChild(linkMontserrat);
    };
  }, [isClient]);

  const handleNavigation = (e, href, openInNewTab) => {
    e.preventDefault();
    
    if (openInNewTab) {
      // Abrir en una nueva pestaña
      window.open(href, '_blank');
    } else {
      // Navegación normal con animación de carga
      setSelectedLink(href);
      setLoading(true);
      
      setTimeout(() => {
        router.push(href);
      }, 600);
    }
  };

  // Animaciones más rápidas para diseño compacto
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 120,
      },
    },
    hover: {
      scale: 1.02,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 10 
      }
    }
  };

  const iconVariants = {
    hover: {
      rotate: [0, 8, -4, 0],
      transition: {
        duration: 0.5
      }
    }
  };

  // Si no estamos en el cliente, mostrar un placeholder simple para evitar problemas de SSR
  if (!isClient) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        p: 3, 
        position: 'relative'
      }}>
        <Box sx={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          p: '0 12px'
        }}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: { xs: 6, md: 8 }
          }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Panel de Control
            </Typography>
            <Typography variant="subtitle1">
              Gestión integral de Actividades deportivas y recreativas Evolution
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {cardData.map((_, index) => (
              <Grid key={index} item xs={12} sm={6} md={4} lg={4}>
                <Paper sx={{ height: '200px', borderRadius: '14px' }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(25, 25, 25, 0.92)',
        }}
        open={loading}
      >
        <CircularProgress 
          color="inherit" 
          size={60}
          thickness={4}
        />
        <Typography 
          variant="subtitle1" 
          sx={{ 
            ml: 2,
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 500,
          }}
        >
          Cargando {selectedLink.replace('/', '')}...
        </Typography>
      </Backdrop>

      <PageContainer>
        <ContentContainer>
          {/* Título con animación */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <StyledTitle>
              Panel de Control
            </StyledTitle>
            <StyledSubtitle>
              Gestión integral de Actividades deportivas y recreativas Evolution
            </StyledSubtitle>
          </motion.div>

          {/* Contenedor de las cards compactas */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {cardData.map(({ icon, title, description, color, link, badge, actionText, openInNewTab }, index) => (
                <Grid key={index} item xs={12} sm={6} md={4} lg={4}>
                  <motion.div 
                    variants={itemVariants}
                    whileHover="hover"
                  >
                    <AnimatePresence>
                      <StyledMotionPaper
                        cardColor={color}
                      >
                        <HighlightBadge
                          badgeColor={color}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ 
                            type: 'spring', 
                            stiffness: 400,
                            delay: index * 0.1 
                          }}
                        >
                          <FontAwesomeIcon icon={badge} size="xs" />
                        </HighlightBadge>
                        
                        <Box>
                          <motion.div
                            variants={iconVariants}
                            whileHover="hover"
                          >
                            <IconBox
                              bgColor={color}
                            >
                              <FontAwesomeIcon
                                icon={icon}
                                style={{ 
                                  fontSize: "1.5rem", 
                                  color: color,
                                }}
                              />
                            </IconBox>
                          </motion.div>
                          <Typography 
                            variant="h6" 
                            fontWeight={600}
                            sx={{
                              fontFamily: '"Montserrat", sans-serif',
                              color: color,
                              fontSize: '1.2rem',
                              mb: 1
                            }}
                          >
                            {title}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{
                              fontFamily: '"Montserrat", sans-serif',
                              fontSize: "0.9rem",
                              lineHeight: 1.5,
                              minHeight: '40px'
                            }}
                          >
                            {description}
                          </Typography>
                        </Box>
                        <NextLink href={link} passHref>
                          <StyledLink 
                            onClick={(e) => handleNavigation(e, link, openInNewTab)} 
                            linkColor={color}
                            rel={openInNewTab ? "noopener noreferrer" : undefined}
                          >
                            {actionText}
                            <FontAwesomeIcon 
                              icon={faArrowRight} 
                              style={{ 
                                marginLeft: "8px",
                                fontSize: '0.8rem',
                                color: color
                              }} 
                            />
                          </StyledLink>
                        </NextLink>
                      </StyledMotionPaper>
                    </AnimatePresence>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </ContentContainer>
      </PageContainer>
    </>
  );
};

export default Dashboard;