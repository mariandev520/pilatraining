import React, { useState, useEffect } from 'react';
import { 
    Container, Typography, Paper, Box, Grid, Avatar,
    Chip, Card, CardContent, CircularProgress, Alert,
    Divider, IconButton, Button, List, ListItem, ListItemAvatar,
    ListItemText, Tab, Tabs, Snackbar, alpha, Tooltip, Zoom, Fade
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
    Bed as BedIcon,
    Info as InfoIcon,
    Clear as ClearIcon,
    Schedule as ScheduleIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { keyframes } from '@emotion/react';

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

// Paleta de colores mejorada
const COLORS = {
    primary: '#5D5FEF',
    secondary: '#6C63FF',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    background: '#F8FAFC',
    textPrimary: '#2D3748',
    textSecondary: '#718096',
    lightGray: '#EDF2F7'
};

// Componente CamaIndividual con mejoras visuales
const CamaIndividual = ({ numero, cliente, onClickCama, onRemoveCliente }) => {
    return (
        <Zoom in={true} style={{ transitionDelay: `${numero * 50}ms` }}>
            <Card
                elevation={cliente ? 3 : 1}
                sx={{
                    height: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'visible',
                    border: cliente ? `2px solid ${cliente.color || COLORS.primary}` : `2px dashed ${COLORS.lightGray}`,
                    bgcolor: cliente ? alpha(cliente.color || COLORS.primary, 0.08) : '#ffffff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        borderColor: cliente ? alpha(cliente.color || COLORS.primary, 0.8) : COLORS.secondary,
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute', 
                        top: -15, 
                        left: 15,
                        backgroundColor: cliente ? (cliente.color || COLORS.primary) : COLORS.textSecondary,
                        color: '#fff', 
                        width: 32, 
                        height: 32,
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
                    cursor: 'pointer'
                }} onClick={onClickCama}>
                    {cliente ? (
                        <Fade in={true}>
                            <Box sx={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center',
                                animation: `${fadeIn} 0.5s ease-out`
                            }}>
                                <Avatar
                                    sx={{
                                        width: 48, 
                                        height: 48,
                                        bgcolor: cliente.color || COLORS.primary, 
                                        mb: 1,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        fontSize: '1rem',
                                        '&:hover': {
                                            animation: `${pulse} 1s ease infinite`
                                        }
                                    }}
                                >
                                    {cliente.nombre?.split(' ').map(n=>n[0]).join('')}
                                </Avatar>
                                <Typography 
                                    variant="body2" 
                                    fontWeight="600" 
                                    align="center" 
                                    sx={{ 
                                        mb: 0, 
                                        width: '100%', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap',
                                        color: COLORS.textPrimary
                                    }}
                                >
                                    {cliente.nombre}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    color="textSecondary" 
                                    align="center" 
                                    sx={{ 
                                        display:'block', 
                                        width: '100%', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.7rem'
                                    }}
                                >
                                    DNI: {cliente.dni}
                                </Typography>
                                <Chip
                                    label={`Clases: ${cliente.clasesPendientes ?? 0}`}
                                    size="small"
                                    sx={{ 
                                        mt: 1, 
                                        bgcolor: alpha(cliente.color || COLORS.primary, 0.15), 
                                        height: 22, 
                                        fontSize: '0.7rem',
                                        color: cliente.color || COLORS.primary,
                                        fontWeight: '500'
                                    }}
                                />
                            </Box>
                        </Fade>
                    ) : (
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            color: COLORS.textSecondary
                        }}>
                            <BedIcon sx={{ 
                                fontSize: 40, 
                                color: COLORS.lightGray, 
                                mb: 1.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    color: COLORS.secondary,
                                    transform: 'scale(1.1)'
                                }
                            }} />
                            <Typography variant="body2" align="center" sx={{ fontWeight: '500' }}>
                                Cama Libre
                            </Typography>
                            <Typography variant="caption" align="center" sx={{ mt: 0.5 }}>
                                Clic para asignar
                            </Typography>
                        </Box>
                    )}
                </CardContent>

                {cliente && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1.5 }}>
                        <Tooltip title={`Quitar a ${cliente.nombre}`} arrow>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`¿Quitar a ${cliente.nombre} de la cama ${numero}?`)) {
                                        onRemoveCliente();
                                    }
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
        </Zoom>
    );
};

// Componente para cliente en la lista con mejoras
const ClienteItem = ({ cliente, seleccionado, onClick }) => {
    return (
        <Zoom in={true}>
            <ListItem
                button
                onClick={() => onClick(cliente)}
                selected={seleccionado}
                sx={{
                    mb: 1, 
                    borderRadius: '8px',
                    border: `1px solid ${seleccionado ? cliente.color || COLORS.primary : 'transparent'}`,
                    bgcolor: seleccionado ? alpha(cliente.color || COLORS.primary, 0.08) : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                        bgcolor: alpha(cliente.color || COLORS.primary, 0.15),
                        transform: 'translateX(2px)'
                    }
                }}
            >
                <ListItemAvatar>
                    <Avatar 
                        sx={{ 
                            bgcolor: cliente.color || COLORS.primary, 
                            width: 38, 
                            height: 38,
                            boxShadow: seleccionado ? `0 0 0 2px ${alpha(cliente.color || COLORS.primary, 0.3)}` : 'none'
                        }}
                    >
                        <PersonIcon fontSize='small' />
                    </Avatar>
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Typography 
                            noWrap 
                            variant="body2" 
                            fontWeight={seleccionado ? '600' : '500'}
                            sx={{ color: COLORS.textPrimary }}
                        >
                            {cliente.nombre}
                        </Typography>
                    }
                    secondary={`Clases: ${cliente.clasesPendientes ?? 0}`}
                    secondaryTypographyProps={{ 
                        variant: 'caption',
                        sx: { 
                            color: seleccionado ? cliente.color || COLORS.primary : COLORS.textSecondary,
                            fontWeight: seleccionado ? '500' : 'normal'
                        }
                    }}
                />
                {seleccionado && (
                    <ArrowRightAltIcon 
                        sx={{ 
                            color: cliente.color || COLORS.primary,
                            animation: `${pulse} 1.5s ease infinite`
                        }} 
                    />
                )}
            </ListItem>
        </Zoom>
    );
};

// Sección de horario mejorada
const SeccionHorario = ({ horario, diaSeleccionado, camasAsignadas, onCamaClick, onRemoveCliente }) => {
    return (
        <Box sx={{ mb: 3, animation: `${fadeIn} 0.4s ease-out` }}>
            <Box
                sx={{
                    bgcolor: COLORS.primary,
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                    color: '#fff',
                    px: 2, 
                    py: 1,
                    borderRadius: '8px 8px 0 0',
                    display: 'flex', 
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                <ScheduleIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" fontWeight="600">{horario}</Typography>
            </Box>

            <Grid 
                container 
                spacing={2} 
                sx={{ 
                    mt: 0, 
                    p: 2, 
                    bgcolor: '#fff', 
                    borderRadius: '0 0 8px 8px', 
                    border: '1px solid', 
                    borderColor: COLORS.lightGray, 
                    borderTop: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
            >
                {[1, 2, 3, 4].map(numCama => {
                    const camaClave = `${diaSeleccionado}-${horario}-Cama ${numCama}`;
                    return (
                        <Grid item xs={6} sm={6} md={3} key={numCama}>
                            <CamaIndividual
                                numero={numCama}
                                cliente={camasAsignadas[camaClave]}
                                onClickCama={() => onCamaClick(camaClave)}
                                onRemoveCliente={() => onRemoveCliente(camaClave)}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

// Componente principal de CamasPilates con diseño mejorado
const CamasPilates = () => {
    const [clientes, setClientes] = useState([]);
    const [clientesPilates, setClientesPilates] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [camasAsignadas, setCamasAsignadas] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingGuardado, setLoadingGuardado] = useState(false);
    const [error, setError] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
    const [isModificado, setIsModificado] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });



    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(prev => prev?.id === cliente.id ? null : cliente);
    };
    

    // Función para generar colores consistentes
    const getRandomColor = (index) => {
        const colors = [
            '#5D5FEF', '#6C63FF', '#4F46E5', '#7C3AED', '#9333EA',
            '#C026D3', '#DB2777', '#E11D48', '#F43F5E', '#F97316',
            '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
            '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB'
        ];
        return colors[index % colors.length];
    };

    // Carga Inicial (sin cambios en la lógica)
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar Clientes
                const respClientes = await fetch('/api/clientes');
                if (!respClientes.ok) throw new Error('Error al cargar clientes');
                const dataClientes = await respClientes.json();
                const clientesConPilates = dataClientes.filter(c => c.actividades?.some(act => act.nombre.toLowerCase().includes('pilates')));
                const clientesFormateados = clientesConPilates.map((cliente, index) => ({
                    id: cliente._id || `cliente-${index}`, dni: cliente.dni, nombre: cliente.nombre,
                    actividades: cliente.actividades, color: getRandomColor(index),
                    clasesPendientes: cliente.clasesPendientesTotales ?? 0
                }));
                setClientes(dataClientes);
                setClientesPilates(clientesFormateados);

                // Cargar Asignaciones
                await cargarAsignaciones();

            } catch (err) {
                console.error('Error cargando datos iniciales:', err);
                setError(`Error al cargar datos: ${err.message}. Intente recargar.`);
                setCamasAsignadas({});
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const cargarAsignaciones = async () => {
        try {
            const apiUrl = '/api/camas-Pilates';
            const respAsignaciones = await fetch(apiUrl);

            if (!respAsignaciones.ok) {
                const errorData = await respAsignaciones.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${respAsignaciones.status} al cargar asignaciones`);
            }

            const dataAsignaciones = await respAsignaciones.json();
            setCamasAsignadas(dataAsignaciones || {});
            setIsModificado(false);
            console.log("Asignaciones cargadas desde API.");

        } catch (err) {
            console.error('Error cargando asignaciones desde API:', err);
            setError(`Error al cargar asignaciones: ${err.message}`);
            setSnackbar({ open: true, message: `Error al cargar asignaciones: ${err.message}`, severity: 'error' });
            setCamasAsignadas({});
            setIsModificado(false);
        }
    };
    // Guardar Asignaciones
const guardarAsignaciones = async () => {
    console.log("Intentando guardar asignaciones...");
    setLoadingGuardado(true);
    setError(null);
    setSnackbar({ open: false, message: '', severity: 'info'});

    try {
        console.log("Guardando Asignaciones - Payload:", JSON.stringify({ asignaciones: camasAsignadas }, null, 2));
        const response = await fetch('/api/camas-Pilates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ asignaciones: camasAsignadas }),
        });

        console.log("[guardarAsignaciones] Respuesta API recibida:", response.status, response.statusText);

        if (!response.ok) {
            let errorMsg = `Error ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorData.error || errorMsg;
                console.error("Error API (JSON):", errorData);
            } catch (jsonError) {
                const textError = await response.text();
                console.error("Error API (No JSON - Texto):", textError);
                errorMsg = `Error del servidor (${response.status}). Revisa los logs.`;
            }
            throw new Error(errorMsg);
        }

        const result = await response.json();
        console.log("[guardarAsignaciones] Respuesta Éxito:", result);
        setIsModificado(false);
        setSnackbar({ open: true, message: result.message || 'Asignaciones guardadas correctamente en el servidor', severity: 'success' });

    } catch (err) {
        console.error('Error guardando asignaciones catch:', err);
        setSnackbar({ open: true, message: `Error al guardar en servidor: ${err.message}`, severity: 'error' });
    } finally {
        setLoadingGuardado(false);
    }
};
// Limpiar todas las asignaciones del día
const limpiarAsignacionesDia = () => {
    if (window.confirm(`¿Borrar todas las asignaciones del ${diaSeleccionado}?`)) {
        const nuevasAsignaciones = { ...camasAsignadas };
        
        Object.keys(nuevasAsignaciones).forEach(key => {
            if (key.startsWith(`${diaSeleccionado}-`)) {
                delete nuevasAsignaciones[key];
            }
        });
        
        setCamasAsignadas(nuevasAsignaciones);
        setIsModificado(true);
        setSnackbar({
            open: true,
            message: `Todas las asignaciones del ${diaSeleccionado} han sido eliminadas`,
            severity: 'info'
        });
    }
};// Limpiar todas las asignaciones del día


// Cambiar día seleccionado
const handleDiaChange = (event, newValue) => {
     if (isModificado && !window.confirm("Hay cambios sin guardar. ¿Descartar cambios y cambiar de día?")) {
        return;
     }
     setDiaSeleccionado(newValue);
     setIsModificado(false);
     setClienteSeleccionado(null);
};
 // Manejar clic en cama
 const handleCamaClick = (camaClave) => {
    if (clienteSeleccionado) {
        const [dia, horario] = camaClave.split('-');
        const estaEnEsteHorario = Object.entries(camasAsignadas).some(
            ([key, cli]) => key.startsWith(`${dia}-${horario}-`) && cli.id === clienteSeleccionado.id
        );

        if (estaEnEsteHorario) {
            setSnackbar({ open: true, message: `${clienteSeleccionado.nombre} ya tiene cama a las ${horario}`, severity: 'warning' });
            return;
        }
        
        // Verificar si el cliente ya está asignado en otro horario el mismo día
        const estaAsignadoEnDia = Object.entries(camasAsignadas).some(
            ([key, cliente]) => 
                key.split('-')[0] === diaSeleccionado && 
                cliente.id === clienteSeleccionado.id
        );
        
        if (estaAsignadoEnDia) {
            setSnackbar({
                open: true,
                message: 'Este cliente ya tiene una cama asignada en este día',
                severity: 'warning'
            });
            return;
        }

        if (clienteSeleccionado.clasesPendientes <= 0) {
             if (!window.confirm(`${clienteSeleccionado.nombre} no tiene clases pendientes. ¿Asignar igual?`)) return;
        }

        console.log(`Asignando cliente ${clienteSeleccionado.id} a cama ${camaClave}`);
        setCamasAsignadas(prev => ({ ...prev, [camaClave]: clienteSeleccionado }));
        setClienteSeleccionado(null);
        setIsModificado(true);
    } else {
         const clienteEnCama = camasAsignadas[camaClave];
         if(clienteEnCama) setSnackbar({ open: true, message: `Cama ocupada por: ${clienteEnCama.nombre}`, severity: 'info' });
         console.log("Clic en cama sin cliente seleccionado:", camaClave);
    }
};
const handleRemoveCliente = (camaClave) => {
    setCamasAsignadas(prev => {
        const nuevasAsignaciones = { ...prev };
        delete nuevasAsignaciones[camaClave];
        return nuevasAsignaciones;
    });
    setIsModificado(true);
    setSnackbar({
        open: true,
        message: `Cliente eliminado de la cama`,
        severity: 'success'
    });
};

const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
};

// Renderizado
if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60} /><Typography sx={{ml:2}}>Cargando datos...</Typography></Box>;
}

if (error && !Object.keys(camasAsignadas).length && !clientesPilates.length) {
     return <Container maxWidth="lg" sx={{ mt: 4 }}><Alert severity="error" action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Recargar</Button>}>{error}</Alert></Container>;
}



    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '80vh',
                flexDirection: 'column',
                animation: `${fadeIn} 0.5s ease-out`
            }}>
                <CircularProgress 
                    size={60} 
                    thickness={4}
                    sx={{ 
                        color: COLORS.primary,
                        mb: 2
                    }} 
                />
                <Typography 
                    variant="h6" 
                    sx={{
                        color: COLORS.textPrimary,
                        fontWeight: '500',
                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    Cargando datos...
                </Typography>
            </Box>
        );
    }

    if (error && !Object.keys(camasAsignadas).length && !clientesPilates.length) {
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
                                bgcolor: 'rgba(255,255,255,0.2)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)'
                                }
                            }}
                        >
                            Recargar
                        </Button>
                    }
                    sx={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderLeft: `4px solid ${COLORS.error}`
                    }}
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            {/* Encabezado mejorado */}
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
                        fontWeight: '700',
                        color: COLORS.textPrimary,
                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: `${fadeIn} 0.6s ease-out`
                    }}
                >
                    <FitnessCenterIcon fontSize="large" />
                    Gestión de Camas de Pilates
                </Typography>
                <Typography 
                    variant="subtitle1" 
                    color="textSecondary" 
                    sx={{
                        maxWidth: '700px',
                        margin: '0 auto',
                        color: COLORS.textSecondary,
                        fontSize: '1.1rem'
                    }}
                >
                    Organiza las asignaciones diarias de clientes a las camas por horario
                </Typography>
            </Box>

            {error && (Object.keys(camasAsignadas).length > 0 || clientesPilates.length > 0) && (
                <Alert 
                    severity="error" 
                    sx={{ 
                        mb: 3, 
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderLeft: `4px solid ${COLORS.error}`
                    }} 
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Sección Lateral (Clientes) mejorada */}
                <Grid item xs={12} md={3}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 2, 
                            borderRadius: '12px', 
                            height: '100%', 
                            position: 'sticky', 
                            top: 20, 
                            display: 'flex', 
                            flexDirection: 'column',
                            bgcolor: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            border: `1px solid ${COLORS.lightGray}`
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2, 
                                pb: 1.5, 
                                borderBottom: `1px solid ${COLORS.lightGray}`,
                                color: COLORS.textPrimary,
                                fontWeight: '600'
                            }}
                        >
                            <PersonIcon sx={{ color: COLORS.primary, mr: 1.5 }} /> 
                            Clientes Pilates
                            <Chip 
                                label={clientesPilates.length} 
                                size="small" 
                                sx={{ 
                                    ml: 'auto', 
                                    bgcolor: alpha(COLORS.primary, 0.1),
                                    color: COLORS.primary,
                                    fontWeight: '600'
                                }} 
                            />
                        </Typography>
                        
                        {clienteSeleccionado && ( 
                            <Alert 
                                severity="success" 
                                sx={{ 
                                    mb: 2, 
                                    fontSize: '0.8rem',
                                    borderRadius: '8px',
                                    bgcolor: alpha(COLORS.success, 0.1),
                                    color: COLORS.textPrimary,
                                    border: `1px solid ${alpha(COLORS.success, 0.3)}`,
                                    '& .MuiAlert-icon': {
                                        color: COLORS.success
                                    }
                                }} 
                                icon={<CheckCircleIcon fontSize='small'/>}
                            >
                                <Box>
                                    <strong>Seleccionado:</strong> {clienteSeleccionado.nombre}
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        Haz clic en una cama libre para asignar
                                    </Typography>
                                </Box>
                            </Alert> 
                        )}
                        
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                            {clientesPilates.length > 0 ? (
                                <List dense sx={{ pt: 0 }}> 
                                    {clientesPilates.map((cliente, index) => (
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
                                    <PersonIcon sx={{ fontSize: 40, color: COLORS.lightGray, mb: 1 }} />
                                    <Typography variant="body2" color="textSecondary">
                                        No hay clientes de pilates registrados
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        
                        <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="primary" 
                                startIcon={
                                    loadingGuardado ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <SaveIcon />
                                    )
                                } 
                                onClick={guardarAsignaciones} 
                                disabled={!isModificado || loadingGuardado}
                                sx={{
                                    bgcolor: COLORS.primary,
                                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                                    height: '42px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 2px 8px rgba(93, 95, 239, 0.3)',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(93, 95, 239, 0.4)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease',
                                    '&:disabled': {
                                        background: COLORS.lightGray,
                                        color: COLORS.textSecondary
                                    }
                                }}
                            >
                                {loadingGuardado ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            
                            {isModificado && (
                                <Typography 
                                    variant="caption" 
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mt: 1,
                                        color: COLORS.warning,
                                        fontWeight: '500'
                                    }}
                                >
                                    <InfoIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                                    Cambios sin guardar
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
                                    height: '42px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px',
                                    borderColor: COLORS.error,
                                    color: COLORS.error,
                                    '&:hover': {
                                        bgcolor: alpha(COLORS.error, 0.08),
                                        borderColor: COLORS.error,
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                                disabled={!Object.keys(camasAsignadas).some(key => key.startsWith(`${diaSeleccionado}-`))}
                            >
                                Limpiar día
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Distribución de Camas (Tabs y Horarios) mejorada */}
                <Grid item xs={12} md={9}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            borderRadius: '12px', 
                            overflow: 'hidden',
                            bgcolor: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            border: `1px solid ${COLORS.lightGray}`
                        }}
                    >
                        {/* Tabs para los Días mejorados */}
                        <Box sx={{ bgcolor: '#fff', borderBottom: `1px solid ${COLORS.lightGray}` }}>
                            <Tabs 
                                value={diaSeleccionado} 
                                onChange={handleDiaChange} 
                                variant="scrollable" 
                                scrollButtons="auto" 
                                allowScrollButtonsMobile 
                                textColor="primary" 
                                indicatorColor="primary"
                                sx={{
                                    '& .MuiTabs-indicator': {
                                        height: '4px',
                                        borderRadius: '4px 4px 0 0'
                                    }
                                }}
                            >
                                {DIAS_SEMANA.map(dia => ( 
                                    <Tab 
                                        key={dia} 
                                        label={
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                textTransform: 'none',
                                                fontSize: '0.9rem'
                                            }}>
                                                <EventIcon sx={{ 
                                                    fontSize: '1rem', 
                                                    mr: 1,
                                                    color: diaSeleccionado === dia ? COLORS.primary : COLORS.textSecondary
                                                }} />
                                                {dia}
                                            </Box>
                                        } 
                                        value={dia} 
                                        sx={{ 
                                            fontWeight: diaSeleccionado === dia ? '600' : '500', 
                                            px: {xs: 1.5, sm: 2},
                                            py: 1.5,
                                            minHeight: 'auto',
                                            color: diaSeleccionado === dia ? COLORS.primary : COLORS.textSecondary,
                                            '&:hover': {
                                                color: COLORS.primary,
                                                bgcolor: alpha(COLORS.primary, 0.05)
                                            }
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        {/* Contenido del Día Seleccionado */}
                        <Box sx={{ p: { xs: 2, sm: 3 } }}>
                            {clienteSeleccionado && (
                                <Box
                                    sx={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        p: 2, 
                                        mb: 3,
                                        borderRadius: '8px', 
                                        bgcolor: alpha(clienteSeleccionado.color || COLORS.primary, 0.08),
                                        border: `1px solid ${alpha(clienteSeleccionado.color || COLORS.primary, 0.2)}`,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        animation: `${fadeIn} 0.4s ease-out`
                                    }}
                                >
                                    <Avatar sx={{ 
                                        bgcolor: clienteSeleccionado.color || COLORS.primary, 
                                        mr: 2, 
                                        width: 40, 
                                        height: 40,
                                        boxShadow: `0 0 0 2px ${alpha(clienteSeleccionado.color || COLORS.primary, 0.3)}`
                                    }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box sx={{flexGrow: 1}}>
                                        <Typography variant="body2" fontWeight="600" sx={{ color: COLORS.textPrimary }}>
                                            {clienteSeleccionado.nombre}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            Selecciona una cama libre para asignar
                                        </Typography>
                                    </Box>
                                    <Button 
                                        sx={{ 
                                            ml: 'auto', 
                                            flexShrink: 0,
                                            textTransform: 'none',
                                            fontWeight: '500',
                                            color: COLORS.textSecondary,
                                            '&:hover': {
                                                color: COLORS.primary
                                            }
                                        }} 
                                        variant="text" 
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
                                    camasAsignadas={camasAsignadas}
                                    onCamaClick={handleCamaClick}
                                    onRemoveCliente={handleRemoveCliente}
                                />
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Snackbar para notificaciones mejorado */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={snackbar.severity === 'error' ? null : 4000} 
                onClose={handleCloseSnackbar} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={Fade}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled" 
                    sx={{ 
                        width: '100%', 
                        boxShadow: 6,
                        borderRadius: '8px',
                        alignItems: 'center',
                        '& .MuiAlert-message': {
                            flexGrow: 1
                        }
                    }} 
                    iconMapping={{ 
                        success: <CheckCircleIcon fontSize="inherit" />, 
                        error: <ErrorOutlineIcon fontSize="inherit" />, 
                        warning: <ErrorOutlineIcon fontSize="inherit" />, 
                        info: <InfoIcon fontSize="inherit" /> 
                    }}
                >
                    <Typography variant="body2" fontWeight="500">
                        {snackbar.message}
                    </Typography>
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CamasPilates;