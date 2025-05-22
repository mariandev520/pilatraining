import React, { useState, useEffect, useCallback, useMemo } from 'react'; 
import Head from 'next/head';
import Link from 'next/link';
import {
    Container, Box, Typography, Button, Grid, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert as MuiAlert, IconButton, Chip, Divider, Tooltip,
    ThemeProvider, createTheme, CssBaseline,
    Snackbar,
    TextField,
    InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
    EventNote as EventNoteIcon, FactCheckOutlined as FactCheckIcon, HistoryEduOutlined as HistoryIcon,
    DeleteForeverOutlined as DeleteForeverIcon, HowToRegOutlined as HowToRegIcon,
    CheckCircleOutline as CheckCircleOutlineIcon, PublishedWithChangesOutlined as PublishedWithChangesIcon,
    TaskAltOutlined as TaskAltOutlinedIcon, WarningAmberOutlined as WarningIcon, EventBusy as EventBusyIcon,
    SettingsApplications as SettingsApplicationsIcon, Refresh as RefreshIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    SearchOff as SearchOffIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { es } from 'date-fns/locale';
import { format as formatDateFns } from 'date-fns';

const DIAS_NOMBRES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};
const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
};
const MotionTableRow = motion(TableRow);

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#1976d2' }, // Azul clásico MUI
        secondary: { main: '#f50057' }, // Rosa intenso
        background: { default: '#f9fafb', paper: '#ffffff' }, // Fondo claro, blanco para papers
        text: { primary: '#222222', secondary: '#555555' }, // Texto oscuro y secundario
        info: { main: '#0288d1' }, // Azul info
        warning: { main: '#f9a825' }, // Amarillo dorado
        error: { main: '#d32f2f' }, // Rojo fuerte
        success: { main: '#388e3c' }, // Verde
        divider: 'rgba(0, 0, 0, 0.12)' // Separadores oscuros suaves
    },
    typography: {
        fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
        button: { textTransform: 'none' } // Botones sin mayúsculas forzadas
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)', // sombra ligera
                    borderRadius: 12,
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#e3f2fd', // Azul claro cabecera
                    fontWeight: 700,
                    color: '#0d47a1',
                    borderBottom: '2px solid #90caf9',
                    fontSize: '0.95rem'
                },
                body: {
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    fontSize: '0.9rem'
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                outlined: {
                    borderColor: '#1976d2',
                    '&:hover': {
                        backgroundColor: '#e3f2fd',
                        borderColor: '#1565c0'
                    }
                },
                containedPrimary: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                    }
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                outlined: {
                    backgroundColor: 'transparent',
                    fontWeight: 500,
                },
                outlinedPrimary: {
                    borderColor: '#1976d2',
                    color: '#1976d2',
                },
                outlinedSecondary: {
                    borderColor: '#f50057',
                    color: '#f50057',
                }
            }
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: '8px', fontWeight: 600 }
            }
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small'
            }
        }
    },
});


export default function VerificacionDiariaPage() {
    // Estados y funciones iguales a tu versión previa
    const [fecha, setFecha] = useState(new Date());
    const [clientesSinVerificar, setClientesSinVerificar] = useState([]);
    const [verifsHoy, setVerifsHoy] = useState({ presenciales:0, automaticas:0 });
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({registrar: null, borrar: null, borrarClienteActividad: null});
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [searchTerm, setSearchTerm] = useState('');

    const showSnackbar = (message, severity = 'info') => { setSnackbar({ open: true, message, severity }); };
    const handleCloseSnackbar = (event, reason) => { if (reason === 'clickaway') return; setSnackbar(prev => ({ ...prev, open: false })); };

    const diasToStr = useCallback(arr => (Array.isArray(arr) ? [...arr].sort((a,b)=>a-b).map(i => DIAS_NOMBRES[i]).join(', ') : '-'), []);

    const cargarDatos = useCallback(async (fechaSeleccionada) => {
        setLoading(true);
        setError(null);
        setActionLoading({registrar: null, borrar: null, borrarClienteActividad: null});

        try {
            if (!fechaSeleccionada || !(fechaSeleccionada instanceof Date) || isNaN(fechaSeleccionada.getTime())) {
                throw new Error("Fecha inválida seleccionada.");
            }
            
            const fechaQuery = fechaSeleccionada.toISOString();
            const s = new Date(fechaSeleccionada); s.setHours(0,0,0,0);
            const e = new Date(fechaSeleccionada); e.setHours(23,59,59,999);
            const since = new Date(s); since.setDate(s.getDate()-7);

            const [resC, resV, resH, resInfoClases] = await Promise.all([
                fetch(`/api/verificacion-diaria?fecha=${fechaQuery}`), 
                fetch(`/api/verificacion?desde=${s.toISOString()}&hasta=${e.toISOString()}`), 
                fetch(`/api/verificacion?desde=${since.toISOString()}&hasta=${e.toISOString()}`), 
                fetch('/api/infoclases')
            ]);

            if (!resV.ok) { throw new Error(`Error ${resV.status} cargando verificaciones.`); }
            const lv = await resV.json();
            setVerifsHoy({
                presenciales: (Array.isArray(lv) ? lv : []).filter(v=>v.metodoVerificacion==='presencial').length,
                automaticas:  (Array.isArray(lv) ? lv : []).filter(v=>v.metodoVerificacion==='automatica').length
            });

            if (!resH.ok) { throw new Error(`Error ${resH.status} cargando historial.`); }
            const historialDatos = await resH.json();
            setHistorial((Array.isArray(historialDatos) ? historialDatos : []).sort((a, b) => new Date(b.fechaVerificacion) - new Date(a.fechaVerificacion)));
            
            if (!resInfoClases.ok) { throw new Error(`Error ${resInfoClases.status} cargando datos de clases (infoclases).`); }
            const todasLasInfoclases = await resInfoClases.json();
            const safeInfoclases = Array.isArray(todasLasInfoclases) ? todasLasInfoclases : [];
            
            if (!resC.ok) { throw new Error(`Error ${resC.status} cargando clientes sin verificar.`); }
            const dc = await resC.json();
            const clientesBase = (Array.isArray(dc.clientesSinVerificar) ? dc.clientesSinVerificar : []);


            const clientesEnriquecidos = clientesBase.map(item => {
                const matchingInfoclase = safeInfoclases.find(
                    info => parseInt(info.dniCliente) === parseInt(item.cliente.dni) && 
                            info.nombreActividad === item.actividad
                );
                return {
                    ...item, 
                    diasVisita: matchingInfoclase?.diasVisita || [],
                    infoclaseId: matchingInfoclase?._id || null
                };
            }).sort((a, b) => a.cliente.nombre.localeCompare(b.cliente.nombre));

            setClientesSinVerificar(clientesEnriquecidos);

        } catch(e) {
            console.error("Error en cargarDatos:", e);
            setError(e.message);
            setClientesSinVerificar([]); setVerifsHoy({ presenciales:0, automaticas:0 }); setHistorial([]);
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        if(fecha && fecha instanceof Date && !isNaN(fecha.getTime())) { cargarDatos(fecha); } else { setError("Fecha inválida."); setLoading(false); }
    }, [fecha, cargarDatos]);

    const registrar = async (dni, act, nombreCliente, index) => {
        setActionLoading(prev => ({...prev, registrar: index})); setError(null); 
        try {
            const res = await fetch('/api/verificacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dniCliente: parseInt(dni), nombreCliente: nombreCliente, nombreActividad: act, metodoVerificacion: 'presencial', fechaVerificacion: fecha.toISOString() })
            });
            if (!res.ok) { const errData = await res.json().catch(() => ({message: "Error desconocido."})); throw new Error(errData.message || "Error al registrar."); } 
            showSnackbar(`Verificación para ${nombreCliente} (${act}) registrada.`, 'success'); 
            cargarDatos(fecha); 
        } catch(e) { 
            showSnackbar(e.message || "Error al registrar", 'error'); 
            setActionLoading(prev => ({...prev, registrar: null})); 
        }
    };
    
    const borrarVerificacion = async (id, index) => {
        if (!window.confirm("¿Eliminar esta verificación del historial?")) return; 
        setActionLoading(prev => ({...prev, borrar: index})); setError(null); 
        try { 
            const res = await fetch(`/api/verificacion?id=${id}`, { method: 'DELETE' }); 
            if (!res.ok) { const err = await res.json().catch(() => ({message: "Error desconocido."})); throw new Error(err.message || 'Error al eliminar.'); } 
            showSnackbar('Verificación eliminada.', 'success'); 
            cargarDatos(fecha); 
        } catch (e) { 
            console.error(e); showSnackbar(e.message || 'Error al eliminar', 'error'); 
            setActionLoading(prev => ({...prev, borrar: null})); 
        }
    };

    const handleBorrarClienteActividad = async (infoclaseId, nombreCliente, actividad, index) => {
        if (!infoclaseId) {
            showSnackbar("No se pudo identificar la inscripción para eliminar.", "error");
            return;
        }
        if (!window.confirm(`¿Está seguro de que desea eliminar la inscripción de ${nombreCliente} a la actividad "${actividad}"?`)) {
            return;
        }
        setActionLoading(prev => ({ ...prev, borrarClienteActividad: index }));
        setError(null);
        try {
            const res = await fetch(`/api/infoclases?id=${infoclaseId}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({ message: "Error desconocido al eliminar inscripción." }));
                throw new Error(errData.message || `Error ${res.status} al eliminar inscripción.`);
            }
            showSnackbar(`Inscripción de ${nombreCliente} a ${actividad} eliminada.`, 'success');
            cargarDatos(fecha); 
        } catch (e) {
            console.error("Error al eliminar inscripción:", e);
            showSnackbar(e.message || "Error al eliminar inscripción.", 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, borrarClienteActividad: null }));
        }
    };

    const formatHistorialDate = (dateString) => {
        try { return formatDateFns(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es }); } catch { return 'Fecha inválida'; }
    };

    const filteredClientesSinVerificar = useMemo(() => {
        if (!searchTerm) {
            return clientesSinVerificar;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return clientesSinVerificar.filter(item => {
            const nombreCliente = item.cliente?.nombre?.toLowerCase() || '';
            const dniCliente = item.cliente?.dni?.toString().toLowerCase() || '';
            const actividad = item.actividad?.toLowerCase() || '';

            return (
                nombreCliente.includes(lowerSearchTerm) ||
                dniCliente.includes(lowerSearchTerm) ||
                actividad.includes(lowerSearchTerm)
            );
        });
    }, [clientesSinVerificar, searchTerm]);

    return (
        <>
            <Head><title>Verificaciones Diarias - Dashboard</title></Head>
            <ThemeProvider theme={lightTheme}>
                <CssBaseline />
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                    <Container maxWidth="xl" sx={{ py: 4 }}>
                        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                            <Paper elevation={4} sx={{ p: {xs: 2, sm: 3}, mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                                    <EventNoteIcon sx={{ mr: 1.5, fontSize: {xs:'2rem', sm:'2.5rem'}, color: 'primary.main' }} />
                                    <Typography variant="h4" component="h1" sx={{fontWeight: 'bold', flexGrow: 1, fontSize: {xs:'1.8rem', sm:'2.2rem'}}}>
                                        Verificaciones Diarias
                                    </Typography>
                                    <DatePicker
                                        label="Seleccionar Fecha"
                                        value={fecha}
                                        onChange={(newDate) => { if (newDate && newDate instanceof Date && !isNaN(newDate.getTime())) setFecha(newDate); }}
                                        sx={{ minWidth: {xs:'100%', sm:'220px'} }}
                                        format="dd/MM/yyyy"
                                        slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
                                        maxDate={new Date()}
                                        disabled={loading || actionLoading.registrar !== null || actionLoading.borrar !== null || actionLoading.borrarClienteActividad !== null}
                                    />
                                    <Tooltip title="Ir a Verificaciones Automáticas">
                                        <Link href="/verificacionautomatica" passHref legacyBehavior>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                startIcon={<SettingsApplicationsIcon />}
                                                sx={{height: '40px'}}
                                                disabled={loading || actionLoading.registrar !== null || actionLoading.borrar !== null || actionLoading.borrarClienteActividad !== null}
                                            >
                                                Automáticas
                                            </Button>
                                        </Link>
                                    </Tooltip>
                                </Box>
                                <Divider sx={{ mb: 3, borderColor:'divider' }}/>
                                {loading && (
                                    <Box sx={{display: 'flex', justifyContent: 'center', py:2}}>
                                        <CircularProgress color="primary"/>
                                    </Box>
                                )}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <MuiAlert severity="error" variant="filled" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                                {error}
                                            </MuiAlert>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {!loading && !error && (
                                    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                                        <Grid container spacing={3} sx={{mb:3}}>
                                            <Grid item xs={12} sm={6}>
                                                <motion.div variants={fadeInUp}>
                                                    <Paper elevation={3} sx={{p:2.5, textAlign:'center', borderRadius:'12px', bgcolor: 'primary.light', color:'primary.contrastText'}}>
                                                        <FactCheckIcon sx={{fontSize: 45, mb:1, opacity: 0.85}}/>
                                                        <Typography variant="h6">Presenciales</Typography>
                                                        <Typography variant="h3" sx={{fontWeight:'bold'}}>{verifsHoy.presenciales}</Typography>
                                                    </Paper>
                                                </motion.div>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <motion.div variants={fadeInUp}>
                                                    <Paper elevation={3} sx={{p:2.5, textAlign:'center', borderRadius:'12px', bgcolor: 'secondary.light', color:'secondary.contrastText'}}>
                                                        <PublishedWithChangesIcon sx={{fontSize: 45, mb:1, opacity: 0.85}}/>
                                                        <Typography variant="h6">Automáticas</Typography>
                                                        <Typography variant="h3" sx={{fontWeight:'bold'}}>{verifsHoy.automaticas}</Typography>
                                                    </Paper>
                                                </motion.div>
                                            </Grid>
                                        </Grid>
                                    </motion.div>
                                )}
                            </Paper>
                        </motion.div>

                        {!loading && !error && (
                            <>
                                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', flexWrap:'wrap', gap:1, mb: 2, mt:2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                            <EventBusyIcon sx={{mr:1.5, fontSize: {xs:'1.8rem', sm:'2rem'}, color: 'warning.main'}} />
                                            <Typography variant="h5" component="h2" sx={{fontWeight: 'medium'}}>
                                                Clientes Pendientes ({ searchTerm ? filteredClientesSinVerificar.length : clientesSinVerificar.length})
                                                {searchTerm && (
                                                    <Typography component="span" variant="caption" sx={{ml:1, color: 'text.secondary'}}>
                                                        (Resultados para "{searchTerm}")
                                                    </Typography>
                                                )}
                                            </Typography>
                                        </Box>
                                        <Button
                                            size="small"
                                            variant="text"
                                            startIcon={<RefreshIcon />}
                                            onClick={() => {setSearchTerm(''); cargarDatos(fecha);}}
                                            disabled={loading || actionLoading.registrar !== null || actionLoading.borrar !== null || actionLoading.borrarClienteActividad !== null}
                                        >
                                            Refrescar Lista
                                        </Button>
                                    </Box>

                                    <Paper elevation={2} sx={{ p: {xs:1.5, sm:2}, mb: 3, borderRadius: '12px', backgroundColor: 'background.paper' }}>
                                        <TextField
                                            fullWidth
                                            label="Buscar por DNI, Nombre Cliente o Actividad"
                                            placeholder="Escriba para buscar..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: 'text.secondary' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: searchTerm && (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setSearchTerm('')} size="small" edge="end">
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Paper>

                                    {filteredClientesSinVerificar.length > 0 ? (
                                        <TableContainer component={Paper} elevation={3} sx={{borderRadius: '12px', mb:4}}>
                                            <Table sx={{ minWidth: 750 }} aria-label="clientes sin verificar">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Cliente (DNI)</TableCell>
                                                        <TableCell>Actividad</TableCell>
                                                        <TableCell align="center">Días sin Verif.</TableCell>
                                                        <TableCell>Días de Visita</TableCell>
                                                        <TableCell align="center">Registrar Asistencia</TableCell>
                                                        <TableCell align="center">Acciones</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <AnimatePresence>
                                                        {filteredClientesSinVerificar.map((item, i) => (
                                                            <MotionTableRow
                                                                key={`${item.cliente.dni}-${item.actividad}-${item.infoclaseId || i}`}
                                                                layout
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0, x: -30 }}
                                                                hover
                                                                sx={{
                                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                                    '&:hover': {backgroundColor: 'action.hover'}
                                                                }}
                                                            >
                                                                <TableCell>{item.cliente.nombre} ({item.cliente.dni})</TableCell>
                                                                <TableCell><Chip label={item.actividad} color="primary" variant="outlined" size="small"/></TableCell>
                                                                <TableCell align="center">
                                                                    <Tooltip title={`${item.diasSinVerificar} día(s) desde la última verificación o inicio semana.`}>
                                                                        <Chip
                                                                            label={item.diasSinVerificar}
                                                                            color={item.diasSinVerificar > 3 ? "error" : item.diasSinVerificar > 0 ? "warning" : "default"}
                                                                            size="small"
                                                                            icon={item.diasSinVerificar > 0 ? <WarningIcon fontSize='small'/> : undefined}
                                                                            variant="filled"
                                                                        />
                                                                    </Tooltip>
                                                                </TableCell>
                                                                <TableCell sx={{fontSize: '0.8rem', fontStyle:'italic', color:'text.secondary'}}>
                                                                    {diasToStr(item.diasVisita)}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Button
                                                                        variant="contained"
                                                                        color="primary"
                                                                        size="small"
                                                                        startIcon={actionLoading.registrar === i ? <CircularProgress size={16} color="inherit"/> : <TaskAltOutlinedIcon />}
                                                                        disabled={actionLoading.registrar !== null || actionLoading.borrarClienteActividad !== null}
                                                                        onClick={() => registrar(item.cliente.dni, item.actividad, item.cliente.nombre, i)}
                                                                    >
                                                                        {actionLoading.registrar === i ? 'Reg...' : 'Registrar'}
                                                                    </Button>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Tooltip title={`Eliminar inscripción de ${item.cliente.nombre} a ${item.actividad}`}>
                                                                        <span>
                                                                            <IconButton
                                                                                color="error"
                                                                                size="small"
                                                                                onClick={() => handleBorrarClienteActividad(item.infoclaseId, item.cliente.nombre, item.actividad, i)}
                                                                                disabled={!item.infoclaseId || actionLoading.borrarClienteActividad !== null || actionLoading.registrar !== null}
                                                                            >
                                                                                {actionLoading.borrarClienteActividad === i ? <CircularProgress size={18} color="inherit"/> : <DeleteForeverIcon fontSize="small"/>}
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </MotionTableRow>
                                                        ))}
                                                    </AnimatePresence>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : searchTerm && clientesSinVerificar.length > 0 ? (
                                        <Paper elevation={0} sx={{p:3, textAlign:'center', mt:2, borderRadius:'8px', border: '1px dashed', borderColor:'divider', mb:4}}>
                                            <SearchOffIcon sx={{fontSize: 48, color: 'text.secondary', mb:1}}/>
                                            <Typography color="text.secondary">No se encontraron clientes que coincidan con "{searchTerm}".</Typography>
                                        </Paper>
                                    ) : !searchTerm && clientesSinVerificar.length === 0 ? (
                                        <Paper elevation={0} sx={{p:3, textAlign:'center', mt:2, borderRadius:'8px', border: '1px dashed', borderColor:'divider', mb:4}}>
                                            <CheckCircleOutlineIcon sx={{fontSize: 48, color: 'success.light', mb:1}}/>
                                            <Typography color="text.secondary">¡Todo en orden! No hay clientes pendientes para hoy.</Typography>
                                        </Paper>
                                    ) : null}
                                </motion.div>

                                <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
                                        <HistoryIcon sx={{mr:1.5, fontSize: {xs:'1.8rem', sm:'2rem'}, color: 'text.secondary'}} />
                                        <Typography variant="h5" component="h2" sx={{fontWeight: 'medium'}}> Historial (Últimos 7 Días) </Typography>
                                    </Box>
                                    {historial.length > 0 ? (
                                        <TableContainer component={Paper} elevation={3} sx={{borderRadius: '12px'}}>
                                            <Table sx={{ minWidth: 650 }} aria-label="historial de verificaciones" size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Fecha y Hora</TableCell>
                                                        <TableCell>Cliente</TableCell>
                                                        <TableCell>Actividad</TableCell>
                                                        <TableCell>Tipo</TableCell>
                                                        <TableCell align="center">Acción</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <AnimatePresence>
                                                        {historial.map((v, i) => (
                                                            <MotionTableRow
                                                                key={v._id || i}
                                                                layout
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0, x: -30 }}
                                                                hover
                                                                sx={{
                                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                                    '&:hover': {backgroundColor: 'action.hover'}
                                                                }}
                                                            >
                                                                <TableCell>{formatHistorialDate(v.fechaVerificacion)}</TableCell>
                                                                <TableCell>{v.nombreCliente || v.cliente?.nombre || '–'}</TableCell>
                                                                <TableCell><Chip label={v.nombreActividad} variant="outlined" size="small"/></TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={v.metodoVerificacion}
                                                                        color={v.metodoVerificacion === 'presencial' ? 'success' : 'info'}
                                                                        size="small"
                                                                        variant="filled"
                                                                        icon={v.metodoVerificacion === 'presencial' ? <HowToRegIcon fontSize="inherit"/> : <PublishedWithChangesIcon fontSize="inherit"/>}
                                                                        sx={{fontSize:'0.75rem', height: '24px'}}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Tooltip title="Eliminar Verificación">
                                                                        <span>
                                                                            <IconButton
                                                                                color="error"
                                                                                size="small"
                                                                                onClick={() => borrarVerificacion(v._id, i)}
                                                                                disabled={actionLoading.borrar !== null || actionLoading.borrarClienteActividad !== null}
                                                                            >
                                                                                {actionLoading.borrar === i ? <CircularProgress size={18} color="inherit"/> : <DeleteForeverIcon fontSize="small"/>}
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </MotionTableRow>
                                                        ))}
                                                    </AnimatePresence>
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Paper elevation={0} sx={{p:3, textAlign:'center', mt:2, borderRadius:'8px', border: '1px dashed', borderColor:'divider'}}>
                                            <Typography color="text.secondary">No hay historial reciente.</Typography>
                                        </Paper>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </Container>
                </LocalizationProvider>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <MuiAlert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity || 'info'}
                        sx={{ width: '100%' }}
                        elevation={6}
                        variant="filled"
                    >
                        {snackbar.message}
                    </MuiAlert>
                </Snackbar>
            </ThemeProvider>
        </>
    );
}
