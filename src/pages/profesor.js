import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { useRouter } from 'next/router';
import EnhancedAttendanceTable from './EnhancedAttendanceTable';

import {
    Container, Box, Typography, TextField, Button, Grid, Card, CardContent,
    Snackbar, Alert, IconButton, CircularProgress, Paper, Avatar, Tooltip,
    Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
    alpha, InputAdornment, Badge,
    FormControl, InputLabel, Select, MenuItem, Collapse // Added Collapse
} from '@mui/material';

import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
    Close as CloseIcon, Logout as LogoutIcon, School as SchoolIcon, Person as PersonIcon,
    Email as EmailIcon, Phone as PhoneIcon, Home as HomeIcon, Fingerprint as FingerprintIcon,
    ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon, CheckCircle as CheckIcon,
    ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon, FilterList as FilterListIcon,
    MonetizationOn as MonetizationOnIcon, History as HistoryIcon,
    FitnessCenter as ActivityIcon
} from '@mui/icons-material';

import {
    format, startOfWeek, endOfWeek, addDays, subDays, getISOWeek, isValid
} from 'date-fns';
import { es } from 'date-fns/locale';

// Tus constantes de estilo (lightPrimary, textSoft, etc.) permanecen igual
const lightPrimary = '#1976d2';
const lightSecondary = '#ffffff';
const lightPaperBg = '#F8FAFC';
const lightAccent = '#5B9BFF';
const lightGray = '#F2F6FA';
const dividerGray = '#E3E8EF';
const textMain = '#1A2138';
const textSoft = '#6A7587';
const softBlue = '#E7F1FF';

const alertColors = {
    success: { bg: '#EAFBF4', text: '#199c68', border: '#b6f0d8' },
    error: { bg: '#FFF2F2', text: '#b81d3c', border: '#FFD7D7' },
    warning: { bg: '#FFFBEA', text: '#b19716', border: '#FFF3C4' },
    info: { bg: '#E5F4FF', text: '#177DDC', border: '#B7E3FF' },
};

const buttonStyles = {
    contained: {
        background: lightPrimary,
        color: lightSecondary,
        fontWeight: 600,
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(40,80,250,0.10)',
        padding: '8px 16px', // Adecuado para mobile
        fontSize: { xs: '0.8rem', sm: '0.875rem' }, // Responsive font size
        '&:hover': { background: '#165abc' },
        '&.Mui-disabled': { background: alpha(lightPrimary, 0.3), color: '#bdbdbd' }
    },
    outlined: {
        borderColor: lightPrimary,
        color: lightPrimary,
        fontWeight: 600,
        borderRadius: 2,
        padding: '8px 16px',
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
        '&:hover': {
            background: alpha(lightPrimary, 0.06),
            borderColor: alpha(lightPrimary, 0.5)
        },
    },
    text: {
        color: lightPrimary,
        fontWeight: 600,
        fontSize: { xs: '0.8rem', sm: '0.875rem' },
        '&:hover': { background: alpha(lightPrimary, 0.04) }
    }
};

const commonInputStyles = (isSelect = false) => ({
    '& label': { color: textSoft, fontSize: { xs: '0.9rem', sm: '1rem'} },
    '& label.Mui-focused': { color: lightPrimary },
    '& .MuiInputBase-root': {
        backgroundColor: lightGray,
        color: textMain,
        fontSize: { xs: '0.9rem', sm: '1rem'},
        '& fieldset': { borderColor: dividerGray },
        '&:hover fieldset': { borderColor: alpha(lightPrimary, 0.5) },
        '&.Mui-focused fieldset': { borderColor: lightPrimary },
        '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: lightPrimary, fontSize: { xs: '1.2rem', sm: '1.5rem'} }
    },
    ...(isSelect && { '& .MuiSelect-icon': { color: lightPrimary } }),
});


const DIAS_LABORABLES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export async function getServerSideProps(context) {
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = context.req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    let profesores = [];
    let actividades = [];
    try {
        const resProf = await fetch(`${baseUrl}/api/profesor`);
        if (resProf.ok) profesores = await resProf.json();
        else console.error("getServerSideProps: Error fetching profesores", resProf.status);


        const resAct = await fetch(`${baseUrl}/api/actividades`);
        if (resAct.ok) actividades = await resAct.json();
        else console.error("getServerSideProps: Error fetching actividades", resAct.status);

    } catch (error) {
        console.error("Error fetching data in getServerSideProps:", error);
    }

    return { props: { data: profesores, actividadesServer: actividades } };
}

export default function Profesor({ data = [], actividadesServer = [] }) {
    const router = useRouter();

    const [form, setForm] = useState({
        nombre: '', telefono: '', mail: '', domicilio: '', dni: '',
        actividad: '', tarifaPorHora: '', id: null
    });
    const [mensaje, setMensaje] = useState(''); // Consider removing if snackbar is primary feedback
    const [error, setError] = useState(''); // For general page errors, distinct from snackbar errors
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false); // For form submission
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredData, setFilteredData] = useState(data); // Will be professor list for the table
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({});
    const [loadingAttendance, setLoadingAttendance] = useState(false); // For fetching/saving attendance
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [confirmDialogData, setConfirmDialogData] = useState({ title: '', message: '', onConfirm: () => { } });
    const [historialPagosVisible, setHistorialPagosVisible] = useState(false);
    const [profesorSeleccionadoHistorial, setProfesorSeleccionadoHistorial] = useState(null);
    const [pagosDelProfesor, setPagosDelProfesor] = useState([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [errorHistorial, setErrorHistorial] = useState('');
    const [loadingPago, setLoadingPago] = useState(false); // For registering a payment
    const [listaActividades, setListaActividades] = useState(actividadesServer);

    // Memoize filteredData for performance
    const processedFilteredData = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return data; // Return all data if no search term
        return data.filter(p => (
            p.nombre?.toLowerCase().includes(term) ||
            p.mail?.toLowerCase().includes(term) ||
            p.actividad?.toLowerCase().includes(term) ||
            p.telefono?.toString().includes(term) ||
            p.dni?.toString().includes(term)
        ));
    }, [searchTerm, data]);

    useEffect(() => {
      setFilteredData(processedFilteredData);
    }, [processedFilteredData]);


    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const toggleExpand = () => {
        if (expanded && isEditing) { // If closing while editing, reset form
            setForm({ nombre: '', telefono: '', mail: '', domicilio: '', dni: '', actividad: '', tarifaPorHora: '', id: null });
            setIsEditing(false);
        }
        setExpanded(!expanded);
    };

    const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        // setMensaje(''); // Not used
        // setError(''); // Use snackbar for form errors

        const tarifaNum = parseFloat(form.tarifaPorHora);
        if (form.tarifaPorHora.trim() !== '' && (isNaN(tarifaNum) || tarifaNum < 0)) {
            setSnackbar({ open: true, message: 'La tarifa por hora debe ser un número positivo o vacía.', severity: 'error' });
            setLoading(false);
            return;
        }

        const formToSend = { ...form, tarifaPorHora: form.tarifaPorHora.trim() === '' ? 0 : tarifaNum };

        try {
            const url = isEditing ? `/api/profesor?id=${form.id}` : '/api/profesor';
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formToSend) });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || result.message || `Error ${res.status}`);

            setSnackbar({ open: true, message: isEditing ? 'Profesor actualizado con éxito' : 'Profesor agregado con éxito', severity: 'success' });
            setForm({ nombre: '', telefono: '', mail: '', domicilio: '', dni: '', actividad: '', tarifaPorHora: '', id: null });
            setExpanded(false); // Collapse form on success
            setIsEditing(false);
            router.replace(router.asPath); // Refresh data
        } catch (submitError) {
            setSnackbar({ open: true, message: `Error al guardar: ${submitError.message}`, severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = profesor => {
        setForm({
            nombre: profesor.nombre || '',
            telefono: profesor.telefono || '',
            mail: profesor.mail || profesor.correo || '', // Handle both possible mail fields
            domicilio: profesor.domicilio || '',
            dni: profesor.dni || '',
            actividad: profesor.actividad || '',
            tarifaPorHora: profesor.tarifaPorHora !== undefined && profesor.tarifaPorHora !== null ? profesor.tarifaPorHora.toString() : '',
            id: profesor.id || profesor._id || null // Handle both possible ID fields
        });
        setIsEditing(true);
        setExpanded(true); // Ensure form is open for editing
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see the form on mobile
    };

    const openConfirmDialog = (title, message, onConfirmCallback) => {
        setConfirmDialogData({ title, message, onConfirm: onConfirmCallback });
        setConfirmDialogOpen(true);
    };
    const handleConfirmDialogClose = () => setConfirmDialogOpen(false);
    const handleConfirmDialogConfirm = () => {
        if (typeof confirmDialogData.onConfirm === 'function') confirmDialogData.onConfirm();
        setConfirmDialogOpen(false);
    };

    const handleDelete = async (id, nombreProfesor) => {
        openConfirmDialog(
            "Confirmar Eliminación",
            `¿Está seguro de que desea eliminar a ${nombreProfesor || 'este profesor'}? Esta acción no se puede deshacer.`,
            async () => {
                // setLoading(true); // Potentially set a specific loading state for this profesor row in table
                try {
                    const res = await fetch(`/api/profesor?id=${id}`, { method: 'DELETE' });
                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(errorData.message || `Error ${res.status} al eliminar`);
                    }
                    setSnackbar({ open: true, message: 'Profesor eliminado con éxito', severity: 'success' });
                    router.replace(router.asPath);
                } catch (deleteErr) {
                    setSnackbar({ open: true, message: `Error al eliminar: ${deleteErr.message}`, severity: 'error' });
                } finally {
                    // setLoading(false);
                }
            }
        );
    };
    
    // --- Funciones de Asistencia y Pagos (lógica interna sin cambios visuales directos aquí) ---
    // loadAttendanceData, handleHoursChange, saveAttendanceData, calculateTotalsForWeek,
    // handleOpenHistorialPagos, handleCloseHistorialPagos, handleRegistrarPagoSemana
    // Estas funciones son cruciales pero sus cambios para responsividad estarían dentro de EnhancedAttendanceTable o los Dialogs.

        // Asistencia: carga datos para la semana seleccionada
    const loadAttendanceData = async (dateForWeek) => {
        if (!isValid(dateForWeek) || !Array.isArray(data) || data.length === 0) {
            setAttendanceData({});
            return;
        }
        const anio = dateForWeek.getFullYear();
        const isoWeek = getISOWeek(dateForWeek);
        setLoadingAttendance(true);
        // setError(''); // Handled by snackbar
        try {
            const res = await fetch(`/api/profesor/asistencia?semana=${isoWeek}&anio=${anio}`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error ${res.status} al cargar asistencia`);
            }
            const asistenciaSemanal = await res.json();
            const newAttendanceState = {};
            // Ensure 'data' (professors list) is up-to-date when this runs
            const currentProfessors = data; // Use the state 'data' directly

            currentProfessors.forEach(profesor => {
                const profesorIdStr = (profesor.id || profesor._id).toString();
                const weekDataForProfesor = asistenciaSemanal[profesorIdStr] || {};
                newAttendanceState[profesorIdStr] = {};
                DIAS_LABORABLES.forEach(dia => {
                    newAttendanceState[profesorIdStr][dia] = { horas: (weekDataForProfesor[dia]?.horas || 0) };
                });
            });
            setAttendanceData(newAttendanceState);
        } catch (err) {
            // setError(`Error al cargar datos de asistencia: ${err.message}`); // Use snackbar
            setSnackbar({ open: true, message: `Error al cargar asistencia: ${err.message}`, severity: 'error' });
        } finally {
            setLoadingAttendance(false);
        }
    };

    useEffect(() => {
        if (data.length > 0) { // Only load if there are professors
          loadAttendanceData(selectedDate);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, data]); // Rerun if selectedDate or the main professor list (data) changes

    const handleHoursChange = (profesorId, day, value) => {
        const numericValue = Math.max(0, Number(value) || 0); // Ensure positive or zero
        setAttendanceData(prev => {
            const currentProfesorData = prev[profesorId.toString()] || {};
            const defaultDaysValues = {};
            DIAS_LABORABLES.forEach(d => {
                defaultDaysValues[d] = { horas: ((currentProfesorData[d] || {}).horas || 0) };
            });
            return {
                ...prev,
                [profesorId.toString()]: {
                    ...defaultDaysValues, // Ensure all days are present
                    // ...currentProfesorData, // This was potentially overriding defaultDaysValues if a day was missing
                    [day]: { horas: numericValue }
                }
            };
        });
    };

    const saveAttendanceData = async () => {
        if (!isValid(selectedDate)) {
            setSnackbar({ open: true, message: 'La fecha seleccionada no es válida.', severity: 'error' });
            return;
        }
        const anio = selectedDate.getFullYear();
        const isoWeek = getISOWeek(selectedDate);
        setLoadingAttendance(true);
        // setError('');

        try {
            const payload = Object.keys(attendanceData)
                .filter(profesorId => data.some(p => (p.id || p._id).toString() === profesorId)) // Match against current professor list
                .map(profesorId => ({
                    semana: isoWeek,
                    anio: anio,
                    profesorId,
                    dias: attendanceData[profesorId] // This should now have all DIAS_LABORABLES
                }));

            if (payload.length === 0 && data.length > 0) { // Check if there's data to save for existing professors
                 setSnackbar({ open: true, message: 'No hay datos de asistencia modificados para guardar.', severity: 'info' });
                 setLoadingAttendance(false);
                 return;
            }
             if (payload.length === 0 && data.length === 0) {
                 setSnackbar({ open: true, message: 'No hay profesores para guardar asistencia.', severity: 'info' });
                 setLoadingAttendance(false);
                 return;
            }


            const res = await fetch('/api/profesor/asistencia/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error ${res.status} al guardar asistencia`);
            }
            setSnackbar({ open: true, message: `Asistencia para la semana ${isoWeek}/${anio} guardada.`, severity: 'success' });
        } catch (err) {
            // setError(`Error al guardar asistencia: ${err.message}`);
            setSnackbar({ open: true, message: `Error al guardar asistencia: ${err.message}`, severity: 'error' });
        } finally {
            setLoadingAttendance(false);
        }
    };
    
    const calculateTotalsForWeek = (profesorId) => {
        const profesor = data.find(p => (p.id || p._id).toString() === profesorId.toString());
        let tarifaProfesor = profesor && !isNaN(parseFloat(profesor.tarifaPorHora)) ? parseFloat(profesor.tarifaPorHora) : 0;
        if (tarifaProfesor < 0) tarifaProfesor = 0;
    
        const weekData = attendanceData[profesorId.toString()] || {};
        let totalHoras = 0;
        DIAS_LABORABLES.forEach(dia => { // Iterate over defined working days
            totalHoras += (weekData[dia]?.horas || 0);
        });
    
        return {
            totalHoras,
            totalMonto: totalHoras * tarifaProfesor,
            tarifaAplicada: tarifaProfesor
        };
    };

    const handleOpenHistorialPagos = async (profesor) => {
        const profId = profesor.id || profesor._id;
        if (!profesor || !profId) {
            // setErrorHistorial("ID de profesor inválido.");
            setSnackbar({ open: true, message: "ID de profesor inválido.", severity: 'error' });
            return;
        }
        setProfesorSeleccionadoHistorial(profesor);
        setLoadingHistorial(true);
        setErrorHistorial('');
        setPagosDelProfesor([]);
        try {
            const res = await fetch(`/api/profesor/${profId}/pagos`);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Error ${res.status} al obtener historial`);
            }
            setPagosDelProfesor(await res.json());
        } catch (err) {
            setErrorHistorial(err.message); // Show error in dialog
            setPagosDelProfesor([]); // Clear previous data on error
            // setSnackbar({ open: true, message: `Error al cargar historial: ${err.message}`, severity: 'error' });
        } finally {
            setLoadingHistorial(false);
            setHistorialPagosVisible(true);
        }
    };

    const handleCloseHistorialPagos = () => {
        setHistorialPagosVisible(false);
        // Delay reset to allow dialog to close smoothly
        setTimeout(() => {
            setProfesorSeleccionadoHistorial(null);
            setPagosDelProfesor([]);
            setErrorHistorial('');
        }, 300);
    };

    const handleRegistrarPagoSemana = async (profesorId) => {
        const profesor = data.find(p => (p.id || p._id).toString() === profesorId.toString());
        if (!profesor) {
            setSnackbar({ open: true, message: 'Profesor no encontrado.', severity: 'error' });
            return;
        }
    
        const { totalMonto, tarifaAplicada } = calculateTotalsForWeek(profesorId);
    
        if (totalMonto <= 0) {
            setSnackbar({ open: true, message: 'No hay monto a pagar para esta semana.', severity: 'warning' });
            return;
        }
    
        const anioActual = selectedDate.getFullYear();
        const isoSemanaActual = getISOWeek(selectedDate);
    
        openConfirmDialog(
            "Confirmar Pago",
            `¿Registrar pago de $${totalMonto.toFixed(2)} para ${profesor.nombre} (Tarifa: $${tarifaAplicada.toFixed(2)}/hr) correspondiente a la Semana ${isoSemanaActual}/${anioActual}?`,
            async () => {
                setLoadingPago(true);
                try {
                    const payload = {
                        montoPagado: totalMonto,
                        semanaISO: isoSemanaActual,
                        anioISO: anioActual, // Make sure API expects this
                        descripcion: `Pago semana ${isoSemanaActual}/${anioActual} (Tarifa: $${tarifaAplicada.toFixed(2)}/hr)`
                    };
                    const apiUrl = `/api/profesor/${profesorId}/pagos`; // Use the correct ID
                    const res = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
    
                    // const responseText = await res.text(); // For debugging if needed
                    if (!res.ok) {
                        const errorResponse = await res.json().catch(() => ({message: `Error ${res.status}`}));
                        throw new Error(errorResponse.message);
                    }
                    setSnackbar({ open: true, message: 'Pago registrado con éxito.', severity: 'success' });
                    // Optionally refresh payment history if visible for this professor
                    if (historialPagosVisible && profesorSeleccionadoHistorial?.id.toString() === profesorId.toString()) {
                        await handleOpenHistorialPagos(profesorSeleccionadoHistorial);
                    }
                } catch (err) {
                    setSnackbar({ open: true, message: `Error al registrar pago: ${err.message}`, severity: 'error' });
                } finally {
                    setLoadingPago(false);
                }
            }
        );
    };


    const handleLogout = () => {
        localStorage.removeItem('usuario'); // O cualquier token/sesión que uses
        router.push('/Dashboard'); // O a la página de login
    };

    const getInitials = (name) => name ? name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : '??';

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, bgcolor: lightPaperBg, minHeight: '100vh', color: textMain, px: { xs: 1, sm: 2, md: 3} }}>
            {/* Header */}
            <Paper elevation={4} sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                mb: { xs: 2, sm: 3, md: 4 },
                borderRadius: 2, bgcolor: lightSecondary, color: textMain,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexDirection: { xs: 'column', sm: 'row' }, // Stack on XS
                textAlign: { xs: 'center', sm: 'left'} // Center text on XS
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: {xs: 1.5, sm: 0} }}>
                    <Avatar sx={{ bgcolor: lightPrimary, width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 }, mr: { xs: 1.5, sm: 2 } }}>
                        <SchoolIcon sx={{ fontSize: { xs: '1.8rem', sm: '2rem'}}} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" color={lightPrimary} sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' } }}>
                            Gestión de Profesores
                        </Typography>
                        <Typography variant="subtitle1" color={textSoft} sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}>
                            Administra registro, asistencia y pagos.
                        </Typography>
                    </Box>
                </Box>
                <Tooltip title="Cerrar sesión" arrow>
                    <IconButton onClick={handleLogout} size="large" sx={{ color: lightPrimary, mt: {xs: 1, sm: 0} }}>
                        <LogoutIcon />
                    </IconButton>
                </Tooltip>
            </Paper>

            {/* Formulario y Controles */}
            <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 3, borderRadius: 2, bgcolor: lightSecondary, color: textMain }}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} md={7}> {/* Search takes more space */}
                        <TextField
                            fullWidth
                            placeholder="Buscar profesor por nombre, DNI, actividad..."
                            variant="outlined"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            size="small"
                            sx={commonInputStyles()}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: lightPrimary }} /></InputAdornment>,
                                endAdornment: searchTerm && (
                                    <IconButton size="small" onClick={() => setSearchTerm('')} title="Limpiar" sx={{ color: lightPrimary }}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={5} sx={{ textAlign: { xs: 'center', md: 'right' }, mt: {xs: 1.5, md: 0} }}>
                        <Button
                            sx={{...buttonStyles.contained, width: {xs: '100%', sm: 'auto'}}} // Full width on XS
                            startIcon={expanded ? <ExpandLessIcon /> : <AddIcon />}
                            onClick={toggleExpand}
                        >
                            {expanded ? (isEditing ? 'Terminar Edición' : 'Ocultar Formulario') : 'Agregar Profesor'}
                        </Button>
                    </Grid>
                </Grid>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, borderTop: `1px solid ${dividerGray}`, pt: 2 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: lightPrimary, fontSize: {xs: '1.1rem', sm: '1.25rem'} }}>
                            {isEditing ? 'Editar Profesor' : 'Nuevo Profesor'}
                        </Typography>
                        <Grid container spacing={2}>
                            {/* Form fields - xs={12} sm={6} is good for responsiveness */}
                            <Grid item xs={12} sm={6}><TextField fullWidth name="nombre" label="Nombre completo" variant="outlined" value={form.nombre} onChange={handleChange} required sx={commonInputStyles()} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth name="dni" label="DNI" type="number" variant="outlined" value={form.dni} onChange={handleChange} required sx={commonInputStyles()} InputProps={{ startAdornment: <InputAdornment position="start"><FingerprintIcon /></InputAdornment> }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth name="telefono" label="Teléfono" type="tel" variant="outlined" value={form.telefono} onChange={handleChange} sx={commonInputStyles()} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth name="mail" label="Correo" type="email" variant="outlined" value={form.mail} onChange={handleChange} sx={commonInputStyles()} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} /></Grid>
                            <Grid item xs={12} sm={6}><TextField fullWidth name="tarifaPorHora" label="Tarifa por Hora ($)" type="number" variant="outlined" value={form.tarifaPorHora} onChange={handleChange} sx={commonInputStyles()} InputProps={{ startAdornment: <InputAdornment position="start"><MonetizationOnIcon /></InputAdornment>, inputProps: { min: 0, step: "0.01" } }} placeholder="Ej: 20.50" /></Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined" sx={commonInputStyles(true)}>
                                    <InputLabel id="actividad-select-label" sx={{display: 'flex', alignItems: 'center'}}>
                                      <ActivityIcon sx={{ mr: 0.5, fontSize: '1.1rem', color: lightPrimary }} /> Actividad
                                    </InputLabel>
                                    <Select labelId="actividad-select-label" name="actividad" value={form.actividad} onChange={handleChange} label="Actividad" MenuProps={{ PaperProps: { sx: { bgcolor: lightSecondary, '& .MuiMenuItem-root': { '&:hover': { bgcolor: softBlue }, '&.Mui-selected': { backgroundColor: alpha(lightPrimary, 0.15) } } } } }}>
                                        <MenuItem value="" sx={{ fontStyle: 'italic', color: textSoft }}><em>Ninguna</em></MenuItem>
                                        {(listaActividades || []).map(act => (<MenuItem key={act._id || act.id || act.nombre} value={act.nombre}>{act.nombre}</MenuItem>))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}><TextField fullWidth name="domicilio" label="Domicilio" variant="outlined" value={form.domicilio} onChange={handleChange} sx={commonInputStyles()} InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon /></InputAdornment> }} /></Grid>
                            <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
                                <Button onClick={toggleExpand} sx={{ ...buttonStyles.outlined, mr: 1 }} disabled={loading}>Cancelar</Button>
                                <Button type="submit" sx={buttonStyles.contained} disabled={loading} startIcon={loading ? <CircularProgress size={20} sx={{ color: lightSecondary }} /> : (isEditing ? <EditIcon /> : <CheckIcon />)}>
                                    {isEditing ? 'Actualizar' : 'Guardar'}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </Paper>

            {/* Selector semana y botones */}
            <Paper elevation={1} sx={{
                p: { xs: 1, sm: 1.5, md: 2 },
                mb: 3, borderRadius: 2, bgcolor: lightSecondary, color: textMain,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                border: `1px solid ${dividerGray}`,
                flexDirection: { xs: 'column', sm: 'row' } // Stack on XS
            }}>
                <IconButton onClick={() => setSelectedDate(prev => subDays(prev, 7))} disabled={loadingAttendance || loadingPago} sx={{ color: lightPrimary, p: {xs: 0.5, sm: 1} }}>
                    <ChevronLeftIcon sx={{fontSize: {xs: '1.8rem', sm: '2rem'}}}/>
                </IconButton>
                <Box textAlign="center" sx={{my: {xs: 1, sm: 0}}}>
                    <Typography variant="h6" component="div" sx={{ color: lightPrimary, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Semana {getISOWeek(selectedDate)}
                    </Typography>
                    <Typography variant="body1" sx={{ color: textSoft, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                        {`${format(startOfWeek(selectedDate, { weekStartsOn: 1, locale: es }), 'dd/MM/yy', { locale: es })} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1, locale: es }), 'dd/MM/yy', { locale: es })}`}
                    </Typography>
                </Box>
                <IconButton onClick={() => setSelectedDate(prev => addDays(prev, 7))} disabled={loadingAttendance || loadingPago} sx={{ color: lightPrimary, p: {xs: 0.5, sm: 1} }}>
                    <ChevronRightIcon sx={{fontSize: {xs: '1.8rem', sm: '2rem'}}}/>
                </IconButton>
            </Paper>

            {/* Botón Guardar Asistencia */}
            <Box sx={{ display: 'flex', justifyContent: {xs: 'center', sm: 'flex-end'}, mb: 3 }}> {/* Center on XS */}
                <Button
                    sx={{...buttonStyles.contained, width: {xs: '100%', sm: 'auto'}}} // Full width on XS
                    onClick={saveAttendanceData}
                    disabled={loadingAttendance || loadingPago}
                    startIcon={loadingAttendance ? <CircularProgress size={20} sx={{ color: lightSecondary }} /> : <CheckIcon />}
                >
                    Guardar Asistencia (S{getISOWeek(selectedDate)}) {/* Shorter text for mobile */}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Tabla asistencia - Wrapped for horizontal scroll on mobile */}
            <Paper sx={{ borderRadius: 2, overflowX: 'auto', bgcolor: lightSecondary, border: `1px solid ${dividerGray}` }}>
                <EnhancedAttendanceTable
                    filteredData={filteredData} // Use the state variable directly
                    attendanceData={attendanceData}
                    loadingAttendance={loadingAttendance}
                    handleHoursChange={handleHoursChange}
                    calculateTotalsForWeek={calculateTotalsForWeek}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                    getInitials={getInitials}
                    onVerHistorialPagos={handleOpenHistorialPagos}
                    onRegistrarPagoSemana={handleRegistrarPagoSemana}
                    loadingPagoSemana={loadingPago}
                    currentISOWeek={getISOWeek(selectedDate)}
                    currentYear={selectedDate.getFullYear()}
                    diasLaborables={DIAS_LABORABLES}
                    // Pass down style constants if EnhancedAttendanceTable uses them
                    colors={{ lightPrimary, lightSecondary, lightPaperBg, lightAccent, lightGray, dividerGray, textMain, textSoft, softBlue, alertColors, buttonStyles, commonInputStyles }}
                    generateRandomColor={(name) => { /* Your color generation logic */
                        const C = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1'];
                        if (!name) return C[0];
                        return C[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % C.length];
                    }}
                />
            </Paper>

            {/* Snackbar y Dialogs (MUI handles their responsiveness well by default) */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={closeSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={closeSnackbar} severity={snackbar.severity || 'info'} variant="filled" sx={{ width: '100%', boxShadow: `0 4px 15px ${alpha(lightPrimary, 0.06)}`, bgcolor: alertColors[snackbar.severity]?.bg || lightSecondary, color: alertColors[snackbar.severity]?.text || lightPrimary, '& .MuiAlert-icon': { color: alertColors[snackbar.severity]?.text || lightPrimary } }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>

            <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose} PaperProps={{ sx: { bgcolor: lightSecondary, borderRadius: 2, border: `1px solid ${dividerGray}`, color: textMain, maxWidth: '450px', m: { xs: 1, sm: 2 } } }}> {/* Margin for xs dialog */}
                <DialogTitle sx={{ color: lightPrimary, borderBottom: `1px solid ${dividerGray}`, fontWeight: 'medium', fontSize: {xs: '1.1rem', sm: '1.25rem'} }}>{confirmDialogData.title}</DialogTitle>
                <DialogContent><DialogContentText sx={{ color: textSoft, fontSize: {xs: '0.9rem', sm: '1rem'} }}>{confirmDialogData.message}</DialogContentText></DialogContent>
                <DialogActions sx={{ borderTop: `1px solid ${dividerGray}`, p: 2, flexDirection: {xs: 'column-reverse', sm: 'row'}, '& .MuiButton-root': { width: {xs: '100%', sm: 'auto'}, mb: {xs: 1, sm: 0}, '&:last-child': {mb: {xs:0}}} }}> {/* Stack buttons on xs */}
                    <Button onClick={handleConfirmDialogClose} sx={{ ...buttonStyles.outlined, color: lightPrimary, borderColor: lightPrimary }}>Cancelar</Button>
                    <Button onClick={handleConfirmDialogConfirm} sx={buttonStyles.contained} autoFocus>Confirmar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={historialPagosVisible} onClose={handleCloseHistorialPagos} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2, bgcolor: lightSecondary, border: `1px solid ${dividerGray}`, color: textMain, maxHeight: '90vh', m: { xs: 1, sm: 2 } } }}> {/* Margin for xs dialog */}
                <DialogTitle sx={{ bgcolor: alpha(lightGray, 0.1), color: lightPrimary, borderBottom: `1px solid ${dividerGray}`, fontWeight: 'medium', display: 'flex', alignItems: 'center', fontSize: {xs: '1.1rem', sm: '1.25rem'} }}>
                    <HistoryIcon sx={{ mr: 1, color: lightAccent }} />
                    Historial Pagos: {profesorSeleccionadoHistorial?.nombre || ''}
                    <IconButton aria-label="cerrar" onClick={handleCloseHistorialPagos} sx={{ position: 'absolute', right: {xs: 8, sm:16}, top: {xs:8, sm:16}, color: lightPrimary }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ p: {xs: 0, sm: 0} }}> {/* No padding for xs if content has its own */}
                    {loadingHistorial && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}><CircularProgress sx={{ color: lightPrimary }} /></Box>}
                    {errorHistorial && <Alert severity="error" sx={{ m: 2 }}>{errorHistorial}</Alert>}
                    {!loadingHistorial && !errorHistorial && pagosDelProfesor.length === 0 && <Typography sx={{ p: 3, textAlign: 'center', color: textSoft }}>No hay pagos registrados.</Typography>}
                    {!loadingHistorial && !errorHistorial && pagosDelProfesor.length > 0 && (
                        <Box> {/* Removed fixed height, DialogContent handles scroll */}
                            {pagosDelProfesor.map(pago => (
                                <Box key={pago._id || pago.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: {xs: 1.5, sm: 2}, borderBottom: `1px solid ${dividerGray}`, '&:last-child': { borderBottom: 'none' }, flexDirection: {xs: 'column', sm: 'row'}, textAlign: {xs: 'center', sm: 'left'} }}>
                                    <Box sx={{mb: {xs:1, sm:0}}}>
                                        <Typography variant="body1" sx={{ color: lightAccent, display: 'flex', alignItems: 'center', justifyContent: {xs: 'center', sm: 'flex-start'} }}>
                                            <MonetizationOnIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                                            <strong>${(pago.montoPagado || 0).toFixed(2)}</strong>
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: textSoft, fontSize: {xs: '0.75rem', sm: '0.8rem'} }}>
                                            {new Date(pago.fechaPago).toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} hs
                                        </Typography>
                                        {pago.descripcion && <Typography variant="body2" sx={{ fontStyle: 'italic', color: alpha(textSoft, 0.8), mt: 0.5, fontSize: {xs: '0.8rem', sm: '0.875rem'} }}>{pago.descripcion}</Typography>}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: `1px solid ${dividerGray}`, bgcolor: alpha(lightGray, 0.1) }}>
                    <Button onClick={handleCloseHistorialPagos} sx={{ ...buttonStyles.outlined, color: lightPrimary, borderColor: lightPrimary, width: {xs: '100%', sm: 'auto'} }}>Cerrar</Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}