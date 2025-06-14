import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import {
    Container, Box, Typography, TextField, Button, Grid, Paper, Card, CardContent, CardActions,
    CircularProgress, LinearProgress, Alert as MuiAlert, IconButton,
    FormControl, RadioGroup, Radio, FormLabel, Divider, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, InputAdornment,
    Stack, CssBaseline
} from '@mui/material';
import { createTheme, ThemeProvider, alpha, useTheme } from '@mui/material/styles'; // Importar useTheme
import {
    PersonSearch as PersonSearchIcon,
    PersonOutline as UserIcon,
    Search as SearchIcon,
    ErrorOutline as ErrorOutlineIcon,
    CheckCircleOutline as CheckIcon, // Cambiado para evitar conflicto
    Refresh as RefreshIcon,
    Block as BlockIcon,
    WarningAmber as WarningAmberIcon,
    ListAlt as ListIcon,
    DoneAll as DoneAllIcon,
    PendingActions as PendingActionsIcon,
    TrendingUp as TrendingUpIcon,
    Celebration as CelebrationIcon,
    Password as PasswordIcon,
    FormatListNumbered as ClassCountIcon,
    Cancel as CancelIcon,
    Close as XIcon,
    EventAvailable as EventAvailableIcon,
    EventBusy as EventBusyIcon,
    AccessTime as AccessTimeIcon // Icono para el reloj
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import FormControlLabel from '@mui/material/FormControlLabel';

// Tema Light
const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#673ab7', contrastText: '#ffffff' }, // Deep Purple
        secondary: { main: '#00bcd4', contrastText: '#000000' }, // Cyan
        background: { default: '#f5f5f5', paper: '#ffffff' }, // Fondo pastel y blanco
        text: { primary: '#424242', secondary: '#757575' }, // Gris oscuro
        success: { main: '#4caf50' }, // Green
        warning: { main: '#ffc107' }, // Amber
        error: { main: '#f44336' }, // Red
        info: { main: '#2196f3' } // Blue
    },
    typography: {
        fontFamily: '"Montserrat", sans-serif'
    },
    components: {
        MuiButton: {
            styleOverrides: {
                containedPrimary: ({ theme }) => ({
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                    '&:hover': {
                        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                    },
                }),
                outlinedPrimary: ({ theme }) => ({
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderColor: theme.palette.primary.main,
                    },
                }),
                textPrimary: ({ theme }) => ({
                    color: theme.palette.primary.main,
                    '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                }),
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
                    backgroundColor: theme.palette.background.paper,
                }),
            },
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }) => ({
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
                    backgroundColor: theme.palette.background.paper,
                }),
            },
        },
        MuiChip: {
            styleOverrides: {
                filledSuccess: ({ theme }) => ({
                    backgroundColor: alpha(theme.palette.success.main, 0.15),
                    color: theme.palette.success.dark,
                    fontWeight: 'bold',
                }),
                filledWarning: ({ theme }) => ({
                    backgroundColor: alpha(theme.palette.warning.main, 0.15),
                    color: theme.palette.warning.dark,
                    fontWeight: 'bold',
                }),
                filledError: ({ theme }) => ({
                    backgroundColor: alpha(theme.palette.error.main, 0.15),
                    color: theme.palette.error.dark,
                    fontWeight: 'bold',
                }),
                outlined: ({ theme }) => ({
                    borderColor: alpha(theme.palette.text.secondary, 0.5),
                    color: theme.palette.text.secondary,
                }),
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    color: theme.palette.text.primary,
                    border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                }),
                filledSuccess: ({ theme }) => ({
                    backgroundColor: theme.palette.success.main,
                    color: theme.palette.common.white,
                }),
                filledError: ({ theme }) => ({
                    backgroundColor: theme.palette.error.main,
                    color: theme.palette.common.white,
                }),
                filledWarning: ({ theme }) => ({
                    backgroundColor: theme.palette.warning.main,
                    color: theme.palette.common.white,
                }),
                filledInfo: ({ theme }) => ({
                    backgroundColor: theme.palette.info.main,
                    color: theme.palette.common.white,
                }),
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: 'rgba(0, 230, 118, 0.08)', // Pastel verde claro para seleccionado
                    },
                },
            },
        },
        MuiRadio: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: theme.palette.text.secondary, // Color por defecto para el radio
                    '&.Mui-checked': {
                        color: theme.palette.primary.main, // Color primario cuando está checked
                    },
                }),
            },
        },
    },
});

// Animaciones y helpers de fecha/API
const fadeInUp = { hidden: { opacity: 0, y: 25, filter: 'blur(3px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut" } } };
const cardVariant = { hidden: { opacity: 0, scale: 0.92, filter: 'blur(5px)' }, visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, type: "spring", stiffness: 90 } } };
const MotionPaper = motion(Paper);

const fetchInfoClases = async (dniBuscar) => {
    const response = await fetch(`/api/infoclases?dniCliente=${dniBuscar}`);
    if (!response.ok) throw new Error('No se pudo obtener infoclases actualizadas');
    const data = await response.json();
    return Array.isArray(data)
        ? data.filter(info => String(info.dniCliente) === String(dniBuscar))
        : [];
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha Inválida';
        // Usar un formato consistente para la fecha también
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
        return 'Error Fecha';
    }
};

const isDateStringOverdue = (dateString) => {
    if (!dateString) return false;
    try {
        const date = new Date(dateString);
        const comparableDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return comparableDate.getTime() < today.getTime();
    } catch (e) {
        console.error("Error parsing date for overdue check:", dateString, e);
        return true;
    }
};

const getActivityDueDateStatus = (infoClaseToCheck) => {
    if (!infoClaseToCheck) return { isOverdue: false, message: "Actividad sin información suficiente." };
    const specificDueDate = infoClaseToCheck.fechaVencimientoActividad;
    if (specificDueDate) {
        if (isDateStringOverdue(specificDueDate)) {
            return { isOverdue: true, message: `Vencimiento de ${infoClaseToCheck.nombreActividad} (${formatDate(specificDueDate)}) ha pasado.` };
        } else {
            return { isOverdue: false, message: `${infoClaseToCheck.nombreActividad} al día (${formatDate(specificDueDate)}).` };
        }
    }
    return { isOverdue: false, message: "Sin vencimiento específico para esta actividad." };
};

// --- Componente del Reloj Actualizado (Con Solución de Hidratación) ---
const ClockDisplay = () => {
    const [time, setTime] = useState(new Date());
    const [mounted, setMounted] = useState(false); // Estado para controlar la hidratación
    const theme = useTheme(); // Usar useTheme para acceder a la paleta

    useEffect(() => {
        // Una vez que el componente se monta en el cliente, establecemos mounted en true
        setMounted(true);

        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timerId);
    }, []);

    // Formatear la hora y fecha
    // Es importante usar opciones explícitas para evitar diferencias entre el servidor y el cliente
    const formattedTime = time.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false // Forzar formato de 24 horas para consistencia
    });
    const formattedDate = time.toLocaleDateString('es-AR', { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short' 
    });

    // Si el componente no está montado en el cliente, no renderizamos el reloj dinámico.
    // Esto significa que en el servidor se renderizará un espacio vacío, evitando el mismatch.
    if (!mounted) {
        return null; 
    }

    return (
        <MotionPaper
            elevation={4}
            sx={{
                position: 'fixed',
                top: { xs: 16, sm: 24 }, // Adjusted top for upper right
                right: { xs: 16, sm: 24 }, // Adjusted right for upper right
                p: { xs: 1.8, sm: 3 },
                borderRadius: '12px',
                textAlign: 'center',
                bgcolor: theme.palette.background.paper, // Fondo pastel suave
                border: `1px solid ${theme.palette.divider}`, // Borde sutil
                boxShadow: `0 4px 6px ${alpha(theme.palette.text.primary, 0.1)}`, // Sombra simple
                zIndex: 100,
                width: { xs: 150, sm: 180 },
                pointerEvents: 'none',
                userSelect: 'none',
                display: { xs: 'none', md: 'block' }
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Box sx={{
                bgcolor: alpha(theme.palette.primary.light, 0.1), // Fondo pastel claro para el icono
                width: 50,
                height: 50,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1.5
            }}>
                <AccessTimeIcon sx={{ 
                    fontSize: '2rem', 
                    color: theme.palette.primary.main // Color primario
                }} />
            </Box>
            <Typography
                variant="h5"
                component="div"
                sx={{
                    fontWeight: 700, // Bold más pesado
                    color: theme.palette.text.primary, // Gris oscuro
                    fontSize: { xs: '1.5rem', sm: '1.9rem' },
                    letterSpacing: '0.03em'
                }}
            >
                {formattedTime}
            </Typography>
            <Typography 
                variant="caption" 
                sx={{ 
                    display: 'block', 
                    mt: 1, 
                    fontSize: '0.9rem',
                    color: theme.palette.text.secondary, // Gris medio
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                }}
            >
                {formattedDate}
            </Typography>
        </MotionPaper>
    );
};
// --- Fin Componente del Reloj ---


export default function VerificacionPage() {
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [infoClases, setInfoClases] = useState([]);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [clienteInfo, setClienteInfo] = useState(null);
    const [dniError, setDniError] = useState('');
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [clasesAAsignar, setClasesAAsignar] = useState(10);
    const [resetError, setResetError] = useState('');
    const [multipleActivities, setMultipleActivities] = useState(false);

    const successAudioRef = useRef(null);
    const errorAudioRef = useRef(null);
    const dniInputRef = useRef(null);
    const inactivityTimerRef = useRef(null);
    const theme = useTheme(); // Usar useTheme para acceder a la paleta

    const fullSubtitleHTML = "Control de clases para clientes de Pilates. Ingrese su DNI y presione Enter para verificar su asistencia   ¡Gracias!"
    const [typedHtmlSubtitle, setTypedHtmlSubtitle] = useState(fullSubtitleHTML);

    useEffect(() => {
        successAudioRef.current = new Audio('/sounds/success.mp3');
        errorAudioRef.current = new Audio('/sounds/success.success.mp3'); // Cambiado para que sea un sonido diferente o ajusta según necesites
    }, []);

    const playSoundNTimes = useCallback((audioRef, times = 1, delay = 180) => {
        if (!audioRef.current) return;
        let count = 0;
        const playOnce = () => {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
            count++;
            if (count < times) {
                setTimeout(playOnce, delay);
            }
        };
        playOnce();
    }, []);

    const playSound = useCallback((type) => {
        if (!successAudioRef.current || !errorAudioRef.current) return;
        if (type === 'success') {
            playSoundNTimes(successAudioRef, 1, 180);
        } else if (type === 'error') {
            playSoundNTimes(errorAudioRef, 3, 280); // Usar errorAudioRef para sonidos de error
        }
    }, [playSoundNTimes]);

    const resetAllMainStates = useCallback(() => {
        setDni('');
        setClienteInfo(null);
        setInfoClases([]);
        setSelectedActivity(null);
        setMultipleActivities(false);
        setDniError('');
        setError(null);
        setMensajeExito('');
        if (dniInputRef.current) dniInputRef.current.focus();
    }, [setDni, setClienteInfo, setInfoClases, setSelectedActivity, setMultipleActivities, setDniError, setError, setMensajeExito, dniInputRef]);

    const restartInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            resetAllMainStates();
        }, 80000); // 80 segundos de inactividad
    }, [resetAllMainStates, inactivityTimerRef]);

    useEffect(() => {
        restartInactivityTimer();
        document.addEventListener('mousemove', restartInactivityTimer);
        document.addEventListener('keypress', restartInactivityTimer);
        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            document.removeEventListener('mousemove', restartInactivityTimer);
            document.removeEventListener('keypress', restartInactivityTimer);
        };
    }, [restartInactivityTimer]);

    const handleDniChange = useCallback((e) => {
        const value = e.target.value;
        const numericValue = value.replace(/\D/g, '');
        setDni(numericValue);
        if (dniError && (numericValue || numericValue === '')) setDniError('');
        setClienteInfo(null);
        setInfoClases([]);
        setSelectedActivity(null);
        setMultipleActivities(false);
        setError(null);
        setMensajeExito('');
        restartInactivityTimer();
    }, [dniError, restartInactivityTimer, setDni, setDniError, setClienteInfo, setInfoClases, setSelectedActivity, setMultipleActivities, setError, setMensajeExito]);

    const buscarYVerificarCliente = useCallback(async (e) => {
        if (e) e.preventDefault();
        if (!dni) { setDniError('Por favor, ingrese un DNI.'); playSound('error'); restartInactivityTimer(); return; }
        
        const currentDniForSearch = dni;
        
        setLoading(true);
        resetAllMainStates();
        setDni(currentDniForSearch);
        
        restartInactivityTimer();

        try {
            const clienteRes = await fetch(`/api/clientes?dni=${currentDniForSearch}`);
            if (!clienteRes.ok) {
                const errData = await clienteRes.json().catch(() => ({ message: `Error ${clienteRes.status} buscando cliente` }));
                throw new Error(errData.message || 'Error del servidor al buscar cliente.');
            }
            const clienteDataResponse = await clienteRes.json();
            let foundClient = null;
            if (Array.isArray(clienteDataResponse)) {
                foundClient = clienteDataResponse.find(c => String(c.dni) === String(currentDniForSearch));
            } else if (clienteDataResponse && String(clienteDataResponse.dni) === String(currentDniForSearch)) {
                foundClient = clienteDataResponse;
            }

            if (!foundClient) {
                setDniError('DNI no registrado.');
                playSound('error'); setLoading(false); return;
            }
            setClienteInfo(foundClient);

            const dataInfoClases = await fetchInfoClases(currentDniForSearch);
            setInfoClases(dataInfoClases);

            if (dataInfoClases && dataInfoClases.length === 1) {
                setMultipleActivities(false);
                setSelectedActivity(dataInfoClases[0]);
            } else if (dataInfoClases && dataInfoClases.length > 1) {
                setMultipleActivities(true);
                setSelectedActivity(null);
            } else {
                setMultipleActivities(false);
                setSelectedActivity(null);
                setError('Cliente encontrado pero sin información de clases/actividades para verificar.');
                playSound('error');
            }
        } catch (errorCatch) {
            setError(errorCatch.message || 'Error al buscar información del cliente.');
            setClienteInfo(null); setInfoClases([]);
            playSound('error');
        } finally {
            setLoading(false);
            restartInactivityTimer();
        }
    }, [dni, resetAllMainStates, playSound, restartInactivityTimer, setDniError, setLoading, setDni, setClienteInfo, setInfoClases, setMultipleActivities, setSelectedActivity, setError]);
    
    const verificarClase = useCallback(async (actividadDesdeSeleccion = null) => {
        const actividadAVerificar = actividadDesdeSeleccion || selectedActivity || (!multipleActivities && infoClases.length === 1 ? infoClases[0] : null);
        restartInactivityTimer();

        if (!actividadAVerificar || !clienteInfo) {
            setError(!clienteInfo ? 'No se encontró información del cliente para la verificación.' : (multipleActivities ? 'Por favor, seleccione una actividad.' : 'No hay actividad para verificar.'));
            playSound('error');
            return;
        }
        
        const currentClienteDni = clienteInfo.dni;

        const dueDateStatus = getActivityDueDateStatus(actividadAVerificar);
        const isOverdue = dueDateStatus.isOverdue;
        const noClasses = actividadAVerificar.clasesPendientes <= 0 && !actividadAVerificar.clasePrueba; // Condición para bloqueo

        if (isOverdue || noClasses) { // Bloqueo si no hay clases o está vencido
            setError(isOverdue && noClasses
                ? `Cuota vencida (${formatDate(actividadAVerificar.fechaVencimientoActividad)}) y sin clases pendientes para ${actividadAVerificar.nombreActividad}. Contacte al administrador.`
                : (isOverdue
                    ? `Cuota vencida para ${actividadAVerificar.nombreActividad} (${formatDate(actividadAVerificar.fechaVencimientoActividad)}). Contacte al administrador.`
                    : `No tiene clases pendientes para ${actividadAVerificar.nombreActividad}.`));
            playSound('error');
            setShowResetModal(true);
            setVerifying(false);
            return;
        }

        setVerifying(true); setError(null); setMensajeExito('');
        try {
            const esPrueba = actividadAVerificar.clasePrueba;
            const endpointVerificacion = '/api/verificacion';
            const endpointInfoClases = '/api/infoclases';
            let nuevaInfoClasesActualizada;
            let verificationPayload;

            if (esPrueba) {
                nuevaInfoClasesActualizada = {
                    ...actividadAVerificar,
                    clasePrueba: false,
                    ultimaActualizacion: new Date().toISOString(),
                    verificacionesSemana: (actividadAVerificar.verificacionesSemana || 0) + 1
                };
                verificationPayload = {
                    dniCliente: parseInt(currentClienteDni),
                    nombreCliente: clienteInfo?.nombre || '',
                    metodoVerificacion: 'presencial',
                    tipo: 'clase_prueba',
                    nombreActividad: actividadAVerificar.nombreActividad
                };
            } else {
                nuevaInfoClasesActualizada = {
                    ...actividadAVerificar,
                    dniCliente: parseInt(currentClienteDni),
                    clasesPendientes: actividadAVerificar.clasesPendientes - 1,
                    clasesEchas: (actividadAVerificar.clasesEchas || 0) + 1,
                    verificacionesSemana: (actividadAVerificar.verificacionesSemana || 0) + 1,
                    ultimaActualizacion: new Date().toISOString()
                };
                verificationPayload = {
                    dniCliente: parseInt(currentClienteDni),
                    nombreCliente: clienteInfo?.nombre || '',
                    metodoVerificacion: 'presencial',
                    tipo: 'clase_regular',
                    nombreActividad: actividadAVerificar.nombreActividad
                };
            }

            const resVerif = await fetch(endpointVerificacion, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(verificationPayload)
            });

            let errVerifMessage;
            if (!resVerif.ok) {
                const errVerifData = await resVerif.json().catch(() => ({ message: "Error en la respuesta del servidor de verificación." }));
                if (resVerif.status === 409 && errVerifData.message && typeof errVerifData.message === 'string' && errVerifData.message.toLowerCase().includes("ya existe una verificación presencial")) {
                    setError(errVerifData.message);
                    playSound('error');
                    setVerifying(false);
                    return;
                }
                errVerifMessage = errVerifData.message || `Error ${resVerif.status} al registrar verificación.`;
            }

            let errInfoMessage;
            if (!errVerifMessage) {
                const resInfoUpdate = await fetch(endpointInfoClases, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevaInfoClasesActualizada)
                });
                if (!resInfoUpdate.ok) {
                    const errInfoData = await resInfoUpdate.json().catch(() => ({ message: "Error en la respuesta del servidor al actualizar clases." }));
                    errInfoMessage = errInfoData.message || `Error ${resInfoUpdate.status} al actualizar info clases.`;
                }
            }

            if (errVerifMessage || errInfoMessage) {
                playSound('error');
                throw new Error(errVerifMessage && errInfoMessage ? `${errVerifMessage} Y ${errInfoMessage}` : errVerifMessage || errInfoMessage || 'Error en una de las operaciones.');
            }

            playSound('success');
            setMensajeExito(esPrueba ? `¡Clase de prueba para ${actividadAVerificar.nombreActividad} utilizada!` : `¡Asistencia para ${actividadAVerificar.nombreActividad} registrada!`);

            const infoclasesActualizadasTrasVerificacion = await fetchInfoClases(currentClienteDni);
            setInfoClases(infoclasesActualizadasTrasVerificacion);

            const currentSelectedActivityName = actividadAVerificar.nombreActividad;
            if (infoclasesActualizadasTrasVerificacion.length === 1) {
                setSelectedActivity(infoclasesActualizadasTrasVerificacion[0]);
                setMultipleActivities(false);
            } else if (infoclasesActualizadasTrasVerificacion.length > 1) {
                const updatedSelected = infoclasesActualizadasTrasVerificacion.find(info => info.nombreActividad === currentSelectedActivityName);
                setSelectedActivity(updatedSelected || null);
                setMultipleActivities(true);
            } else {
                setSelectedActivity(null);
                setMultipleActivities(false);
            }

        } catch (errorCatch) {
            setError(errorCatch.message || 'Error al procesar verificación.');
            playSound('error');
        } finally {
            setVerifying(false);
            restartInactivityTimer();
        }
    }, [
        selectedActivity, multipleActivities, infoClases, clienteInfo,
        restartInactivityTimer, setError, playSound, setShowResetModal, setVerifying, setMensajeExito,
        setInfoClases, setSelectedActivity, setMultipleActivities,
    ]);

    const handleResetClasses = useCallback(async () => {
        restartInactivityTimer();
        if (multipleActivities && !selectedActivity) { setResetError('Seleccione una actividad para reiniciar.'); playSound('error'); return; }
        const actividadAReiniciar = selectedActivity || (infoClases.length === 1 ? infoClases[0] : null);

        if (!actividadAReiniciar || !clienteInfo) {
            setResetError('No se puede reiniciar. Falta información del cliente o actividad seleccionada.');
            playSound('error'); return;
        }
        if (resetPassword !== '0716') { setResetError('Contraseña incorrecta.'); playSound('error'); return; }
        const numClases = parseInt(clasesAAsignar);
        if (isNaN(numClases) || numClases <= 0) { setResetError('Ingrese un número válido de clases (mayor a 0).'); playSound('error'); return; }

        setResetting(true); setResetError(''); setMensajeExito(''); setError(null);
        try {
            const currentClienteDni = clienteInfo.dni;

            const actividadOriginalCliente = clienteInfo.actividades?.find(act => act.nombre === actividadAReiniciar.nombreActividad);
            let nuevaFechaVencimientoActividadEspecifica = actividadAReiniciar.fechaVencimientoActividad;
            const dueDateStatusOriginal = getActivityDueDateStatus(actividadAReiniciar);

            if (dueDateStatusOriginal.isOverdue || !actividadOriginalCliente?.fechaVencimientoActividad) {
                const fechaBaseParaNuevaEspecifica = new Date();
                fechaBaseParaNuevaEspecifica.setMonth(fechaBaseParaNuevaEspecifica.getMonth() + 1);
                nuevaFechaVencimientoActividadEspecifica = fechaBaseParaNuevaEspecifica.toISOString();
            }

            const updatedClientActividades = clienteInfo.actividades.map(act =>
                act.nombre === actividadAReiniciar.nombreActividad
                ? { ...act, fechaVencimientoActividad: nuevaFechaVencimientoActividadEspecifica }
                : act
            );

            const updatedClientPayload = {
                _id: clienteInfo._id,
                nombre: clienteInfo.nombre,
                actividades: updatedClientActividades
            };

            const nuevaInfoClasesPayload = {
                ...actividadAReiniciar,
                clasesPendientes: numClases,
                clasesEchas: 0,
                clasePrueba: false,
                ultimaActualizacion: new Date().toISOString(),
                fechaVencimientoActividad: nuevaFechaVencimientoActividadEspecifica
            };

            const [resInfoUpdate, resClientUpdate] = await Promise.all([
                fetch('/api/infoclases', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevaInfoClasesPayload) }),
                fetch(`/api/clientes?id=${clienteInfo._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedClientPayload) })
            ]);

            if (!resInfoUpdate.ok) {
                   const errorData = await resInfoUpdate.json().catch(() => ({ message: 'Error desconocido al actualizar infoclases' }));
                   throw new Error(errorData.message || 'Error al reiniciar clases en infoclases');
            }
            if (!resClientUpdate.ok) {
                const errorData = await resClientUpdate.json().catch(() => ({ message: 'Error desconocido al actualizar cliente' }));
                throw new Error(errorData.message || 'Error al actualizar datos del cliente (fechas)');
            }

            const [refreshedInfoClases, refreshedClientRes] = await Promise.all([
                fetchInfoClases(currentClienteDni),
                fetch(`/api/clientes?dni=${currentClienteDni}`)
            ]);

            const refreshedClientDataResponse = await refreshedClientRes.json();
            let refreshedClient = null;
            if (Array.isArray(refreshedClientDataResponse)) {
                refreshedClient = refreshedClientDataResponse.find(c => String(c.dni) === String(currentClienteDni));
            } else if (refreshedClientDataResponse && String(refreshedClientDataResponse.dni) === String(currentClienteDni)) {
                refreshedClient = refreshedClientDataResponse;
            }

            setInfoClases(refreshedInfoClases);
            if (refreshedClient) {
                setClienteInfo(refreshedClient);
            }

            const actividadActualizadaSeleccionada = refreshedInfoClases.find(info => info.nombreActividad === actividadAReiniciar.nombreActividad);
            setSelectedActivity(actividadActualizadaSeleccionada || null);

            if (refreshedInfoClases.length > 1) {
                setMultipleActivities(true);
            } else {
                setMultipleActivities(false);
            }

            setShowResetModal(false);
            setMensajeExito(`¡Clases reiniciadas! Se asignaron ${numClases} a ${actividadAReiniciar.nombreActividad}. Fechas actualizadas.`);
            setResetPassword(''); setClasesAAsignar(10); setResetError('');
            playSound('success');
        } catch (error) {
            setResetError(error.message || 'Error al reiniciar las clases');
            playSound('error');
        } finally {
            setResetting(false);
            restartInactivityTimer();
        }
    }, [
        multipleActivities, selectedActivity, infoClases, clienteInfo, resetPassword, clasesAAsignar,
        restartInactivityTimer, playSound, setResetError, setResetting, setMensajeExito, setError,
        setInfoClases, setClienteInfo, setSelectedActivity, setMultipleActivities, setShowResetModal,
        setResetPassword, setClasesAAsignar,
    ]);

    const calculateProgress = useCallback(() => {
        const actividadParaProgreso = selectedActivity || (!multipleActivities && infoClases.length === 1 ? infoClases[0] : null);
        if (!actividadParaProgreso || actividadParaProgreso.clasePrueba) return 0;
        const dueDateStatus = getActivityDueDateStatus(actividadParaProgreso);
        if (dueDateStatus.isOverdue) return 0;

        const clasesEchas = Number(actividadParaProgreso.clasesEchas) || 0;
        const clasesPendientes = Number(actividadParaProgreso.clasesPendientes) || 0;
        const totalClasesAsignadas = clasesEchas + clasesPendientes;
        if (totalClasesAsignadas === 0) return 0;
        const progreso = Math.round((clasesEchas / totalClasesAsignadas) * 100);
        return Math.max(0, Math.min(progreso, 100));
    }, [selectedActivity, multipleActivities, infoClases]);

    const handleSelectActivity = useCallback((event) => {
        const selectedNombre = event.target.value;
        const newSelected = infoClases.find(info => info.nombreActividad === selectedNombre);
        setSelectedActivity(newSelected);
        setError(null);
        setMensajeExito('');
        restartInactivityTimer();
    }, [infoClases, restartInactivityTimer, setSelectedActivity, setError, setMensajeExito]);

    const currentActivityDueDateStatus = selectedActivity ? getActivityDueDateStatus(selectedActivity) : { isOverdue: false, message: '' };
    const noClassesLeftForSelected = selectedActivity && selectedActivity.clasesPendientes <= 0 && !selectedActivity.clasePrueba;
    const showOverallAccessDeniedCard = clienteInfo && selectedActivity && (noClassesLeftForSelected || currentActivityDueDateStatus.isOverdue);

    let overallAccessDeniedMessage = '';
    if (showOverallAccessDeniedCard && selectedActivity) {
        if (currentActivityDueDateStatus.isOverdue && noClassesLeftForSelected) {
            overallAccessDeniedMessage = `${currentActivityDueDateStatus.message} Además, no tiene clases pendientes para ${selectedActivity.nombreActividad}.`;
        } else if (currentActivityDueDateStatus.isOverdue) {
            overallAccessDeniedMessage = currentActivityDueDateStatus.message;
        } else if (noClassesLeftForSelected) {
            overallAccessDeniedMessage = `No tiene clases pendientes para ${selectedActivity.nombreActividad}.`;
        }
    }
    
    useEffect(() => {
        if (showOverallAccessDeniedCard) {
            playSound('error');
        }
    }, [showOverallAccessDeniedCard, playSound]);

    // useEffect para sonido de advertencia de "Última Clase"
    useEffect(() => {
        if (
            selectedActivity &&
            !selectedActivity.clasePrueba &&
            selectedActivity.clasesPendientes === 1 &&
            !currentActivityDueDateStatus.isOverdue // Usar la variable ya calculada
        ) {
            playSoundNTimes(errorAudioRef, 1, 220); // Sonido de error una vez (o un sonido de advertencia dedicado)
        }
    }, [selectedActivity, currentActivityDueDateStatus, playSoundNTimes, errorAudioRef]);


    useEffect(() => {
        const handleGlobalKeyDown = (event) => {
            if (event.key !== 'Enter') {
                return; 
            }

            const activeElement = document.activeElement;
            const dniInputElement = dniInputRef.current?.querySelector('input');

            if (activeElement === dniInputElement) {
                return;
            }

            if (showResetModal) {
                const dialogElement = activeElement?.closest('.MuiDialog-root');
                if (dialogElement && dialogElement.contains(activeElement)) {
                    return;
                }
            }

            if (multipleActivities && activeElement && activeElement.type === 'radio' && activeElement.name === 'activity-selection-group') {
                return;
            }

            const activityForVerification = selectedActivity || (!multipleActivities && infoClases && infoClases.length === 1 ? infoClases[0] : null);

            if (clienteInfo && activityForVerification && !showOverallAccessDeniedCard) {
                const isVerificationPossible =
                    !verifying &&
                    !loading &&
                    !getActivityDueDateStatus(activityForVerification).isOverdue && // Re-chequear aquí por si acaso
                    !(activityForVerification.clasesPendientes <= 0 && !activityForVerification.clasePrueba);

                if (isVerificationPossible) {
                    verificarClase(activityForVerification);
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [
        clienteInfo, infoClases, selectedActivity, multipleActivities,
        loading, verifying, showResetModal, showOverallAccessDeniedCard,
        verificarClase, 
        dniInputRef, 
    ]);


    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <Head> <title>Verificación de Asistencia - Evolution FYT</title> </Head>
            <Box sx={{ position: 'fixed', zIndex: -2, inset: 0, background: 'radial-gradient(ellipse at 25% 30%, #aed58122 0%, #f5f5f5 70%, #f5f5f5 100%)', pointerEvents: 'none' }} />
            <motion.div style={{ position: 'fixed', zIndex: -1, inset: 0, pointerEvents: 'none' }} animate={{ scale: [1, 1.003, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} >
                <Box sx={{ height: '100%', width: '100%', background: 'repeating-radial-gradient(circle at 65% 10%, #81c78433 0 2px, transparent 4px 100px), repeating-radial-gradient(circle at 30% 80%, #64b5f614 0 2.5px, transparent 7px 120px)' }} />
            </motion.div>

            {/* Nuevo componente del reloj */}
            <ClockDisplay />

            <Container maxWidth="md" sx={{ py: { xs: 2, sm: 5 }, minHeight: '100vh' }}>
                <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                    <Paper elevation={10} sx={{ p: { xs: 3, sm: 5 }, mb: { xs: 4, sm: 5 }, borderRadius: '30px', textAlign: 'center', bgcolor: 'background.paper', border: '2px solid', borderColor: 'primary.main', boxShadow: `0 0 40px 8px ${alpha(lightTheme.palette.primary.main, 0.2)}, 0 2px 24px ${alpha(lightTheme.palette.primary.main, 0.2)}, 0 2px 2px ${alpha(lightTheme.palette.text.primary, 0.1)}` }}>
                        <motion.div animate={{ textShadow: ["0 0 5px rgba(103, 58, 183, 0.3)", "0 0 25px rgba(103, 58, 183, 0.5)", "0 0 5px rgba(103, 58, 183, 0.3)"] }} transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }} >
                            <Typography variant="h4" component="h1" gutterBottom sx={{ letterSpacing: '0.04em', fontWeight: 900, textTransform: 'uppercase', color: 'text.primary' }}> Verificación de Asistencia </Typography>
                        </motion.div>
                        <Divider sx={{ mb: 2, mx: 'auto', width: '50%', borderColor: 'primary.main', opacity: 0.4, borderBottomWidth: 3, borderRadius: 3, boxShadow: `0 1px 6px 0 ${alpha(lightTheme.palette.primary.main, 0.1)}` }} />
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, minHeight: '60px' }} dangerouslySetInnerHTML={{ __html: typedHtmlSubtitle }} />
                    </Paper>
                </motion.div>
                <motion.div variants={cardVariant} initial="hidden" animate="visible">
                    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '16px', mb: { xs: 3, sm: 4 }, bgcolor: 'background.paper' }}>
                        <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2.5, color: 'text.primary' }}>
                            <PersonSearchIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '2rem' }} /> Buscar Cliente
                        </Typography>
                        <Box component="form" onSubmit={buscarYVerificarCliente}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={8}>
                                    <TextField fullWidth label="DNI del Cliente" variant="outlined" type="tel" inputMode="numeric" value={dni} onChange={handleDniChange} required error={!!dniError} helperText={dniError} disabled={loading || verifying} inputRef={dniInputRef} InputProps={{ startAdornment: <InputAdornment position="start"> <UserIcon sx={{ color: 'text.secondary' }} /> </InputAdornment>, style: { color: lightTheme.palette.text.primary } }} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || verifying || !dni} startIcon={(loading) ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />} sx={{ height: '56px', boxShadow: !(loading || verifying) && dni ? `0 0 15px ${alpha(lightTheme.palette.primary.main, 0.6)}` : 'none', transition: 'transform 0.2s ease, box-shadow 0.2s', '&:hover': { transform: !(loading || verifying) && dni ? 'scale(1.03)' : 'none', boxShadow: !(loading || verifying) && dni ? `0 0 25px ${alpha(lightTheme.palette.primary.main, 0.8)}` : 'none', } }}>
                                        {loading ? 'Buscando...' : 'Buscar Cliente'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                        <AnimatePresence> {dniError && !loading && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}> <MuiAlert severity="error" sx={{ mt: 2 }} action={<IconButton aria-label="close" color="inherit" size="small" onClick={() => { setDniError(''); restartInactivityTimer(); }}> <XIcon fontSize="inherit" /> </IconButton> }>{dniError}</MuiAlert> </motion.div>)} </AnimatePresence>
                    </Paper>
                </motion.div>
                <AnimatePresence>
                    {clienteInfo && (
                        <motion.div variants={cardVariant} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.9 }}>
                            <Card elevation={4} sx={{ borderRadius: '20px', overflow: 'visible', mt: 0, bgcolor: 'background.paper', border: '1.5px solid', borderColor: alpha(lightTheme.palette.primary.main, 0.2) }}>
                                <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                                    <Box sx={{ p: 3, background: `linear-gradient(135deg, ${lightTheme.palette.background.paper} 0%, ${alpha(lightTheme.palette.primary.main, 0.05)} 60%, ${alpha(lightTheme.palette.primary.main, 0.1)} 120%)`, textAlign: 'center', borderBottom: '1.5px solid', borderColor: lightTheme.palette.divider }}>
                                        <motion.div whileHover={{ scale: 1.11, rotate: 2 }} transition={{ type: 'spring', stiffness: 300 }}>
                                            <Avatar alt={`${clienteInfo.nombre || ''} ${clienteInfo.apellido || ''}`} src={clienteInfo.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(clienteInfo.nombre || 'Cliente')}+${encodeURIComponent(clienteInfo.apellido || '')}&background=673ab7&color=ffffff&size=128&bold=true&font-size=0.4`} sx={{ width: 100, height: 100, margin: 'auto', mb: 1.5, border: `3px solid ${lightTheme.palette.primary.main}`, boxShadow: `0 0 15px ${alpha(lightTheme.palette.primary.main, 0.6)}` }} />
                                        </motion.div>
                                        <Typography variant="h5" component="h2" sx={{ color: 'text.primary', mb: 0.5 }}> {clienteInfo.nombre} {clienteInfo.apellido} </Typography>
                                        
                                        {clienteInfo.actividades && clienteInfo.actividades.length > 0 && (
                                            <Box mt={2} p={2} border={1} borderColor={alpha(lightTheme.palette.primary.main, 0.1)} borderRadius={2} sx={{bgcolor: alpha(lightTheme.palette.common.white, 0.25), mb: 2}}>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1.5, display:'block', textAlign:'left', borderBottom:1, borderColor: alpha(lightTheme.palette.primary.main, 0.2), pb:1 }}>
                                                    Vencimientos de Cuotas (Cliente):
                                                </Typography>
                                                <Stack spacing={1}>
                                                    {clienteInfo.actividades.map((act, idx) => {
                                                        const specificDueDate = act.fechaVencimientoActividad;
                                                        const isSpecificDateOverdue = specificDueDate ? isDateStringOverdue(specificDueDate) : null;
                                                        let dateTextToShow = "Sin fecha";
                                                        let chipColor = 'default';
                                                        let chipVariant = 'outlined';
                                                        let iconToShow = <EventAvailableIcon fontSize="inherit" sx={{opacity: 0.6}}/>;

                                                        if (specificDueDate) {
                                                            dateTextToShow = formatDate(specificDueDate);
                                                            if (isSpecificDateOverdue === true) {
                                                                chipColor = 'error'; chipVariant = 'filled'; iconToShow = <EventBusyIcon fontSize="inherit"/>;
                                                            } else if (isSpecificDateOverdue === false) {
                                                                chipColor = 'success'; chipVariant = 'filled'; iconToShow = <EventAvailableIcon fontSize="inherit"/>;
                                                            }
                                                        }
                                                        return (
                                                            <Box key={`${act.nombre}-${idx}-due-cliente`} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5}}>
                                                                <Typography variant="body2" sx={{ color: isSpecificDateOverdue === true ? 'error.main' : (isSpecificDateOverdue === false ? 'success.main' : 'text.secondary'), flexGrow: 1, textAlign:'left', mr: 1 }} title={act.nombre}>
                                                                    {act.nombre}
                                                                </Typography>
                                                                <Chip icon={iconToShow} label={dateTextToShow} color={chipColor} size="small" variant={chipVariant} sx={{fontSize:'0.8rem', height: '26px', '.MuiChip-icon': {fontSize: '1rem', ml: '6px', mr:'-4px'}, '.MuiChip-label': {pl: iconToShow ? '4px' : '10px', pr: '10px'}}} />
                                                            </Box>
                                                        );
                                                    })}
                                                </Stack>
                                            </Box>
                                        )}
                                        {infoClases.length === 0 && !loading && !verifying && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                                <Chip icon={<WarningAmberIcon fontSize="small" />} label="Sin actividades cargadas en el sistema para verificar" color="warning" size="medium" variant="filled" sx={{ mt: 1, fontWeight: 'medium' }} />
                                            </motion.div>
                                        )}
                                    </Box>

                                    {showOverallAccessDeniedCard && selectedActivity ? ( 
                                        <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', backgroundColor: alpha(lightTheme.palette.error.main, 0.08) }}>
                                            <BlockIcon sx={{ fontSize: 60, color: 'error.main', mb: 1 }} />
                                            <Typography variant="h6" color="error.main" gutterBottom> ¡ACCESO DENEGADO! </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}> {overallAccessDeniedMessage} </Typography>
                                            <Button variant="outlined" color="primary" onClick={() => {setShowResetModal(true); restartInactivityTimer();}} startIcon={<RefreshIcon />}> Contactar Administrador </Button>
                                        </Box>
                                        ) : (
                                            infoClases.length > 0 && (
                                                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                                                    {multipleActivities && (
                                                        <motion.div variants={fadeInUp}>
                                                            <Paper elevation={0} sx={{p: 2, mb: 3, border: '1.5px solid', borderColor: alpha(lightTheme.palette.primary.main, 0.32), backgroundColor: alpha(lightTheme.palette.primary.main, 0.05), borderRadius: '12px' }}>
                                                                <FormControl component="fieldset" fullWidth>
                                                                    <FormLabel component="legend" sx={{ mb: 1.5, fontWeight: 'bold', display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                                                                        <ListIcon sx={{ mr: 1 }} fontSize="small" /> Seleccione Actividad para Verificar:
                                                                    </FormLabel>
                                                                    <RadioGroup aria-label="activity-selection" name="activity-selection-group" value={selectedActivity?.nombreActividad || ''} onChange={handleSelectActivity}>
                                                                        {infoClases.map((info, index) => {
                                                                            const activityDueDateInfo = getActivityDueDateStatus(info);
                                                                            const isActivityDisabledByDate = activityDueDateInfo.isOverdue;
                                                                            const isActivityDisabledByClasses = info.clasesPendientes <= 0 && !info.clasePrueba;
                                                                            const isActivityDisabled = isActivityDisabledByDate || isActivityDisabledByClasses;
                                                                            
                                                                            let radioLabelColor = 'text.primary';
                                                                            let helperText = info.clasePrueba ? 'Clase de Prueba' : `${info.clasesPendientes} clases restantes`;
                                                                            let dateHelperText = '';

                                                                            if (info.fechaVencimientoActividad) {
                                                                                dateHelperText = ` (Vence: ${formatDate(info.fechaVencimientoActividad)})`;
                                                                            }

                                                                            if (isActivityDisabledByDate) {
                                                                                radioLabelColor = 'error.main';
                                                                                helperText = activityDueDateInfo.message;
                                                                            } else if (isActivityDisabledByClasses) {
                                                                                radioLabelColor = 'warning.main';
                                                                                helperText = `Sin clases para ${info.nombreActividad}${dateHelperText}`;
                                                                            } else {
                                                                                helperText += dateHelperText;
                                                                            }

                                                                            return (
                                                                                <MotionPaper key={index} variant="outlined" whileHover={!isActivityDisabled ? { scale: 1.03, x: 4, boxShadow: `0 0 12px ${alpha(lightTheme.palette.primary.main, 0.3)}` } : {}} transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                                                    sx={{ mb: 1, display: 'flex', alignItems: 'center', cursor: isActivityDisabled ? 'not-allowed' : 'pointer', borderRadius: '10px', borderColor: selectedActivity?.nombreActividad === info.nombreActividad ? 'primary.main' : lightTheme.palette.divider, backgroundColor: selectedActivity?.nombreActividad === info.nombreActividad ? alpha(lightTheme.palette.primary.main, 0.08) : (isActivityDisabled ? alpha(lightTheme.palette.text.secondary, 0.05) : 'transparent'), boxShadow: selectedActivity?.nombreActividad === info.nombreActividad ? `0 0 12px ${alpha(lightTheme.palette.primary.main, 0.3)}` : 'none', opacity: isActivityDisabled ? 0.6 : 1 }}>
                                                                                    <FormControlLabel value={info.nombreActividad} control={<Radio size="small" color="primary" />}
                                                                                        disabled={isActivityDisabled}
                                                                                        sx={{ flexGrow: 1, py: 1, pl: 1.5, m: 0 }}
                                                                                        label={<Box>
                                                                                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: radioLabelColor }}>{info.nombreActividad}</Typography>
                                                                                            <Typography variant="caption" sx={{ color: isActivityDisabled ? radioLabelColor : 'text.secondary', opacity: isActivityDisabled ? 0.8 : 1 }}>
                                                                                                {helperText}
                                                                                            </Typography>
                                                                                        </Box>}
                                                                                    />
                                                                                </MotionPaper>
                                                                            );
                                                                        })}
                                                                    </RadioGroup>
                                                                </FormControl>
                                                            </Paper>
                                                        </motion.div>
                                                    )}
                                                    {selectedActivity && (
                                                        <motion.div variants={fadeInUp}>
                                                            <Grid container spacing={2} sx={{ textAlign: 'center', mb: multipleActivities && selectedActivity ? 3 : 0 }}>
                                                                {[{icon: <DoneAllIcon sx={{ fontSize: 30, mb: 0.5, color: lightTheme.palette.success.main }} />, value: selectedActivity.clasesEchas || 0, label: 'Realizadas' }, { icon: <PendingActionsIcon sx={{ fontSize: 30, mb: 0.5, color: lightTheme.palette.warning.main }} />, value: selectedActivity.clasesPendientes || 0, label: 'Pendientes' }, { icon: <TrendingUpIcon sx={{ fontSize: 30, mb: 0.5, color: lightTheme.palette.primary.main }} />, value: selectedActivity.nombreActividad, label: 'Actividad', isText: true }].map((item, idx) => ( <Grid item xs={12} sm={4} key={idx}> <MotionPaper variant="outlined" whileHover={{ y: -7, scale: 1.04, boxShadow: `0px 10px 20px ${alpha(lightTheme.palette.primary.main, 0.14)}` }} transition={{ type: "spring", stiffness: 300 }} sx={{ p: 1.5, borderRadius: '12px', bgcolor: alpha(lightTheme.palette.primary.main, 0.03), border: `1px solid ${alpha(lightTheme.palette.primary.main, 0.22)}` }}> {item.icon} {item.isText ? <Typography variant="body2" sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.primary', height: '20px' }}>{item.value}</Typography> : <Typography variant="h6" sx={{ color: 'text.primary' }}>{item.value}</Typography>} <Typography variant="caption" color="text.secondary" display="block">{item.label}</Typography> </MotionPaper> </Grid> ))}
                                                            </Grid>
                                                            
                                                            {/* ADVERTENCIA DE ÚLTIMA CLASE */}
                                                            {selectedActivity && !selectedActivity.clasePrueba && selectedActivity.clasesPendientes === 1 && !currentActivityDueDateStatus.isOverdue && (
                                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                                                    <MuiAlert severity="warning" sx={{ mt: 2, mb: 1 }} icon={<WarningAmberIcon fontSize="inherit" />}>
                                                                        ¡Atención! Esta es la última clase pendiente para {selectedActivity.nombreActividad}.
                                                                    </MuiAlert>
                                                                </motion.div>
                                                            )}

                                                            {!selectedActivity.clasePrueba && (
                                                                <Box sx={{ mb: multipleActivities && selectedActivity ? 3 : 0, mt:2 }}>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                                                        <Typography variant="body2" color="text.secondary">Progreso Clases:</Typography>
                                                                        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'primary.main' }}> {`${calculateProgress()}%`} </Typography>
                                                                    </Box>
                                                                    <LinearProgress variant="determinate" value={calculateProgress()} sx={{ height: 12, borderRadius: 6, bgcolor: alpha(lightTheme.palette.text.secondary, 0.2), '& .MuiLinearProgress-bar': { borderRadius: 6 } }} color="primary" />
                                                                </Box>
                                                            )}
                                                            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 2 }}> Última Actualización (InfoClases): {formatDate(selectedActivity.ultimaActualizacion)} </Typography>
                                                        </motion.div>
                                                    )}
                                                    <AnimatePresence> 
                                                        {error && ( <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}> <MuiAlert severity="error" sx={{ mt: 2, mb: mensajeExito ? 1 : 0 }} action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => {setError(null); restartInactivityTimer();}}> <XIcon fontSize="inherit" /> </IconButton> }>{error}</MuiAlert> </motion.div> )} 
                                                        {mensajeExito && ( <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}> <MuiAlert severity="success" sx={{ mt: 2 }} icon={<CelebrationIcon fontSize="inherit" />} action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => {setMensajeExito(''); restartInactivityTimer();}}> <XIcon fontSize="inherit" /> </IconButton> }>{mensajeExito}</MuiAlert> </motion.div> )} 
                                                    </AnimatePresence>
                                                </Box>
                                            )
                                        )
                                    }
                                </CardContent>
                                {clienteInfo && infoClases.length > 0 && (selectedActivity || !multipleActivities) && !showOverallAccessDeniedCard && (
                                    <CardActions sx={{ justifyContent: 'center', p: 2.5, borderTop: '1px solid', borderColor: lightTheme.palette.divider, backgroundColor: alpha(lightTheme.palette.background.default, 0.5) }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            onClick={() => verificarClase()}
                                            disabled={
                                                verifying ||
                                                loading || 
                                                !selectedActivity || 
                                                getActivityDueDateStatus(selectedActivity).isOverdue || // Condición de bloqueo original
                                                (selectedActivity.clasesPendientes <= 0 && !selectedActivity.clasePrueba) // Condición de bloqueo original
                                            }
                                            startIcon={
                                                verifying
                                                    ? <CircularProgress size={20} color="inherit" />
                                                    : (
                                                        <motion.span
                                                            animate={{ scale: [1, 1.2, 1, 1.2, 1] }}
                                                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                                            style={{ display: 'inline-flex', alignItems: 'center' }}
                                                        >
                                                            <CheckIcon />
                                                        </motion.span>
                                                    )
                                            }
                                            sx={{
                                                minWidth: 220,
                                                fontWeight: 'bold',
                                                py: 1.5,
                                                boxShadow: `0 0 18px ${alpha(lightTheme.palette.primary.main, 0.7)}, 0 0 8px ${alpha(lightTheme.palette.primary.main, 0.9)}`,
                                                transition: 'transform 0.25s cubic-bezier(0.175,0.885,0.32,1.275), box-shadow 0.25s',
                                                '&:hover': {
                                                    transform: 'scale(1.07) rotate(1deg)',
                                                    boxShadow: `0 0 36px ${alpha(lightTheme.palette.primary.main, 0.88)}, 0 0 14px ${alpha(lightTheme.palette.primary.main, 1)}`
                                                },
                                                '&:disabled': { boxShadow: 'none' }
                                            }}
                                        >
                                            {verifying ? 'Verificando...' : `Verificar ${selectedActivity?.nombreActividad || 'Asistencia'}`}
                                        </Button>
                                    </CardActions>
                                )}
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Dialog open={showResetModal} onClose={() => { if(!resetting) setShowResetModal(false); restartInactivityTimer(); }} aria-labelledby="reset-dialog-title" PaperComponent={MotionPaper} PaperProps={{ variants: cardVariant, initial: "hidden", animate: "visible", exit: "hidden" }}>
                    <DialogTitle id="reset-dialog-title" sx={{ textAlign: 'center', pb: 1, color: 'error.main' }}>
                        <WarningAmberIcon color="error" sx={{ verticalAlign: 'middle', mr: 1 }} /> ACCESO DENEGADO O REINICIO
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2, textAlign: 'center', color: 'text.secondary' }}>
                            { overallAccessDeniedMessage || (selectedActivity && `${clienteInfo?.nombre || 'El cliente'} necesita regularizar la situación para ${selectedActivity.nombreActividad}.`) || "El cliente necesita regularizar su situación."}
                            <br/>
                            Ingrese la contraseña y el nuevo número de clases para asignar/regularizar.
                        </DialogContentText>
                        <AnimatePresence> {resetError && ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}> <MuiAlert severity="error" sx={{ mb: 2 }} action={ <IconButton aria-label="close" color="inherit" size="small" onClick={() => {setResetError(''); restartInactivityTimer();}}> <XIcon fontSize="inherit" /> </IconButton> }>{resetError}</MuiAlert> </motion.div> )} </AnimatePresence>
                        <TextField autoFocus margin="dense" id="admin-password" label="Contraseña Administrador" type="password" fullWidth variant="outlined" value={resetPassword} onChange={(e) => {setResetPassword(e.target.value); restartInactivityTimer();}} disabled={resetting} InputProps={{ startAdornment: <InputAdornment position="start"><PasswordIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }} sx={{ mb: 2 }} />
                        <TextField margin="dense" id="clases-asignar" label="Número de Clases a Asignar" type="number" fullWidth variant="outlined" value={clasesAAsignar} onChange={(e) => {setClasesAAsignar(e.target.value); restartInactivityTimer();}} disabled={resetting} InputProps={{ inputProps: { min: 1 }, startAdornment: <InputAdornment position="start"><ClassCountIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }} />
                    </DialogContent>
                    <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, borderTop: '1px solid', borderColor: lightTheme.palette.divider }}>
                        <Button onClick={() => {setShowResetModal(false); setResetError(''); restartInactivityTimer();}} disabled={resetting} startIcon={<CancelIcon />} sx={{ color: 'text.secondary' }}>Cancelar</Button>
                        <Button onClick={handleResetClasses} variant="contained" color="primary" disabled={resetting || !resetPassword || !clasesAAsignar} startIcon={resetting ? <CircularProgress size={16} /> : <RefreshIcon />} sx={{ boxShadow: `0 0 10px ${alpha(lightTheme.palette.primary.main, 0.5)}`, '&:hover': { boxShadow: `0 0 15px ${alpha(lightTheme.palette.primary.main, 0.8)}` } }}>
                            {resetting ? 'Reiniciando...' : 'Confirmar Reinicio'}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Box sx={{ 
    position: 'fixed', 
    bottom: { xs: 12, sm: 20 }, 
    right: { xs: 10, sm: 25 }, 
    zIndex: 200, 
    pointerEvents: 'none', 
    userSelect: 'none' 
}}>
    <motion.a 
        href="https://www.traninghub.net.ar" 
        target="_blank" 
        rel="noopener noreferrer"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        whileHover={{ scale: 1.05 }}
        style={{ 
            fontFamily: '"Montserrat", sans-serif', // Usar la misma fuente del tema
            fontWeight: 700,
            fontSize: '1rem',
            letterSpacing: '0.1em',
            color: lightTheme.palette.primary.main, // Color primario
            background: lightTheme.palette.background.paper, // Fondo blanco/pastel
            padding: '8px 22px',
            borderRadius: '4px',
            boxShadow: `0 0 8px ${alpha(lightTheme.palette.primary.main, 0.5)}`, // Sombra sutil
            textDecoration: 'none',
            textAlign: 'center',
            display: 'inline-block',
            border: `1px solid ${lightTheme.palette.primary.main}`, // Borde primario
            textTransform: 'uppercase',
            pointerEvents: 'auto' // Permitir interacción con el enlace
        }}
    >
        <span style={{ 
            fontFamily: '"Montserrat", sans-serif',
            fontWeight: 500,
            fontSize: '0.7em',
            letterSpacing: '0.2em',
            color: lightTheme.palette.secondary.main, // Color secundario para el ícono
            marginRight: 10,
            verticalAlign: 'middle'
        }}>
            ▶
        </span>
        Design by:
        WWW.TRAININGHUB.NET.AR
    </motion.a>
</Box>
            </Container>
        </ThemeProvider>
    );
}