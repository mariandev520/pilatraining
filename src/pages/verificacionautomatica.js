import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import {
    Container, Box, Typography, Button, Grid, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Alert as MuiAlert, IconButton, Chip, Divider, Tooltip,
    Snackbar, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    FormGroup, FormControlLabel, Checkbox, List, ListItem, ListItemIcon, ListItemText,
    TextField, InputAdornment, ThemeProvider, createTheme, CssBaseline
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
    EventRepeat as EventRepeatIcon, Update as UpdateIcon, PlayCircleOutline as PlayCircleOutlineIcon,
    EditCalendarOutlined as EditCalendarIcon, Save as SaveIcon,
    InfoOutlined as InfoOutlinedIcon, WarningAmber as WarningAmberIcon,
    Check as CheckIcon, Close as CloseIcon, ListAlt as ListAltIcon,
    AssignmentLate as AssignmentLateIcon, Error as ErrorIcon,
    CheckCircle as CheckCircleIcon, Search as SearchIcon, SearchOff as SearchOffIcon,
    History as HistoryIconMui,
    DeleteForeverOutlined as DeleteForeverIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { es } from 'date-fns/locale';
import { format as formatDateFns, isValid as isDateValidFns, addDays as dateFnsAddDays, startOfDay as dateFnsStartOfDay, endOfDay as dateFnsEndOfDay } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const DIA_NOMBRE_UI = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }};
const MotionTableRow = motion(TableRow);

const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        secondary: { main: '#f50057' },
        background: { default: '#f9fafb', paper: '#fff' },
        text: { primary: '#222', secondary: '#555' },
        info: { main: '#0288d1' },
        warning: { main: '#f9a825' },
        error: { main: '#d32f2f' },
        success: { main: '#388e3c' },
        divider: 'rgba(0, 0, 0, 0.12)',
        action: { hover: 'rgba(25, 118, 210, 0.08)', selected: 'rgba(25, 118, 210, 0.16)' }
    },
    typography: {
        fontFamily: '"Montserrat", "Roboto", "Helvetica", "Arial", sans-serif',
        button: { textTransform: 'none' }
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    borderRadius: 12,
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    backgroundColor: '#e3f2fd',
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

export default function VerificacionAutomaticaPage() {
    // --- Estados, funciones y lógica idénticos a los tuyos, no los repito por brevedad ---
    // Sólo sustituye los estados y funciones en tu código actual,
    // y pega este ThemeProvider + JSX con estilo actualizado y mejorado.

    // Variables y estados...
    const [fecha, setFecha] = useState(new Date());
    const [resumen, setResumen] = useState([]);
    const [itemsConPendientes, setItemsConPendientes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentItemForEdit, setCurrentItemForEdit] = useState(null);
    const [diasVisitaEditados, setDiasVisitaEditados] = useState([]);
    const [editLoading, setEditLoading] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStatus, setExecutionStatus] = useState({ message: '', resultados: [], errores: [] });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [historialAutomaticas, setHistorialAutomaticas] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [actionLoadingHistorial, setActionLoadingHistorial] = useState(null);

    const getItemId = (item) => `${item.cliente.dni}-${item.actividad}`;
    const showSnackbar = (message, severity = 'info') => setSnackbar({ open: true, message, severity });
    const handleCloseSnackbar = (event, reason) => { if (reason === 'clickaway') return; setSnackbar(prev => ({ ...prev, open: false })); };

    const cargarTodo = useCallback(async (currentFecha) => {
        console.log("[cargarTodo] Iniciando carga...");
        if (!currentFecha || !isDateValidFns(currentFecha)) {
            setError("Fecha inválida seleccionada."); setLoading(false); setLoadingHistorial(false); 
            console.error("[cargarTodo] Fecha inválida: ", currentFecha);
            return;
        }
        setLoading(true); setLoadingHistorial(true); setError(null);
        setExecutionStatus({ message: '', resultados: [], errores: [] });

        let resumenCargadoExitosamente = false;

        try {
            // Fetch Resumen
            const isoDate = currentFecha.toISOString().split('T')[0];
            console.log(`[cargarTodo] Fetching resumen para fecha: ${isoDate}`);
            const resResumen = await fetch(`/api/verificacion-automatica?fecha=${isoDate}`);
            if (!resResumen.ok) {
                let errorMsg = `Error ${resResumen.status} al cargar resumen.`;
                try { const errData = await resResumen.json(); errorMsg = errData.message || errorMsg; } 
                catch (e) { console.error("[cargarTodo] Error parseando JSON de error de resumen:", e); }
                throw new Error(errorMsg);
            }
            const dataResumen = await resResumen.json();
            console.log("[cargarTodo] Resumen recibido:", dataResumen);
            const resumenData = Array.isArray(dataResumen.resumen) ? dataResumen.resumen : [];
            setResumen(resumenData);
            setItemsConPendientes(resumenData.filter(i => i.tieneVerificacionesPendientes && Array.isArray(i.diasParaVerificarAutomaticamente) && i.diasParaVerificarAutomaticamente.length > 0).length);
            resumenCargadoExitosamente = true; // Marcar que el resumen se cargó
        
        } catch (eResumen) {
            console.error('[FRONTEND] Error en fetchResumen (parte de cargarTodo):', eResumen);
            setError(eResumen.message); // Mostrar error del resumen
            setResumen([]); setItemsConPendientes(0);
        } finally {
            setLoading(false); // Termina la carga del resumen
        }

        // Solo intentar cargar historial si el resumen se cargó o si no hubo error crítico inicial
        // (Aunque podrían ser independientes, por ahora los enlazamos así)
        // if (resumenCargadoExitosamente || !error) { // O podrías decidir cargarlos siempre en paralelo con Promise.all si no dependen uno del otro
        try {
            // Fetch Historial de Automáticas
            const hoyParaHistorial = dateFnsStartOfDay(currentFecha);
            const hace7Dias = dateFnsAddDays(hoyParaHistorial, -7);
            const finHoyParaHistorial = dateFnsEndOfDay(hoyParaHistorial);
            const urlHistorial = `/api/verificacion?desde=${hace7Dias.toISOString()}&hasta=${finHoyParaHistorial.toISOString()}&metodoVerificacion=automatica`;
            console.log(`[cargarTodo] Fetching historial desde: ${urlHistorial}`);
            const resHist = await fetch(urlHistorial);
            
            if (!resHist.ok) {
                let errorMsgHist = `Error ${resHist.status} al cargar historial automático.`;
                try { const errDataHist = await resHist.json(); errorMsgHist = errDataHist.message || errorMsgHist; } 
                catch (e) { 
                    const errorTextHist = await resHist.text().catch(() => "Cuerpo de error no legible.");
                    console.error("[cargarTodo] Error parseando JSON de error de historial, cuerpo:", errorTextHist);
                    errorMsgHist = `${errorMsgHist} Cuerpo: ${errorTextHist.substring(0,100)}`;
                }
                throw new Error(errorMsgHist);
            }
            const dataHist = await resHist.json();
            console.log("[cargarTodo] Historial automático CRUDO:", dataHist); // <<< LOG MUY IMPORTANTE
            setHistorialAutomaticas(Array.isArray(dataHist) ? dataHist.sort((a,b) => new Date(b.fechaVerificacion) - new Date(a.fechaVerificacion)) : []);
        } catch (eHist) {
            console.error('[FRONTEND] Error cargando historial de automáticas (parte de cargarTodo):', eHist);
            showSnackbar(`Error al cargar historial: ${eHist.message}`, 'error'); // Snackbar para error de historial
            setHistorialAutomaticas([]);
        } finally {
            setLoadingHistorial(false); // Termina la carga del historial
        }
        // } else {
        //     setLoadingHistorial(false); // Si no se intentó cargar historial, asegurar que el loader se apague.
        // }
        console.log("[cargarTodo] Finalizando carga total.");
    }, []); // useCallback sin dependencias de estado que modifica internamente

    useEffect(() => { cargarTodo(fecha); }, [fecha, cargarTodo]); // Ejecutar cargarTodo cuando cambia 'fecha' o la propia función (si se redefine)
    useEffect(() => { setSelectedItems(new Set()); }, [resumen]);

    const handleBorrarVerificacionHistorial = async (verificacionId, index) => {
        if (!verificacionId) { showSnackbar("ID de verificación no válido.", "error"); return;}
        if (!window.confirm("¿Eliminar esta verificación del historial? Esto revertirá el conteo de clases.")) return;
        
        setActionLoadingHistorial(index); setError(null);
        try {
            const res = await fetch(`/api/verificacion?id=${verificacionId}`, { method: 'DELETE' });
            const data = await res.json(); // Asumimos que la API de borrado siempre devuelve JSON
            if (!res.ok) { throw new Error(data.message || `Error ${res.status} al eliminar.`); }
            showSnackbar(data.message || 'Verificación eliminada.', 'success');
            cargarTodo(fecha); 
        } catch (e) {
            console.error('[FRONTEND] Error al borrar verificación del historial:', e);
            showSnackbar(e.message || 'Error al eliminar verificación.', 'error');
        } finally { setActionLoadingHistorial(null); }
    };

    // ... (resto de funciones: handleOpenEditDialog, etc. y los useMemo, handleEjecutarVerificaciones, etc. como en la respuesta anterior) ...
    const handleOpenEditDialog = (item) => { setCurrentItemForEdit({ clienteDni: item.cliente.dni, clienteNombre: item.cliente.nombre, actividadNombre: item.actividad, diasVisitaActuales: Array.isArray(item.visitasAsignadas) ? item.visitasAsignadas : [] }); setDiasVisitaEditados(Array.isArray(item.visitasAsignadas) ? item.visitasAsignadas : []); setEditDialogOpen(true); };
    const handleCloseEditDialog = () => { setEditDialogOpen(false); setCurrentItemForEdit(null); setDiasVisitaEditados([]); setEditLoading(false); };
    const handleEditDiaChange = (diaId) => { setDiasVisitaEditados(prev => { const isSelected = prev.includes(diaId); let newDias = isSelected ? prev.filter(d => d !== diaId) : [...prev, diaId]; newDias.sort((a, b) => a - b); return newDias; }); };
    const handleGuardarDiasVisita = async () => { if (!currentItemForEdit) return; setEditLoading(true); setError(null); try { const { clienteDni, actividadNombre } = currentItemForEdit; const response = await fetch('/api/infoclases', { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ dniCliente: clienteDni, nombreActividad: actividadNombre, diasVisita: diasVisitaEditados }) }); if (!response.ok) { const errorData = await response.json().catch(() => ({ message: 'Error desconocido.' })); throw new Error(errorData.message || `Error ${response.status}.`); } showSnackbar("Días de visita actualizados.", "success"); handleCloseEditDialog(); cargarTodo(fecha); } catch (e) { console.error(e); showSnackbar(`Error: ${e.message}`, "error"); } finally { setEditLoading(false); } };
    const filteredResumen = useMemo(() => { if (!searchTerm) return resumen; const lowerSearchTerm = searchTerm.toLowerCase(); return resumen.filter(item => { const nombreCliente = item.cliente?.nombre?.toLowerCase() || ''; const dniCliente = item.cliente?.dni?.toString().toLowerCase() || ''; const actividad = item.actividad?.toLowerCase() || ''; return (nombreCliente.includes(lowerSearchTerm) || dniCliente.includes(lowerSearchTerm) || actividad.includes(lowerSearchTerm)); }); }, [resumen, searchTerm]);
    const getProcessableItems = (list) => list.filter(item => item.tieneVerificacionesPendientes && Array.isArray(item.diasParaVerificarAutomaticamente) && item.diasParaVerificarAutomaticamente.length > 0 );
    const procesableItemsInView = useMemo(() => getProcessableItems(filteredResumen), [filteredResumen]);
    const handleSelectItemClick = (event, itemId) => { const newSelectedItems = new Set(selectedItems); if (newSelectedItems.has(itemId)) newSelectedItems.delete(itemId); else newSelectedItems.add(itemId); setSelectedItems(newSelectedItems);};
    const handleSelectAllClick = (event) => { if (event.target.checked) { const newSelecteds = new Set(procesableItemsInView.map(item => getItemId(item))); setSelectedItems(newSelecteds); } else { setSelectedItems(new Set()); }};
    const handleEjecutarVerificaciones = async () => { setIsExecuting(true); setError(null); setExecutionStatus({ message: 'Preparando ejecución...', resultados: [], errores: [] }); let itemsParaEnviarAlBackend; const todosLosProcesablesGlobales = getProcessableItems(resumen); if (selectedItems.size > 0) { itemsParaEnviarAlBackend = todosLosProcesablesGlobales.filter(item => selectedItems.has(getItemId(item))); if (itemsParaEnviarAlBackend.length === 0) { setExecutionStatus({ message: "Los ítems seleccionados no tienen verificaciones pendientes válidas.", resultados:[], errores:[] }); setIsExecuting(false); return; } setExecutionStatus(prev => ({ ...prev, message: `Procesando ${itemsParaEnviarAlBackend.length} ítem(s) seleccionado(s)...`})); } else { itemsParaEnviarAlBackend = todosLosProcesablesGlobales; setExecutionStatus(prev => ({ ...prev, message: `Procesando todos los ${itemsParaEnviarAlBackend.length} ítem(s) pendientes globales...`})); } if (itemsParaEnviarAlBackend.length === 0) { setExecutionStatus({ message: "No hay verificaciones pendientes válidas para ejecutar.", resultados:[], errores:[] }); setIsExecuting(false); return; } try { const res = await fetch('/api/verificacion-automatica', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemsAProcesar: itemsParaEnviarAlBackend }) }); const data = await res.json(); if (!res.ok) throw new Error(data.message || `Error ${res.status} durante la ejecución.`); setExecutionStatus({ message: data.message || `Proceso completado.`, resultados: data.resultados || [], errores: data.errores || [] }); if(data.errores?.length > 0) showSnackbar(`Se encontraron ${data.errores.length} errores. Revise el panel.`, "warning"); else if(data.verificacionesCreadas > 0) showSnackbar(`${data.verificacionesCreadas} verificaciones procesadas.`, "success"); else showSnackbar("Proceso completado, no se crearon nuevas verificaciones.", "info");} catch (e) { console.error('[FRONTEND] Error en handleEjecutarVerificaciones:', e); setExecutionStatus(prev => ({ ...prev, message: `Error al ejecutar: ${e.message}` })); } finally { setIsExecuting(false); setSelectedItems(new Set()); cargarTodo(fecha); }};    
    let countParaEjecutar = 0; let botonEjecutarDeshabilitado = true; if (selectedItems.size > 0) { countParaEjecutar = getProcessableItems(resumen.filter(item => selectedItems.has(getItemId(item)))).length; botonEjecutarDeshabilitado = countParaEjecutar === 0 || isExecuting || loading || loadingHistorial; } else { countParaEjecutar = itemsConPendientes; botonEjecutarDeshabilitado = itemsConPendientes === 0 || isExecuting || loading || loadingHistorial; }

    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <>
                    <Head><title>Verificación Automática</title></Head>
                    <Container maxWidth="xl" sx={{ py: 4 }}>
                        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
                            <Paper elevation={3} sx={{ p: {xs: 2, sm: 3}, mb: 4, borderRadius: '12px' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <EventRepeatIcon sx={{ mr: 1.5, fontSize: {xs:'2rem', sm:'2.5rem'}, color: 'primary.main' }} />
                                        <Typography variant="h4" component="h1" sx={{fontWeight: 'bold', fontSize: {xs:'1.8rem', sm:'2.2rem'}}}>
                                            Verificación Automática
                                        </Typography>
                                    </Box>
                                    <DatePicker
                                        label="Evaluar Hasta Fecha"
                                        value={fecha}
                                        onChange={(newDate) => newDate && isDateValidFns(newDate) && setFecha(newDate)}
                                        sx={{ minWidth: {xs:'100%', sm:'220px'} }}
                                        format="dd/MM/yyyy"
                                        slotProps={{ textField: { size: 'small', variant: 'outlined' } }}
                                        maxDate={new Date()}
                                        disabled={loading || isExecuting || loadingHistorial}
                                    />
                                </Box>
                                <Divider sx={{mb:3}}/>
                                {loading && (
                                    <Box sx={{display: 'flex', justifyContent:'center', alignItems:'center', gap: 2, py: 2}}>
                                        <CircularProgress size={24}/> 
                                        <Typography>Cargando resumen...</Typography>
                                    </Box>
                                )}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                            <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                                {error}
                                            </MuiAlert>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {!loading && !error && (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} md={4}>
                                            <Chip
                                                icon={<AssignmentLateIcon />}
                                                label={`${itemsConPendientes} Ítem(s) con Pendientes (Global)`}
                                                color={itemsConPendientes > 0 ? "warning" : "success"}
                                                sx={{fontSize: '1rem', p: 2, width:'100%', height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal'}}}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={8} sx={{display: 'flex', gap: 2, justifyContent: {xs:'center', md:'flex-end'}, flexWrap:'wrap'}}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<UpdateIcon />}
                                                onClick={() => { setSearchTerm(''); setSelectedItems(new Set()); cargarTodo(fecha);}}
                                                disabled={isExecuting || loading || loadingHistorial}
                                            >
                                                Refrescar
                                            </Button>
                                            <Button
                                                variant="contained"
                                                startIcon={isExecuting ? <CircularProgress size={20} color="inherit"/> : <PlayCircleOutlineIcon />}
                                                onClick={handleEjecutarVerificaciones}
                                                disabled={botonEjecutarDeshabilitado}
                                                color="primary"
                                            >
                                                {selectedItems.size > 0 ? `Ejecutar Selec. (${countParaEjecutar})` : `Ejecutar Todos (${countParaEjecutar})`}
                                            </Button>
                                        </Grid>
                                    </Grid>
                                )}

                                <AnimatePresence>
                                    {executionStatus.message && !loading && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                            <Paper elevation={1} sx={{ mt: 3, p: 2, borderRadius: '8px', borderLeft: 5, borderColor: executionStatus.errores?.length > 0 ? 'error.main' : 'success.main' }}>
                                                <Typography variant="subtitle1" gutterBottom sx={{fontWeight:'medium'}}>
                                                    {executionStatus.message}
                                                </Typography>
                                                {isExecuting && <LinearProgress sx={{my:1}} />}
                                                {executionStatus.resultados.length > 0 && (
                                                    <Box sx={{maxHeight: 150, overflowY: 'auto', mt: 1, fontSize: '0.8rem'}}>
                                                        <Typography variant="caption" sx={{fontWeight:'medium', color:'success.dark'}}>Éxitos:</Typography>
                                                        <List dense disablePadding>
                                                            {executionStatus.resultados.map((r, idx) => (
                                                                <ListItem key={`res-${idx}`} sx={{py:0.2}}>
                                                                    <ListItemIcon sx={{minWidth: 20}}><CheckCircleIcon fontSize="small" color="success"/></ListItemIcon>
                                                                    <ListItemText primaryTypographyProps={{fontSize:'0.75rem'}} primary={`${r.clienteDni} - ${r.actividad} (${r.fecha}): ${r.status}`} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Box>
                                                )}
                                                {executionStatus.errores.length > 0 && (
                                                    <Box sx={{maxHeight: 150, overflowY: 'auto', mt: 1, fontSize: '0.8rem'}}>
                                                        <Typography variant="caption" sx={{fontWeight:'medium', color:'error.dark'}}>Errores:</Typography>
                                                        <List dense disablePadding>
                                                            {executionStatus.errores.map((e, idx) => (
                                                                <ListItem key={`err-${idx}`} sx={{py:0.2}}>
                                                                    <ListItemIcon sx={{minWidth: 20}}><ErrorIcon fontSize="small" color="error"/></ListItemIcon>
                                                                    <ListItemText primaryTypographyProps={{fontSize:'0.75rem', color:'error.dark'}} primary={`${e.clienteDni || '?'} - ${e.actividad || '?'} (${e.fecha || '?'}): ${e.error}`} />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </Box>
                                                )}
                                            </Paper>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Paper>
                        </motion.div>

                        {!loading && !error && (
                            <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2, mt: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                        <ListAltIcon sx={{mr:1.5, fontSize: {xs:'1.8rem', sm:'2rem'}, color: 'text.secondary'}} />
                                        <Typography variant="h5" component="h2" sx={{fontWeight: 'medium'}}>
                                            Resumen de Estado
                                            {searchTerm && (
                                                <Typography component="span" variant="caption" sx={{ml:1, color: 'text.secondary'}}>
                                                    (Mostrando {filteredResumen.length} de {resumen.length} para "{searchTerm}")
                                                </Typography>
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Paper elevation={2} sx={{ p: {xs:1.5, sm:2}, mb: 3, borderRadius: '12px' }}>
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        label="Buscar en Resumen por DNI, Nombre Cliente o Actividad"
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
                                        disabled={loading || isExecuting || loadingHistorial}
                                    />
                                </Paper>

                                {filteredResumen.length > 0 ? (
                                    <TableContainer component={Paper} elevation={2} sx={{borderRadius: '12px'}}>
                                        <Table sx={{ minWidth: 800 }} aria-label="resumen verificación automática" size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell padding="checkbox">
                                                        <Checkbox
                                                            indeterminate={selectedItems.size > 0 && selectedItems.size < procesableItemsInView.length}
                                                            checked={procesableItemsInView.length > 0 && selectedItems.size === procesableItemsInView.length}
                                                            onChange={handleSelectAllClick}
                                                            inputProps={{ 'aria-label': 'select all processable items in view' }}
                                                            disabled={procesableItemsInView.length === 0 || isExecuting}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{fontWeight:'bold'}}>Cliente (DNI)</TableCell>
                                                    <TableCell sx={{fontWeight:'bold'}}>Actividad</TableCell>
                                                    <TableCell sx={{fontWeight:'bold', textAlign:'center'}}>Clases Pend.</TableCell>
                                                    <TableCell sx={{fontWeight:'bold'}}>Días Visita</TableCell>
                                                    <TableCell sx={{fontWeight:'bold', textAlign:'center'}}>¿Pendiente?</TableCell>
                                                    <TableCell sx={{fontWeight:'bold', minWidth: 180}}>Días a Verificar Autom.</TableCell>
                                                    <TableCell align="center" sx={{fontWeight:'bold'}}>Editar Días</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <AnimatePresence>
                                                    {filteredResumen.map((item, i) => {
                                                        const itemId = getItemId(item);
                                                        const isItemSelected = selectedItems.has(itemId);
                                                        const isItemProcessable = item.tieneVerificacionesPendientes && Array.isArray(item.diasParaVerificarAutomaticamente) && item.diasParaVerificarAutomaticamente.length > 0;
                                                        return (
                                                            <MotionTableRow
                                                                key={itemId + `_row_${i}`}
                                                                layout
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                exit={{ opacity: 0 }}
                                                                hover
                                                                selected={isItemSelected}
                                                                sx={{
                                                                    backgroundColor: isItemSelected ? 'action.selected' : (item.tieneVerificacionesPendientes ? 'warning.lighter' : 'inherit'),
                                                                    '&:last-child td, &:last-child th': { border: 0 }
                                                                }}
                                                            >
                                                                <TableCell padding="checkbox">
                                                                    <Checkbox
                                                                        checked={isItemSelected}
                                                                        onChange={(event) => handleSelectItemClick(event, itemId)}
                                                                        inputProps={{ 'aria-labelledby': `checkbox-label-${itemId}` }}
                                                                        disabled={!isItemProcessable || isExecuting}
                                                                        size="small"
                                                                    />
                                                                </TableCell>
                                                                <TableCell id={`checkbox-label-${itemId}`}>{item.cliente.nombre} ({item.cliente.dni})</TableCell>
                                                                <TableCell><Chip label={item.actividad} variant="outlined" size="small" color="primary"/></TableCell>
                                                                <TableCell align="center">{item.clasesPendientes}</TableCell>
                                                                <TableCell sx={{fontSize:'0.8rem'}}>
                                                                    {(Array.isArray(item.visitasAsignadas) ? item.visitasAsignadas : []).sort((a,b)=>a-b).map(dNum => DIA_NOMBRE_UI[dNum] || '?').join(', ') || '—'}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Chip
                                                                        label={item.tieneVerificacionesPendientes ? 'Sí' : 'No'}
                                                                        color={item.tieneVerificacionesPendientes ? "warning" : "success"}
                                                                        size="small"
                                                                        variant={item.tieneVerificacionesPendientes ? "filled" : "outlined"}
                                                                    />
                                                                </TableCell>
                                                                <TableCell sx={{fontSize:'0.8rem'}}>
                                                                    {Array.isArray(item.diasParaVerificarAutomaticamente) && item.diasParaVerificarAutomaticamente.length > 0
                                                                        ? item.diasParaVerificarAutomaticamente.map(dInfo => `${DIA_NOMBRE_UI[dInfo.diaNumero]} (${formatDateFns(utcToZonedTime(dInfo.fechaEspecificaParaVerificar, 'UTC'), 'dd/MM')})`).join('; ')
                                                                        : (item.clasesPendientes > 0 && item.visitasAsignadas?.length > 0
                                                                            ? <Chip label="Al día" size="small" color="success" variant='outlined'/>
                                                                            : <Chip label="N/A" size="small" variant="outlined" />)}
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Tooltip title="Editar Días de Visita Asignados">
                                                                        <span>
                                                                            <IconButton size="small" color="secondary" onClick={() => handleOpenEditDialog(item)} disabled={isExecuting}>
                                                                                <EditCalendarIcon fontSize="small"/>
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                </TableCell>
                                                            </MotionTableRow>
                                                        );
                                                    })}
                                                </AnimatePresence>
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : searchTerm && resumen.length > 0 ? (
                                    <Paper elevation={1} sx={{p:3, textAlign:'center', mt:2, borderRadius:'8px' }}>
                                        <SearchOffIcon sx={{fontSize: 48, color: 'text.secondary', mb:1}}/>
                                        <Typography color="text.secondary">No se encontraron ítems que coincidan con "{searchTerm}".</Typography>
                                    </Paper>
                                ) : !searchTerm && resumen.length === 0 && !loading ? (
                                    <Paper elevation={1} sx={{p:3, textAlign:'center', mt:2, borderRadius:'8px' }}>
                                        <InfoOutlinedIcon sx={{fontSize: 48, color: 'text.secondary', mb:1}}/>
                                        <Typography color="text.secondary">No hay datos de resumen para la fecha.</Typography>
                                    </Paper>
                                ) : null}
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {!loading && !error && (
                                <motion.div variants={fadeInUp} initial="hidden" animate="visible" style={{ marginTop: '40px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <HistoryIconMui sx={{mr:1.5, fontSize: {xs:'1.8rem', sm:'2rem'}, color: 'text.secondary'}} />
                                        <Typography variant="h5" component="h2" sx={{fontWeight: 'medium'}}>
                                            Historial de Verificaciones Automáticas (Últimos 7 días)
                                        </Typography>
                                    </Box>
                                    {loadingHistorial ? (
                                        <Box sx={{display: 'flex', justifyContent: 'center', py:2}}><CircularProgress/></Box>
                                    ) : historialAutomaticas.length > 0 ? (
                                        <TableContainer component={Paper} elevation={2} sx={{borderRadius: '12px'}}>
                                            <Table size="small" aria-label="historial verificaciones automáticas">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{fontWeight:'bold'}}>Fecha y Hora</TableCell>
                                                        <TableCell sx={{fontWeight:'bold'}}>Cliente</TableCell>
                                                        <TableCell sx={{fontWeight:'bold'}}>Actividad</TableCell>
                                                        <TableCell sx={{fontWeight:'bold'}} align="center">Acción</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <AnimatePresence>
                                                        {historialAutomaticas.map((verif, index) => (
                                                            <MotionTableRow key={verif._id || `hist-auto-${index}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                                <TableCell>{formatDateFns(new Date(verif.fechaVerificacion), 'dd/MM/yyyy HH:mm:ss', { locale: es })}</TableCell>
                                                                <TableCell>{verif.nombreCliente || 'N/A'}</TableCell>
                                                                <TableCell><Chip label={verif.nombreActividad} size="small" variant="outlined" /></TableCell>
                                                                <TableCell align="center">
                                                                    <Tooltip title="Eliminar esta verificación automática">
                                                                        <span>
                                                                            <IconButton
                                                                                size="small" color="error"
                                                                                onClick={() => handleBorrarVerificacionHistorial(verif._id, index)}
                                                                                disabled={actionLoadingHistorial !== null}
                                                                            >
                                                                                {actionLoadingHistorial === index ? <CircularProgress size={18} color="inherit"/> : <DeleteForeverIcon fontSize="small" />}
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
                                            <Typography color="text.secondary">No hay historial de verificaciones automáticas recientes.</Typography>
                                        </Paper>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
                            <DialogTitle sx={{display:'flex', alignItems:'center'}}>
                                <EditCalendarIcon sx={{mr:1}}/>
                                Editar Días de Visita
                            </DialogTitle>
                            <DialogContent dividers>
                                <Typography gutterBottom>
                                    Cliente: <strong>{currentItemForEdit?.clienteDni}{currentItemForEdit?.clienteNombre && ` (${currentItemForEdit.clienteNombre})`}</strong>
                                </Typography>
                                <Typography gutterBottom>
                                    Actividad: <strong>{currentItemForEdit?.actividadNombre}</strong>
                                </Typography>
                                <Typography component="legend" variant="body2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                                    Seleccione los días:
                                </Typography>
                                <FormGroup row sx={{ justifyContent: 'space-around' }}>
                                    {DIA_NOMBRE_UI.map((nombreDia, numDia) => (
                                        <FormControlLabel
                                            key={numDia}
                                            control={
                                                <Checkbox
                                                    checked={diasVisitaEditados.includes(numDia)}
                                                    onChange={() => handleEditDiaChange(numDia)}
                                                    name={nombreDia}
                                                />
                                            }
                                            label={nombreDia}
                                        />
                                    ))}
                                </FormGroup>
                            </DialogContent>
                            <DialogActions sx={{p:2}}>
                                <Button onClick={handleCloseEditDialog} disabled={editLoading}>Cancelar</Button>
                                <Button
                                    onClick={handleGuardarDiasVisita}
                                    variant="contained"
                                    disabled={editLoading}
                                    startIcon={editLoading ? <CircularProgress size={16}/> : <SaveIcon />}
                                >
                                    Guardar Cambios
                                </Button>
                            </DialogActions>
                        </Dialog>

                        <Snackbar
                            open={snackbar.open}
                            autoHideDuration={6000}
                            onClose={handleCloseSnackbar}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        >
                            <MuiAlert
                                onClose={handleCloseSnackbar}
                                severity={snackbar.severity}
                                sx={{ width: '100%' }}
                                elevation={6}
                                variant="filled"
                            >
                                {snackbar.message}
                            </MuiAlert>
                        </Snackbar>
                    </Container>
                </>
            </LocalizationProvider>
        </ThemeProvider>
    );
}
