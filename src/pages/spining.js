import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Box, Grid, Avatar,
    Chip, Card, CardContent, CircularProgress, Alert,
    Divider, IconButton, Button, List, ListItem, ListItemAvatar,
    ListItemText, Tab, Tabs, alpha, Tooltip, keyframes
} from '@mui/material';
import {
    Person as PersonIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    FitnessCenter as FitnessCenterIcon,
    CheckCircle as CheckCircleIcon,
    ArrowRightAlt as ArrowRightAltIcon,
    Today as TodayIcon,
    ErrorOutline as ErrorOutlineIcon,
    Info as InfoIcon,
    Clear as ClearIcon,
    DirectionsBike as DirectionsBikeIcon,
    AccessibilityNew as AccessibilityNewIcon
} from '@mui/icons-material';
import { toast } from 'sonner';

// Animaciones personalizadas
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Constantes
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORARIOS = ['8:00', '9:30', '11:00', '16:00', '17:30', '19:00'];
const TOTAL_ESPACIOS = 10;

// Componente EspacioSpinning mejorado
const EspacioSpinning = ({ numero, cliente, onClickEspacio, onRemoveCliente }) => {
    return (
        <Card
            elevation={cliente ? 4 : 1}
            sx={{
                height: '160px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                position: 'relative',
                overflow: 'visible',
                border: cliente ? `2px solid ${cliente.color || '#f57c00'}` : '2px dashed #e0e0e0',
                bgcolor: cliente ? alpha(cliente.color || '#f57c00', 0.08) : '#f9f9f9',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                    borderColor: cliente ? alpha(cliente.color || '#f57c00', 0.8) : '#bdbdbd',
                },
                animation: `${fadeIn} 0.3s ease-out`
            }}
        >
            <Box
                sx={{
                    position: 'absolute', 
                    top: -15, 
                    left: 15,
                    backgroundColor: cliente ? (cliente.color || '#f57c00') : '#9e9e9e',
                    color: '#fff', 
                    width: 32, 
                    height: 32,
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    fontWeight: 'bold', 
                    zIndex: 1,
                    transition: 'all 0.3s ease'
                }}
            >
                {numero}
            </Box>

            <CardContent sx={{
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '28px 10px 8px',
                cursor: 'pointer',
                '&:hover': {
                    '& .avatar-hover': {
                        animation: `${pulse} 1s infinite`
                    }
                }
            }} onClick={onClickEspacio}>
                {cliente ? (
                    <>
                        <Avatar
                            className="avatar-hover"
                            sx={{
                                width: 48, 
                                height: 48,
                                bgcolor: cliente.color || '#f57c00', 
                                mb: 1,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)', 
                                fontSize: '1rem',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {cliente.nombre?.split(' ').map(n=>n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold" align="center" sx={{ 
                            mb: 0, 
                            width: '100%', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            fontFamily: '"Roboto Condensed", sans-serif'
                        }}>
                            {cliente.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" align="center" sx={{ 
                            display:'block', 
                            width: '100%', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            fontFamily: '"Roboto Condensed", sans-serif'
                        }}>
                            DNI: {cliente.dni}
                        </Typography>
                        <Chip
                           label={`Clases: ${cliente.clasesPendientes ?? 0}`}
                           size="small"
                           sx={{ 
                               mt: 1, 
                               bgcolor: alpha(cliente.color || '#f57c00', 0.2), 
                               height: 22, 
                               fontSize: '0.7rem',
                               fontWeight: 'bold',
                               fontFamily: '"Roboto Condensed", sans-serif'
                           }}
                         />
                    </>
                ) : (
                    <>
                        <AccessibilityNewIcon sx={{ 
                            fontSize: 40, 
                            color: '#bdbdbd', 
                            mb: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                color: '#f57c00'
                            }
                        }} />
                        <Typography variant="body2" align="center" color="text.secondary" sx={{
                            fontFamily: '"Roboto Condensed", sans-serif'
                        }}>
                            Espacio Libre
                        </Typography>
                        <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 0.5 }}>
                            Clic para asignar
                        </Typography>
                    </>
                )}
            </CardContent>

            {cliente && (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    pb: 1.5,
                    animation: `${fadeIn} 0.3s ease-out`
                }}>
                    <Tooltip title={`Quitar a ${cliente.nombre}`}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                toast(`¿Quitar a ${cliente.nombre} del espacio ${numero}?`, {
                                    action: {
                                        label: 'Confirmar',
                                        onClick: () => onRemoveCliente()
                                    },
                                    cancel: {
                                        label: 'Cancelar',
                                        onClick: () => {}
                                    },
                                    duration: 10000,
                                    position: 'top-center'
                                });
                            }}
                            sx={{ 
                                bgcolor: 'rgba(244, 67, 54, 0.1)', 
                                '&:hover': { 
                                    bgcolor: 'rgba(244, 67, 54, 0.2)',
                                    transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Card>
    );
};

// Componente para cliente en la lista mejorado
const ClienteItem = ({ cliente, seleccionado, onClick }) => {
    return (
        <ListItem
            button
            onClick={() => onClick(cliente)}
            selected={seleccionado}
            sx={{
                mb: 1, 
                borderRadius: '8px',
                border: `1px solid ${seleccionado ? cliente.color || '#f57c00' : 'transparent'}`,
                bgcolor: seleccionado ? alpha(cliente.color || '#f57c00', 0.1) : 'transparent',
                '&:hover': { 
                    bgcolor: alpha(cliente.color || '#f57c00', 0.15),
                    transform: 'translateX(4px)'
                },
                transition: 'all 0.2s ease',
                animation: `${fadeIn} 0.3s ease-out`
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ 
                    bgcolor: cliente.color || '#f57c00', 
                    width: 38, 
                    height: 38,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                    <PersonIcon fontSize='small' />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={
                    <Typography noWrap variant="body2" fontWeight={seleccionado ? 'bold' : 'normal'} sx={{
                        fontFamily: '"Roboto Condensed", sans-serif'
                    }}>
                        {cliente.nombre}
                    </Typography>
                }
                secondary={`Clases: ${cliente.clasesPendientes ?? 0}`}
                secondaryTypographyProps={{ 
                    variant: 'caption',
                    sx: {
                        fontFamily: '"Roboto Condensed", sans-serif'
                    }
                }}
            />
            {seleccionado && (
                <ArrowRightAltIcon color="primary" sx={{
                    animation: `${pulse} 1.5s infinite`
                }} />
            )}
        </ListItem>
    );
};

// Sección de horario mejorada
const SeccionHorario = ({ horario, diaSeleccionado, espaciosAsignados, onEspacioClick, onRemoveCliente }) => {
    return (
        <Box sx={{ mb: 3, animation: `${fadeIn} 0.4s ease-out` }}>
            <Box
                sx={{
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                    px: 2, 
                    py: 1,
                    borderRadius: '12px 12px 0 0',
                    display: 'flex', 
                    alignItems: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                <TodayIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" fontWeight="bold" sx={{
                    fontFamily: '"Roboto Condensed", sans-serif',
                    letterSpacing: '0.5px'
                }}>
                    {horario}
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ 
                mt: 0, 
                p: 2, 
                bgcolor: '#fdfdfd', 
                borderRadius: '0 0 12px 12px', 
                border: '1px solid', 
                borderColor: 'grey.200', 
                borderTop: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                {[...Array(TOTAL_ESPACIOS)].map((_, index) => {
                    const numEspacio = index + 1;
                    const espacioClave = `${diaSeleccionado}-${horario}-Espacio ${numEspacio}`;
                    return (
                        <Grid item xs={6} sm={4} md={2} lg={2.4} key={numEspacio} sx={{ mb: 2 }}>
                            <EspacioSpinning
                                numero={numEspacio}
                                cliente={espaciosAsignados[espacioClave]}
                                onClickEspacio={() => onEspacioClick(espacioClave)}
                                onRemoveCliente={() => onRemoveCliente(espacioClave)}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

// Componente principal de Spinning mejorado
const Spinning = () => {
    const [clientes, setClientes] = useState([]);
    const [clientesSpinning, setClientesSpinning] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [espaciosAsignados, setEspaciosAsignados] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingGuardado, setLoadingGuardado] = useState(false);
    const [error, setError] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
    const [isModificado, setIsModificado] = useState(false);
      const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Función para generar colores
    const getRandomColor = (index) => {
        const colors = [
            '#f57c00', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
            '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
            '#8bc34a', '#cddc39', '#ffc107', '#ff9800', '#ff5722'
        ];
        return colors[index % colors.length];
    };

    // Carga Inicial
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar Clientes
                const respClientes = await fetch('/api/clientes');
                if (!respClientes.ok) throw new Error('Error al cargar clientes');
                const dataClientes = await respClientes.json();
                const clientesConSpinning = dataClientes.filter(c => c.actividades?.some(act => act.nombre.toLowerCase().includes('spinning') || act.nombre.toLowerCase().includes('ciclismo')));
                const clientesFormateados = clientesConSpinning.map((cliente, index) => ({
                    id: cliente._id || `cliente-${index}`, 
                    dni: cliente.dni, 
                    nombre: cliente.nombre,
                    actividades: cliente.actividades, 
                    color: getRandomColor(index),
                    clasesPendientes: cliente.clasesPendientesTotales ?? 0
                }));
                setClientes(dataClientes);
                setClientesSpinning(clientesFormateados);

                // Cargar Asignaciones
                await cargarAsignaciones();

            } catch (err) {
                console.error('Error cargando datos iniciales:', err);
                setError(`Error al cargar datos: ${err.message}. Intente recargar.`);
                toast.error(`Error al cargar datos: ${err.message}`, {
                    position: 'top-center',
                    duration: 5000
                });
                setEspaciosAsignados({});
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const cargarAsignaciones = async () => {
      try {
          const apiUrl = '/api/spining';
          const respAsignaciones = await fetch(apiUrl);

          if (!respAsignaciones.ok) {
              const errorText = await respAsignaciones.text();
              let errorMessage = `Error ${respAsignaciones.status} al cargar asignaciones`;
              
              try {
                  const errorData = JSON.parse(errorText);
                  if (errorData && errorData.message) {
                      errorMessage = errorData.message;
                  }
              } catch (parseError) {
                  console.error('Error parseando respuesta de error:', parseError);
              }
              
              throw new Error(errorMessage);
          }

          const dataAsignaciones = await respAsignaciones.json();
          setEspaciosAsignados(dataAsignaciones || {});
          setIsModificado(false);
          toast.success("Asignaciones de spinning cargadas correctamente", {
              position: 'top-center',
              duration: 3000
          });

      } catch (err) {
          console.error('Error cargando asignaciones de spinning desde API:', err);
          setError(`Error al cargar asignaciones: ${err.message}`);
          toast.error(`Error al cargar asignaciones: ${err.message}`, {
              position: 'top-center',
              duration: 5000
          });
          setEspaciosAsignados({});
          setIsModificado(false);
      }
    };

    // Seleccionar cliente
    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(prev => prev?.id === cliente.id ? null : cliente);
        if (!clienteSeleccionado || clienteSeleccionado?.id !== cliente.id) {
            toast(`Cliente seleccionado: ${cliente.nombre}`, {
                description: `Clases pendientes: ${cliente.clasesPendientes}`,
                position: 'top-center',
                duration: 3000
            });
        }
    };

    // Manejar clic en espacio
    const handleEspacioClick = (espacioClave) => {
        if (clienteSeleccionado) {
            const [dia, horario] = espacioClave.split('-');
            const estaEnEsteHorario = Object.entries(espaciosAsignados).some(
                ([key, cli]) => key.startsWith(`${dia}-${horario}-`) && cli.id === clienteSeleccionado.id
            );

            if (estaEnEsteHorario) {
                toast.warning(`${clienteSeleccionado.nombre} ya tiene un espacio a las ${horario}`, {
                    position: 'top-center',
                    duration: 4000
                });
                return;
            }
            
            const estaAsignadoEnDia = Object.entries(espaciosAsignados).some(
                ([key, cliente]) => 
                    key.split('-')[0] === diaSeleccionado && 
                    cliente.id === clienteSeleccionado.id
            );
            
            if (estaAsignadoEnDia) {
                toast.warning('Este cliente ya tiene un espacio asignado en este día', {
                    position: 'top-center',
                    duration: 4000
                });
                return;
            }

            if (clienteSeleccionado.clasesPendientes <= 0) {
                toast(`¿Asignar a ${clienteSeleccionado.nombre} sin clases pendientes?`, {
                    action: {
                        label: 'Confirmar',
                        onClick: () => {
                            setEspaciosAsignados(prev => ({ ...prev, [espacioClave]: clienteSeleccionado }));
                            setClienteSeleccionado(null);
                            setIsModificado(true);
                            toast.success(`Cliente asignado al espacio ${espacioClave.split('-')[2]}`, {
                                position: 'top-center',
                                duration: 3000
                            });
                        }
                    },
                    cancel: {
                        label: 'Cancelar',
                        onClick: () => {}
                    },
                    duration: 8000,
                    position: 'top-center'
                });
                return;
            }

            setEspaciosAsignados(prev => ({ ...prev, [espacioClave]: clienteSeleccionado }));
            setClienteSeleccionado(null);
            setIsModificado(true);
            toast.success(`Cliente asignado al espacio ${espacioClave.split('-')[2]}`, {
                position: 'top-center',
                duration: 3000
            });
        } else {
             const clienteEnEspacio = espaciosAsignados[espacioClave];
             if(clienteEnEspacio) {
                 toast.info(`Espacio ocupado por: ${clienteEnEspacio.nombre}`, {
                     position: 'top-center',
                     duration: 3000
                 });
             }
        }
    };

    // Eliminar cliente de espacio
    const handleRemoveCliente = (espacioClave) => {
        const cliente = espaciosAsignados[espacioClave];
        setEspaciosAsignados(prev => {
            const nuevasAsignaciones = { ...prev };
            delete nuevasAsignaciones[espacioClave];
            return nuevasAsignaciones;
        });
        setIsModificado(true);
        toast.success(`${cliente.nombre} eliminado del espacio`, {
            position: 'top-center',
            duration: 3000
        });
    };

    // Función para verificar si hay espacios asignados para el día actual
    const hayEspaciosEnDia = () => {
        return Object.keys(espaciosAsignados).some(key => key.startsWith(`${diaSeleccionado}-`));
    };

    const limpiarAsignacionesDia = () => {
        if (window.confirm(`¿Borrar todas las asignaciones del ${diaSeleccionado}?`)) {
            const nuevasAsignaciones = { ...espaciosAsignados };
            
            Object.keys(nuevasAsignaciones).forEach(key => {
                if (key.startsWith(`${diaSeleccionado}-`)) {
                    delete nuevasAsignaciones[key];
                }
            });
            
            setEspaciosAsignados(nuevasAsignaciones);
            setIsModificado(true);
            setSnackbar({
                open: true,
                message: `Todas las asignaciones del ${diaSeleccionado} han sido eliminadas`,
                severity: 'info'
            });
        }
    };
    // Cambiar día seleccionado
  
      // Cambiar día seleccionado
      const handleDiaChange = (event, newValue) => {
        if (isModificado && !window.confirm("Hay cambios sin guardar. ¿Descartar cambios y cambiar de día?")) {
           return;
        }
        setDiaSeleccionado(newValue);
        setIsModificado(false);
        setClienteSeleccionado(null);
   };

    // Guardar Asignaciones
    const guardarAsignaciones = async () => {
        setLoadingGuardado(true);
        setError(null);

        // Mostrar toast de carga
        const toastId = toast.loading('Guardando asignaciones...', {
            position: 'top-center'
        });

        try {
            const response = await fetch('/api/spining', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asignaciones: espaciosAsignados }),
            });

            if (!response.ok) {
                let errorMsg = `Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                } catch (jsonError) {
                    const textError = await response.text();
                    errorMsg = `Error del servidor (${response.status}). Revisa los logs.`;
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            setIsModificado(false);
            
            // Actualizar el toast de carga con éxito
            toast.success(result.message || 'Asignaciones guardadas correctamente', {
                id: toastId,
                position: 'top-center',
                duration: 4000
            });

        } catch (err) {
            console.error('Error guardando asignaciones:', err);
            
            // Actualizar el toast de carga con error
            toast.error(`Error al guardar: ${err.message}`, {
                id: toastId,
                position: 'top-center',
                duration: 5000
            });
        } finally {
            setLoadingGuardado(false);
        }
    };

    // Renderizado
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '80vh',
                flexDirection: 'column'
            }}>
                <CircularProgress 
                    size={60} 
                    thickness={4}
                    sx={{ 
                        color: 'warning.main',
                        animation: `${pulse} 1.5s infinite ease-in-out`
                    }} 
                />
                <Typography variant="h6" sx={{ mt: 3, fontFamily: '"Roboto Condensed", sans-serif' }}>
                    Cargando datos...
                </Typography>
            </Box>
        );
    }

    if (error && !Object.keys(espaciosAsignados).length && !clientesSpinning.length) {
         return (
             <Container maxWidth="lg" sx={{ mt: 4 }}>
                 <Alert 
                     severity="error" 
                     action={
                         <Button 
                             color="inherit" 
                             size="small" 
                             onClick={() => window.location.reload()}
                             sx={{
                                 borderRadius: '20px',
                                 px: 2,
                                 fontFamily: '"Roboto Condensed", sans-serif'
                             }}
                         >
                             Recargar
                         </Button>
                     }
                     sx={{
                         borderRadius: '12px',
                         boxShadow: 2
                     }}
                 >
                     {error}
                 </Alert>
             </Container>
         );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            {/* Encabezado */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <Typography 
                    variant="h3" 
                    component="h1" 
                    gutterBottom 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 2, 
                        fontWeight: 'bold',
                        fontFamily: '"Roboto Condensed", sans-serif',
                        letterSpacing: '0.5px',
                        color: 'text.primary',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <DirectionsBikeIcon 
                        fontSize="large" 
                        color="warning"
                        sx={{
                            animation: `${pulse} 2s infinite ease-in-out`
                        }}
                    /> 
                    Distribución de Espacios Spinning
                </Typography>
                <Typography 
                    variant="subtitle1" 
                    color="text.secondary" 
                    sx={{
                        fontFamily: '"Roboto Condensed", sans-serif',
                        letterSpacing: '0.3px'
                    }}
                >
                    Organiza las asignaciones de clientes a los espacios de spinning por día y horario.
                </Typography>
            </Box>

            {error && (Object.keys(espaciosAsignados).length > 0 || clientesSpinning.length > 0) && (
                 <Alert 
                     severity="error" 
                     sx={{ 
                         mb: 2, 
                         borderRadius: '12px',
                         boxShadow: 2
                     }} 
                     onClose={() => setError(null)}
                 >
                     {error}
                 </Alert>
            )}

            <Grid container spacing={3}>
                {/* Sección Lateral (Clientes) */}
                <Grid item xs={12} md={3}>
                    <Paper 
                        elevation={4} 
                        sx={{ 
                            p: 2, 
                            borderRadius: '16px', 
                            height: '100%', 
                            position: 'sticky', 
                            top: 20, 
                            display: 'flex', 
                            flexDirection: 'column',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2, 
                                pb: 1, 
                                borderBottom: '1px solid #eee',
                                fontFamily: '"Roboto Condensed", sans-serif',
                                fontWeight: 'bold'
                            }}
                        >
                            <PersonIcon color="warning" sx={{ mr: 1.5 }} /> 
                            Clientes Spinning
                        </Typography>
                        
                        {clienteSeleccionado && ( 
                            <Alert 
                                severity="success" 
                                sx={{ 
                                    mb: 2, 
                                    fontSize: '0.8rem',
                                    borderRadius: '12px',
                                    animation: `${fadeIn} 0.3s ease-out`
                                }} 
                                icon={<CheckCircleIcon fontSize='small'/>}
                            >
                                Seleccionado: <strong>{clienteSeleccionado.nombre}</strong>. Clic en espacio libre.
                            </Alert> 
                        )}
                        
                        <Box sx={{ 
                            flexGrow: 1, 
                            overflowY: 'auto', 
                            maxHeight: 'calc(100vh - 300px)',
                            pr: 1,
                            '&::-webkit-scrollbar': {
                                width: '6px'
                            },
                            '&::-webkit-scrollbar-track': {
                                background: '#f1f1f1',
                                borderRadius: '10px'
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: '#ff9800',
                                borderRadius: '10px',
                                '&:hover': {
                                    background: '#f57c00'
                                }
                            }
                        }}>
                            {clientesSpinning.length > 0 ? (
                                <List dense sx={{ pt: 0 }}> 
                                    {clientesSpinning.map(cliente => (
                                        <ClienteItem 
                                            key={cliente.id} 
                                            cliente={cliente} 
                                            seleccionado={clienteSeleccionado?.id === cliente.id} 
                                            onClick={seleccionarCliente}
                                        />
                                    ))} 
                                </List>
                            ) : (
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    py: 4,
                                    animation: `${fadeIn} 0.5s ease-out`
                                }}>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{
                                            fontFamily: '"Roboto Condensed", sans-serif'
                                        }}
                                    >
                                        No hay clientes de spinning registrados.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        
                        <Box sx={{ 
                            mt: 'auto', 
                            pt: 2,
                            animation: `${fadeIn} 0.3s ease-out`
                        }}>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="warning" 
                                startIcon={
                                    loadingGuardado ? (
                                        <CircularProgress 
                                            size={20} 
                                            color="inherit" 
                                            sx={{
                                                animation: `${pulse} 1.5s infinite ease-in-out`
                                            }}
                                        />
                                    ) : (
                                        <SaveIcon />
                                    )
                                } 
                                onClick={guardarAsignaciones} 
                                disabled={!isModificado || loadingGuardado}
                                sx={{
                                    borderRadius: '12px',
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    fontFamily: '"Roboto Condensed", sans-serif',
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    '&:hover': {
                                        boxShadow: '0 6px 8px rgba(0,0,0,0.15)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {loadingGuardado ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            
                            {isModificado && (
                                <Typography 
                                    variant="caption" 
                                    color="warning.main" 
                                    sx={{
                                        display: 'block', 
                                        textAlign: 'center', 
                                        mt: 1,
                                        fontFamily: '"Roboto Condensed", sans-serif',
                                        fontWeight: 'bold',
                                        animation: `${pulse} 2s infinite`
                                    }}
                                >
                                    ⚠️ Cambios sin guardar
                                </Typography>
                            )}
                            
                            <Button 
                                fullWidth 
                                variant="outlined" 
                                color="error" 
                                startIcon={<ClearIcon />}
                                onClick={limpiarAsignacionesDia}
                                sx={{ 
                                    mt: 2,
                                    borderRadius: '12px',
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    fontFamily: '"Roboto Condensed", sans-serif',
                                    letterSpacing: '0.5px',
                                    '&:hover': {
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                                disabled={!hayEspaciosEnDia()}
                            >
                                Limpiar día
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Distribución de Espacios (Tabs y Horarios) */}
                <Grid item xs={12} md={9}>
                    <Paper 
                        elevation={4} 
                        sx={{ 
                            borderRadius: '16px', 
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                        }}
                    >
                        {/* Tabs para los Días */}
                        <Box sx={{ 
                            bgcolor: 'grey.50', 
                            borderBottom: '1px solid #e0e0e0',
                            px: 1
                        }}>
                            <Tabs 
                                value={diaSeleccionado} 
                                onChange={handleDiaChange} 
                                variant="scrollable" 
                                scrollButtons="auto" 
                                allowScrollButtonsMobile 
                                textColor="warning" 
                                indicatorColor="warning"
                                sx={{
                                    '& .MuiTab-root': {
                                        minHeight: 48,
                                        fontFamily: '"Roboto Condensed", sans-serif',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.3px',
                                        textTransform: 'none',
                                        fontSize: '0.95rem',
                                        '&.Mui-selected': {
                                            color: 'warning.dark'
                                        }
                                    }
                                }}
                            >
                                {DIAS_SEMANA.map(dia => ( 
                                    <Tab 
                                        key={dia} 
                                        label={dia} 
                                        value={dia} 
                                        sx={{ 
                                            fontWeight: diaSeleccionado === dia ? 'bold' : 'normal', 
                                            px: {xs: 1.5, sm: 2.5},
                                            borderRadius: '8px 8px 0 0',
                                            mx: 0.5
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        {/* Contenido del Día Seleccionado */}
                        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                            {clienteSeleccionado && (
                                <Box
                                    sx={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        p: 2, 
                                        mb: 3,
                                        borderRadius: '12px', 
                                        bgcolor: alpha(clienteSeleccionado.color || '#f57c00', 0.1),
                                        border: `1px solid ${alpha(clienteSeleccionado.color || '#f57c00', 0.3)}`,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        animation: `${fadeIn} 0.3s ease-out`
                                    }}
                                >
                                    <Avatar sx={{ 
                                        bgcolor: clienteSeleccionado.color || '#f57c00', 
                                        mr: 2, 
                                        width: 40, 
                                        height: 40,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        animation: `${pulse} 1.5s infinite ease-in-out`
                                    }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box sx={{flexGrow: 1}}>
                                        <Typography 
                                            variant="body1" 
                                            fontWeight="bold"
                                            sx={{
                                                fontFamily: '"Roboto Condensed", sans-serif'
                                            }}
                                        >
                                            {clienteSeleccionado.nombre}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            color="text.secondary"
                                            sx={{
                                                fontFamily: '"Roboto Condensed", sans-serif'
                                            }}
                                        >
                                            Selecciona un espacio libre para asignar
                                        </Typography>
                                    </Box>
                                    <Button 
                                        sx={{ 
                                            ml: 'auto', 
                                            flexShrink: 0,
                                            borderRadius: '8px',
                                            px: 2,
                                            py: 0.8,
                                            fontFamily: '"Roboto Condensed", sans-serif',
                                            fontWeight: 'bold',
                                            '&:hover': {
                                                transform: 'translateY(-1px)'
                                            },
                                            transition: 'all 0.2s ease'
                                        }} 
                                        variant="outlined" 
                                        size="small" 
                                        onClick={() => setClienteSeleccionado(null)}
                                    >
                                        Cancelar
                                    </Button>
                                </Box>
                            )}

                            {/* Renderizar Secciones de Horario */}
                            {HORARIOS.map((horario, index) => (
                                <SeccionHorario
                                    key={horario}
                                    horario={horario}
                                    diaSeleccionado={diaSeleccionado}
                                    espaciosAsignados={espaciosAsignados}
                                    onEspacioClick={handleEspacioClick}
                                    onRemoveCliente={handleRemoveCliente}
                                />
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Aquí se renderizarán los toast de Sonner automáticamente */}
        </Container>
    );
};

export default Spinning;