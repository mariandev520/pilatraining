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
const HORARIOS = ['7:00','8:00', '9:00', '10:00', '11:00', '12:00', '14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

// Paleta de colores adaptada para modo light
const COLORS = {
    primary: '#673ab7',         // Deep Purple (un poco más vibrante para light)
    primaryLight: '#9575cd',    // Deep Purple 300
    primaryDark: '#5e35b1',     // Deep Purple 700
    secondary: '#00bcd4',       // Cyan (para acentos)
    secondaryLight: '#4dd0e1',  // Cyan 300
    secondaryDark: '#0097a7',   // Cyan 700
    accent: '#ff4081',          // Pink Accent
    error: '#f44336',           // Red 500
    warning: '#ffc107',         // Amber para advertencias
    success: '#4caf50',         // Green para éxito
    
    // Colores de texto para tema light (gris oscuro)
    textPrimary: '#424242',     // Gris oscuro para texto principal
    textSecondary: '#757575',   // Gris medio para texto secundario
    textTertiary: '#9e9e9e',    // Gris claro para texto terciario
    
    // Colores de fondo para modo light (blancos y pasteles)
    background: '#f5f5f5',      // Fondo casi blanco
    surface: '#ffffff',         // Superficie estándar (blanco puro)
    surfaceLight: '#fcfcfc',    // Superficie ligeramente más clara
    surfaceMedium: '#eeeeee',   // Superficie media (gris muy claro)
    card: '#ffffff',            // Fondo para tarjetas (blanco puro)
    
    // Colores de borde
    border: '#e0e0e0',          // Borde estándar (gris muy claro)
    borderLight: '#f0f0f0',     // Borde aún más claro
    borderAccent: '#673ab7',    // Borde con acento violeta
    
    // Utilidades
    divider: '#bdbdbd',         // Línea divisoria (gris claro)
    disabled: '#e0e0e0',        // Elementos deshabilitados
    lightGray: '#f5f5f5',       // Reemplazo para lightGray
    
    // Gradientes (ajustados para ser sutiles en light mode)
    gradient: 'linear-gradient(45deg, #673ab7 30%, #00bcd4 90%)', // Deep Purple to Cyan
    gradientPrimary: 'linear-gradient(135deg, #673ab7 0%, #9575cd 100%)'
};


// Componente CamaIndividual (sin cambios en funcionalidad, solo estilos)
const CamaIndividual = ({ numero, cliente, onClickCama, onRemoveCliente }) => {
    return (
        <Zoom in={true} style={{ transitionDelay: `${numero * 50}ms` }}>
            <Card
                elevation={cliente ? 4 : 2}
                sx={{
                    height: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    position: 'relative',
                    overflow: 'visible',
                    border: cliente ? `2px solid ${cliente.color || COLORS.primary}` : `2px dashed ${COLORS.border}`,
                    bgcolor: cliente ? alpha(cliente.color || COLORS.primary, 0.1) : COLORS.surface,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: `0 4px 12px ${alpha(cliente ? (cliente.color || COLORS.primary) : COLORS.secondary, 0.2)}`,
                        transform: 'translateY(-2px)',
                        borderColor: cliente ? alpha(cliente.color || COLORS.primary, 0.7) : COLORS.borderAccent,
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute', 
                        top: -15, 
                        left: 15,
                        backgroundColor: cliente ? (cliente.color || COLORS.primary) : COLORS.textTertiary,
                        color: COLORS.surface, // Texto blanco sobre colores vibrantes o gris
                        width: 32, 
                        height: 32,
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center', 
                        boxShadow: `0 2px 8px ${alpha(cliente ? (cliente.color || COLORS.primary) : COLORS.secondary, 0.2)}`,
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
                                        boxShadow: `0 2px 8px ${alpha(cliente.color || COLORS.primary, 0.2)}`,
                                        fontSize: '1rem',
                                        color: COLORS.surface, // Texto blanco en avatar
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
                                        color: COLORS.textPrimary // Gris oscuro
                                    }}
                                >
                                    {cliente.nombre}
                                </Typography>
                                <Typography 
                                    variant="caption" 
                                    align="center" 
                                    sx={{ 
                                        display:'block', 
                                        width: '100%', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.7rem',
                                        color: COLORS.textSecondary // Gris medio
                                    }}
                                >
                                    DNI: {cliente.dni}
                                </Typography>
                                <Chip
                                    label={`Clases: ${cliente.clasesPendientes ?? 0}`}
                                    size="small"
                                    sx={{ 
                                        mt: 1, 
                                        bgcolor: alpha(cliente.color || COLORS.primary, 0.1), 
                                        height: 22, 
                                        fontSize: '0.7rem',
                                        color: alpha(cliente.color || COLORS.primary, 0.9),
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
                                color: COLORS.divider, 
                                mb: 1.5,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    color: COLORS.secondary,
                                    transform: 'scale(1.1)'
                                }
                            }} />
                            <Typography variant="body2" align="center" sx={{ fontWeight: '500', color: COLORS.textSecondary }}>
                                Cama Libre
                            </Typography>
                            <Typography variant="caption" align="center" sx={{ mt: 0.5, color: COLORS.textTertiary }}>
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
                                    bgcolor: alpha(COLORS.error, 0.1), 
                                    '&:hover': { 
                                        bgcolor: alpha(COLORS.error, 0.2),
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease',
                                    color: COLORS.error // Asegura que el icono sea rojo
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

// Componente para cliente en la lista (sin cambios en funcionalidad, solo estilos)
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
                    bgcolor: seleccionado ? alpha(cliente.color || COLORS.primary, 0.08) : COLORS.surface, // Blanco o pastel muy claro
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                        bgcolor: alpha(cliente.color || COLORS.primary, 0.1),
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
                            boxShadow: seleccionado ? `0 0 0 2px ${alpha(cliente.color || COLORS.primary, 0.2)}` : 'none',
                            color: COLORS.surface // Texto blanco en avatar
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
                            sx={{ color: COLORS.textPrimary }} // Gris oscuro
                        >
                            {cliente.nombre}
                        </Typography>
                    }
                    secondary={`Clases: ${cliente.clasesPendientes ?? 0}`}
                    secondaryTypographyProps={{ 
                        variant: 'caption',
                        sx: { 
                            color: seleccionado ? alpha(cliente.color || COLORS.primary, 0.9) : COLORS.textSecondary, // Color del cliente o gris medio
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

// Sección de horario (sin cambios en funcionalidad, solo estilos)
const SeccionHorario = ({ horario, diaSeleccionado, camasAsignadas, onCamaClick, onRemoveCliente }) => {
    return (
        <Box sx={{ mb: 3, animation: `${fadeIn} 0.4s ease-out` }}>
            <Box
                sx={{
                    bgcolor: COLORS.primary,
                    background: COLORS.gradientPrimary,
                    color: COLORS.surface, // Texto blanco
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
                    bgcolor: COLORS.surfaceLight, // Fondo pastel muy claro
                    borderRadius: '0 0 8px 8px', 
                    border: '1px solid', 
                    borderColor: COLORS.border, 
                    borderTop: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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

// Componente principal de CamasPilates
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
    
    const getRandomColor = (index) => {
        const colors = [
            '#81c784', // Light Green
            '#64b5f6', // Light Blue
            '#ffb74d', // Orange
            '#ba68c8', // Purple
            '#e57373', // Red
            '#aed581', // Lime Green
            '#4db6ac', // Teal
            '#ff8a65', // Deep Orange
            '#90a4ae', // Blue Grey
            '#f06292', // Pink
            '#7986cb', // Indigo
            '#ffd54f', // Amber
            '#b39ddb', // Deep Purple
            '#80cbc4', // Cyan
            '#ffcc80', // Light Orange
            '#c5e1a5', // Light Green (lighter)
            '#9fa8da', // Indigo (lighter)
            '#ef9a9a', // Red (lighter)
            '#a1887f', // Brown
            '#dce775'  // Lime
        ];
        return colors[index % colors.length];
    };

    // --- INICIO: NUEVA FUNCIÓN PARA LIMPIAR ASIGNACIONES ---
    const limpiarAsignacionesDeClientesEliminados = (asignacionesActuales, listaClientesValidos) => {
        const asignacionesLimpias = { ...asignacionesActuales };
        // Asegurarse que listaClientesValidos es un array antes de mapear
        const idsClientesValidos = new Set(
            Array.isArray(listaClientesValidos) ? listaClientesValidos.map(c => c.id) : []
        );
        let cambiosRealizados = false;

        for (const camaClave in asignacionesLimpias) {
            if (asignacionesLimpias.hasOwnProperty(camaClave)) {
                const clienteAsignado = asignacionesLimpias[camaClave];
                // Verificar que clienteAsignado y clienteAsignado.id existan
                if (clienteAsignado && clienteAsignado.id && !idsClientesValidos.has(clienteAsignado.id)) {
                    console.warn(`Cliente con ID ${clienteAsignado.id} asignado a ${camaClave} no encontrado en lista de clientes válidos. Eliminando asignación.`);
                    delete asignacionesLimpias[camaClave];
                    cambiosRealizados = true;
                }
            }
        }
        return { asignacionesLimpias, cambiosRealizados };
    };
    // --- FIN: NUEVA FUNCIÓN PARA LIMPIAR ASIGNACIONES ---

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
                    // Es crucial que cliente._id exista y sea el identificador único.
                    id: cliente._id, 
                    dni: cliente.dni, 
                    nombre: cliente.nombre,
                    actividades: cliente.actividades, 
                    color: getRandomColor(index),
                    clasesPendientes: cliente.clasesPendientesTotales ?? 0
                }));
                setClientes(dataClientes);
                setClientesPilates(clientesFormateados);

                // Cargar Asignaciones
                const respAsignaciones = await fetch('/api/camas-Pilates');
                if (!respAsignaciones.ok) {
                    const errorData = await respAsignaciones.json().catch(() => ({}));
                    throw new Error(errorData.message || `Error ${respAsignaciones.status} al cargar asignaciones`);
                }
                const dataAsignaciones = await respAsignaciones.json();
                
                // --- INICIO: LIMPIEZA AL CARGAR ---
                const { 
                    asignacionesLimpias, 
                    cambiosRealizados 
                } = limpiarAsignacionesDeClientesEliminados(dataAsignaciones || {}, clientesFormateados);
                
                setCamasAsignadas(asignacionesLimpias);
                if (cambiosRealizados) {
                    setIsModificado(true); // Marcar como modificado para permitir guardar la limpieza
                    setSnackbar({ 
                        open: true, 
                        message: 'Se limpiaron asignaciones de clientes no encontrados.', 
                        severity: 'info' 
                    });
                } else {
                    setIsModificado(false);
                }
                // --- FIN: LIMPIEZA AL CARGAR ---
                console.log("Asignaciones cargadas y potencialmente limpiadas desde API.");

            } catch (err) {
                console.error('Error cargando datos iniciales:', err);
                setError(`Error al cargar datos: ${err.message}. Intente recargar.`);
                setCamasAsignadas({});
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []); // Se ejecuta solo al montar el componente


    // cargarAsignaciones original (sin cambios, la lógica de limpieza se movió a cargarDatos)
    const cargarAsignaciones = async () => {
        try {
            const apiUrl = '/api/camas-Pilates';
            const respAsignaciones = await fetch(apiUrl);

            if (!respAsignaciones.ok) {
                const errorData = await respAsignaciones.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${respAsignaciones.status} al cargar asignaciones`);
            }

            const dataAsignaciones = await respAsignaciones.json();
            // La limpieza ahora se hace en cargarDatos después de tener la lista de clientes actualizada
            setCamasAsignadas(dataAsignaciones || {});
            setIsModificado(false); // Asumimos que lo cargado es el estado "guardado"
            console.log("Asignaciones cargadas desde API (función cargarAsignaciones).");

        } catch (err) {
            console.error('Error cargando asignaciones desde API:', err);
            setError(`Error al cargar asignaciones: ${err.message}`);
            setSnackbar({ open: true, message: `Error al cargar asignaciones: ${err.message}`, severity: 'error' });
            setCamasAsignadas({});
            setIsModificado(false);
        }
    };
    
    const guardarAsignaciones = async () => {
        console.log("Intentando guardar asignaciones...");
        setLoadingGuardado(true);
        setError(null);
        setSnackbar({ open: false, message: '', severity: 'info'});

        // --- INICIO: LIMPIEZA ANTES DE GUARDAR ---
        // Usar el estado actual de clientesPilates que debería estar actualizado
        const { 
            asignacionesLimpias, 
            cambiosRealizados: seHicieronLimpiezas 
        } = limpiarAsignacionesDeClientesEliminados(camasAsignadas, clientesPilates);

        let payloadAsignaciones = camasAsignadas;
        if (seHicieronLimpiezas) {
            console.log("Se detectaron clientes eliminados antes de guardar. Actualizando asignaciones.");
            // Si se hicieron limpiezas, el estado `camasAsignadas` debe actualizarse
            // y el payload a enviar será `asignacionesLimpias`.
            // Esto podría ocurrir si un cliente fue eliminado DESPUÉS de la carga inicial
            // y ANTES de que el usuario presione guardar.
            // Nota: Si `clientesPilates` no se actualiza en tiempo real, esta limpieza
            // podría no capturar eliminaciones muy recientes.
            setCamasAsignadas(asignacionesLimpias); // Actualiza el estado local
            payloadAsignaciones = asignacionesLimpias; // Usa el payload limpio
             // Mantenemos isModificado true, ya que la acción de guardar es la que lo debe limpiar.
        }
        // --- FIN: LIMPIEZA ANTES DE GUARDAR ---

        try {
            console.log("Guardando Asignaciones - Payload:", JSON.stringify({ asignaciones: payloadAsignaciones }, null, 2));
            const response = await fetch('/api/camas-Pilates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asignaciones: payloadAsignaciones }), // Enviar las asignaciones (potencialmente limpias)
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
            setIsModificado(false); // Solo si el guardado fue exitoso
            setSnackbar({ 
                open: true, 
                message: seHicieronLimpiezas ? 'Asignaciones actualizadas y guardadas (clientes obsoletos eliminados).' : (result.message || 'Asignaciones guardadas correctamente.'), 
                severity: 'success' 
            });

        } catch (err) {
            console.error('Error guardando asignaciones catch:', err);
            setSnackbar({ open: true, message: `Error al guardar en servidor: ${err.message}`, severity: 'error' });
            // No cambiar isModificado a false si hay error, para permitir reintentar.
        } finally {
            setLoadingGuardado(false);
        }
    };

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
    };

    const handleDiaChange = (event, newValue) => {
        if (isModificado && !window.confirm("Hay cambios sin guardar. ¿Descartar cambios y cambiar de día?")) {
            return;
        }
        setDiaSeleccionado(newValue);
        // Al cambiar de día, si había modificaciones sin guardar, se descartan.
        // Si la limpieza inicial marcó isModificado=true, y el usuario cambia de día sin guardar,
        // se podría recargar las asignaciones del nuevo día o confiar en la lógica actual.
        // Por simplicidad, mantenemos el comportamiento actual.
        setIsModificado(false); 
        setClienteSeleccionado(null);
    };

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
    
    // Renderizado (sin cambios en funcionalidad, solo estilos)
    if (loading) {
        return (
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '80vh',
                flexDirection: 'column',
                animation: `${fadeIn} 0.5s ease-out`,
                bgcolor: COLORS.background,
                color: COLORS.textPrimary
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
                        fontWeight: '500',
                        background: COLORS.gradientPrimary,
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
            <Container maxWidth="lg" sx={{ 
                mt: 4,
                bgcolor: COLORS.background,
                color: COLORS.textPrimary
            }}>
                <Alert 
                    severity="error" 
                    action={
                        <Button 
                            color="inherit" 
                            size="small" 
                            onClick={() => {
                                setLoading(true); // Para mostrar el loader mientras se recarga
                                cargarDatos(); // Volver a llamar a cargarDatos
                            }}
                            sx={{ 
                                bgcolor: alpha(COLORS.error, 0.1),
                                '&:hover': {
                                    bgcolor: alpha(COLORS.error, 0.2)
                                },
                                color: COLORS.error // Asegura que el texto del botón sea rojo
                            }}
                        >
                            Reintentar Carga
                        </Button>
                    }
                    sx={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        borderLeft: `4px solid ${COLORS.error}`,
                        bgcolor: alpha(COLORS.error, 0.05), // Fondo pastel más sutil
                        color: COLORS.textPrimary // Gris oscuro
                    }}
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ 
            mt: 4, 
            mb: 8,
            bgcolor: COLORS.background,
            color: COLORS.textPrimary
        }}>
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
                        background: COLORS.gradientPrimary,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        animation: `${fadeIn} 0.6s ease-out`
                    }}
                >
                    <FitnessCenterIcon fontSize="large" sx={{ color: COLORS.primary }} />
                    Gestión de Camas de Pilates
                </Typography>
                <Typography 
                    variant="subtitle1" 
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
                        borderLeft: `4px solid ${COLORS.error}`,
                        bgcolor: alpha(COLORS.error, 0.05), // Fondo pastel más sutil
                        color: COLORS.textPrimary // Gris oscuro
                    }} 
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 2, 
                            borderRadius: '12px', 
                            height: '100%', 
                            position: 'sticky', 
                            top: 20, 
                            display: 'flex', 
                            flexDirection: 'column',
                            bgcolor: COLORS.surface, // Blanco
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: `1px solid ${COLORS.border}`
                        }}
                    >
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                mb: 2, 
                                pb: 1.5, 
                                borderBottom: `1px solid ${COLORS.divider}`,
                                color: COLORS.textPrimary, // Gris oscuro
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
                                    bgcolor: alpha(COLORS.success, 0.08), // Pastel de éxito
                                    color: COLORS.textPrimary, // Gris oscuro
                                    border: `1px solid ${alpha(COLORS.success, 0.2)}`,
                                    '& .MuiAlert-icon': {
                                        color: COLORS.success
                                    }
                                }} 
                                icon={<CheckCircleIcon fontSize='small'/>}
                            >
                                <Box>
                                    <strong>Seleccionado:</strong> {clienteSeleccionado.nombre}
                                    <Typography variant="caption" display="block" sx={{ mt: 0.5, color: COLORS.textSecondary }}>
                                        Haz clic en una cama libre para asignar
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
                            </Alert> 
                        )}
                        
                        <Box sx={{ 
                            flexGrow: 1, 
                            overflowY: 'auto', 
                            maxHeight: 'calc(100vh - 300px)', // Ajustado para el botón de limpiar día
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: COLORS.border,
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: COLORS.surface,
                            }
                        }}>
                            {clientesPilates.length > 0 ? (
                                <List dense sx={{ pt: 0 }}> 
                                    {clientesPilates.map((cliente) => ( // Removido index, key usa cliente.id
                                        <ClienteItem 
                                            key={cliente.id} // Asumimos que cliente.id es único y estable
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
                                    <PersonIcon sx={{ fontSize: 40, color: COLORS.divider, mb: 1 }} />
                                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
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
                                    background: COLORS.gradientPrimary,
                                    height: '42px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px',
                                    boxShadow: '0 2px 8px rgba(103, 58, 183, 0.2)', // Ajustado para primary
                                    color: COLORS.surface, // Texto blanco
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(103, 58, 183, 0.3)',
                                        transform: 'translateY(-1px)',
                                        bgcolor: COLORS.primaryDark // Oscurecer en hover
                                    },
                                    transition: 'all 0.3s ease',
                                    '&:disabled': {
                                        background: alpha(COLORS.disabled, 0.2), // Tono pastel más claro para disabled
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
                                        bgcolor: alpha(COLORS.error, 0.05), // Pastel de error
                                        borderColor: COLORS.error,
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.3s ease',
                                    '&:disabled': {
                                        borderColor: COLORS.disabled,
                                        color: COLORS.disabled
                                    }
                                }}
                                disabled={!Object.keys(camasAsignadas).some(key => key.startsWith(`${diaSeleccionado}-`))}
                            >
                                Limpiar día
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            borderRadius: '12px', 
                            overflow: 'hidden',
                            bgcolor: COLORS.surface, // Blanco
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: `1px solid ${COLORS.border}`
                        }}
                    >
                        <Box sx={{ bgcolor: COLORS.surfaceMedium, borderBottom: `1px solid ${COLORS.divider}` }}>
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
                                        borderRadius: '4px 4px 0 0',
                                        bgcolor: COLORS.primary
                                    },
                                    '& .MuiButtonBase-root': {
                                        color: COLORS.textSecondary // Gris medio para tabs no seleccionados
                                    },
                                    '& .Mui-selected': {
                                        color: `${COLORS.primary} !important` // Color primario para tab seleccionado
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
                                            // color ya manejado por .MuiButtonBase-root y .Mui-selected
                                            '&:hover': {
                                                color: COLORS.primary,
                                                bgcolor: alpha(COLORS.primary, 0.05) // Pastel ligero en hover
                                            }
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        <Box sx={{ p: { xs: 2, sm: 3 } }}>
                            {HORARIOS.map((horario) => ( // Removido index
                                <SeccionHorario
                                    key={`${diaSeleccionado}-${horario}`} // Clave más específica
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
                        color: COLORS.surface, // Texto blanco para SnackBar
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