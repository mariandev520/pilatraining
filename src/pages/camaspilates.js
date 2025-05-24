import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Typography, Paper, Box, Grid, Avatar,
    Chip, Card, CardContent, CircularProgress, Alert,
    Divider, IconButton, Button, List, ListItem, ListItemAvatar,
    ListItemText, Tab, Tabs, Snackbar, alpha, Tooltip, Zoom, Fade, Slide, ButtonBase
} from '@mui/material';
import {
    Person as PersonIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    FitnessCenter as FitnessCenterIcon,
    CheckCircle as CheckCircleIcon,
    ArrowRightAlt as ArrowRightAltIcon,
    // Today as TodayIcon, // Not used
    ErrorOutline as ErrorOutlineIcon,
    Bed as BedIcon,
    Info as InfoIcon,
    Clear as ClearIcon,
    Schedule as ScheduleIcon,
    Event as EventIcon
} from '@mui/icons-material';
import { keyframes, useTheme } from '@emotion/react'; // Added useTheme for breakpoints

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

// Paleta de colores mejorada (using your COLORS object)
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

// Componente CamaIndividual con mejoras visuales y responsiveness
const CamaIndividual = ({ numero, cliente, onClickCama, onRemoveCliente }) => {
    return (
        <Zoom in={true} style={{ transitionDelay: `${numero * 50}ms` }}>
            <Card
                elevation={cliente ? 3 : 1}
                sx={{
                    height: '160px', // Maintained height
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'visible', // Kept for the number badge
                    border: cliente ? `2px solid ${cliente.color || COLORS.primary}` : `2px dashed ${COLORS.lightGray}`,
                    bgcolor: cliente ? alpha(cliente.color || COLORS.primary, 0.08) : '#ffffff',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-2px)',
                        borderColor: cliente ? alpha(cliente.color || COLORS.primary, 0.8) : COLORS.secondary,
                    },
                    // Responsive adjustments for inner content might be needed if text overflows badly
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

                {/* Added ButtonBase for ripple effect on the main clickable area */}
                <ButtonBase
                    component="div" // Use div to avoid button-in-button issues if Card is ever a button
                    onClick={onClickCama}
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: { xs: '28px 8px 8px', sm: '28px 10px 8px' }, // Slightly less horizontal padding on xs
                        width: '100%',
                        borderRadius: 'inherit', // Inherit border radius from Card
                    }}
                >
                    {cliente ? (
                        <Fade in={true}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                animation: `${fadeIn} 0.5s ease-out`,
                                textAlign: 'center', // Ensure text is centered
                                width: '100%' // Ensure box takes full width for text centering
                            }}>
                                <Avatar
                                    sx={{
                                        width: { xs: 40, sm: 48 }, // Responsive avatar
                                        height: { xs: 40, sm: 48 },
                                        bgcolor: cliente.color || COLORS.primary,
                                        mb: 1,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        fontSize: { xs: '0.9rem', sm: '1rem' }, // Responsive font size for initials
                                        '&:hover': { // Pulse animation on hover (less relevant for tap)
                                            animation: `${pulse} 1s ease infinite`
                                        }
                                    }}
                                >
                                    {cliente.nombre?.split(' ').map(n => n[0]).join('')}
                                </Avatar>
                                <Typography
                                    variant="body2"
                                    fontWeight="600"
                                    align="center"
                                    noWrap // Prevents wrapping, shows ellipsis
                                    sx={{
                                        mb: 0,
                                        width: '100%',
                                        color: COLORS.textPrimary,
                                        fontSize: { xs: '0.8rem', sm: '0.875rem' } // Responsive font size
                                    }}
                                >
                                    {cliente.nombre}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="textSecondary"
                                    align="center"
                                    noWrap
                                    sx={{
                                        display: 'block',
                                        width: '100%',
                                        fontSize: { xs: '0.65rem', sm: '0.7rem' } // Responsive font size
                                    }}
                                >
                                    DNI: {cliente.dni}
                                </Typography>
                                <Chip
                                    label={`Clases: ${cliente.clasesPendientes ?? 0}`}
                                    size="small"
                                    sx={{
                                        mt: 0.5, // Reduced margin top
                                        bgcolor: alpha(cliente.color || COLORS.primary, 0.15),
                                        height: 20, // Slightly smaller chip
                                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
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
                            color: COLORS.textSecondary,
                            textAlign: 'center'
                        }}>
                            <BedIcon sx={{
                                fontSize: { xs: 32, sm: 40 }, // Responsive icon size
                                color: COLORS.lightGray,
                                mb: 1,
                                transition: 'all 0.3s ease',
                                '&:hover': { // Maintained hover, subtle for tap
                                    color: COLORS.secondary,
                                    transform: 'scale(1.1)'
                                }
                            }} />
                            <Typography variant="body2" align="center" sx={{ fontWeight: '500', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                                Cama Libre
                            </Typography>
                            <Typography variant="caption" align="center" sx={{ mt: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                Clic para asignar
                            </Typography>
                        </Box>
                    )}
                </ButtonBase>

                {cliente && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1, pt: 0 }}> {/* Adjusted padding */}
                        <Tooltip title={`Quitar a ${cliente.nombre}`} arrow>
                            <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent Card's onClick
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

// Componente para cliente en la lista con slide-in animation
const ClienteItem = ({ cliente, seleccionado, onClick, index }) => {
    return (
        <Slide direction="right" in={true} style={{ transitionDelay: `${index * 30}ms` }} mountOnEnter unmountOnExit>
            <ListItem
                button // ListItem with button prop already has ripple
                onClick={() => onClick(cliente)}
                selected={seleccionado}
                sx={{
                    mb: 1,
                    borderRadius: '8px',
                    border: `1px solid ${seleccionado ? client.color || COLORS.primary : 'transparent'}`,
                    bgcolor: seleccionado ? alpha(cliente.color || COLORS.primary, 0.08) : 'transparent',
                    transition: 'all 0.2s ease, transform 0.1s ease-out', // Added transform for tap feedback
                    '&:hover': { // Hover for desktop
                        bgcolor: alpha(cliente.color || COLORS.primary, 0.15),
                        transform: 'translateX(2px)'
                    },
                    '&:active': { // Basic tap feedback for mobile
                        transform: 'scale(0.98) translateX(1px)',
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
        </Slide>
    );
};


// Sección de horario
const SeccionHorario = ({ horario, diaSeleccionado, camasAsignadas, onCamaClick, onRemoveCliente }) => {
    // No direct animation here, parent will handle fade for the whole day's schedule block
    return (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}> {/* Responsive margin bottom */}
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
                spacing={{ xs: 1.5, sm: 2 }} // Responsive spacing
                sx={{
                    mt: 0,
                    p: { xs: 1.5, sm: 2 }, // Responsive padding
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
                        // Adjusted grid for better mobile layout: 1 card per row on xs if too cramped, 2 on sm
                        <Grid item xs={6} sm={3} key={numCama}> {/* Changed from md={3} sm={6} xs={6} -> sm={3} xs={6} to ensure 4 beds can fit reasonably on sm and 2 on xs */}
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


const CamasPilates = () => {
    const [clientes, setClientes] = useState([]); // Full client list from API
    const [clientesPilates, setClientesPilates] = useState([]); // Filtered and formatted for display
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [camasAsignadas, setCamasAsignadas] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingGuardado, setLoadingGuardado] = useState(false);
    const [error, setError] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
    const [isModificado, setIsModificado] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const theme = useTheme(); // For accessing theme breakpoints if needed, though sx prop handles most

    // Memoize clientesPilates to prevent re-computation if `clientes` array reference changes but content is same
    // And to assign colors consistently
    const preprocessedClientesPilates = useMemo(() => {
        const filtered = clientes.filter(c => c.actividades?.some(act => act.nombre.toLowerCase().includes('pilates')));
        return filtered.map((cliente, index) => ({
            id: cliente._id || `cliente-${index}`, // Ensure ID for key
            dni: cliente.dni,
            nombre: cliente.nombre,
            actividades: cliente.actividades,
            color: getRandomColor(index),
            // Assuming clasesPendientesTotales is a field you calculate/get from backend
            clasesPendientes: cliente.clasesPendientesTotales ?? cliente.actividades?.find(act => act.nombre.toLowerCase().includes('pilates'))?.clasesPendientes ?? 0
        }));
    }, [clientes]);

    useEffect(() => {
        setClientesPilates(preprocessedClientesPilates);
    }, [preprocessedClientesPilates]);


    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(prev => prev?.id === cliente.id ? null : cliente);
    };

    const getRandomColor = (index) => {
        const colors = [
            '#5D5FEF', '#6C63FF', '#4F46E5', '#7C3AED', '#9333EA',
            '#C026D3', '#DB2777', '#E11D48', '#F43F5E', '#F97316',
            '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
            '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB'
        ];
        return colors[index % colors.length];
    };

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);

                const respClientes = await fetch('/api/clientes');
                if (!respClientes.ok) throw new Error('Error al cargar clientes');
                const dataClientes = await respClientes.json();
                setClientes(dataClientes); // Set full list, memoized effect will filter pilates ones

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
            // console.log("Asignaciones cargadas desde API.");

        } catch (err) {
            console.error('Error cargando asignaciones desde API:', err);
            setError(`Error al cargar asignaciones: ${err.message}`);
            setSnackbar({ open: true, message: `Error al cargar asignaciones: ${err.message}`, severity: 'error' });
            setCamasAsignadas({});
            setIsModificado(false);
        }
    };
   const guardarAsignaciones = async () => {
        setLoadingGuardado(true);
        try {
            const response = await fetch('/api/camas-Pilates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asignaciones: camasAsignadas }),
            });

            if (!response.ok) throw new Error('Error al guardar');
            
            setIsModificado(false);
            setSnackbar({
                open: true,
                message: 'Asignaciones guardadas correctamente',
                severity: 'success'
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: `Error al guardar: ${err.message}`,
                severity: 'error'
            });
        } finally {
            setLoadingGuardado(false);
        }
    };

    // Función para limpiar asignaciones del día
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
        }
    };

    const handleDiaChange = (event, newValue) => {
        if (isModificado && !window.confirm("Hay cambios sin guardar. ¿Descartar cambios y cambiar de día?")) {
            return;
        }
        setDiaSeleccionado(newValue);
        setIsModificado(false); // Reset modification status as we are changing view or loading new state
        setClienteSeleccionado(null); // Deselect client when changing day
    };

    const handleCamaClick = (camaClave) => {
        if (camasAsignadas[camaClave] && !clienteSeleccionado) {
            // If cama is occupied and no client is selected, select the client in the bed
            // This is an alternative UX: tapping an occupied bed could also show info or allow quick removal.
            // For now, let's keep the "info" snackbar.
            const clienteEnCama = camasAsignadas[camaClave];
             setSnackbar({ open: true, message: `Cama ocupada por: ${clienteEnCama.nombre}. DNI: ${clienteEnCama.dni}`, severity: 'info' });
            // Optionally, select this client:
            // setClienteSeleccionado(clienteEnCama);
            return;
        }


        if (clienteSeleccionado) {
            // If a client is selected, try to assign them
            const [dia, horario] = camaClave.split('-'); // dia here is from camaClave, ensure it matches diaSeleccionado

            // Check if already assigned in THIS specific timeslot on THIS day
            const clienteYaEnEsteHorarioEsteDia = Object.values(camasAsignadas).find(
                cli => cli.id === clienteSeleccionado.id && camasAsignadas[camaClave]?.id !== clienteSeleccionado.id // Exclude self if re-clicking same bed by mistake
            );
            // More precise check for the exact day and slot
             const estaEnEsteHorario = Object.entries(camasAsignadas).some(
                 ([key, cli]) => key.startsWith(`${diaSeleccionado}-${horario}-`) && cli.id === clienteSeleccionado.id
             );


            if (estaEnEsteHorario && camasAsignadas[camaClave]?.id !== clienteSeleccionado.id) { // If target bed is not already theirs
                setSnackbar({ open: true, message: `${clienteSeleccionado.nombre} ya tiene una cama asignada a las ${horario} este día.`, severity: 'warning' });
                return;
            }
            
            // Check if client is assigned anywhere else on THIS selected day but a DIFFERENT timeslot
            const asignacionesDelClienteEnDiaSeleccionado = Object.entries(camasAsignadas).filter(
                ([key, cli]) => key.startsWith(`${diaSeleccionado}-`) && cli.id === clienteSeleccionado.id
            );

            const estaAsignadoEnOtroHorarioHoy = asignacionesDelClienteEnDiaSeleccionado.some(
                ([key]) => !key.startsWith(`${diaSeleccionado}-${horario}-`) // Key does not belong to current slot
            );
            
            if (estaAsignadoEnOtroHorarioHoy) {
                 setSnackbar({
                     open: true,
                     message: `${clienteSeleccionado.nombre} ya está asignado a otra hora el ${diaSeleccionado}. Un cliente por día.`,
                     severity: 'warning'
                 });
                 return;
             }


            if (clienteSeleccionado.clasesPendientes <= 0) {
                if (!window.confirm(`${clienteSeleccionado.nombre} no tiene clases pendientes. ¿Asignar de todas formas?`)) return;
            }

            setCamasAsignadas(prev => ({ ...prev, [camaClave]: clienteSeleccionado }));
            setClienteSeleccionado(null); // Deselect after assignment
            setIsModificado(true);
        } else if (!camasAsignadas[camaClave]) {
            // If no client selected and bed is free
             setSnackbar({ open: true, message: `Cama libre. Selecciona un cliente de la lista para asignar.`, severity: 'info' });
        }
        // If bed is occupied and no client selected, the initial check handles it.
    };


   
    // Handler para eliminar cliente de cama
    const handleRemoveCliente = (camaClave) => {
        setCamasAsignadas(prev => {
            const nuevas = { ...prev };
            delete nuevas[camaClave];
            return nuevas;
        });
        setIsModificado(true);
    };


    // Handler para cerrar snackbar
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box sx={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh',
                flexDirection: 'column', animation: `${fadeIn} 0.5s ease-out`
            }}>
                <CircularProgress size={60} thickness={4} sx={{ color: COLORS.primary, mb: 2 }} />
                <Typography variant="h6" sx={{
                    color: COLORS.textPrimary, fontWeight: '500',
                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                }}>
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
                        <Button color="inherit" size="small" onClick={() => window.location.reload()}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}>Recargar</Button>
                    }
                    sx={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: `4px solid ${COLORS.error}` }}
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: { xs: 2, sm: 4 }, mb: 8, px: { xs: 1, sm: 2, md: 3 } }}>
            <Box sx={{ mb: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography
                    variant="h3" // Base variant
                    component="h1"
                    gutterBottom
                    sx={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, sm: 2 },
                        fontWeight: '700', color: COLORS.textPrimary,
                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        animation: `${fadeIn} 0.6s ease-out`,
                        fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' } // Responsive font size
                    }}
                >
                    <FitnessCenterIcon sx={{ fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.3rem' } }} />
                    Gestión de Camas
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{
                    maxWidth: '700px', margin: '0 auto', color: COLORS.textSecondary,
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } // Responsive font size
                }}>
                    Organiza las asignaciones diarias de clientes a las camas por horario.
                </Typography>
            </Box>

            {error && (Object.keys(camasAsignadas).length > 0 || clientesPilates.length > 0) && (
                <Alert severity="error" sx={{
                    mb: 3, borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${COLORS.error}`
                }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} md={3}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2, borderRadius: '12px', height: '100%',
                            position: { xs: 'static', md: 'sticky' }, // Static on mobile, sticky on larger
                            top: 20, display: 'flex', flexDirection: 'column', bgcolor: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: `1px solid ${COLORS.lightGray}`,
                            maxHeight: { xs: '60vh', sm: '70vh', md: 'calc(100vh - 120px)' }, // Adjusted max height for mobile
                            mb: { xs: 3, md: 0 } // Margin bottom on mobile when it stacks
                        }}
                    >
                        <Typography variant="h5" sx={{
                            display: 'flex', alignItems: 'center', mb: 2, pb: 1.5,
                            borderBottom: `1px solid ${COLORS.lightGray}`, color: COLORS.textPrimary,
                            fontWeight: '600', fontSize: { xs: '1.2rem', sm: '1.35rem' } // Responsive
                        }}>
                            <PersonIcon sx={{ color: COLORS.primary, mr: 1.5 }} />
                            Clientes Pilates
                            <Chip label={clientesPilates.length} size="small" sx={{
                                ml: 'auto', bgcolor: alpha(COLORS.primary, 0.1), color: COLORS.primary, fontWeight: '600'
                            }} />
                        </Typography>

                        {clienteSeleccionado && (
                            <Alert severity="success" sx={{
                                mb: 2, fontSize: '0.8rem', borderRadius: '8px',
                                bgcolor: alpha(COLORS.success, 0.1), color: COLORS.textPrimary,
                                border: `1px solid ${alpha(COLORS.success, 0.3)}`,
                                '& .MuiAlert-icon': { color: COLORS.success }
                            }} icon={<CheckCircleIcon fontSize='small' />}>
                                <Box>
                                    <strong>Seleccionado:</strong> {clienteSeleccionado.nombre}
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                        Haz clic en una cama libre para asignar.
                                    </Typography>
                                </Box>
                            </Alert>
                        )}

                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}> {/* List takes remaining space and scrolls */}
                            {clientesPilates.length > 0 ? (
                                <List dense sx={{ pt: 0 }}>
                                    {clientesPilates.map((cliente, index) => (
                                        <ClienteItem
                                            key={cliente.id}
                                            cliente={cliente}
                                            seleccionado={clienteSeleccionado?.id === cliente.id}
                                            onClick={seleccionarCliente}
                                            index={index} // For staggered animation
                                        />
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4, animation: `${fadeIn} 0.5s ease-out` }}>
                                    <PersonIcon sx={{ fontSize: 40, color: COLORS.lightGray, mb: 1 }} />
                                    <Typography variant="body2" color="textSecondary">
                                        No hay clientes de pilates registrados.
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Box sx={{ mt: 'auto', pt: 2 }}> {/* Buttons stick to bottom of this paper */}
                            <Button fullWidth variant="contained" color="primary"
                                startIcon={loadingGuardado ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                onClick={guardarAsignaciones} disabled={!isModificado || loadingGuardado}
                                sx={{
                                    bgcolor: COLORS.primary,
                                    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
                                    height: '42px', borderRadius: '8px', fontWeight: '600', letterSpacing: '0.5px',
                                    boxShadow: '0 2px 8px rgba(93, 95, 239, 0.3)',
                                    '&:hover': { boxShadow: '0 4px 12px rgba(93, 95, 239, 0.4)', transform: 'translateY(-1px)' },
                                    transition: 'all 0.3s ease',
                                    '&:disabled': { background: COLORS.lightGray, color: COLORS.textSecondary, boxShadow: 'none' }
                                }}
                            >
                                {loadingGuardado ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            {isModificado && (
                                <Typography variant="caption" sx={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1,
                                    color: COLORS.warning, fontWeight: '500'
                                }}>
                                    <InfoIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                                    Cambios sin guardar
                                </Typography>
                            )}
                            <Button fullWidth variant="outlined" color="error" startIcon={<ClearIcon />}
                                onClick={limpiarAsignacionesDia}
                                sx={{
                                    mt: isModificado ? 1 : 2, // Adjust margin based on warning presence
                                    height: '42px', borderRadius: '8px', fontWeight: '600', letterSpacing: '0.5px',
                                    borderColor: COLORS.error, color: COLORS.error,
                                    '&:hover': { bgcolor: alpha(COLORS.error, 0.08), borderColor: COLORS.error, transform: 'translateY(-1px)' },
                                    transition: 'all 0.3s ease'
                                }}
                                disabled={!Object.keys(camasAsignadas).some(key => key.startsWith(`${diaSeleccionado}-`))}
                            >
                                Limpiar día
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9}>
                    <Paper elevation={2} sx={{
                        borderRadius: '12px', overflow: 'hidden', bgcolor: '#fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: `1px solid ${COLORS.lightGray}`
                    }}>
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
                                    '& .MuiTabs-indicator': { height: '4px', borderRadius: '4px 4px 0 0' },
                                    minHeight: 'auto' // Reduce default height of Tabs
                                }}
                            >
                                {DIAS_SEMANA.map(dia => (
                                    <Tab key={dia} value={dia}
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', textTransform: 'none', fontSize: '0.9rem' }}>
                                                <EventIcon sx={{ fontSize: '1rem', mr: { xs: 0.5, sm: 1 }, color: diaSeleccionado === dia ? COLORS.primary : COLORS.textSecondary }} />
                                                {dia}
                                            </Box>
                                        }
                                        sx={{
                                            fontWeight: diaSeleccionado === dia ? '600' : '500',
                                            px: { xs: 1, sm: 2 }, py: { xs: 1, sm: 1.5 }, minHeight: 'auto',
                                            minWidth: { xs: 'auto', sm: '90px' }, // Allow tabs to be smaller on mobile
                                            color: diaSeleccionado === dia ? COLORS.primary : COLORS.textSecondary,
                                            '&:hover': { color: COLORS.primary, bgcolor: alpha(COLORS.primary, 0.05) }
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        {/* Content for the selected day with Fade transition */}
                        <Fade in={true} key={diaSeleccionado} timeout={500}>
                             <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}> {/* Responsive padding for content area */}
                                {HORARIOS.map((horario) => (
                                    <SeccionHorario
                                        key={`${diaSeleccionado}-${horario}`} // Ensure key changes when dia changes for re-animation
                                        horario={horario}
                                        diaSeleccionado={diaSeleccionado}
                                        camasAsignadas={camasAsignadas}
                                        onCamaClick={handleCamaClick}
                                        onRemoveCliente={handleRemoveCliente}
                                    />
                                ))}
                            </Box>
                        </Fade>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={snackbar.severity === 'error' ? null : (snackbar.severity === 'info' ? 2500 : 4000) }
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                TransitionComponent={Fade} // Simple Fade for Snackbar
            >
                <Alert
                    onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled"
                    sx={{
                        width: '100%', boxShadow: 6, borderRadius: '8px', alignItems: 'center',
                        '& .MuiAlert-message': { flexGrow: 1 }
                    }}
                    iconMapping={{
                        success: <CheckCircleIcon fontSize="inherit" />, error: <ErrorOutlineIcon fontSize="inherit" />,
                        warning: <ErrorOutlineIcon fontSize="inherit" />, info: <InfoIcon fontSize="inherit" />
                    }}
                >
                    <Typography variant="body2" fontWeight="500">{snackbar.message}</Typography>
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default CamasPilates;