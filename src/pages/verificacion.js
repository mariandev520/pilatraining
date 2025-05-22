// pages/verificacion.js 
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
    Container, Box, Typography, TextField, Button, Grid, Paper, Card, CardContent, CardActions,
    CircularProgress, LinearProgress, Alert as MuiAlert, IconButton, Select, MenuItem, InputLabel,
    FormControl, FormGroup, FormControlLabel, Checkbox, Divider, Chip, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, InputAdornment,
    RadioGroup, Radio, FormLabel, Collapse, Tooltip
} from '@mui/material';
import {
    // Íconos usados en VerificacionPage
    PersonSearch as PersonSearchIcon,
    PersonOutline as UserIcon,
    Search as SearchIcon,
    ChevronRight as ChevronRightIcon, // (No se usa en botón final, pero por si acaso)
    ErrorOutline as ErrorOutlineIcon, // Para Alertas de error
    CheckCircleOutline as CheckCircleIcon, // Para botón Verificar Asistencia
    StarBorder as StarIcon,
    Refresh as RefreshIcon,
    Block as BlockIcon,               // Para estado 'Sin Clases'
    WarningAmber as WarningAmberIcon, // Para estado 'Pocas Clases', título Dialog y Chip 'Sin Clases'
    VerifiedUserOutlined as ShieldIcon,
    ListAlt as ListIcon,
    DoneAll as DoneAllIcon,
    PendingActions as PendingActionsIcon,
    TrendingUp as TrendingUpIcon,
    Celebration as CelebrationIcon,
    Password as PasswordIcon,
    FormatListNumbered as ClassCountIcon,
    Cancel as CancelIcon,
    Close as XIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// --- Animaciones ---
const fadeInUp = { /* ... */
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};
const cardVariant = { /* ... */
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
};
const MotionPaper = motion(Paper);

// --- Estado Inicial ---
// const initialActivityState = { ... }; // No usado directamente aquí
const initialFormState = {
    _id: null, dni: '', nombre: '', correo: '', direccion: '', telefono: '',
    actividades: [{ nombre: '', tarifa: '', clasesPendientes: '', profesor: '', diasVisita: [] }]
};

// --- Componente Principal ---
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

    // Carga de fuentes (Mejor globalmente)
    useEffect(() => {
        const fonts = ['Playfair Display:wght@400;700', 'Montserrat:wght@300;400;500;600;700'];
        const fontLink = document.createElement('link');
        fontLink.href = `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`;
        fontLink.rel = 'stylesheet';
        if (!document.querySelector(`link[href="${fontLink.href}"]`)) {
            document.head.appendChild(fontLink);
        }
    }, []);

    const handleDniChange = (e) => { /* ... sin cambios ... */ 
        setDni(e.target.value.replace(/\D/g, '')); 
        setInfoClases([]); setClienteInfo(null); setError(null); setDniError('');
        setMensajeExito(''); setSelectedActivity(null); setMultipleActivities(false);
    };

    const buscarInfoClases = async (e) => { /* ... sin cambios ... */ 
        if (e) e.preventDefault();
        if (!dni) { setDniError('Por favor, ingrese un DNI'); return; }
        setLoading(true); setError(null); setDniError(''); setClienteInfo(null);
        setInfoClases([]); setMensajeExito(''); setSelectedActivity(null); setMultipleActivities(false);
        try {
            const clienteRes = await fetch(`/api/clientes?dni=${dni}`);
             if (!clienteRes.ok) { const errData = await clienteRes.json().catch(() => ({})); throw new Error(errData.message || `Error ${clienteRes.status} buscando cliente`); }
            const clienteData = await clienteRes.json();
             const foundClient = Array.isArray(clienteData) ? clienteData.find(c => parseInt(c.dni) === parseInt(dni)) : null;
            if (!foundClient) { setDniError('DNI no registrado'); setLoading(false); return; }
            setClienteInfo(foundClient); // <<< Establecer clienteInfo aquí aunque no tenga clases
            const response = await fetch(`/api/infoclases?dniCliente=${dni}`);
             if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData.message || `Error ${response.status} buscando clases`); }
            const data = await response.json();
            const infosClase = Array.isArray(data) ? data.filter(info => parseInt(info.dniCliente) === parseInt(dni)) : [];
            if (infosClase && infosClase.length > 0) {
                setInfoClases(infosClase);
                if (infosClase.length > 1) { setMultipleActivities(true); } 
                else { setMultipleActivities(false); setSelectedActivity(infosClase[0]); }
            } else { 
                // Cliente existe pero CERO infoclases
                setInfoClases([]); // Asegurar que infoClases esté vacío
                // No establecer error aquí, simplemente no hay clases que mostrar/verificar
                // setError('Cliente encontrado, pero sin clases/actividades registradas.'); 
            }
        } catch (error) { console.error('Error al buscar información:', error); setError(error.message || 'Error al buscar información'); setClienteInfo(null); setInfoClases([]);
        } finally { setLoading(false); }
    };

    const verificarClase = async () => { /* ... sin cambios ... */ 
        if (multipleActivities && !selectedActivity) { setError('Por favor, seleccione una actividad para verificar.'); return; }
        const actividadAVerificar = selectedActivity || (infoClases.length === 1 ? infoClases[0] : null);
        if (!actividadAVerificar) { setError('No se puede verificar. Falta información de la actividad.'); return; }
        setVerifying(true); setError(null); setMensajeExito('');
        try {
            const esPrueba = actividadAVerificar.clasePrueba;
            const endpointVerificacion = '/api/verificacion'; const endpointInfoClases = '/api/infoclases';
            let nuevaInfoClases; let verificationPayload;
            if (esPrueba) {
                 nuevaInfoClases = { ...actividadAVerificar, clasePrueba: false, ultimaActualizacion: new Date().toISOString(), verificacionesSemana: (actividadAVerificar.verificacionesSemana || 0) + 1 };
                 verificationPayload = { dniCliente: parseInt(dni), nombreCliente: clienteInfo?.nombre || '', metodoVerificacion: 'presencial', tipo: 'clase_prueba', nombreActividad: actividadAVerificar.nombreActividad };
            } else {
                if (actividadAVerificar.clasesPendientes <= 0) { setShowResetModal(true); setVerifying(false); return; }
                 nuevaInfoClases = { ...actividadAVerificar, dniCliente: parseInt(dni), clasesPendientes: actividadAVerificar.clasesPendientes - 1, clasesEchas: (actividadAVerificar.clasesEchas || 0) + 1, verificacionesSemana: (actividadAVerificar.verificacionesSemana || 0) + 1, ultimaActualizacion: new Date().toISOString() };
                 verificationPayload = { dniCliente: parseInt(dni), nombreCliente: clienteInfo?.nombre || '', metodoVerificacion: 'presencial', tipo: 'clase_regular', nombreActividad: actividadAVerificar.nombreActividad };
            }
            const [resVerif, resInfoUpdate] = await Promise.all([
                fetch(endpointVerificacion, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(verificationPayload) }),
                fetch(endpointInfoClases, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(nuevaInfoClases) })
            ]);
            if (!resVerif.ok || !resInfoUpdate.ok) {
                const errVerif = resVerif.ok ? null : await resVerif.json().catch(()=>({message:"Error registrando verificación."}));
                const errInfo = resInfoUpdate.ok ? null : await resInfoUpdate.json().catch(()=>({message:"Error actualizando estado de clases."}));
                throw new Error(errInfo?.message || errVerif?.message || 'Error en una de las operaciones de verificación.');
            }
            const updatedInfoClases = infoClases.map(info => info.nombreActividad === actividadAVerificar.nombreActividad ? nuevaInfoClases : info);
            setInfoClases(updatedInfoClases); setSelectedActivity(nuevaInfoClases); 
            setMensajeExito(esPrueba ? `¡Clase de prueba para ${actividadAVerificar.nombreActividad} utilizada!` : `¡Asistencia para ${actividadAVerificar.nombreActividad} registrada!`);
        } catch (error) { console.error('Error al verificar clase:', error); setError(error.message || 'Error al registrar la verificación');
        } finally { setVerifying(false); }
    };

    const handleResetClasses = async () => { /* ... sin cambios ... */ 
        if (multipleActivities && !selectedActivity) { setResetError('Seleccione una actividad para reiniciar.'); return; }
        const actividadAReiniciar = selectedActivity || (infoClases.length === 1 ? infoClases[0] : null);
        if (!actividadAReiniciar) { setResetError('No se puede reiniciar. Falta información.'); return; }
        if (resetPassword !== '0716') { setResetError('Contraseña incorrecta'); return; } 
        const numClases = parseInt(clasesAAsignar);
        if (isNaN(numClases) || numClases <= 0) { setResetError('Ingrese un número válido de clases (mayor a 0)'); return; }
        setResetting(true); setResetError(''); setMensajeExito(''); setError(null);
        try {
            const nuevaInfoClases = { ...actividadAReiniciar, clasesPendientes: numClases, clasesEchas: 0, clasePrueba: false, ultimaActualizacion: new Date().toISOString() };
            const res = await fetch('/api/infoclases', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(nuevaInfoClases) });
            if (!res.ok) { const errData = await res.json().catch(()=>({message:"Error desconocido."})); throw new Error(errData.message || 'Error al reiniciar las clases'); }
            const updatedInfoClases = infoClases.map(info => info.nombreActividad === actividadAReiniciar.nombreActividad ? nuevaInfoClases : info);
            setInfoClases(updatedInfoClases); setSelectedActivity(nuevaInfoClases); setShowResetModal(false);
            setMensajeExito(`¡Clases reiniciadas! Se asignaron ${numClases} a ${actividadAReiniciar.nombreActividad}.`);
            setResetPassword(''); setClasesAAsignar(10); setResetError('');
        } catch (error) { console.error('Error al reiniciar clases:', error); setResetError(error.message || 'Error al reiniciar las clases');
        } finally { setResetting(false); }
    };

    const calculateProgress = () => { /* ... sin cambios ... */ 
        const actividad = selectedActivity || (infoClases.length === 1 ? infoClases[0] : null);
        if (!actividad || actividad.clasePrueba || actividad.clasesPendientes + (actividad.clasesEchas || 0) === 0) return 0;
        const total = (actividad.clasesEchas || 0) + actividad.clasesPendientes;
        return Math.round(((actividad.clasesEchas || 0) / total) * 100);
    };

    const getClientStatus = () => { /* ... Usa WarningAmberIcon ... */ 
        const actividad = selectedActivity || (infoClases.length === 1 ? infoClases[0] : null);
        if (!actividad) return null;
        if (actividad.clasePrueba) return { label: 'Clase de Prueba', icon: <StarIcon fontSize="inherit"/>, color: 'secondary' };
        if (actividad.clasesPendientes <= 0) return { label: 'Sin Clases', icon: <BlockIcon fontSize="inherit"/>, color: 'error' }; // Usar BlockIcon
        if (actividad.clasesPendientes === 1) return { label: 'Última clase', icon: <WarningAmberIcon fontSize="inherit"/>, color: 'warning' };
        if (actividad.clasesPendientes <= 3) return { label: `Quedan ${actividad.clasesPendientes}`, icon: <WarningAmberIcon fontSize="inherit"/>, color: 'warning' };
        return { label: 'Activo', icon: <ShieldIcon fontSize="inherit"/>, color: 'success' };
    };
    const clientStatus = getClientStatus();

    const formatDate = (dateString) => { /* ... sin cambios ... */ 
        if (!dateString) return 'N/A';
        try { const date = new Date(dateString); if (isNaN(date.getTime())) return 'Fecha Inválida'; return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (e) { return 'Error Fecha'; }
    };

    const handleSelectActivity = (event) => { /* ... sin cambios ... */ 
        const selectedNombre = event.target.value;
        const newSelected = infoClases.find(info => info.nombreActividad === selectedNombre);
        setSelectedActivity(newSelected); setError(null); setMensajeExito('');
    };

    return (
        <>
            <Head>
                <title>Verificación de Asistencia - Evolution FYT</title>
            </Head>
            <Container maxWidth="md" sx={{ py: 4 }}>
                <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                    <Paper elevation={3} sx={{ p: {xs:2, sm:3}, mb: 4, borderRadius: '12px', textAlign: 'center' }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700 }}>
                            Verificación de Asistencia
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ fontFamily: '"Montserrat", sans-serif', mb: 2 }}>
                            Control de clases para clientes de Evolution FYT
                        </Typography>
                    </Paper>
                </motion.div>

                {/* --- Búsqueda --- */}
                <motion.div variants={cardVariant} initial="hidden" animate="visible">
                <Paper elevation={3} sx={{ p: {xs:2, sm:3}, borderRadius: '12px', mb: 4 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{display: 'flex', alignItems:'center', mb:2}}>
                        <PersonSearchIcon sx={{mr:1, color:'primary.main'}}/> Buscar Cliente
                    </Typography>
                    <Box component="form" onSubmit={buscarInfoClases}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={8}>
                                <TextField fullWidth label="DNI del Cliente" variant="outlined" type="tel" value={dni} onChange={handleDniChange} required error={!!dniError} helperText={dniError} disabled={loading}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><UserIcon /></InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Button type="submit" variant="contained" fullWidth size="large" disabled={loading || !dni} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />} sx={{ height: '56px' }} >
                                    {loading ? 'Buscando...' : 'Buscar'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                     <AnimatePresence>
                        {error && ( // Mostrar error de búsqueda aquí
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                <MuiAlert severity="error" sx={{ mt: 2, borderRadius:'8px' }} onClose={() => setError(null)}>{error}</MuiAlert>
                            </motion.div>
                        )}
                     </AnimatePresence>
                </Paper>
                </motion.div>

                {/* --- Resultados y Acciones --- */}
                <AnimatePresence>
                {(clienteInfo) && (
                     <motion.div variants={cardVariant} initial="hidden" animate="visible" exit={{opacity:0, scale: 0.9}}>
                     <Card elevation={4} sx={{ borderRadius: '12px', overflow: 'visible', mt: 4 }}>
                         <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                            <Box sx={{ p: 3, background: 'linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)', textAlign: 'center' }}>
                                <Avatar alt={`${clienteInfo.nombre || ''} ${clienteInfo.apellido || ''}`} src={clienteInfo.fotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(clienteInfo.nombre)}+${encodeURIComponent(clienteInfo.apellido)}&background=random&size=128`} sx={{ width: 100, height: 100, margin: 'auto', mb: 2, border: '3px solid white', boxShadow: 3 }} />
                                <Typography variant="h5" component="h2" gutterBottom sx={{fontWeight:'medium'}}>
                                    {clienteInfo.nombre} {clienteInfo.apellido}
                                </Typography>
                                {infoClases.length > 0 && clientStatus && ( <Chip icon={React.cloneElement(clientStatus.icon, {fontSize: 'small'})} label={clientStatus.label} color={clientStatus.color} size="medium" variant="filled" sx={{ mt: 1, fontWeight: 'medium' }} /> )}
                                {/* CORRECCIÓN AQUÍ: Usar WarningAmberIcon */}
                                {infoClases.length === 0 && !error && ( <Chip icon={<WarningAmberIcon fontSize="small"/>} label="Sin clases/actividades" color="warning" size="medium" variant="filled" sx={{ mt: 1, fontWeight: 'medium' }} /> )}
                                {/* Mostrar error si la búsqueda de clases falló (pero el cliente se encontró) */}
                                {error && infoClases.length === 0 && ( <Chip icon={<ErrorOutlineIcon fontSize="small"/>} label={error} color="error" size="medium" variant="filled" sx={{ mt: 1, fontWeight: 'medium' }} /> )}
                            </Box>
                             {infoClases.length > 0 && ( // Solo mostrar sección de clases si existen
                                <Box sx={{p: {xs:2, sm:3}}}>
                                    {multipleActivities && ( /* ... Sección de selección de actividad ... */
                                        <motion.div variants={fadeInUp}>
                                        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'info.light', backgroundColor: 'info.lighter', borderRadius:'8px' }}>
                                            <FormControl component="fieldset" fullWidth>
                                            <FormLabel component="legend" sx={{mb:1, fontWeight:'medium', display:'flex', alignItems:'center'}}> <ListIcon sx={{mr:0.5}} fontSize="small"/> Seleccione Actividad:</FormLabel>
                                            <RadioGroup aria-label="activity-selection" name="activity-selection-group" value={selectedActivity?.nombreActividad || ''} onChange={handleSelectActivity} >
                                                {infoClases.map((info, index) => (
                                                <Paper key={index} variant="outlined" onClick={() => {setSelectedActivity(info); setError(null); setMensajeExito('');}}
                                                    sx={{ mb: 1, display: 'flex', alignItems: 'center', cursor:'pointer', borderRadius: '8px',
                                                        borderColor: selectedActivity?.nombreActividad === info.nombreActividad ? 'primary.main' : 'grey.300',
                                                        backgroundColor: selectedActivity?.nombreActividad === info.nombreActividad ? 'action.selected' : 'transparent',
                                                        '&:hover': { backgroundColor: 'action.hover'} }}>
                                                <FormControlLabel value={info.nombreActividad} control={<Radio size="small"/>} sx={{flexGrow:1, py:0.5, pl:1, m:0}}
                                                    label={ <Box> <Typography variant="body1" sx={{fontWeight:'medium'}}>{info.nombreActividad}</Typography> <Typography variant="caption" color="text.secondary"> {info.clasePrueba ? 'Clase de Prueba' : `${info.clasesPendientes} clases restantes`} </Typography> </Box> }
                                                />
                                                </Paper>
                                                ))}
                                            </RadioGroup>
                                            </FormControl>
                                        </Paper>
                                        </motion.div>
                                     )}
                                    {(selectedActivity || !multipleActivities) && ( /* ... Sección de estadísticas y progreso ... */
                                        <motion.div variants={fadeInUp}>
                                        <Grid container spacing={2.5} sx={{ textAlign: 'center', mb: 3 }}>
                                            <Grid item xs={4}>
                                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius:'8px' }}>
                                                    <DoneAllIcon color="success" sx={{ fontSize: 30, mb: 0.5 }} />
                                                    <Typography variant="h6">{selectedActivity?.clasesEchas ?? infoClases[0]?.clasesEchas ?? 0}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">Realizadas</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={4}>
                                                 <Paper variant="outlined" sx={{ p: 1.5, borderRadius:'8px' }}>
                                                    <PendingActionsIcon color={clientStatus?.color === 'error' || clientStatus?.color === 'warning' ? clientStatus.color : 'info'} sx={{ fontSize: 30, mb: 0.5 }} />
                                                    <Typography variant="h6">{selectedActivity?.clasesPendientes ?? infoClases[0]?.clasesPendientes ?? 0}</Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">Pendientes</Typography>
                                                </Paper>
                                            </Grid>
                                            <Grid item xs={4}>
                                                 <Paper variant="outlined" sx={{ p: 1.5, borderRadius:'8px' }}>
                                                    <TrendingUpIcon color="primary" sx={{ fontSize: 30, mb: 0.5 }} />
                                                    <Typography variant="body2" sx={{ fontWeight:'medium', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {selectedActivity?.nombreActividad ?? infoClases[0]?.nombreActividad}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" display="block">Actividad</Typography>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                        {!(selectedActivity?.clasePrueba ?? infoClases[0]?.clasePrueba) && (
                                            <Box sx={{ mb: 3 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', mb: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary">Progreso Clases:</Typography>
                                                    <Typography variant="body2" sx={{fontWeight:'medium'}}>{`${calculateProgress()}%`}</Typography>
                                                </Box>
                                                <LinearProgress variant="determinate" value={calculateProgress()} sx={{ height: 10, borderRadius: 5 }} color={clientStatus?.color || 'primary'} />
                                            </Box>
                                        )}
                                        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary', mt: 2 }}>
                                             Última Act: {formatDate(selectedActivity?.ultimaActualizacion ?? infoClases[0]?.ultimaActualizacion)}
                                        </Typography>
                                        </motion.div>
                                    )}
                                    <AnimatePresence>
                                        {mensajeExito && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                                <MuiAlert severity="success" sx={{ mt: 2, borderRadius:'8px' }} icon={<CelebrationIcon fontSize="inherit"/>} onClose={()=>setMensajeExito('')}>{mensajeExito}</MuiAlert>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Box>
                             )} 
                         </CardContent>
                         {infoClases.length > 0 && (selectedActivity || !multipleActivities) && (
                         <CardActions sx={{ justifyContent: 'center', p: 2.5, borderTop: '1px solid', borderColor: 'divider', backgroundColor:'grey.50' }}>
                             <Button variant="contained" color="primary" size="large" onClick={verificarClase} disabled={verifying || loading || (multipleActivities && !selectedActivity)}
                                 startIcon={verifying ? <CircularProgress size={20} color="inherit"/> : <CheckCircleIcon />}
                                 sx={{minWidth: 220, textTransform: 'none', fontWeight:'bold', py: 1.5}} >
                                 {verifying ? 'Verificando...' : 'Verificar Asistencia'}
                             </Button>
                         </CardActions>
                         )}
                     </Card>
                     </motion.div>
                )}
                </AnimatePresence>

                {/* --- Modal Resetear Clases --- */}
                <Dialog open={showResetModal} onClose={() => !resetting && setShowResetModal(false)} aria-labelledby="reset-dialog-title">
                    <DialogTitle id="reset-dialog-title" sx={{textAlign:'center', pb:1}}>
                         <WarningAmberIcon color="error" sx={{verticalAlign:'middle', mr:1}}/> ACCESO DENEGADO
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{mb:2, textAlign:'center'}}>
                            Cliente sin clases para <strong>{selectedActivity?.nombreActividad ?? 'esta actividad'}</strong>.
                            Ingrese la contraseña y el nuevo número de clases.
                        </DialogContentText>
                         <AnimatePresence>
                            {resetError && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <MuiAlert severity="error" sx={{ mb: 2, borderRadius:'8px' }}>{resetError}</MuiAlert>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <TextField autoFocus margin="dense" id="admin-password" label="Contraseña Administrador" type="password" fullWidth variant="outlined" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} disabled={resetting}
                            InputProps={{ startAdornment: <InputAdornment position="start"><PasswordIcon /></InputAdornment> }} />
                        <TextField margin="dense" id="clases-asignar" label="Número de Clases a Asignar" type="number" fullWidth variant="outlined" value={clasesAAsignar} onChange={(e) => setClasesAAsignar(e.target.value)} disabled={resetting}
                             InputProps={{ inputProps: { min: 1 }, startAdornment: <InputAdornment position="start"><ClassCountIcon /></InputAdornment> }} />
                    </DialogContent>
                    <DialogActions sx={{p:2}}>
                        <Button onClick={() => setShowResetModal(false)} disabled={resetting} startIcon={<CancelIcon/>}>Cancelar</Button>
                        <Button onClick={handleResetClasses} variant="contained" color="primary" disabled={resetting} startIcon={resetting ? <CircularProgress size={16}/> : <RefreshIcon/>}>
                            {resetting ? 'Reiniciando...' : 'Confirmar Reinicio'}
                        </Button>
                    </DialogActions>
                </Dialog>

            </Container>
        </>
    );
}