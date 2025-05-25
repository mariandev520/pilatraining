import React, { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Alert, Card, CardContent, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, Chip, Fade, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, IconButton, Grid, Paper, Divider,
    Select, MenuItem, InputLabel, FormControl, Avatar, Zoom, Slide, Grow, Tooltip,
    useMediaQuery, useTheme, CircularProgress, Link, alpha
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon, Delete as DeleteIcon, Payment as PaymentIcon,
    AttachMoney as AttachMoneyIcon, People as PeopleIcon, Receipt as ReceiptIcon,
    Phone as PhoneIcon, Email as EmailIcon, Info as InfoIcon, TrendingUp as TrendingUpIcon,
    MonetizationOn as MonetizationOnIcon, AccountBalanceWallet as AccountBalanceWalletIcon,
    BarChart as BarChartIcon, CloudUpload as CloudUploadIcon, AddPhotoAlternate as AddPhotoAlternateIcon,
    InsertDriveFile as InsertDriveFileIcon, Cancel as CancelIcon, Image as ImageIcon,
    Close as CloseIcon, Description as DescriptionIcon,
    Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, MoreVert as MoreVertIcon,
    EditCalendar as EditCalendarIcon, ContactPhone as ContactPhoneIcon, Payments as PaymentsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';

// --- Componentes personalizados con estilos (sin cambios) ---
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
    padding: theme.spacing(0.8, 2),
    boxShadow: `0 4px 8px 0 ${alpha(theme.palette.success.main, 0.3)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.light} 90%)`,
        boxShadow: `0 6px 12px 0 ${alpha(theme.palette.success.dark, 0.35)}`,
        transform: 'translateY(-1px)'
    },
    [theme.breakpoints.down('sm')]: {
        padding: theme.spacing(0.7, 1.5),
        fontSize: '0.8rem',
    },
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
// Fin componentes personalizados

const RegistroPagos = () => {
    // --- State (sin cambios) ---
    const [clientes, setClientes] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [actividadSeleccionada, setActividadSeleccionada] = useState(null);
    const [montoPago, setMontoPago] = useState('');
    const [cargando, setCargando] = useState(true);
    const [filtroUsuario, setFiltroUsuario] = useState('todos');
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

    // --- Refs (sin cambios) ---
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    // --- Theme & Media Queries (sin cambios) ---
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Drag & Drop (sin cambios)
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

    // Carga de datos (sin cambios)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setCargando(true);
                setError('');
                const [clientesRes, infoclasesRes] = await Promise.all([
                    fetch('/api/clientes'),
                    fetch('/api/infoclases')
                ]);
                if (!clientesRes.ok) {
                    const errData = await clientesRes.json().catch(() => ({}));
                    throw new Error(errData.message || `Error ${clientesRes.status} cargando clientes`);
                }
                if (!infoclasesRes.ok) {
                    const errData = await infoclasesRes.json().catch(() => ({}));
                    throw new Error(errData.message || `Error ${infoclasesRes.status} cargando infoclases`);
                }
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
                            clasesPendientes: claseCorrespondiente?.clasesPendientes ?? 0
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

    // --- Helpers (sin cambios) ---
    const calcularDeudaTotal = (cliente) => {
        if (!cliente) return 0;
        const tarifaTotal = (cliente.actividades || []).reduce((sum, act) => sum + parseFloat(act.tarifa || 0), 0);
        const totalPagado = (cliente.historialPagos || []).reduce((sum, pago) => sum + parseFloat(pago.monto || 0), 0);
        const deuda = tarifaTotal - totalPagado;
        return deuda > 0 ? parseFloat(deuda.toFixed(2)) : 0;
    };
    const calcularDeudaPorActividad = (cliente, actividadId) => {
        if (!cliente || !cliente.actividades || !actividadId) return 0;
        const actividad = cliente.actividades.find(act => act._id === actividadId);
        if (!actividad) return 0;
        const tarifaActividad = parseFloat(actividad.tarifa || 0);
        const pagosActividad = (cliente.historialPagos || [])
            .filter(pago => pago.idActividad === actividadId)
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
        const necesitaRenovarClases = cliente.actividades?.some(act => act.clasesPendientes <= 0) || false;
        if (deudaMonetaria > 0) {
            return { estado: 'deudor_pago', mensaje: `Debe $${deudaMonetaria.toFixed(2)}`, tieneDeuda: true, color: 'error' };
        } else if (necesitaRenovarClases) {
            return { estado: 'deudor_clases', mensaje: 'Renovar clases', tieneDeuda: true, color: 'warning' };
        } else {
            return { estado: 'al_dia', mensaje: 'Al día', tieneDeuda: false, color: 'success' };
        }
    };
    const tienePagosPendientes = (cliente) => getClienteStatus(cliente).tieneDeuda;
    const formatFecha = (fecha) => {
        if (!fecha) return 'Sin fecha';
        try {
            return new Date(fecha).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch(e) { return 'Fecha inválida'; }
    };
    const getNombreActividad = (cliente, actividadId) => {
        if (!cliente || !cliente.actividades || !actividadId) return 'Pago general';
        const actividad = cliente.actividades.find(act => act._id === actividadId);
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
        const maxSize = 10 * 1024 * 1024; // 10MB
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
        if (actividadId && cliente.actividades) {
            const actividad = cliente.actividades.find(act => act._id === actividadId);
            if (actividad) {
                setActividadSeleccionada(actividad);
                deudaSugerida = calcularDeudaPorActividad(cliente, actividadId);
                if (deudaSugerida <= 0 && actividad.clasesPendientes <= 0 && actividad.tarifa) {
                    deudaSugerida = parseFloat(actividad.tarifa);
                }
            } else {
                setActividadSeleccionada(null);
                deudaSugerida = calcularDeudaTotal(cliente);
            }
        } else {
            setActividadSeleccionada(null);
            deudaSugerida = calcularDeudaTotal(cliente);
            if (deudaSugerida <= 0) {
                const actividadARenovar = cliente.actividades?.find(act => act.clasesPendientes <= 0 && act.tarifa > 0);
                if (actividadARenovar) {
                    deudaSugerida = parseFloat(actividadARenovar.tarifa);
                }
            }
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

        try {
            setUploadingFile(true); setError('');
            const formData = new FormData();
            formData.append('monto', monto.toString());
            if (actividadSeleccionada?._id) formData.append('idActividad', actividadSeleccionada._id);
            if (selectedFile) formData.append('comprobante', selectedFile);

            const response = await fetch(`/api/clientes/${clienteSeleccionado._id}/pagos`, { method: 'POST', body: formData });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            const clienteActualizadoBackend = await response.json();
            setClientes(prev => prev.map(c => c._id === clienteActualizadoBackend._id ? clienteActualizadoBackend : c));
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
        if (!window.confirm('¿Eliminar este pago?')) return;
        if (!pagoId || typeof pagoId !== 'string') { setError("ID de pago inválido."); setTimeout(() => setError(''), 5000); return; }
        try {
            setError('');
            const response = await fetch(`/api/clientes/${clienteId}/pagos?pagoId=${pagoId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }
            const clienteActualizadoBackend = await response.json();
            setClientes(prev => prev.map(c => c._id === clienteActualizadoBackend._id ? clienteActualizadoBackend : c));
            setSuccess('Pago eliminado.');
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('Error en handleEliminarPago:', err);
            setError(err.message || 'Error eliminando pago.');
            setTimeout(() => setError(''), 7000);
        }
    };

    // --- Cálculos Derivados para UI (sin cambios) ---
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
        .slice(0, isMobile ? 2 : 3);

    const clientesFiltrados = filtroUsuario === 'todos'
        ? clientes
        : clientes.filter(c => c._id === filtroUsuario);

    // --- Funciones de protección recaudación (sin cambios) ---
    const handleEyeClick = () => {
        setOpenPassword(true); setPasswordInput(''); setSnackPwError(false);
    };
    const handlePasswordCheck = () => {
        if (passwordInput === 'popi') {
            setShowTotal(true); setOpenPassword(false);
        } else {
            setSnackPwError(true);
        }
    };
    const handlePasswordClose = () => {
        setOpenPassword(false); setPasswordInput(''); setSnackPwError(false);
    };


    // --- NUEVA FUNCIÓN PARA RENDERIZAR TARJETA DE CLIENTE EN MÓVIL ---
    const renderMobileClientCard = (cliente) => {
        const { estado, mensaje, color } = getClienteStatus(cliente);
        const ultimosPagos = (cliente.historialPagos || []).slice(-1).reverse(); // Solo el último pago para ahorrar espacio

        return (
            <AnimatedCard key={cliente._id} sx={{ mb: 2, boxShadow: 2, borderRadius: "12px" }}>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Grid container spacing={1.5} alignItems="flex-start">
                        {/* Columna Izquierda: Info Cliente y Contacto */}
                        <Grid item xs={8}>
                            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette[color]?.main || theme.palette.grey[500], 0.15), color: `${color}.dark`, width: 36, height: 36 }}>
                                    <PersonIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                    <Typography fontWeight="600" fontSize="0.95rem" noWrap>{cliente.nombre}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                        DNI: {cliente.dni ? String(cliente.dni).substring(0, 4) + '...' : 'N/A'}
                                    </Typography>
                                </Box>
                            </Box>
                             <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                <EditCalendarIcon sx={{fontSize: "1rem"}}/> Vence: {formatFecha(cliente.fechaVencimientoCuota)}
                            </Typography>
                            {cliente.telefono && (
                                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                    <ContactPhoneIcon sx={{fontSize: "1rem"}} /> {cliente.telefono}
                                </Typography>
                            )}
                        </Grid>

                        {/* Columna Derecha: Estado General */}
                        <Grid item xs={4} textAlign="right">
                            <Chip label={mensaje} color={color} size="small" variant="filled" sx={{ fontSize: '0.7rem', height: '22px', fontWeight: 500 }}/>
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 0.5 }} /></Grid>
                        
                        {/* Actividades */}
                        <Grid item xs={12} sm={7}>
                             <Typography variant="overline" display="block" color="text.secondary" fontSize="0.65rem" lineHeight={1.2} mb={0.25}>Actividades y Clases</Typography>
                            <Box display="flex" flexDirection="column" gap={0.5}>
                                {cliente.actividades && cliente.actividades.length > 0 ? (
                                    cliente.actividades.map((act) => {
                                        const deudaAct = calcularDeudaPorActividad(cliente, act._id);
                                        const necesitaRenovar = act.clasesPendientes <= 0;
                                        const actColor = necesitaRenovar ? 'warning' : deudaAct > 0 ? 'error' : 'success';
                                        const actLabel = `${act.nombre} (${act.clasesPendientes} Cl.) ${deudaAct > 0 ? `- $${deudaAct}` : ''}`;
                                        return (
                                            <Tooltip key={act._id} title={actLabel}>
                                                <Chip
                                                    label={actLabel}
                                                    size="small"
                                                    color={actColor}
                                                    variant="outlined"
                                                    onClick={necesitaRenovar || deudaAct > 0 ? () => handleOpenModal(cliente, act._id) : undefined}
                                                    clickable={necesitaRenovar || deudaAct > 0}
                                                    sx={{ justifyContent: 'flex-start', fontSize: '0.7rem', height: '22px', p: '0 6px' }}
                                                />
                                            </Tooltip>
                                        );
                                    })
                                ) : (
                                    <Typography variant="caption" color="text.secondary" fontSize="0.7rem">Sin actividades</Typography>
                                )}
                            </Box>
                        </Grid>
                        
                        {/* Último Pago y Acciones */}
                        <Grid item xs={12} sm={5} container direction="column" justifyContent="space-between" alignItems={{xs: "stretch", sm: "flex-end"}}>
                             {ultimosPagos.length > 0 && (
                                <Box mb={1} textAlign={{xs: "left", sm: "right"}}>
                                    <Typography variant="overline" display="block" color="text.secondary" fontSize="0.65rem" lineHeight={1.2} mb={0.25}>Último Pago</Typography>
                                    {ultimosPagos.map(pago => (
                                        <Box key={pago._id} display="flex" alignItems="center" justifyContent={{xs: "flex-start", sm: "flex-end"}} gap={0.5}>
                                            <PaymentsIcon sx={{fontSize: "0.8rem", color: "text.secondary"}}/>
                                            <Typography variant="caption" fontSize="0.7rem">
                                                <strong>${parseFloat(pago.monto).toFixed(2)}</strong> ({getNombreActividad(cliente, pago.idActividad).substring(0,10)+(getNombreActividad(cliente, pago.idActividad).length > 10 ? '...':'')})
                                            </Typography>
                                            {pago.comprobante?.url && (
                                                 <Tooltip title="Ver comprobante">
                                                    <IconButton size="small" sx={{p:0, ml:0.2}} onClick={(e) => {e.stopPropagation(); window.open(pago.comprobante.url, '_blank')}}>
                                                        {getFileIcon(pago.comprobante.url)}
                                                    </IconButton>
                                                 </Tooltip>
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            <PaymentButton
                                fullWidth
                                onClick={() => handleOpenModal(cliente)}
                                size="small"
                                startIcon={<PaymentIcon fontSize="small" />}
                                sx={{ mt: ultimosPagos.length > 0 ? 0 : 1, fontSize: "0.75rem", p: "4px 10px" }}
                            >
                                Registrar Pago
                            </PaymentButton>
                        </Grid>
                    </Grid>
                </CardContent>
            </AnimatedCard>
        );
    };
    // --- Fin nueva función ---


    // --- Renderizado Principal ---
    if (cargando) return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress size={isMobile ? 40 : 60} />
        </Box>
    );

    return (
        <Box p={isMobile ? 1.5 : 3} sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Typography
                    variant={isMobile ? "h5" : "h4"}
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        mb: isMobile ? 2.5 : 4,
                        color: "primary.main",
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <PaymentIcon sx={{ fontSize: isMobile ? 28 : 40 }} /> Gestión de Pagos
                </Typography>
            </motion.div>

            <Box sx={{ position: 'sticky', top: theme.spacing(isMobile ? 1 : 2), zIndex: 1200, mb: isMobile ? 2 : 3 }}>
                {error && (
                    <Fade in={!!error} timeout={300}>
                        <Alert severity="error" onClose={() => setError('')} variant="filled" sx={{ boxShadow: theme.shadows[4], fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                            {error}
                        </Alert>
                    </Fade>
                )}
                {success && (
                    <Fade in={!!success} timeout={300}>
                        <Alert severity="success" onClose={() => setSuccess('')} variant="filled" sx={{ boxShadow: theme.shadows[4], fontSize: isMobile ? '0.8rem' : 'inherit' }}>
                            {success}
                        </Alert>
                    </Fade>
                )}
            </Box>

            <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 3 : 4 }}>
                {/* Clientes con Prioridad y Métricas (sin cambios en su renderizado, ya son responsivos) */}
                <Grid item xs={12} md={7} lg={8}>
                    <AnimatedCard>
                        <CardContent sx={{ p: isMobile ? 1.5 : 2.5 }}>
                            <Box display="flex" alignItems="center" mb={isMobile ? 1.5 : 2.5}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color:'error.main', mr: 1.5, width: isMobile? 40:48, height: isMobile? 40:48 }}>
                                    <TrendingUpIcon fontSize={isMobile? 'small':'medium'} />
                                </Avatar>
                                <Box>
                                    <Typography variant={isMobile? "h6" : "h6"} component="div" sx={{ fontWeight: 'bold' }}>
                                        Prioridad ({clientesPendientes.length})
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{fontSize: isMobile ? '0.75rem' : '0.875rem'}}>
                                        Top {isMobile ? '2':'3'} con deuda/renovación
                                    </Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ my: isMobile ? 1 : 2 }} />
                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 350, overflowY: 'auto' }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', p: isMobile ? '6px 8px':'6px 16px' }}>Nombre</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', p: isMobile ? '6px 8px':'6px 16px' }}>Estado</TableCell>
                                            {!isMobile && <TableCell sx={{ fontWeight: 'bold' }}>Detalle</TableCell>}
                                            <TableCell align="center" sx={{ fontWeight: 'bold', p: isMobile ? '6px 8px':'6px 16px' }}>Acción</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {clientesConPrioridad.length > 0 ? (
                                            clientesConPrioridad.map((cliente) => {
                                                const { estado, mensaje, color } = getClienteStatus(cliente);
                                                return (
                                                    <TableRow key={cliente._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell component="th" scope="row" sx={{p: isMobile ? '6px 8px':'6px 16px'}}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Avatar sx={{ bgcolor: alpha(theme.palette[color]?.light || theme.palette.grey[300], 0.3), width: 30, height: 30 }}>
                                                                    <PersonIcon fontSize="small" color={color !== 'default' ? color : 'action'} />
                                                                </Avatar>
                                                                <Typography variant="body2" sx={{fontSize: isMobile ? '0.8rem' : '0.875rem'}}>{cliente.nombre}</Typography>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{p: isMobile ? '6px 8px':'6px 16px'}}>
                                                            <Chip
                                                                label={estado === 'deudor_pago' ? 'Deuda' : (estado === 'deudor_clases' ? 'Renovar' : 'Al día')}
                                                                color={color} size="small" variant="outlined"
                                                                sx={{fontSize: isMobile ? '0.7rem' : '0.75rem'}}
                                                            />
                                                        </TableCell>
                                                        {!isMobile &&
                                                            <TableCell>
                                                                <Typography variant="caption" color={`${color}.dark`} fontWeight="medium">
                                                                    {mensaje}
                                                                </Typography>
                                                            </TableCell>
                                                        }
                                                        <TableCell align="center" sx={{p: isMobile ? '6px 8px':'6px 16px'}}>
                                                            <Tooltip title="Registrar pago general">
                                                                <IconButton onClick={() => handleOpenModal(cliente)} color="primary" size="small">
                                                                    <PaymentIcon fontSize={isMobile ? 'small' : 'medium'} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={isMobile ? 3 : 4} align="center" sx={{ py: 3 }}>
                                                    <Box display="flex" flexDirection="column" alignItems="center" gap={1} sx={{ color: 'text.secondary'}}>
                                                        <CheckCircleIcon color="success" sx={{ fontSize: isMobile ? 30 : 40 }} />
                                                        <Typography variant="body2" sx={{fontSize: isMobile ? '0.8rem' : '0.875rem'}}>Sin pendientes.</Typography>
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
                    <Grid container spacing={isMobile ? 1.5 : 2}>
                        <Grid item xs={12}>
                            <AnimatedCard initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                                <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                                    <Box display="flex" alignItems="center" justifyContent="space-between">
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{fontSize: isMobile ? '0.75rem' : '0.875rem'}}>
                                                Recaudación Total
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 700, color: 'success.dark' }}>
                                                    {showTotal ? `$${totalRecaudado.toFixed(2)}` : '••••••'}
                                                </Typography>
                                                <Tooltip title={showTotal ? "Ocultar monto" : "Mostrar monto"}>
                                                    <IconButton size="small" onClick={() => {
                                                        if (showTotal) setShowTotal(false);
                                                        else handleEyeClick();
                                                    }}>
                                                        {showTotal ? <VisibilityIcon fontSize="small"/> : <VisibilityOffIcon fontSize="small"/>}
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), width: isMobile? 40:48, height: isMobile?40:48 }}>
                                            <MonetizationOnIcon color="success" fontSize={isMobile? 'small':'medium'}/>
                                        </Avatar>
                                    </Box>
                                </CardContent>
                            </AnimatedCard>
                        </Grid>
                        <Grid item xs={6}>
                            <MetricCard sx={{p: isMobile ? 1.5 : 2.5}}>
                                <PeopleIcon color="info" sx={{ fontSize: isMobile? 22:28, mb: 0.5 }} />
                                <Typography variant="caption" color="text.secondary" sx={{fontSize: isMobile ? '0.7rem' : 'inherit'}}>Clientes Activos</Typography>
                                <Typography variant={isMobile? 'subtitle1':'h6'} sx={{ fontWeight: 'bold', color: 'info.main' }}>{clientesActivos}</Typography>
                            </MetricCard>
                        </Grid>
                        <Grid item xs={6}>
                            <MetricCard sx={{p: isMobile ? 1.5 : 2.5}}>
                                <BarChartIcon color="warning" sx={{ fontSize: isMobile? 22:28, mb: 0.5 }} />
                                <Typography variant="caption" color="text.secondary" sx={{fontSize: isMobile ? '0.7rem' : 'inherit'}}>Promedio/Cliente</Typography>
                                <Typography variant={isMobile? 'subtitle1':'h6'} sx={{ fontWeight: 'bold', color: 'warning.main' }}>${promedioPorCliente.toFixed(2)}</Typography>
                            </MetricCard>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* --- Listado Completo de Clientes --- */}
            <Zoom in={!cargando}>
                <Card elevation={3} sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: isMobile ? 1.5 : 3 }}>
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={isMobile ? 2 : 3}
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            gap={2}
                        >
                            <Typography
                                variant={isMobile ? "h6" : "h5"}
                                sx={{
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    width: { xs: '100%', sm: 'auto' }
                                }}
                            >
                                <ReceiptIcon color="primary" /> Listado de Clientes ({clientesFiltrados.length})
                            </Typography>
                            <FormControl
                                variant="outlined"
                                size="small"
                                sx={{
                                    minWidth: { xs: '100%', sm: 220, md: 250 },
                                }}
                            >
                                <InputLabel>Filtrar por cliente</InputLabel>
                                <Select value={filtroUsuario} onChange={(e) => setFiltroUsuario(e.target.value)} label="Filtrar por cliente">
                                    <MenuItem value="todos">Todos los clientes</MenuItem>
                                    {clientes.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).map(cliente => (
                                        <MenuItem key={cliente._id} value={cliente._id}>{cliente.nombre} ({cliente.dni ? String(cliente.dni) : ''})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* AQUÍ EL CAMBIO PRINCIPAL: RENDERIZADO CONDICIONAL DE TABLA O TARJETAS */}
                        {!isMobile ? (
                            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'auto' }}>
                                <Table sx={{ minWidth: { md: 900 } }} size={"medium"}> {/* minWidth solo para desktop */}
                                    <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 'bold', pl: 2 }}>Cliente</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Contacto</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Actividades (Estado)</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Estado Gral.</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Últimos Pagos</TableCell>
                                            <TableCell align="center" sx={{ fontWeight: 'bold', pr: 2 }}>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {clientesFiltrados.length > 0 ? (
                                            clientesFiltrados.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).map((cliente) => {
                                                const { estado, mensaje, color } = getClienteStatus(cliente);
                                                const ultimosPagos = (cliente.historialPagos || []).slice(-2).reverse();

                                                return (
                                                    <TableRow key={cliente._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                        <TableCell sx={{ minWidth: 180, pl: 2 }}>
                                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                                <Avatar sx={{ bgcolor: alpha(theme.palette[color]?.light || theme.palette.grey[300], 0.3), width:38, height:38 }}>
                                                                    <PersonIcon fontSize="small" color={color !== 'default' ? color : 'action'}/>
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography fontWeight="medium" fontSize="0.9rem">{cliente.nombre}</Typography>
                                                                    <Typography variant="caption" color="text.secondary">DNI: {cliente.dni || 'N/A'}</Typography>
                                                                    <Typography variant="caption" color="text.secondary" display="block">Vence: {formatFecha(cliente.fechaVencimientoCuota)}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem', minWidth: 150 }}>
                                                            <Typography variant="body2" display="flex" alignItems="center" gap={0.5} noWrap title={cliente.telefono || ''}>
                                                                <PhoneIcon fontSize="inherit" color="action"/> {cliente.telefono || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="body2" display="flex" alignItems="center" gap={0.5} noWrap title={cliente.correo || ''}>
                                                                <EmailIcon fontSize="inherit" color="action"/> {cliente.correo || 'N/A'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell sx={{ minWidth: 200 }}>
                                                            {cliente.actividades && cliente.actividades.length > 0 ? (
                                                                <Box display="flex" flexDirection="column" gap={0.5}>
                                                                    {cliente.actividades.map((act) => {
                                                                        const deudaAct = calcularDeudaPorActividad(cliente, act._id);
                                                                        const necesitaRenovar = act.clasesPendientes <= 0;
                                                                        const actColor = necesitaRenovar ? 'warning' : deudaAct > 0 ? 'error' : 'success';
                                                                        const actTooltip = necesitaRenovar ? `Renovar clases (${act.clasesPendientes} Cl.) para ${act.nombre}` : deudaAct > 0 ? `Pagar $${deudaAct.toFixed(2)} para ${act.nombre}` : `${act.nombre} al día (${act.clasesPendientes} clases rest.)`;
                                                                        return (
                                                                            <Tooltip key={act._id} title={actTooltip}>
                                                                                <Chip
                                                                                    label={`${act.nombre} (${act.clasesPendientes} Cl.)`}
                                                                                    size="small" color={actColor} variant="outlined"
                                                                                    onClick={necesitaRenovar || deudaAct > 0 ? () => handleOpenModal(cliente, act._id) : undefined}
                                                                                    clickable={necesitaRenovar || deudaAct > 0}
                                                                                    sx={{ maxWidth: '100%', justifyContent: 'flex-start', fontSize: '0.75rem', height: '24px' }}
                                                                                />
                                                                            </Tooltip>
                                                                        );
                                                                    })}
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="caption" color="text.secondary">Sin activ.</Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip label={mensaje} color={color} size="small" variant="filled" sx={{fontSize: '0.75rem'}}/>
                                                        </TableCell>
                                                        <TableCell sx={{ minWidth: 200 }}>
                                                            <Box sx={{ maxHeight: 100, overflowY: 'auto', pr: 1 }}>
                                                                {(ultimosPagos || []).length > 0 ? (
                                                                    ultimosPagos.map((pago) => (
                                                                        <Box key={pago._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, fontSize: '0.75rem', p:0.5, borderRadius:1, '&:hover': { bgcolor: alpha(theme.palette.grey[500], 0.1)} }}>
                                                                            <Box>
                                                                                <Typography variant="caption" display="block">
                                                                                    <strong>${parseFloat(pago.monto).toFixed(2)}</strong> ({getNombreActividad(cliente, pago.idActividad)})
                                                                                </Typography>
                                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                                    {formatFecha(pago.fechaPago)}
                                                                                    {pago.comprobante?.url && (
                                                                                        <Tooltip title="Ver comprobante">
                                                                                            <IconButton size="small" sx={{ p: 0, ml: 0.5 }} onClick={(e) => {e.stopPropagation(); window.open(pago.comprobante.url, '_blank')}}>
                                                                                                {getFileIcon(pago.comprobante.url)}
                                                                                            </IconButton>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                </Typography>
                                                                            </Box>
                                                                            <Tooltip title="Eliminar este pago">
                                                                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEliminarPago(cliente._id, pago._id); }} color="error">
                                                                                    <DeleteIcon fontSize="inherit" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    ))
                                                                ) : (
                                                                    <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>Sin pagos</Typography>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell align="center" sx={{pr: 2}}>
                                                            <Tooltip title="Registrar Pago General">
                                                                <PaymentButton
                                                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(cliente); }}
                                                                    size={"medium"}
                                                                    startIcon={<PaymentIcon />}
                                                                    sx={{ textTransform: 'none', fontSize: '0.8rem' }}
                                                                >
                                                                    Registrar Pago
                                                                </PaymentButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                                    <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                                                        <InfoIcon color="action" sx={{ fontSize: 40 }} />
                                                        <Typography variant="body1" color="textSecondary">No se encontraron clientes.</Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            // VISTA MÓVIL CON TARJETAS
                            <Box mt={2}>
                                {clientesFiltrados.length > 0 ? (
                                    clientesFiltrados.slice().sort((a, b) => a.nombre.localeCompare(b.nombre)).map((cliente) => (
                                        renderMobileClientCard(cliente)
                                    ))
                                ) : (
                                    <Box textAlign="center" py={4}>
                                        <InfoIcon color="action" sx={{ fontSize: 40 }} />
                                        <Typography variant="body1" color="textSecondary">No se encontraron clientes.</Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Zoom>

            {/* --- Dialogos (sin cambios) --- */}
            <Dialog
                open={openModal}
                onClose={handleCloseModal}
                fullWidth
                maxWidth="sm"
                fullScreen={isMobile}
                TransitionComponent={Slide}
                transitionDuration={300}
            >
                <DialogTitle sx={{ bgcolor: 'primary.dark', color: 'white', display: 'flex', alignItems: 'center', gap: 1, fontSize: isMobile ? '1.1rem' : '1.25rem', p: isMobile ? '12px 16px' : '16px 24px' }}>
                    <PaymentIcon /> Registrar Nuevo Pago
                </DialogTitle>
                <DialogContent sx={{ pt: isMobile ? 2 : 3, pb: isMobile ? 1.5 : 2, bgcolor: 'grey.50' }}>
                    {clienteSeleccionado && (() => {
                        let deudaLimite = 0;
                        let necesitaRenovarModal = false;
                        let clasesPendientesModal = null;

                        if (actividadSeleccionada) {
                            deudaLimite = calcularDeudaPorActividad(clienteSeleccionado, actividadSeleccionada._id);
                            necesitaRenovarModal = actividadSeleccionada.clasesPendientes <= 0;
                            if (necesitaRenovarModal) clasesPendientesModal = actividadSeleccionada.clasesPendientes;
                        } else {
                            deudaLimite = calcularDeudaTotal(clienteSeleccionado);
                            necesitaRenovarModal = clienteSeleccionado.actividades?.some(act => act.clasesPendientes <= 0) || false;
                            if (necesitaRenovarModal && deudaLimite <= 0) clasesPendientesModal = clienteSeleccionado.totalClasesPendientes;
                        }
                        const deudaColor = necesitaRenovarModal && deudaLimite <= 0 ? 'warning' : deudaLimite > 0 ? 'error' : 'success';
                        const deudaLabel = necesitaRenovarModal && deudaLimite <= 0
                            ? `Renovar (${clasesPendientesModal ?? 0} cl.)`
                            : `$${deudaLimite.toFixed(2)}`;

                        const montoSugeridoHelper = actividadSeleccionada?.tarifa
                            ? ` (Sugerido: $${parseFloat(actividadSeleccionada.tarifa).toFixed(2)})`
                            : clienteSeleccionado?.actividades?.find(a => a.clasesPendientes <=0 && a.tarifa)?.tarifa
                                ? ` (Sugerido: $${parseFloat(clienteSeleccionado.actividades.find(a => a.clasesPendientes <=0 && a.tarifa).tarifa).toFixed(2)})`
                                : '';

                        return (
                            <>
                                <Box display="flex" alignItems="center" mb={isMobile ? 2 : 2.5}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette[deudaColor]?.light || theme.palette.grey[300], 0.3), mr: 1.5, width: 44, height: 44 }}>
                                        <PersonIcon color={deudaColor !== 'default' ? deudaColor : 'action'} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600} sx={{fontSize: isMobile ? '1rem' : '1.25rem'}}>{clienteSeleccionado.nombre}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{fontSize: isMobile ? '0.8rem' : '0.875rem'}}>
                                            {clienteSeleccionado.dni} {actividadSeleccionada ? `• ${actividadSeleccionada.nombre}` : '• Pago general'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: isMobile? 1.5 : 2 }} />

                                <Grid container spacing={1.5} mb={isMobile? 2 : 2.5}>
                                    <Grid item xs={12}>
                                        <Paper elevation={0} sx={{ p: 1.5, border: `1px solid ${theme.palette[deudaColor]?.light || theme.palette.divider}`, borderRadius: 2, bgcolor: alpha(theme.palette[deudaColor]?.light || theme.palette.grey[300], 0.1) }}>
                                            <Typography variant="caption" display="block" color="text.secondary">Saldo Pendiente ({actividadSeleccionada ? 'Actividad' : 'Total'})</Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: `${deudaColor}.dark`, fontSize: isMobile ? '1.4rem' : '1.75rem' }}>{deudaLabel}</Typography>
                                        </Paper>
                                    </Grid>
                                </Grid>

                                <TextField
                                    fullWidth autoFocus
                                    label="Monto del pago" type="number" value={montoPago}
                                    onChange={(e) => setMontoPago(e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                                        inputProps: { min: 0.01, step: '0.01' }
                                    }}
                                    variant="filled"
                                    helperText={`Ingrese monto.${(necesitaRenovarModal && deudaLimite <=0) ? montoSugeridoHelper : (deudaLimite > 0 ? ` Deuda $${deudaLimite.toFixed(2)}` : ' Puede ser pago adelantado.')}`}
                                    FormHelperTextProps={{ sx: {fontSize: isMobile ? '0.7rem' : '0.75rem'} }}
                                />

                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 'medium', color:'text.secondary', fontSize: isMobile ? '0.85rem' : '0.9rem' }}>
                                        <CloudUploadIcon fontSize="small" color="primary"/> Comprobante (Opcional)
                                    </Typography>
                                    {!selectedFile ? (
                                        <UploadDropZone ref={dropZoneRef} isDragActive={isDragActive} hasFile={false} onClick={() => fileInputRef.current?.click()} sx={{p: isMobile ? 1.5 : 2}}>
                                            <VisuallyHiddenInput ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/gif,application/pdf" onChange={handleFileChange} />
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                <AddPhotoAlternateIcon color="disabled" sx={{ fontSize: isMobile ? 24:30 }} />
                                                <Typography variant="caption" sx={{fontSize: isMobile ? '0.7rem' : '0.75rem'}}>Clic o arrastre archivo</Typography>
                                            </Box>
                                        </UploadDropZone>
                                    ) : (
                                        <FilePreview sx={{p: isMobile ? 1 : 1.5}}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                {selectedFile.type.startsWith('image/') && filePreview ? (
                                                    <Box sx={{ width: isMobile?32:40, height: isMobile?32:40, borderRadius: 1, overflow: 'hidden', mr: 1.5, flexShrink: 0, border:'1px solid', borderColor:'divider', cursor:'pointer' }} onClick={() => handleOpenImagePreview(filePreview)}>
                                                        <img src={filePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    </Box>
                                                ) : (
                                                    <Avatar variant="rounded" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', mr: 1.5, width: isMobile?32:40, height: isMobile?32:40 }}>
                                                        {getFileIcon(selectedFile.name)}
                                                    </Avatar>
                                                )}
                                                <Box sx={{ flexGrow: 1, overflow:'hidden' }}>
                                                    <Typography variant="body2" fontWeight="medium" noWrap sx={{fontSize: isMobile ? '0.8rem' : '0.875rem'}}>{selectedFile.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{fontSize: isMobile ? '0.7rem' : '0.75rem'}}>{(selectedFile.size / 1024).toFixed(1)} KB</Typography>
                                                </Box>
                                                <IconButton color="error" onClick={handleRemoveFile} size="small" sx={{p:0.5}}><CancelIcon fontSize="small"/></IconButton>
                                            </Box>
                                        </FilePreview>
                                    )}
                                    {error && <Typography color="error" variant="caption" sx={{ display:'block', mt: 1, fontSize: isMobile ? '0.7rem' : '0.75rem' }}>{error}</Typography>}
                                </Box>
                            </>
                        );
                    })()}
                </DialogContent>
                <DialogActions sx={{ p: isMobile ? '8px 16px' : 2, bgcolor: 'grey.100' }}>
                    <Button onClick={handleCloseModal} variant="text" color="secondary" size={isMobile ? 'small' : 'medium'}>Cancelar</Button>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <PaymentButton
                            onClick={handlePago}
                            size={isMobile ? "medium" : "large"}
                            startIcon={uploadingFile ? <CircularProgress size={20} color="inherit" /> : <AttachMoneyIcon />}
                            disabled={!montoPago || isNaN(montoPago) || parseFloat(montoPago) <= 0 || uploadingFile}
                        >
                            {uploadingFile ? 'Procesando...' : `Confirmar Pago`}
                        </PaymentButton>
                    </motion.div>
                </DialogActions>
            </Dialog>

            <Dialog open={openImagePreview} onClose={() => setOpenImagePreview(false)} maxWidth="md" fullScreen={isMobile}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: isMobile ? '1rem' : '1.25rem', p: isMobile ? '12px 16px' : '16px 24px' }}>
                    Vista Previa Comprobante
                    <IconButton onClick={() => setOpenImagePreview(false)}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ textAlign: 'center', p: isMobile ? 0.5 : 1, bgcolor:'grey.100' }}>
                    {previewImage && <img src={previewImage} alt="Comprobante" style={{ display:'block', maxWidth: '100%', maxHeight: isMobile ? '85vh' : '75vh', margin:'auto', borderRadius: '4px' }} />}
                </DialogContent>
            </Dialog>

            <Dialog
                open={openPassword}
                onClose={handlePasswordClose}
                maxWidth="xs"
                fullWidth
                fullScreen={isMobile}
            >
                <DialogTitle sx={{fontSize: isMobile ? '1rem' : '1.25rem'}}>Acceso restringido</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" mb={2} sx={{fontSize: isMobile ? '0.9rem' : '1rem'}}>
                        Ingresá la contraseña de administrador para ver la recaudación total.
                    </Typography>
                    <TextField
                        autoFocus
                        type="password"
                        label="Contraseña"
                        fullWidth
                        value={passwordInput}
                        onChange={e => { setPasswordInput(e.target.value); setSnackPwError(false); }}
                        error={snackPwError}
                        helperText={snackPwError ? "Contraseña incorrecta" : ""}
                        onKeyDown={e => { if (e.key === 'Enter') handlePasswordCheck(); }}
                        sx={{ mt: 1 }}
                        size={isMobile ? 'small' : 'medium'}
                    />
                </DialogContent>
                <DialogActions sx={{p: isMobile ? '8px 16px' : '12px 16px'}}>
                    <Button onClick={handlePasswordClose} color="secondary" size={isMobile ? 'small' : 'medium'}>Cancelar</Button>
                    <Button variant="contained" onClick={handlePasswordCheck} size={isMobile ? 'small' : 'medium'}>Ver monto</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RegistroPagos;