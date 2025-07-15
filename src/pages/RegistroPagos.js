import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import {
    Box, Typography, Alert, Card, CardContent, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, Chip, Fade, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, IconButton, Grid, Paper, Divider,
    Select, MenuItem, InputLabel, FormControl, Avatar, Zoom, Slide, Grow, Tooltip,
    useMediaQuery, useTheme, CircularProgress, Link, alpha, Stack, InputAdornment
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon, Delete as DeleteIcon, Payment as PaymentIcon,
    AttachMoney as AttachMoneyIcon, People as PeopleIcon, Receipt as ReceiptIcon,
    Phone as PhoneIcon, Email as EmailIcon, Info as InfoIcon, TrendingUp as TrendingUpIcon,
    MonetizationOn as MonetizationOnIcon, AccountBalanceWallet as AccountBalanceWalletIcon,
    BarChart as BarChartIcon, CloudUpload as CloudUploadIcon, AddPhotoAlternate as AddPhotoAlternateIcon,
    InsertDriveFile as InsertDriveFileIcon, Cancel as CancelIcon, Image as ImageIcon,
    Close as CloseIcon, Description as DescriptionIcon,
    Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon,
    Event as EventIcon,
    CalendarToday as CalendarTodayIcon,
    EventBusy as EventBusyIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';

// --- Componentes personalizados con estilos ---
const AnimatedCard = styled(motion(Card))({
    transition: 'transform 0.3s, box-shadow 0.3s',
    borderRadius: '16px',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
    }
});

const MetricCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2.5),
    textAlign: 'center',
    borderRadius: '12px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    transition: 'all 0.3s ease',
    boxShadow: theme.shadows[1],
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: theme.shadows[6]
    }
}));

const PaymentButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)`,
    color: theme.palette.success.contrastText,
    fontWeight: 'bold',
    borderRadius: '8px',
    padding: theme.spacing(1.12, 2.8),
    fontSize: '1.4rem', 
    boxShadow: `0 4px 8px 0 ${alpha(theme.palette.success.main, 0.3)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.light} 90%)`,
        boxShadow: `0 6px 12px 0 ${alpha(theme.palette.success.dark, 0.35)}`,
        transform: 'translateY(-1px)'
    }
}));


const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)', height: 1, overflow: 'hidden',
    position: 'absolute', bottom: 0, left: 0, whiteSpace: 'nowrap', width: 1,
});

const FilePreview = styled(Box)(({ theme }) => ({
    width: '100%', padding: theme.spacing(1.5), border: `1px dashed ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius, display: 'flex', alignItems: 'center',
    marginTop: theme.spacing(1), marginBottom: theme.spacing(1), position: 'relative',
    transition: 'all 0.3s ease',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }
}));

const UploadDropZone = styled(Box)(({ theme, isDragActive, hasFile }) => ({
    border: `2px dashed ${isDragActive ? theme.palette.primary.main : hasFile ? theme.palette.success.main : theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius, padding: theme.spacing(2), textAlign: 'center',
    backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.05) : hasFile ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.grey[500], 0.02),
    transition: 'all 0.3s ease', cursor: 'pointer',
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        borderColor: theme.palette.primary.main
    }
}));

// --- Funciones Helper ---
const formatFullDateTime = (isoDateString) => {
    if (!isoDateString) return 'Sin fecha';
    try {
        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch(e) { return 'Fecha inválida'; }
};

const formatDateOnly = (isoDateString) => {
    if (!isoDateString) return 'N/A';
    try {
        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) return 'Fecha Inválida';
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
        return adjustedDate.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
        console.error("Error formatting date only:", isoDateString, e);
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

// --- Componente Principal ---
const RegistroPagos = () => {
    const [clientes, setClientes] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [montoPago, setMontoPago] = useState('');
    const [cargando, setCargando] = useState(true);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);
    const [openImagePreview, setOpenImagePreview] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [showTotal, setShowTotal] = useState(false);
    const [openPassword, setOpenPassword] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [snackPwError, setSnackPwError] = useState(false);

    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true); };
        const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false); };
        const handleDrop = (e) => {
            e.preventDefault(); e.stopPropagation(); setIsDragActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelection(e.dataTransfer.files[0]);
            }
        };
        const dropZoneElement = dropZoneRef.current;
        if (dropZoneElement) {
            dropZoneElement.addEventListener('dragover', handleDragOver);
            dropZoneElement.addEventListener('dragleave', handleDragLeave);
            dropZoneElement.addEventListener('drop', handleDrop);
            return () => {
                if (dropZoneElement) {
                    dropZoneElement.removeEventListener('dragover', handleDragOver);
                    dropZoneElement.removeEventListener('dragleave', handleDragLeave);
                    dropZoneElement.removeEventListener('drop', handleDrop);
                }
            };
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setCargando(true);
                setError('');
                const [clientesRes, infoclasesRes] = await Promise.all([
                    fetch('/api/clientes'),
                    fetch('/api/infoclases')
                ]);
                if (!clientesRes.ok) { throw new Error((await clientesRes.json().catch(() => ({}))).message || `Error ${clientesRes.status} cargando clientes`); }
                if (!infoclasesRes.ok) { throw new Error((await infoclasesRes.json().catch(() => ({}))).message || `Error ${infoclasesRes.status} cargando infoclases`); }
                
                const clientesData = await clientesRes.json();
                const infoclasesData = await infoclasesRes.json();
                const infoclasesMap = new Map();
                infoclasesData.forEach(ic => {
                    const key = `${ic.idCliente?.toString()}-${ic.nombreActividad}`;
                    infoclasesMap.set(key, ic);
                });

                const clientesCombinados = clientesData.map(cliente => {
                    const actividadesActualizadas = (cliente.actividades || []).map(actividad => {
                        const infoclaseKey = `${cliente._id?.toString()}-${actividad.nombre}`;
                        const claseCorrespondiente = infoclasesMap.get(infoclaseKey);
                        return {
                            ...actividad, 
                            clasesPendientes: claseCorrespondiente?.clasesPendientes ?? actividad.clasesPendientes ?? 0
                        };
                    });
                    const totalClasesPendientesCalculado = actividadesActualizadas.reduce((sum, act) => sum + (act.clasesPendientes || 0), 0);
                    return {
                        ...cliente, 
                        actividades: actividadesActualizadas,
                        totalClasesPendientes: totalClasesPendientesCalculado
                    };
                });
                setClientes(clientesCombinados);
            } catch (err) {
                setError('Error al cargar datos: ' + err.message);
                console.error("Error en fetchData:", err);
            } finally {
                setCargando(false);
            }
        };
        fetchData();
    }, []);

    const calcularDeudaTotal = (cliente) => { 
        if (!cliente) return 0;
        const tarifaTotal = (cliente.actividades || []).reduce((sum, act) => sum + parseFloat(act.tarifa || 0), 0);
        const totalPagado = (cliente.historialPagos || []).reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
        const deuda = tarifaTotal - totalPagado;
        return deuda > 0 ? parseFloat(deuda.toFixed(2)) : 0;
    };
    const calcularDeudaPorActividad = (cliente, actividadId) => { 
        if (!cliente || !cliente.actividades || !actividadId) return 0;
        const actividad = cliente.actividades.find(act => (act._id?.toString() || act.nombre) === actividadId.toString());
        if (!actividad) return 0;
        const tarifaActividad = parseFloat(actividad.tarifa || 0);
        const pagosActividad = (cliente.historialPagos || [])
            .filter(pago => pago.idActividad === (actividad._id?.toString() || actividad.nombre))
            .reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
        const deuda = tarifaActividad - pagosActividad;
        return deuda > 0 ? parseFloat(deuda.toFixed(2)) : 0;
    };
    const calcularTotalRecaudado = (cliente) => { 
        if (!cliente || !cliente.historialPagos) return 0;
        return cliente.historialPagos.reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
    };

    const getClienteStatus = (cliente) => { 
        if (!cliente) return { estado: 'desconocido', mensaje: 'N/A', tieneDeuda: false, color: 'default' };
        const deudaMonetaria = calcularDeudaTotal(cliente);
        const necesitaRenovarClasesGeneral = cliente.actividades?.some(act => act.clasesPendientes <= 0 && !act.clasePrueba) || false; 

        if (deudaMonetaria > 0) {
            return { estado: 'deudor_pago', mensaje: `Debe $${deudaMonetaria.toFixed(2)}`, tieneDeuda: true, color: 'error' };
        } else if (necesitaRenovarClasesGeneral) {
            return { estado: 'deudor_clases', mensaje: 'Renovar clases', tieneDeuda: true, color: 'warning' };
        } else {
            return { estado: 'al_dia', mensaje: 'Al día', tieneDeuda: false, color: 'success' };
        }
    };

    const tienePagosPendientes = (cliente) => getClienteStatus(cliente).tieneDeuda;
    
    const getNombreActividad = (cliente, actividadId) => {
        if (!cliente || !cliente.actividades || !actividadId) return 'Pago general';
        const actividad = cliente.actividades.find(act => (act._id?.toString() || act.nombre) === actividadId.toString());
        return actividad ? actividad.nombre : 'Actividad eliminada';
    };
    const getFileIcon = (fileNameOrUrl) => {
        if (!fileNameOrUrl) return <InsertDriveFileIcon color="action" />;
        const extension = fileNameOrUrl.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return <ImageIcon color="primary" />;
        if (extension === 'pdf') return <DescriptionIcon color="error" />;
        return <InsertDriveFileIcon color="action" />;
    };
    const handleFileSelection = (file) => {
        setError('');
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!file || !validTypes.includes(file.type)) { setError('Formato inválido (JPG, PNG, GIF, PDF)'); return; }
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) { setError('Archivo muy grande (max 10MB)'); return; }
        setSelectedFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result);
            reader.onerror = () => { console.error("Error leyendo archivo"); setFilePreview(null); }
            reader.readAsDataURL(file);
        } else { setFilePreview(null); }
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) handleFileSelection(e.target.files[0]);
    };
    const handleRemoveFile = () => {
        setSelectedFile(null); setFilePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        setError('');
    };
    const handleOpenImagePreview = (imageUrl) => {
        setPreviewImage(imageUrl); setOpenImagePreview(true);
    };

    const handleOpenModal = (cliente, actividadId = null) => {
        setClienteSeleccionado(cliente); setError('');
        let deudaSugerida = 0;
        let actividadParaModal = null;

        if (actividadId && cliente.actividades) {
            actividadParaModal = cliente.actividades.find(act => (act._id?.toString() || act.nombre) === actividadId.toString());
        }
        
        if (actividadParaModal) {
            setActividadSeleccionada(actividadParaModal);
            deudaSugerida = calcularDeudaPorActividad(cliente, actividadId);
        } else {
            setActividadSeleccionada(null);
            deudaSugerida = calcularDeudaTotal(cliente);
        }
        setMontoPago(deudaSugerida > 0 ? deudaSugerida.toString() : '');
        setSelectedFile(null); setFilePreview(''); setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setTimeout(() => {
            setClienteSeleccionado(null); setActividadSeleccionada(null);
            setSelectedFile(null); setFilePreview(''); setMontoPago(''); setError('');
        }, 300);
    };
    const handlePago = async () => {
        if (!clienteSeleccionado) return;
        const monto = parseFloat(montoPago);
        if (isNaN(monto) || monto <= 0) { setError('Monto inválido.'); return; }
        let deudaLimite = actividadSeleccionada ? calcularDeudaPorActividad(clienteSeleccionado, (actividadSeleccionada._id?.toString() || actividadSeleccionada.nombre) ) : calcularDeudaTotal(clienteSeleccionado);
        if (deudaLimite > 0 && monto > deudaLimite) { setError(`Monto excede deuda pendiente ($${deudaLimite.toFixed(2)})`); return; }
        try {
            setUploadingFile(true); setError('');
            const formData = new FormData();
            formData.append('monto', monto.toString());
            if (actividadSeleccionada?._id) formData.append('idActividad', actividadSeleccionada._id.toString());
            else if (actividadSeleccionada?.nombre && !actividadSeleccionada._id) formData.append('idActividad', actividadSeleccionada.nombre);
            if (selectedFile) formData.append('comprobante', selectedFile);
            
            const response = await fetch(`/api/clientes/${clienteSeleccionado._id}/pagos`, { method: 'POST', body: formData });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            const clienteActualizadoBackend = await response.json();
            
            const infoclasesRes = await fetch('/api/infoclases');
            const infoclasesData = await infoclasesRes.json();
            const infoclasesMap = new Map();
            infoclasesData.forEach(ic => {
                const key = `${ic.idCliente?.toString()}-${ic.nombreActividad}`;
                infoclasesMap.set(key, ic);
            });

            const actividadesActualizadasCliente = (clienteActualizadoBackend.actividades || []).map(actividad => {
                const infoclaseKey = `${clienteActualizadoBackend._id?.toString()}-${actividad.nombre}`;
                const claseCorrespondiente = infoclasesMap.get(infoclaseKey);
                return {
                    ...actividad,
                    clasesPendientes: claseCorrespondiente?.clasesPendientes ?? actividad.clasesPendientes ?? 0
                };
            });
            const totalClasesPendientesCalculadoCliente = actividadesActualizadasCliente.reduce((sum, act) => sum + (act.clasesPendientes || 0), 0);

            const clienteActualizadoCompleto = {
                ...clienteActualizadoBackend,
                actividades: actividadesActualizadasCliente,
                totalClasesPendientes: totalClasesPendientesCalculadoCliente
            };

            setClientes(prev => prev.map(c => c._id === clienteActualizadoCompleto._id ? clienteActualizadoCompleto : c));
            const nombreAct = actividadSeleccionada ? actividadSeleccionada.nombre : 'general';
            setSuccess(`Pago de $${monto.toFixed(2)} (${nombreAct}) registrado. ${selectedFile ? 'Comprobante adjunto.' : ''}`);
            setTimeout(() => setSuccess(''), 5000);
            handleCloseModal();
        } catch (err) {
            console.error('Error en handlePago:', err);
            setError(err.message || 'Error procesando pago.');
            setTimeout(() => setError(''), 7000);
        } finally {
            setUploadingFile(false);
        }
    };
    const handleEliminarPago = async (clienteId, pagoId) => {
        if (!confirm('¿Eliminar este pago?')) return;
        if (!pagoId || typeof pagoId !== 'string') { setError("ID de pago inválido."); setTimeout(() => setError(''), 5000); return; }
        try {
            setError('');
            const response = await fetch(`/api/clientes/${clienteId}/pagos?pagoId=${pagoId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            const clienteActualizadoBackend = await response.json();

            const infoclasesRes = await fetch('/api/infoclases');
            const infoclasesData = await infoclasesRes.json();
            const infoclasesMap = new Map();
            infoclasesData.forEach(ic => {
                const key = `${ic.idCliente?.toString()}-${ic.nombreActividad}`;
                infoclasesMap.set(key, ic);
            });

            const actividadesActualizadasCliente = (clienteActualizadoBackend.actividades || []).map(actividad => {
                const infoclaseKey = `${clienteActualizadoBackend._id?.toString()}-${actividad.nombre}`;
                const claseCorrespondiente = infoclasesMap.get(infoclaseKey);
                return {
                    ...actividad,
                    clasesPendientes: claseCorrespondiente?.clasesPendientes ?? actividad.clasesPendientes ?? 0
                };
            });
            const totalClasesPendientesCalculadoCliente = actividadesActualizadasCliente.reduce((sum, act) => sum + (act.clasesPendientes || 0), 0);

            const clienteActualizadoCompleto = {
                ...clienteActualizadoBackend,
                actividades: actividadesActualizadasCliente,
                totalClasesPendientes: totalClasesPendientesCalculadoCliente
            };

            setClientes(prev => prev.map(c => c._id === clienteActualizadoCompleto._id ? clienteActualizadoCompleto : c));
            setSuccess('Pago eliminado.');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('Error en handleEliminarPago:', err);
            setError(err.message || 'Error eliminando pago.');
            setTimeout(() => setError(''), 7000);
        }
    };
    const handleEyeClick = () => {
        setOpenPassword(true);
        setPasswordInput('');
        setSnackPwError(false);
    };
    const handlePasswordCheck = () => {
        if (passwordInput === 'popi') {
            setShowTotal(true);
            setOpenPassword(false);
        } else {
            setSnackPwError(true);
        }
    };
    const handlePasswordClose = () => {
        setOpenPassword(false);
        setPasswordInput('');
        setSnackPwError(false);
    };

    const clientesPendientes = clientes.filter(tienePagosPendientes);
    const totalRecaudado = clientes.reduce((total, cliente) => total + calcularTotalRecaudado(cliente), 0);
    const clientesActivos = clientes.length;
    const promedioPorCliente = clientesActivos > 0 ? totalRecaudado / clientesActivos : 0;
    const clientesConPrioridad = [...clientesPendientes]
        .sort((a, b) => {
            const statusA = getClienteStatus(a);
            const statusB = getClienteStatus(b);
            const pesoA = statusA.estado === 'deudor_pago' ? calcularDeudaTotal(a) : (statusA.estado === 'deudor_clases' ? -1 : -Infinity);
            const pesoB = statusB.estado === 'deudor_pago' ? calcularDeudaTotal(b) : (statusB.estado === 'deudor_clases' ? -1 : -Infinity);
            return pesoB - pesoA;
        })
        .slice(0, 3);

    const clientesFiltrados = clientes.filter(cliente => {
        const termino = terminoBusqueda.toLowerCase().trim();
        if (!termino) {
            return true;
        }

        const nombreMatch = cliente.nombre?.toLowerCase().includes(termino);
        const dniMatch = cliente.dni?.toString().includes(termino);
        const actividadMatch = cliente.actividades?.some(act =>
            act.nombre?.toLowerCase().includes(termino)
        );

        return nombreMatch || dniMatch || actividadMatch;
    });

    if (cargando) return ( <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"><CircularProgress size={60} /></Box> );

    return (
        <Box p={isMobile ? 2 : 4} sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Typography variant={isMobile ? "h5" : "h4"} gutterBottom sx={{ fontWeight: 700, mb: 4, color: "primary.main", display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PaymentIcon sx={{ fontSize: isMobile ? 30: 40 }} /> Gestión de Pagos
                </Typography>
            </motion.div>

            <Box sx={{ position: 'sticky', top: theme.spacing(1), zIndex: 1200, mb: 3 }}>
                {error && ( <Fade in={!!error} timeout={300}><Alert severity="error" onClose={() => setError('')} variant="filled" sx={{ boxShadow: theme.shadows[4] }}>{error}</Alert></Fade> )}
                {success && ( <Fade in={!!success} timeout={300}><Alert severity="success" onClose={() => setSuccess('')} variant="filled" sx={{ boxShadow: theme.shadows[4] }}>{success}</Alert></Fade> )}
            </Box>
            
            <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={7} lg={8}>
                    <AnimatedCard>
                         <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                            <Box display="flex" alignItems="center" mb={2.5}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color:'error.main', mr: 2, width: 48, height: 48 }}>
                                    <TrendingUpIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                                        Clientes con Prioridad ({clientesPendientes.length})
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Top 3 con mayor deuda o necesidad de renovación
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350, overflowY: 'auto' }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Detalle</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acción</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {clientesConPrioridad.length > 0 ? (
                                            clientesConPrioridad.map((cliente) => {
                                                const { estado, mensaje, tieneDeuda, color } = getClienteStatus(cliente);
                                                return (
                                                    <TableRow key={cliente._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell component="th" scope="row">
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Avatar sx={{ bgcolor: alpha(theme.palette[color]?.light || theme.palette.grey[300], 0.3), width: 32, height: 32 }}>
                                                                    <PersonIcon fontSize="small" color={color !== 'default' ? color : 'action'} />
                                                                </Avatar>
                                                                <Typography variant="body2">{cliente.nombre}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={estado === 'deudor_pago' ? 'Deuda' : (estado === 'deudor_clases' ? 'Renovar' : 'Al día')}
                                                                color={color}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="caption" color={`${color}.dark`} fontWeight="medium">
                                                                {mensaje}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Tooltip title="Registrar pago general">
                                                                <IconButton onClick={() => handleOpenModal(cliente)} color="primary" size="small">
                                                                    <PaymentIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} sx={{ color: 'text.secondary'}}>
                                                        <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
                                                        <Typography variant="body2">No hay clientes con pagos pendientes.</Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </AnimatedCard>
                </Grid>
                <Grid item xs={12} md={5} lg={4}>
                    <Grid container spacing={isMobile ? 2 : 3}>
                        <Grid item xs={12}>
                            <AnimatedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Recaudación Total
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'success.dark' }}>
                                                    {showTotal ? `$${totalRecaudado.toFixed(2)}` : '••••••'}
                                                </Typography>
                                                <Tooltip title={showTotal ? "Ocultar monto" : "Mostrar monto"}>
                                                    <IconButton size="small" onClick={() => {
                                                        if (showTotal) setShowTotal(false);
                                                        else handleEyeClick();
                                                    }}>
                                                        {showTotal ? <VisibilityIcon /> : <VisibilityOffIcon />}
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: 48, height: 48 }}>
                                            <MonetizationOnIcon color="success" />
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </AnimatedCard>
                        </Grid>
                        <Grid item xs={6}>
                            <MetricCard>
                                <PeopleIcon color="info" sx={{ fontSize: 28, mb: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">Clientes Activos</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'info.main' }}>{clientesActivos}</Typography>
                            </MetricCard>
                        </Grid>
                        <Grid item xs={6}>
                            <MetricCard>
                                <BarChartIcon color="warning" sx={{ fontSize: 28, mb: 0.5 }} />
                                <Typography variant="caption" color="text.secondary">Promedio/Cliente</Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'warning.main' }}>${promedioPorCliente.toFixed(2)}</Typography>
                            </MetricCard>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Zoom in={!cargando}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                            <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ReceiptIcon color="primary" /> Listado de Clientes ({clientesFiltrados.length})
                            </Typography>
                            
                            <TextField
                                variant="outlined"
                                size="small"
                                placeholder="Buscar por nombre, DNI, actividad..."
                                value={terminoBusqueda}
                                onChange={(e) => setTerminoBusqueda(e.target.value)}
                                sx={{ width: { xs: '100%', sm: 350 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <Table sx={{ minWidth: { xs: 800, md: 1000 } }}>
                                <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.1) }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Actividades y Pagos</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado General</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Últimos Pagos</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {clientesFiltrados.length > 0 ? (
                                        clientesFiltrados.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).map((cliente) => {
                                            const { estado, mensaje, color } = getClienteStatus(cliente);
                                            const ultimosPagos = (cliente.historialPagos || []).slice(-3).reverse();

                                            return (
                                                <TableRow key={cliente._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ minWidth: 200 }}>
                                                        <Box display="flex" flexDirection="column" alignItems="flex-start" gap={0.5}>
                                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                                <Avatar sx={{ bgcolor: alpha(theme.palette[color]?.light || theme.palette.grey[300], 0.3), width: 38, height: 38 }}>
                                                                    <PersonIcon fontSize="small" color={color !== 'default' ? color : 'action'}/>
                                                                </Avatar>
                                                                <Typography fontWeight="medium">{cliente.nombre}</Typography>
                                                            </Box>
                                                            <Typography variant="caption" color="text.secondary" component="div">DNI: {cliente.dni}</Typography>
                                                            {cliente.telefono && (
                                                                <Typography variant="caption" color="text.secondary" component="div" sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                                    <PhoneIcon fontSize="inherit" sx={{opacity: 0.7}}/> {cliente.telefono}
                                                                </Typography>
                                                            )}
                                                            {cliente.correo && (
                                                                <Typography variant="caption" color="text.secondary" component="div" sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                                                                    <EmailIcon fontSize="inherit" sx={{opacity: 0.7}}/> {cliente.correo}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="caption" color="text.secondary" component="div" sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25}}>
                                                                <EventIcon fontSize="inherit" sx={{opacity: 0.7}}/>
                                                                Alta: {formatDateOnly(cliente.fechaInscripcion) || 'N/A'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ minWidth: 260 }}>
                                                        {(cliente.actividades && cliente.actividades.length > 0) ? (
                                                            <Stack spacing={0.75}>
                                                                {cliente.actividades.map((act) => {
                                                                    const actividadIdParaCalculo = act._id?.toString() || act.nombre;
                                                                    const deudaAct = calcularDeudaPorActividad(cliente, actividadIdParaCalculo);
                                                                    const necesitaRenovarClasesAct = act.clasesPendientes <= 0 && !act.clasePrueba;
                                                                    
                                                                    let actStatusColor = 'success';
                                                                    let actStatusText = `${act.clasesPendientes} Cl.`;
                                                                    if (deudaAct > 0) {
                                                                        actStatusColor = 'error';
                                                                        actStatusText = `Debe $${deudaAct.toFixed(2)}`;
                                                                    } else if (necesitaRenovarClasesAct) {
                                                                        actStatusColor = 'warning';
                                                                        actStatusText = 'Renovar';
                                                                    }

                                                                    const vencimientoActividadStr = act.fechaVencimientoActividad ? formatDateOnly(act.fechaVencimientoActividad) : null;
                                                                    const isActividadVencida = act.fechaVencimientoActividad ? isDateStringOverdue(act.fechaVencimientoActividad) : false;
                                                                    
                                                                    let chipLabel = `${act.nombre} (${actStatusText})`;
                                                                    let chipTooltip = `Estado: ${actStatusText}.`;
                                                                    if (vencimientoActividadStr) {
                                                                        chipTooltip += ` Vence: ${vencimientoActividadStr}${isActividadVencida ? ' (Vencida)' : ''}.`;
                                                                    } else {
                                                                        chipTooltip += " Sin vencimiento específico.";
                                                                    }

                                                                    return (
                                                                        <Tooltip key={act._id || act.nombre} title={chipTooltip}>
                                                                            <Chip
                                                                                label={chipLabel}
                                                                                size="small"
                                                                                color={actStatusColor}
                                                                                variant={isActividadVencida && vencimientoActividadStr ? "filled" : "outlined"}
                                                                                icon={vencimientoActividadStr ? (isActividadVencida ? <EventBusyIcon /> : <CalendarTodayIcon />) : undefined}
                                                                                onClick={(necesitaRenovarClasesAct || deudaAct > 0) ? () => handleOpenModal(cliente, actividadIdParaCalculo) : undefined}
                                                                                clickable={necesitaRenovarClasesAct || deudaAct > 0}
                                                                                sx={{
                                                                                    width: '100%', justifyContent: 'flex-start', height: 'auto',
                                                                                    '& .MuiChip-label': { whiteSpace: 'normal', lineHeight: 1.3, py:'2px'},
                                                                                    borderColor: isActividadVencida && vencimientoActividadStr ? theme.palette.error.main : undefined,
                                                                                    backgroundColor: isActividadVencida && vencimientoActividadStr ? alpha(theme.palette.error.main, 0.2) : undefined,
                                                                                    '& .MuiChip-icon': { ml: '5px', mr: '-2px', fontSize:'1rem' }
                                                                                }}
                                                                            />
                                                                        </Tooltip>
                                                                    );
                                                                })}
                                                            </Stack>
                                                        ) : ( <Typography variant="caption" color="text.secondary">Sin activ.</Typography> )}
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip label={mensaje} color={color} size="small" variant="filled" />
                                                    </TableCell>
                                                    <TableCell sx={{ minWidth: 200 }}>
                                                        <Box sx={{ maxHeight: 100, overflowY: 'auto', pr: 1 }}>
                                                            {(ultimosPagos || []).length > 0 ? (
                                                                ultimosPagos.map((pago) => (
                                                                    <Box key={pago._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, fontSize: '0.75rem', p:0.5, borderRadius:1, '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.1)} }}>
                                                                        <Box>
                                                                            <Typography variant="caption" display="block"><strong>${parseFloat(pago.monto).toFixed(2)}</strong> ({getNombreActividad(cliente, pago.idActividad)})</Typography>
                                                                            <Typography variant="caption" color="text.secondary" display="block">
                                                                                {formatFullDateTime(pago.fechaPago)}
                                                                                {pago.comprobante?.url && (<Tooltip title="Ver comprobante"><IconButton size="small" sx={{ p: 0, ml: 0.5 }} onClick={(e) => {e.stopPropagation(); window.open(pago.comprobante.url, '_blank')}}>{getFileIcon(pago.comprobante.url)}</IconButton></Tooltip>)}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Tooltip title="Eliminar este pago"><IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEliminarPago(cliente._id, pago._id); }} color="error"><DeleteIcon fontSize="inherit" /></IconButton></Tooltip>
                                                                    </Box>
                                                                ))
                                                            ) : ( <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>Sin pagos</Typography> )}
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : ( <TableRow> <TableCell colSpan={6} align="center" sx={{ py: 4 }}> <Box display="flex" flexDirection="column" alignItems="center" gap={1}> <InfoIcon color="action" sx={{ fontSize: 40 }} /> <Typography variant="body1" color="textSecondary">No se encontraron clientes para la búsqueda "{terminoBusqueda}".</Typography> </Box> </TableCell> </TableRow> )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            </Zoom>

            {/* --- Modals --- */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm" TransitionComponent={Slide} transitionDuration={300} >
                 <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}> <PaymentIcon /> Registrar Nuevo Pago </DialogTitle>
                 <DialogContent sx={{ pt: 3, pb: 2, bgcolor: 'grey.50' }}>
                     {clienteSeleccionado && (() => {
                         let deudaLimite = 0;
                         let necesitaRenovarModal = false;
                         let clasesPendientesModal = null;
                         let actividadParaDeuda = actividadSeleccionada || (clienteSeleccionado.actividades && clienteSeleccionado.actividades.length === 1 ? clienteSeleccionado.actividades[0] : null);

                         if (actividadParaDeuda) {
                             deudaLimite = calcularDeudaPorActividad(clienteSeleccionado, actividadParaDeuda._id?.toString() || actividadParaDeuda.nombre);
                             necesitaRenovarModal = actividadParaDeuda.clasesPendientes <= 0 && !actividadParaDeuda.clasePrueba;
                             if (necesitaRenovarModal && deudaLimite <= 0) clasesPendientesModal = actividadParaDeuda.clasesPendientes;
                         } else {
                             deudaLimite = calcularDeudaTotal(clienteSeleccionado);
                             necesitaRenovarModal = clienteSeleccionado.actividades?.some(act => act.clasesPendientes <= 0 && !act.clasePrueba) || false;
                             if (necesitaRenovarModal && deudaLimite <= 0) clasesPendientesModal = clienteSeleccionado.totalClasesPendientes;
                         }
                         const deudaColor = necesitaRenovarModal && deudaLimite <= 0 ? 'warning' : deudaLimite > 0 ? 'error' : 'success';
                         const deudaLabel = necesitaRenovarModal && deudaLimite <= 0 ? `Renovar (${clasesPendientesModal ?? 0} clases)` : `$${deudaLimite.toFixed(2)}`;

                         return ( <> <Box display="flex" alignItems="center" mb={2.5}> <Avatar sx={{ bgcolor: alpha(theme.palette[deudaColor]?.light || theme.palette.grey[300], 0.3), mr: 2, width: 48, height: 48 }}> <PersonIcon color={deudaColor !== 'default' ? deudaColor : 'action'} /> </Avatar> <Box> <Typography variant="h6" fontWeight={600}>{clienteSeleccionado.nombre}</Typography> <Typography variant="body2" color="text.secondary"> {clienteSeleccionado.dni} {actividadSeleccionada ? `• ${actividadSeleccionada.nombre}` : '• Pago general'} </Typography> </Box> </Box> <Divider sx={{ my: 2 }} /> <Grid container spacing={1.5} mb={2.5}> <Grid item xs={12}> <Paper elevation={0} sx={{ p: 1.5, border: `1px solid ${theme.palette[deudaColor]?.light || theme.palette.divider}`, borderRadius: 2, bgcolor: alpha(theme.palette[deudaColor]?.light || theme.palette.grey[300], 0.1) }}> <Typography variant="caption" display="block" color="text.secondary">Saldo Pendiente ({actividadSeleccionada ? 'Actividad' : 'Total'})</Typography> <Typography variant="h5" sx={{ fontWeight: 'bold', color: `${deudaColor}.dark` }}>{deudaLabel}</Typography> </Paper> </Grid> </Grid> <TextField fullWidth autoFocus label="Monto del pago" type="number" value={montoPago} onChange={(e) => setMontoPago(e.target.value)} sx={{ mb: 2 }} InputProps={{ startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>, inputProps: { min: 0.01, step: '0.01', max: deudaLimite > 0 ? deudaLimite.toFixed(2) : undefined } }} variant="filled" helperText={`Ingrese monto${deudaLimite > 0 ? ` (máx. $${deudaLimite.toFixed(2)})` : '. Puede ser pago adelantado.'}`} /> <Box sx={{ mt: 2 }}> <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'medium', color:'text.secondary' }}> <CloudUploadIcon fontSize="small" color="primary"/> Comprobante (Opcional) </Typography> {!selectedFile ? ( <UploadDropZone ref={dropZoneRef} isDragActive={isDragActive} hasFile={false} onClick={() => fileInputRef.current?.click()}> <VisuallyHiddenInput ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf" onChange={handleFileChange} /> <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}> <AddPhotoAlternateIcon color="disabled" sx={{ fontSize: 30 }} /> <Typography variant="caption">Clic o arrastre archivo</Typography> </Box> </UploadDropZone> ) : ( <FilePreview> <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}> {selectedFile.type.startsWith('image/') && filePreview ? ( <Box sx={{ width: 40, height: 40, borderRadius: 1, overflow: 'hidden', mr: 1.5, flexShrink: 0, border:'1px solid', borderColor:'divider', cursor:'pointer' }} onClick={() => handleOpenImagePreview(filePreview)}> <img src={filePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> </Box> ) : ( <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 1.5, width: 40, height: 40 }}> {getFileIcon(selectedFile.name)} </Avatar> )} <Box sx={{ flexGrow: 1, overflow:'hidden' }}> <Typography variant="body2" fontWeight="medium" noWrap>{selectedFile.name}</Typography> <Typography variant="caption" color="text.secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Typography> </Box> <IconButton color="error" onClick={handleRemoveFile} size="small" sx={{p:0.5}}><CancelIcon fontSize="small"/></IconButton> </Box> </FilePreview> )} {error && <Typography color="error" variant="caption" sx={{ display:'block', mt: 1 }}>{error}</Typography>} </Box> </> );
                     })()}
                 </DialogContent>
                 <DialogActions sx={{ p: 2, bgcolor: 'grey.100' }}>
                     <Button onClick={handleCloseModal} variant="text" color="secondary">Cancelar</Button>
                     <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                         <PaymentButton onClick={handlePago} size="large" startIcon={uploadingFile ? <CircularProgress size={20} color="inherit" /> : <AttachMoneyIcon />} disabled={!montoPago || isNaN(montoPago) || parseFloat(montoPago) <= 0 || uploadingFile} >
                             {uploadingFile ? 'Procesando...' : `Confirmar Pago`}
                         </PaymentButton>
                     </motion.div>
                 </DialogActions>
            </Dialog>
            <Dialog open={openImagePreview} onClose={() => setOpenImagePreview(false)} maxWidth="md"> <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> Vista Previa Comprobante <IconButton onClick={() => setOpenImagePreview(false)}><CloseIcon /></IconButton> </DialogTitle> <DialogContent dividers sx={{ textAlign: 'center', p: 1, bgcolor:'grey.100' }}> {previewImage && <img src={previewImage} alt="Comprobante" style={{ display:'block', maxWidth: '100%', maxHeight: '75vh', margin:'auto', borderRadius: '4px' }} />} </DialogContent> </Dialog>
            <Dialog open={openPassword} onClose={handlePasswordClose} maxWidth="xs" fullWidth > <DialogTitle>Acceso restringido</DialogTitle> <DialogContent> <Typography variant="body2" mb={2}> Ingresá la contraseña de administrador . </Typography> <TextField autoFocus type="password" label="Contraseña" fullWidth value={passwordInput} onChange={e => { setPasswordInput(e.target.value); setSnackPwError(false); }} error={snackPwError} helperText={snackPwError ? "Contraseña incorrecta" : "" } onKeyDown={e => { if (e.key === 'Enter') handlePasswordCheck(); }} sx={{ mt: 1 }} /> </DialogContent> <DialogActions> <Button onClick={handlePasswordClose} color="secondary">Cancelar</Button> <Button variant="contained" onClick={handlePasswordCheck}>Ver monto</Button> </DialogActions> </Dialog>
        </Box>
    );
};

export default RegistroPagos;