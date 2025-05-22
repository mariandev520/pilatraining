// pages/infoclases.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import {
    Container, Box, Typography, Button, Grid, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert as MuiAlert, IconButton, Chip, Divider, Tooltip,
    TextField, Select, MenuItem, InputLabel, FormControl, FormGroup, FormControlLabel, Checkbox,
    Switch, Snackbar, Collapse, InputAdornment,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, // Añadido DialogContentText
    List, ListItem, ListItemText, ListItemIcon,
    // --- Para el tema ---
    createTheme, ThemeProvider, CssBaseline, alpha
} from '@mui/material';
import {
    Class as ClassIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon,
    AddCircleOutline as AddIcon,
    ErrorOutline as ErrorOutlineIcon, CheckCircleOutline as CheckCircleOutlineIcon,
    CategoryOutlined as CategoryIcon, SchoolOutlined as SchoolIcon,
    FormatListNumberedOutlined as FormatListNumberedIcon, Close as CloseIcon,
    ListAlt as ListAltIcon, History as HistoryIcon, Search as SearchIcon,
    PersonPinCircleOutlined as PresencialIcon, CloudSyncOutlined as AutomaticaIcon,
    ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon // Asegurar que estén
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format as formatDateFns, isValid as isDateValid, parseISO } from 'date-fns'; // Importar parseISO
import { es } from 'date-fns/locale';

// --- Nombres de Días para UI (sin cambios) ---
const DIAS_SEMANA_NOMBRES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']; // Añadir Dom si es 0-6

// --- Estado Inicial del Formulario (sin cambios) ---
const initialFormState = {
    _id: null, dniCliente: '', nombreActividad: '', nombreProfesor: '',
    clasesPendientes: '', clasesEchas: '', clasesMensuales: '',
    clasePrueba: false, diasVisita: []
};

// --- Animaciones (sin cambios) ---
const fadeInUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } }};
const popCard = {
  rest: { scale: 1, boxShadow: 'none' },
  hover: {
    scale: 1.015,
    boxShadow: `0 8px 36px 0 rgba(20,255,180,0.07), 0 1.5px 0 0 #18ff99 inset`,
    transition: { duration: 0.18, ease: 'easeOut' }
  }
};
const MotionTableRow = motion(TableRow);


// --- NUEVO: TEMA CLARO ---
const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#15599a' },     // Azul que usabas
        secondary: { main: '#14A38B' }, // Verde acento que usabas
        background: { default: '#f4f6f8', paper: '#ffffff' },
        text: { primary: 'rgba(0, 0, 0, 0.87)', secondary: 'rgba(0, 0, 0, 0.6)' },
        error: { main: '#d32f2f' },
        warning: { main: '#ffa000' },
        info: { main: '#1976d2' },
        success: { main: '#2e7d32' },
        // Colores personalizados para chips de estado si se necesitan
        custom: {
            brightGreen: '#18cc80', // Un verde brillante pero más amigable para fondo claro
        }
    },
    typography: { fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif', h4: {fontWeight: 700}, h6: {fontWeight: 600} },
    components: {
        MuiPaper: { defaultProps: { elevation: 1 }, styleOverrides: { root: { backgroundImage: 'none' }}},
        MuiTableCell: { styleOverrides: { head: { backgroundColor: alpha('#000000', 0.03), fontWeight: 'bold' }, body: { borderColor: alpha('#000000', 0.12) }}},
        MuiButton: { styleOverrides: { root: { borderRadius: 8, textTransform: 'none', fontWeight: 600 }}},
        MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } }, // Tamaño small por defecto
        MuiSelect: { defaultProps: { variant: 'outlined', size: 'small' } },
        MuiChip: { styleOverrides: { root: { fontWeight: 500 }}},
    }
});

const headerCellStyle = (theme) => ({ // Convertido a función para acceder al tema
    fontWeight: 700,
    color: theme.palette.text.primary,
    letterSpacing: 0.5, // Reducido
    background: alpha(theme.palette.primary.main, 0.05), // Fondo sutil con color primario
    py: 1.5 // Padding vertical ajustado
});


export default function InfoClasesPage() {
    const [clientes, setClientes] = useState([]);
    const [infoclases, setInfoClases] = useState([]);
    const [form, setForm] = useState(initialFormState);
    const [editMode, setEditMode] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [historialSeleccionado, setHistorialSeleccionado] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [errorHistory, setErrorHistory] = useState(null);
    const [infoclaseParaHistorial, setInfoclaseParaHistorial] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const showSnackbar = (message, severity = 'info') => setSnackbar({ open: true, message, severity });
    const handleCloseSnackbar = (event, reason) => { if (reason === 'clickaway') return; setSnackbar(prev => ({ ...prev, open: false })); };

    const fetchInfoclases = useCallback(async () => {
        try {
            const res = await fetch('/api/infoclases');
            if (!res.ok) throw new Error((await res.json()).message || "Error cargando info clases");
            setInfoClases(await res.json());
        } catch (err) { showSnackbar(err.message || "Error recargando info clases", 'error'); }
    }, []); // showSnackbar no necesita ser dependencia si no cambia

    useEffect(() => {
        setPageLoading(true); setError('');
        Promise.all([
            fetch('/api/clientes').then(r => r.ok ? r.json() : r.json().then(err => Promise.reject(err.message || "Error clientes"))),
        ]).then(([clientesData]) => {
            setClientes(Array.isArray(clientesData) ? clientesData : []);
            return fetchInfoclases();
        }).catch(errorMessage => {
            setError(typeof errorMessage === 'string' ? errorMessage : "Error crítico al cargar datos.");
            setClientes([]); setInfoClases([]);
        }).finally(() => setPageLoading(false));
    }, [fetchInfoclases]);

    const onChange = e => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value);
    if (type === 'number' && !isNaN(val) && val < 0) val = 0;
    setForm(f => ({ ...f, [name]: val }));
  };
  const toggleDia = diaIndex => {
    setForm(f => {
      const currentDias = Array.isArray(f.diasVisita) ? f.diasVisita : [];
      let newDiasVisita = currentDias.includes(diaIndex) ?
        currentDias.filter(d => d !== diaIndex) : [...currentDias, diaIndex];
      newDiasVisita.sort((a, b) => a - b);
      return { ...f, diasVisita: newDiasVisita };
    });
  };
  const handleToggleFormVisibility = () => {
    if (isFormVisible && editMode) cancelEdit();
    else if (isFormVisible && !editMode) { setIsFormVisible(false); setForm(initialFormState); setError(''); }
    else { setForm(initialFormState); setEditMode(false); setError(''); setIsFormVisible(true); }
  };
  const startEdit = info => {
    setError(''); setEditMode(true);
    setForm({
      _id: info._id || null,
      dniCliente: info.dniCliente?.toString() || '',
      nombreActividad: info.nombreActividad || '',
      nombreProfesor: info.nombreProfesor || '',
      clasesPendientes: info.clasesPendientes != null ? info.clasesPendientes.toString() : '',
      clasesEchas: info.clasesEchas != null ? info.clasesEchas.toString() : '',
      clasesMensuales: info.clasesMensuales != null ? info.clasesMensuales.toString() : '',
      clasePrueba: !!info.clasePrueba,
      diasVisita: Array.isArray(info.diasVisita) ? [...info.diasVisita].sort((a, b) => a - b) : []
    });
    setIsFormVisible(true);
    setTimeout(() => { document.getElementById('infoclase-form-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
  };
  const cancelEdit = () => {
    setEditMode(false); setForm(initialFormState); setError(''); setIsFormVisible(false);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true); setError('');
    const bodyPayload = { ...form };
    if (editMode) {
      if (!bodyPayload._id) {
        showSnackbar("Error Crítico: Falta el ID del registro para actualizar.", "error");
        setFormLoading(false); return;
      }
    } else {
      if (bodyPayload._id === null) { delete bodyPayload._id; }
    }
    bodyPayload.clasesPendientes = Number(bodyPayload.clasesPendientes) || 0;
    bodyPayload.clasesMensuales = Number(bodyPayload.clasesMensuales) || 0;
    bodyPayload.clasesEchas = Number(bodyPayload.clasesEchas) || 0;
    bodyPayload.dniCliente = Number(bodyPayload.dniCliente);
    try {
      const res = await fetch('/api/infoclases', {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || `Error al ${editMode ? 'actualizar' : 'guardar'}.`);
      showSnackbar(resData.message || `Info clase ${editMode ? 'actualizada' : 'guardada'} con éxito`, 'success');
      fetchInfoclases(); cancelEdit();
    } catch (err) {
      showSnackbar(err.message || "Ocurrió un error desconocido.", 'error');
    } finally { setFormLoading(false); }
  };
  const diasToStr = useCallback(arr => (Array.isArray(arr) ? [...arr].sort((a, b) => a - b) : []).map(i => DIAS_SEMANA_NOMBRES[i]).join(', '), []);
  const handleOpenHistoryDialog = async (infoclase) => {
    setInfoclaseParaHistorial({
      dni: infoclase.dniCliente,
      nombre: infoclase.nombreCliente,
      actividad: infoclase.nombreActividad
    });
    setIsHistoryDialogOpen(true); setLoadingHistory(true); setErrorHistory(null); setHistorialSeleccionado([]);
    try {
      const res = await fetch(`/api/verificacion?dniCliente=${infoclase.dniCliente}&nombreActividad=${encodeURIComponent(infoclase.nombreActividad)}`);
      if (!res.ok) throw new Error((await res.json()).message || `Error ${res.status} obteniendo historial.`);
      const data = await res.json();
      setHistorialSeleccionado((Array.isArray(data) ? data : []).sort((a, b) => new Date(b.fechaVerificacion) - new Date(a.fechaVerificacion)));
    } catch (e) { setErrorHistory(e.message); }
    finally { setLoadingHistory(false); }
  };
  const handleCloseHistoryDialog = () => { setIsHistoryDialogOpen(false); };
  const formatHistoryDialogDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (!isDateValid(date)) return 'Fecha inválida';
      return formatDateFns(date, 'Pp', { locale: es });
    } catch { return 'Fecha inválida'; }
  };

    const filteredInfoClases = useMemo(() => {
        if (!searchTerm) return infoclases;
        const lowerSearchTerm = searchTerm.toLowerCase();
        return infoclases.filter(info =>
            (info.nombreCliente || '').toLowerCase().includes(lowerSearchTerm) ||
            (info.dniCliente?.toString() || '').includes(lowerSearchTerm) ||
            (info.nombreActividad || '').toLowerCase().includes(lowerSearchTerm)
        );
    }, [infoclases, searchTerm]);

    // --- Renderizado ---
    if (pageLoading) {
        return (<ThemeProvider theme={lightTheme}><CssBaseline /><Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Container></ThemeProvider>);
    }


    return (
        <ThemeProvider theme={lightTheme}> {/* Envolver con ThemeProvider */}
            <CssBaseline />
            <Head><title>Gestión de Info Clases</title></Head>
            <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
                {/* CABECERA */}
                <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <motion.div whileHover={{ rotate: 6, scale: 1.1 }}>
                                    <ClassIcon sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: 'primary.main' }} />
                                </motion.div>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: { xs: '1.8rem', sm: '2.2rem' } }}>
                                    Gestión de Clases
                                </Typography>
                            </Box>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="contained" color={isFormVisible ? "warning" : "primary"} onClick={handleToggleFormVisibility} startIcon={isFormVisible ? <CloseIcon /> : <AddIcon />} sx={{ fontWeight: 'bold' }}>
                                    {isFormVisible ? (editMode ? 'Cancelar Edición' : 'Cerrar Formulario') : 'Agregar Info Clase'}
                                </Button>
                            </motion.div>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <AnimatePresence> {error && !pageLoading && ( <motion.div initial={{ opacity: 0}} animate={{ opacity: 1}} exit={{ opacity: 0}}><MuiAlert severity="error" sx={{mt: 2, borderRadius: 2}} onClose={() => setError('')}>{error}</MuiAlert></motion.div> )} </AnimatePresence>
                    </Paper>
                </motion.div>

                {/* FORMULARIO */}
                <Collapse in={isFormVisible} timeout="auto" unmountOnExit>
                    <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                         <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3, borderLeft: 5, borderColor: 'primary.main' }} id="infoclase-form-section">
                            <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
                                <Typography variant="h6" gutterBottom sx={{ mb: 2.5, fontWeight: 'medium' }}>{editMode ? 'Editar Información de Clase' : 'Nueva Información de Clase'}</Typography>
                                <Grid container spacing={2.5}>
                                    {/* Cliente (DNI) */}
                                    <Grid item xs={12} md={6}><FormControl fullWidth required disabled={editMode}><InputLabel>Cliente (DNI)</InputLabel><Select name="dniCliente" value={form.dniCliente} label="Cliente (DNI)" onChange={onChange} MenuProps={{ PaperProps: { sx: { maxHeight: 250 } } }}><MenuItem value=""><em>-- Seleccione --</em></MenuItem>{clientes.map(c => (<MenuItem key={c._id || c.dni} value={c.dni?.toString()}><b>{c.nombre}</b> ({c.dni})</MenuItem>))}</Select></FormControl></Grid>
                                    {/* Nombre Actividad */}
                                    <Grid item xs={12} md={6}><TextField fullWidth label="Nombre Actividad" name="nombreActividad" value={form.nombreActividad} onChange={onChange} required disabled={editMode} helperText={editMode ? "Actividad no modificable." : ""}/></Grid>
                                    {/* Nombre Profesor */}
                                    <Grid item xs={12} md={6}><TextField fullWidth label="Profesor" name="nombreProfesor" value={form.nombreProfesor} onChange={onChange} /></Grid>
                                    {/* Clases Pendientes */}
                                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Clases Pendientes" name="clasesPendientes" type="number" value={form.clasesPendientes} onChange={onChange} InputProps={{ inputProps: { min: 0 }}}/></Grid>
                                    {/* Clases Hechas */}
                                    <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Clases Hechas" name="clasesEchas" type="number" value={form.clasesEchas} onChange={onChange} InputProps={{ inputProps: { min: 0 }}}/></Grid>
                                    {/* Clases Mensuales */}
                                     <Grid item xs={12} sm={6} md={3}><TextField fullWidth label="Clases Mensuales" name="clasesMensuales" type="number" value={form.clasesMensuales} onChange={onChange} InputProps={{ inputProps: { min: 0 }}} helperText="Total por mes"/></Grid>
                                    {/* Clase de Prueba */}
                                    <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}><FormControlLabel control={<Switch checked={form.clasePrueba} onChange={onChange} name="clasePrueba" color="primary" />} label="¿Clase de Prueba?" /></Grid>
                                    {/* Días de Visita */}
                                    <Grid item xs={12}><Typography component="legend" variant="body2" sx={{ mt: 1, mb: 1, color: 'text.secondary' }}>Días de visita:</Typography><FormGroup row sx={{justifyContent: { xs: 'flex-start', sm: 'space-around'}, flexWrap:'wrap'}}>{DIAS_SEMANA_NOMBRES.map((nombreDia, numDiaReal) => { const diaId = numDiaReal +1; /* Ajustar a 1-7 si así se guarda */ return (<FormControlLabel key={diaId} labelPlacement="end" control={<Checkbox checked={(form.diasVisita || []).includes(diaId)} onChange={() => toggleDia(diaId)} name={nombreDia} size="small" />} label={<Typography variant="body2">{nombreDia}</Typography>} />); })}</FormGroup></Grid>
                                    {/* Botones Formulario */}
                                    <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}><Button variant="outlined" onClick={cancelEdit} disabled={formLoading} startIcon={<CancelIcon />}>Cancelar</Button><Button type="submit" variant="contained" disabled={formLoading} startIcon={formLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}>{formLoading ? 'Guardando...' : (editMode ? 'Actualizar' : 'Guardar')}</Button></Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </motion.div>
                </Collapse>

                {/* BUSCADOR Y TABLA */}
                <motion.div variants={fadeInUp} initial="hidden" animate="visible" style={{ marginTop: isFormVisible ? '16px' : '0px' }}>
                    <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2.5, borderRadius: 2 }}>
                        <TextField fullWidth variant="outlined" label="Buscar por Nombre Cliente, DNI o Actividad" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Escriba para buscar..." InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), endAdornment: searchTerm && (<InputAdornment position="end"><IconButton onClick={() => setSearchTerm('')} size="small"><CloseIcon fontSize="small" /></IconButton></InputAdornment>) }} />
                    </Paper>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> <ListAltIcon sx={{ mr: 1, fontSize: { xs: '1.8rem', sm: '2rem' }, color: 'text.secondary' }} /> <Typography variant="h5" component="h2" sx={{ fontWeight: 'medium' }}>Lista de Clases <Chip label={filteredInfoClases.length} size="small" sx={{ml:1}}/> </Typography> </Box>

                    {pageLoading && !infoclases.length && (<Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress size={50} /></Box>)}
                    {!pageLoading && error && !infoclases.length && (<MuiAlert severity="error" variant="filled" sx={{mt: 2, borderRadius:2}}>{error}</MuiAlert>)}
                    {!pageLoading && !error && infoclases.length === 0 && (<Paper elevation={0} sx={{p:3, textAlign:'center', mt:2, borderRadius:2, border: '1px dashed', borderColor:'divider'}}><Typography color="text.secondary">No hay información de clases registrada.</Typography></Paper>)}
                    {!pageLoading && !error && infoclases.length > 0 && filteredInfoClases.length === 0 && (<Paper elevation={0} sx={{p:3, textAlign:'center', mt:2, borderRadius:2, border: '1px dashed', borderColor:'divider'}}><Typography color="text.secondary">No se encontraron clases que coincidan.</Typography></Paper>)}

                    {!pageLoading && !error && filteredInfoClases.length > 0 && (
                        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                            <Table sx={{ minWidth: 750 }} aria-label="lista de info clases" size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={headerCellStyle(lightTheme)}>Cliente (DNI)</TableCell>
                                        <TableCell sx={headerCellStyle(lightTheme)}>Actividad</TableCell>
                                        <TableCell sx={headerCellStyle(lightTheme)}>Profesor</TableCell>
                                        <TableCell align="center" sx={headerCellStyle(lightTheme)}>Clases Pend.</TableCell>
                                        <TableCell align="center" sx={headerCellStyle(lightTheme)}>Clases Hechas</TableCell>
                                        <TableCell align="center" sx={headerCellStyle(lightTheme)}>Clases Mens.</TableCell>
                                        <TableCell align="center" sx={headerCellStyle(lightTheme)}>Prueba</TableCell>
                                        <TableCell sx={headerCellStyle(lightTheme)}>Días Visita</TableCell>
                                        <TableCell align="center" sx={headerCellStyle(lightTheme)}>Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                <AnimatePresence>
                                    {filteredInfoClases.map(info => (
                                        <MotionTableRow key={info._id || `${info.dniCliente}|${info.nombreActividad}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} hover selected={editMode && form._id === info._id} sx={{ '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: alpha(lightTheme.palette.primary.main, 0.08)}, '&:hover':{backgroundColor: alpha(lightTheme.palette.action.hover, 0.6)}, '&:last-child td, &:last-child th': { border: 0 }}}>
                                            <TableCell sx={{py: 1.5}}><Typography variant="body2" fontWeight={500}>{info.nombreCliente || 'N/A'}</Typography><Typography variant="caption" color="text.secondary">{info.dniCliente}</Typography></TableCell>
                                            <TableCell sx={{py: 1.5}}>{info.nombreActividad}</TableCell>
                                            <TableCell sx={{py: 1.5}}>{info.nombreProfesor || '-'}</TableCell>
                                            <TableCell align="center" sx={{py: 1.5}}><Chip label={info.clasesPendientes} size="small" color={info.clasesPendientes > 0 ? "success" : "default"} variant="outlined" /></TableCell>
                                            <TableCell align="center" sx={{py: 1.5}}><Chip label={info.clasesEchas} size="small" variant="outlined" /></TableCell>
                                            <TableCell align="center" sx={{py: 1.5}}>{info.clasesMensuales}</TableCell>
                                            <TableCell align="center" sx={{py: 1.5}}><Chip label={info.clasePrueba ? 'Sí' : 'No'} size="small" color={info.clasePrueba ? "secondary" : "default"} variant={info.clasePrueba ? "filled" : "outlined"} /></TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem', py: 1.5 }}>{diasToStr(info.diasVisita) || '-'}</TableCell>
                                            <TableCell align="center" sx={{ py: 1 }}>
                                                <Tooltip title="Editar" placement="top"><IconButton color="primary" size="small" onClick={() => startEdit(info)} disabled={pageLoading || formLoading} sx={{mr:0.5}}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Ver Historial" placement="top"><IconButton color="info" size="small" onClick={() => handleOpenHistoryDialog(info)} disabled={pageLoading || formLoading}><HistoryIcon fontSize="small" /></IconButton></Tooltip>
                                            </TableCell>
                                        </MotionTableRow>
                                    ))}
                                </AnimatePresence>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </motion.div>

                {/* Snackbar */}
                <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} >
                    <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity || 'info'} sx={{ width: '100%' }} elevation={6} variant="filled" >{snackbar.message}</MuiAlert>
                </Snackbar>

                {/* Dialogo Historial */}
                <Dialog open={isHistoryDialogOpen} onClose={handleCloseHistoryDialog} maxWidth="sm" fullWidth scroll="paper" PaperProps={{ sx: { borderRadius: 2 }}}>
                    <DialogTitle sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor:'divider' }}><HistoryIcon sx={{ mr: 1 }} />Historial de Verificaciones</DialogTitle>
                    <DialogContent dividers>
                        {infoclaseParaHistorial && ( <Box sx={{ mb: 2, p: 1.5, bgcolor: alpha(lightTheme.palette.primary.main, 0.05), borderRadius: 1 }}><Typography variant="subtitle1">Cliente: <strong>{infoclaseParaHistorial.nombre || 'N/A'}</strong> (DNI: {infoclaseParaHistorial.dni})</Typography><Typography variant="subtitle1">Actividad: <strong>{infoclaseParaHistorial.actividad}</strong></Typography></Box> )}
                        {loadingHistory && (<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>)}
                        <AnimatePresence> {errorHistory && !loadingHistory && ( <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><MuiAlert severity="error" onClose={() => setErrorHistory(null)}>{errorHistory}</MuiAlert></motion.div> )} </AnimatePresence>
                        {!loadingHistory && !errorHistory && historialSeleccionado.length === 0 && (<Typography sx={{ textAlign: 'center', p: 2, color: 'text.secondary' }}>No hay historial para esta selección.</Typography>)}
                        {!loadingHistory && !errorHistory && historialSeleccionado.length > 0 && (
                            <List dense sx={{ pt:0 }}>{historialSeleccionado.map((verif, index) => (<ListItem key={verif._id || index} divider={index < historialSeleccionado.length -1} sx={{ py: 1.2 }}><ListItemIcon sx={{ minWidth: 36 }}>{verif.metodoVerificacion === 'presencial' ? (<Tooltip title="Presencial"><PresencialIcon color="success" /></Tooltip>) : (<Tooltip title="Automática"><AutomaticaIcon color="info" /></Tooltip>)}</ListItemIcon><ListItemText primary={formatHistoryDialogDate(verif.fechaVerificacion)} primaryTypographyProps={{ fontWeight: 'medium' }} secondary={`Tipo: ${verif.tipo === 'clase_prueba' ? 'Prueba' : (verif.tipo || 'Regular')}`} /></ListItem>))} </List>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}><Button onClick={handleCloseHistoryDialog} startIcon={<CloseIcon />}>Cerrar</Button></DialogActions>
                </Dialog>
            </Container>
        </ThemeProvider>
    );
}