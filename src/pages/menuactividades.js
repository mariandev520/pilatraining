import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  IconButton,
  Collapse,
  Grid,
  Tooltip,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  Menu,
  MenuItem,
  Snackbar,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Logout as LogoutIcon,
  SportsSoccer as SportsIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  MoreVert as MoreVertIcon,
  WhatsApp as WhatsAppIcon,
  ContentCopy as ContentCopyIcon,
  Email as EmailIcon,
  FitnessCenter as FitnessCenterIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Color principal para actividades (verde)
const ACTIVITY_COLOR = "rgb(76, 175, 80)";
const ACTIVITY_COLOR_LIGHT = "rgba(76, 175, 80, 0.1)";

// Función para extraer componentes RGB de un color
const getColorComponents = (colorStr) => {
  // Si no hay color o no es un string válido, usar color predeterminado
  if (!colorStr || typeof colorStr !== 'string') {
    return [76, 175, 80]; // Verde predeterminado
  }
  
  // Intentar extraer componentes RGB
  const matches = colorStr.match(/\d+/g);
  return matches && matches.length >= 3 ? 
    [parseInt(matches[0], 10), parseInt(matches[1], 10), parseInt(matches[2], 10)] : 
    [76, 175, 80]; // Color predeterminado si no se pueden extraer componentes
};

// Componentes con estilos personalizados
const StyledHeaderPaper = styled(Paper)(({ theme }) => ({
  borderRadius: "14px",
  background: `linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(56, 142, 60, 0.9) 100%)`,
  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.18)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid rgba(76, 175, 80, 0.2)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  "&::before": {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'white',
    opacity: 0.3,
    zIndex: 2
  }
}));

const StyledCard = styled(Card)(({ theme, color = ACTIVITY_COLOR }) => {
  const [r, g, b] = getColorComponents(color);
  
  return {
    borderRadius: "14px",
    boxShadow: `0 6px 20px rgba(${r}, ${g}, ${b}, 0.15)`,
    background: `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(${r}, ${g}, ${b}, 0.05) 100%)`,
    border: `1.5px solid rgba(${r}, ${g}, ${b}, 0.2)`,
    position: 'relative',
    marginBottom: theme.spacing(4),
    overflow: 'hidden',
    "&::before": {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '3px',
      background: color,
      zIndex: 2
    }
  };
});

const StyledListCard = styled(Card)(({ theme }) => ({
  borderRadius: "14px",
  boxShadow: '0 6px 20px rgba(76, 175, 80, 0.12)',
  border: '1px solid rgba(76, 175, 80, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  "&::before": {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: ACTIVITY_COLOR,
    zIndex: 2
  }
}));

const StyledButton = styled(Button)(({ theme, color = ACTIVITY_COLOR }) => {
  const [r, g, b] = getColorComponents(color);
  
  return {
    borderRadius: "10px",
    transition: "all 0.3s ease",
    fontWeight: 600,
    boxShadow: `0 4px 12px rgba(${r}, ${g}, ${b}, 0.2)`,
    padding: '8px 20px',
    textTransform: 'none',
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `0 6px 16px rgba(${r}, ${g}, ${b}, 0.25)`,
    }
  };
});

const StyledAvatar = styled(Avatar)(({ theme, color = ACTIVITY_COLOR }) => {
  const [r, g, b] = getColorComponents(color);
  
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
    color: color,
    fontWeight: 600,
    boxShadow: `0 3px 8px rgba(${r}, ${g}, ${b}, 0.15)`,
    border: `1px solid rgba(${r}, ${g}, ${b}, 0.2)`,
  };
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: ACTIVITY_COLOR,
      borderWidth: "2px"
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: `rgba(76, 175, 80, 0.5)`
    }
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: ACTIVITY_COLOR
  }
}));

export async function getServerSideProps(context) {
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const host = context.req.headers.host;
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/actividades`);
  const data = await res.json();

  return { props: { data } };
}

export default function menuactividades({ data }) {
  const initialForm = {
    nombre: '',
    horarios: '',
    valorPorClase: '',
    valorMensual: ''
  };

  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [actividades, setActividades] = useState([]);
  const [shareAnchorEl, setShareAnchorEl] = useState(null);
  const [shareActivity, setShareActivity] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
      router.push('/index');
    }
    setActividades(data);
  }, [data, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertir a número los campos de valor si contienen números
    if ((name === 'valorPorClase' || name === 'valorMensual') && value !== '') {
      const numericValue = value.replace(/[^0-9]/g, '');
      setForm({ ...form, [name]: numericValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const method = editIndex !== null ? 'PUT' : 'POST';
    const url = editIndex !== null 
      ? `/api/actividades?id=${actividades[editIndex]._id}` 
      : '/api/actividades';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      
      const result = await res.json();
      setMensaje(result.message);
      
      // Refrescar la página para obtener datos actualizados
      router.replace(router.asPath);
      
      // Resetear formulario y cerrar expandible
      resetForm();
      setExpanded(false);
      
      // Mostrar notificación de éxito
      setNotificationMessage(editIndex !== null ? 
        'Actividad actualizada con éxito' : 
        'Actividad creada con éxito');
      setNotificationOpen(true);
    } catch (error) {
      console.error("Error al guardar:", error);
      setMensaje("Error al procesar la solicitud");
    }
  };

  const handleEdit = (index) => {
    setForm({
      nombre: actividades[index].nombre,
      horarios: actividades[index].horarios || '',
      valorPorClase: actividades[index].valorPorClase || '',
      valorMensual: actividades[index].valorMensual || ''
    });
    setEditIndex(index);
    setExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/actividades?id=${deleteId}`, {
        method: 'DELETE',
      });
      
      const result = await res.json();
      
      // Cerrar diálogo y resetear estado
      setDeleteDialogOpen(false);
      setDeleteId(null);
      
      // Refrescar la página para obtener datos actualizados
      router.replace(router.asPath);
      
      // Mostrar notificación
      setNotificationMessage('Actividad eliminada con éxito');
      setNotificationOpen(true);
    } catch (error) {
      console.error("Error al eliminar:", error);
      setDeleteDialogOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    router.push('/Dashboard');
  };

  const toggleExpand = () => {
    if (expanded && editIndex !== null) {
      resetForm();
    }
    setExpanded(!expanded);
  };

  // Funciones para compartir
  const handleShareClick = (event, actividad) => {
    setShareAnchorEl(event.currentTarget);
    setShareActivity(actividad);
  };

  const handleShareClose = () => {
    setShareAnchorEl(null);
    setShareActivity(null);
  };

  const handleShareOption = (option) => {
    const actividadInfo = `Actividad: ${shareActivity.nombre}\nHorarios: ${shareActivity.horarios || 'No especificado'}\nValor por clase: $${shareActivity.valorPorClase || '0'}\nValor mensual: $${shareActivity.valorMensual || '0'}`;
    
    switch (option) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(actividadInfo)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=Información de Actividad&body=${encodeURIComponent(actividadInfo)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(actividadInfo);
        setNotificationMessage('Información copiada al portapapeles');
        setNotificationOpen(true);
        break;
      default:
        break;
    }
    handleShareClose();
  };

  const handleCloseNotification = () => {
    setNotificationOpen(false);
  };

  // Animaciones para los ítems de la lista
  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    }),
    exit: { opacity: 0, x: -20 }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, fontFamily: "'Montserrat', sans-serif" }}>
      {/* Encabezado */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <StyledHeaderPaper>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StyledAvatar 
                sx={{ width: 56, height: 56 }}
                color={ACTIVITY_COLOR}
              >
                <FitnessCenterIcon fontSize="large" />
              </StyledAvatar>
              <Box>
                <Typography variant="h4" component="h1" fontWeight={700} fontSize="1.8rem">
                  Gestión de Actividades
                </Typography>
                <Typography variant="subtitle1" sx={{ opacity: 0.9, fontWeight: 300 }}>
                  Administra las clases y horarios de tu estudio
                </Typography>
              </Box>
            </Box>
            <Tooltip title="Cerrar sesión">
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                size="large"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)' 
                  } 
                }}
              >
                <LogoutIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>
        </StyledHeaderPaper>
      </motion.div>

      {/* Panel de acciones */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <StyledCard>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <StyledAvatar color={ACTIVITY_COLOR}>
                  <SportsIcon />
                </StyledAvatar>
                <Typography variant="h6" fontWeight="bold">
                  Listado de Actividades
                </Typography>
              </Box>
              <StyledButton
                variant="contained"
                startIcon={expanded ? <ExpandLessIcon /> : <AddIcon />}
                onClick={toggleExpand}
                sx={{ 
                  bgcolor: ACTIVITY_COLOR,
                  '&:hover': { 
                    bgcolor: 'rgba(76, 175, 80, 0.9)' 
                  }
                }}
              >
                {expanded ? (editIndex !== null ? 'Cancelar edición' : 'Ocultar formulario') : 'Agregar actividad'}
              </StyledButton>
            </Box>
          </CardContent>
        </StyledCard>
      </motion.div>

      {/* Formulario desplegable */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StyledCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3, color: ACTIVITY_COLOR, display: 'flex', alignItems: 'center' }}>
                  <StyledAvatar 
                    color={ACTIVITY_COLOR} 
                    sx={{ 
                      width: 34, 
                      height: 34, 
                      mr: 1.5, 
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {editIndex !== null ? <EditIcon /> : <AddIcon />}
                  </StyledAvatar>
                  {editIndex !== null ? 'Editar Actividad' : 'Nueva Actividad'}
                </Typography>
                
                {mensaje && (
                  <Alert 
                    severity={mensaje.includes('éxito') ? 'success' : 'error'} 
                    sx={{ 
                      mb: 3, 
                      borderRadius: '8px',
                      ...(mensaje.includes('éxito') && {
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        color: ACTIVITY_COLOR,
                        '& .MuiAlert-icon': {
                          color: ACTIVITY_COLOR,
                        }
                      })
                    }}
                  >
                    {mensaje}
                  </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        name="nombre"
                        label="Nombre de la actividad"
                        variant="outlined"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        size="medium"
                        InputProps={{ sx: { borderRadius: '8px' } }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        name="horarios"
                        label="Horarios (ej: Lunes y Miércoles 18:00-20:00)"
                        variant="outlined"
                        value={form.horarios}
                        onChange={handleChange}
                        size="medium"
                        InputProps={{ sx: { borderRadius: '8px' } }}
                        placeholder="Días y horas de la actividad"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        name="valorPorClase"
                        label="Valor por clase"
                        variant="outlined"
                        value={form.valorPorClase}
                        onChange={handleChange}
                        size="medium"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          sx: { borderRadius: '8px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        name="valorMensual"
                        label="Valor mensual"
                        variant="outlined"
                        value={form.valorMensual}
                        onChange={handleChange}
                        size="medium"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          sx: { borderRadius: '8px' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                        <Button
                          variant="outlined"
                          onClick={toggleExpand}
                          sx={{ 
                            borderRadius: 2, 
                            px: 4,
                            minWidth: 120,
                            color: ACTIVITY_COLOR,
                            borderColor: `rgba(76, 175, 80, 0.5)`,
                            '&:hover': {
                              borderColor: ACTIVITY_COLOR,
                              bgcolor: `rgba(76, 175, 80, 0.04)`
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                        <StyledButton
                          type="submit"
                          variant="contained"
                          startIcon={editIndex !== null ? <EditIcon /> : <AddIcon />}
                          sx={{ 
                            minWidth: 120,
                            bgcolor: ACTIVITY_COLOR,
                            '&:hover': { 
                              bgcolor: 'rgba(76, 175, 80, 0.9)' 
                            }
                          }}
                        >
                          {editIndex !== null ? 'Actualizar' : 'Guardar'}
                        </StyledButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </StyledCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de actividades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <StyledListCard>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="600">
                  Total de actividades:
                </Typography>
                <Chip 
                  label={actividades.length} 
                  sx={{ 
                    fontWeight: 600, 
                    color: ACTIVITY_COLOR,
                    borderColor: `rgba(76, 175, 80, 0.3)`,
                    bgcolor: `rgba(76, 175, 80, 0.05)`
                  }}
                  variant="outlined"
                  size="small"
                />
              </Box>
            }
            sx={{ 
              backgroundColor: 'rgba(76, 175, 80, 0.05)',
              borderBottom: '1px solid rgba(76, 175, 80, 0.1)',
              padding: 2
            }}
          />
          <CardContent sx={{ p: 0 }}>
            {actividades.length > 0 ? (
              <List sx={{ p: 0 }}>
                <AnimatePresence>
                  {actividades.map((actividad, i) => (
                    <motion.div
                      key={actividad._id || i}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <ListItem
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.05)',
                          },
                          transition: 'background-color 0.2s',
                          padding: 2
                        }}
                        secondaryAction={
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Compartir">
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  backgroundColor: `rgba(33, 150, 243, 0.1)`,
                                  color: 'rgb(33, 150, 243)',
                                  transition: 'all 0.2s',
                                  '&:hover': { 
                                    backgroundColor: 'rgb(33, 150, 243)',
                                    color: 'white',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                                onClick={(e) => handleShareClick(e, actividad)}
                              >
                                <ShareIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  backgroundColor: `rgba(76, 175, 80, 0.1)`,
                                  color: ACTIVITY_COLOR,
                                  transition: 'all 0.2s',
                                  '&:hover': { 
                                    backgroundColor: ACTIVITY_COLOR,
                                    color: 'white',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                                onClick={() => handleEdit(i)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar">
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                  color: 'rgb(244, 67, 54)',
                                  transition: 'all 0.2s',
                                  '&:hover': { 
                                    backgroundColor: 'rgb(244, 67, 54)', 
                                    color: 'white',
                                    transform: 'translateY(-2px)'
                                  }
                                }}
                                onClick={() => handleDeleteConfirm(actividad._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        }
                      >
                        <StyledAvatar 
                          sx={{ width: 40, height: 40, mr: 2 }}
                          color={ACTIVITY_COLOR}
                        >
                          {actividad.nombre.charAt(0).toUpperCase()}
                        </StyledAvatar>
                        <ListItemText
                          primary={
                            <Typography fontWeight={600} sx={{ color: ACTIVITY_COLOR }}>
                              {actividad.nombre}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              {actividad.horarios && (
                                <Typography variant="body2" color="text.secondary" component="div">
                                  <strong>Horarios:</strong> {actividad.horarios}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                {actividad.valorPorClase && (
                                  <Chip 
                                    label={`Por clase: $${actividad.valorPorClase}`} 
                                    size="small"
                                    sx={{
                                      backgroundColor: `rgba(76, 175, 80, 0.08)`,
                                      color: 'rgba(76, 175, 80, 0.9)',
                                      fontWeight: 500,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                )}
                                {actividad.valorMensual && (
                                  <Chip 
                                    label={`Mensual: $${actividad.valorMensual}`} 
                                    size="small"
                                    sx={{
                                      backgroundColor: `rgba(76, 175, 80, 0.08)`,
                                      color: 'rgba(76, 175, 80, 0.9)',
                                      fontWeight: 500,
                                      fontSize: '0.75rem'
                                    }}
                                  />
                                )}
                              </Box>
                              <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
                                Creada el {new Date(actividad.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {i < actividades.length - 1 && <Divider sx={{ opacity: 0.5 }} />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <StyledAvatar sx={{ width: 60, height: 60, mx: 'auto', mb: 2 }} color={ACTIVITY_COLOR}>
                  <FitnessCenterIcon fontSize="large" />
                </StyledAvatar>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                  No hay actividades registradas.
                </Typography>
                <StyledButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={toggleExpand}
                  sx={{ 
                    mt: 2,
                    bgcolor: ACTIVITY_COLOR,
                    '&:hover': { 
                      bgcolor: 'rgba(76, 175, 80, 0.9)' 
                    }
                  }}
                >
                  Agregar primera actividad
                </StyledButton>
              </Box>
            )}
          </CardContent>
        </StyledListCard>
      </motion.div>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '14px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 2,
          color: 'rgb(244, 67, 54)'
        }}>
          <DeleteIcon color="error" />
          <Typography variant="h6" component="span" fontWeight={600}>
            Confirmar eliminación
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText>
            ¿Estás seguro de que des¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer.
          </DialogContentText>
          <Alert 
            severity="error" 
            sx={{ 
              mt: 2,
              borderRadius: '8px',
              '& .MuiAlert-icon': {
                color: 'rgb(244, 67, 54)',
              }
            }}
          >
            Al eliminar esta actividad, también se eliminará su asociación con los clientes registrados.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            variant="outlined"
            sx={{ 
              minWidth: 100,
              borderRadius: '8px',
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.primary',
                bgcolor: 'rgba(0, 0, 0, 0.03)'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ 
              minWidth: 120,
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(244, 67, 54, 0.2)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(244, 67, 54, 0.3)',
                transform: "translateY(-2px)",
              }
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menú para compartir */}
      <Menu
        anchorEl={shareAnchorEl}
        open={Boolean(shareAnchorEl)}
        onClose={handleShareClose}
        PaperProps={{
          sx: {
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(33, 150, 243, 0.1)',
            overflow: 'hidden',
            "& .MuiMenuItem-root": {
              py: 1.5
            }
          }
        }}
      >
        <MenuItem 
          onClick={() => handleShareOption('whatsapp')}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(33, 150, 243, 0.08)' 
            }
          }}
        >
          <WhatsAppIcon fontSize="small" sx={{ mr: 1.5, color: '#25D366' }} /> 
          <Typography variant="body2" fontWeight={500}>Compartir por WhatsApp</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => handleShareOption('email')}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(33, 150, 243, 0.08)' 
            }
          }}
        >
          <EmailIcon fontSize="small" sx={{ mr: 1.5, color: '#4A90E2' }} /> 
          <Typography variant="body2" fontWeight={500}>Compartir por Email</Typography>
        </MenuItem>
        <MenuItem 
          onClick={() => handleShareOption('copy')}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(33, 150, 243, 0.08)' 
            }
          }}
        >
          <ContentCopyIcon fontSize="small" sx={{ mr: 1.5, color: '#607D8B' }} /> 
          <Typography variant="body2" fontWeight={500}>Copiar información</Typography>
        </MenuItem>
      </Menu>

      {/* Notificaciones */}
      <Snackbar
        open={notificationOpen}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity="success"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            bgcolor: 'rgba(76, 175, 80, 0.9)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
          elevation={6}
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}