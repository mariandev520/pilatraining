import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EnhancedAttendanceTable from './EnhancedAttendanceTable';

import {
  Container, Box, Typography, TextField, Button, Grid, Card, CardContent,
  Snackbar, Alert, IconButton, CircularProgress, Paper, Avatar, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  alpha, InputAdornment, Badge,
  FormControl, InputLabel, Select, MenuItem
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
    '&:hover': { background: '#165abc' },
    '&.Mui-disabled': { background: alpha(lightPrimary, 0.3), color: '#bdbdbd' }
  },
  outlined: {
    borderColor: lightPrimary,
    color: lightPrimary,
    fontWeight: 600,
    borderRadius: 2,
    '&:hover': {
      background: alpha(lightPrimary, 0.06),
      borderColor: alpha(lightPrimary, 0.5)
    },
  },
  text: {
    color: lightPrimary,
    fontWeight: 600,
    '&:hover': { background: alpha(lightPrimary, 0.04) }
  }
};

const commonInputStyles = (isSelect = false) => ({
  '& label': { color: textSoft },
  '& label.Mui-focused': { color: lightPrimary },
  '& .MuiInputBase-root': {
    backgroundColor: lightGray,
    color: textMain,
    '& fieldset': { borderColor: dividerGray },
    '&:hover fieldset': { borderColor: alpha(lightPrimary, 0.5) },
    '&.Mui-focused fieldset': { borderColor: lightPrimary },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: lightPrimary }
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

    const resAct = await fetch(`${baseUrl}/api/actividades`);
    if (resAct.ok) actividades = await resAct.json();
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
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState({ title: '', message: '', onConfirm: () => { } });
  const [historialPagosVisible, setHistorialPagosVisible] = useState(false);
  const [profesorSeleccionadoHistorial, setProfesorSeleccionadoHistorial] = useState(null);
  const [pagosDelProfesor, setPagosDelProfesor] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [errorHistorial, setErrorHistorial] = useState('');
  const [loadingPago, setLoadingPago] = useState(false);
  const [listaActividades, setListaActividades] = useState(actividadesServer);

  // Filtrado datos con búsqueda
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    setFilteredData(data.filter(p => (
      p.nombre?.toLowerCase().includes(term) ||
      p.mail?.toLowerCase().includes(term) ||
      p.actividad?.toLowerCase().includes(term) ||
      p.telefono?.toString().includes(term) ||
      p.dni?.toString().includes(term)
    )));
  }, [searchTerm, data]);

  // Función para manejar cambio input
  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Expande o colapsa formulario
  const toggleExpand = () => {
    if (expanded && isEditing) {
      setForm({ nombre: '', telefono: '', mail: '', domicilio: '', dni: '', actividad: '', tarifaPorHora: '', id: null });
      setIsEditing(false);
    }
    setExpanded(!expanded);
  };

  // Limpia snackbar
  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // Valida y envía formulario
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMensaje('');
    setError('');

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

      setSnackbar({ open: true, message: isEditing ? 'Profesor actualizado' : 'Profesor agregado', severity: 'success' });
      setForm({ nombre: '', telefono: '', mail: '', domicilio: '', dni: '', actividad: '', tarifaPorHora: '', id: null });
      setExpanded(false);
      setIsEditing(false);
      router.replace(router.asPath);
    } catch (submitError) {
      setSnackbar({ open: true, message: `Error: ${submitError.message}`, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Carga datos para editar profesor
  const handleEdit = profesor => {
    setForm({
      nombre: profesor.nombre || '',
      telefono: profesor.telefono || '',
      mail: profesor.mail || profesor.correo || '',
      domicilio: profesor.domicilio || '',
      dni: profesor.dni || '',
      actividad: profesor.actividad || '',
      tarifaPorHora: profesor.tarifaPorHora !== undefined ? profesor.tarifaPorHora.toString() : '',
      id: profesor.id || profesor._id || null
    });
    setIsEditing(true);
    setExpanded(true);
  };

  // Confirm dialog open
  const openConfirmDialog = (title, message, onConfirmCallback) => {
    setConfirmDialogData({ title, message, onConfirm: onConfirmCallback });
    setConfirmDialogOpen(true);
  };
  const handleConfirmDialogClose = () => setConfirmDialogOpen(false);
  const handleConfirmDialogConfirm = () => {
    if (typeof confirmDialogData.onConfirm === 'function') confirmDialogData.onConfirm();
    setConfirmDialogOpen(false);
  };

  // Elimina profesor
  const handleDelete = async (id, nombreProfesor) => {
    openConfirmDialog(
      "Confirmar Eliminación",
      `¿Está seguro de que desea eliminar a ${nombreProfesor || 'este profesor'}? Esta acción no se puede deshacer.`,
      async () => {
        setLoading(true);
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
          setLoading(false);
        }
      }
    );
  };

  // Asistencia: carga datos para la semana seleccionada
  const loadAttendanceData = async (dateForWeek) => {
    if (!isValid(dateForWeek) || !Array.isArray(data) || data.length === 0) {
      setAttendanceData({});
      return;
    }
    const isoWeek = getISOWeek(dateForWeek);
    setLoadingAttendance(true);
    setError('');
    try {
      const res = await fetch(`/api/profesor/asistencia?semana=${isoWeek}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error ${res.status} al cargar asistencia`);
      }
      const asistenciaSemanal = await res.json();
      const newAttendanceState = {};
      data.forEach(profesor => {
        const profesorIdStr = profesor.id.toString();
        const weekDataForProfesor = asistenciaSemanal[profesorIdStr] || {};
        newAttendanceState[profesorIdStr] = {};
        DIAS_LABORABLES.forEach(dia => {
          newAttendanceState[profesorIdStr][dia] = { horas: (weekDataForProfesor[dia]?.horas || 0) };
        });
      });
      setAttendanceData(newAttendanceState);
    } catch (err) {
      setError(`Error al cargar datos de asistencia: ${err.message}`);
      setSnackbar({ open: true, message: `Error al cargar asistencia: ${err.message}`, severity: 'error' });
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    loadAttendanceData(selectedDate);
  }, [selectedDate, data]);

  // Maneja cambios de horas en la asistencia
  const handleHoursChange = (profesorId, day, value) => {
    const numericValue = Math.max(0, Number(value) || 0);
    setAttendanceData(prev => {
      const currentProfesorData = prev[profesorId] || {};
      const defaultDaysValues = {};
      DIAS_LABORABLES.forEach(d => {
        defaultDaysValues[d] = { horas: ((currentProfesorData[d] || {}).horas || 0) };
      });
      return {
        ...prev,
        [profesorId]: {
          ...defaultDaysValues,
          ...currentProfesorData,
          [day]: { horas: numericValue }
        }
      };
    });
  };

  // Guarda la asistencia semanal
  const saveAttendanceData = async () => {
    if (!isValid(selectedDate)) {
      setSnackbar({ open: true, message: 'La fecha seleccionada no es válida.', severity: 'error' });
      return;
    }
    const isoWeek = getISOWeek(selectedDate);
    setLoadingAttendance(true);
    setError('');
    try {
      const payload = Object.keys(attendanceData)
        .filter(profesorId => data.some(p => p.id.toString() === profesorId))
        .map(profesorId => ({
          semana: isoWeek,
          profesorId,
          dias: attendanceData[profesorId]
        }));

      if (payload.length === 0) {
        setSnackbar({ open: true, message: 'No hay datos de asistencia para guardar.', severity: 'info' });
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
      setSnackbar({ open: true, message: `Asistencia para la semana ${isoWeek} guardada con éxito.`, severity: 'success' });
    } catch (err) {
      setError(`Error al guardar asistencia: ${err.message}`);
      setSnackbar({ open: true, message: `Error al guardar asistencia: ${err.message}`, severity: 'error' });
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Calcula totales por semana con tarifa individual
  const calculateTotalsForWeek = (profesorId) => {
    const profesor = data.find(p => p.id.toString() === profesorId.toString());
    let tarifaProfesor = profesor && !isNaN(parseFloat(profesor.tarifaPorHora)) ? parseFloat(profesor.tarifaPorHora) : 0;
    if (tarifaProfesor < 0) tarifaProfesor = 0;

    const weekData = attendanceData[profesorId] || {};
    let totalHoras = 0;
    Object.values(weekData).forEach(dayData => {
      totalHoras += (dayData.horas || 0);
    });
    return {
      totalHoras,
      totalMonto: totalHoras * tarifaProfesor,
      tarifaAplicada: tarifaProfesor
    };
  };

  // Abrir historial de pagos
  const handleOpenHistorialPagos = async (profesor) => {
    if (!profesor || !profesor.id) {
      setErrorHistorial("ID de profesor inválido.");
      setSnackbar({ open: true, message: "ID de profesor inválido.", severity: 'error' });
      return;
    }
    setProfesorSeleccionadoHistorial(profesor);
    setLoadingHistorial(true);
    setErrorHistorial('');
    setPagosDelProfesor([]);
    try {
      const res = await fetch(`/api/profesor/${profesor.id}/pagos`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Error ${res.status} al obtener historial`);
      }
      setPagosDelProfesor(await res.json());
    } catch (err) {
      setErrorHistorial(err.message);
      setPagosDelProfesor([]);
      setSnackbar({ open: true, message: `Error al cargar historial: ${err.message}`, severity: 'error' });
    } finally {
      setLoadingHistorial(false);
      setHistorialPagosVisible(true);
    }
  };

  const handleCloseHistorialPagos = () => {
    setHistorialPagosVisible(false);
    setProfesorSeleccionadoHistorial(null);
    setPagosDelProfesor([]);
    setErrorHistorial('');
  };

  // Registrar pago semanal
  const handleRegistrarPagoSemana = async (profesorId) => {
    const profesor = data.find(p => p.id.toString() === profesorId.toString());
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
            anioISO: anioActual,
            descripcion: `Pago automático semana ${isoSemanaActual}/${anioActual} (Tarifa: $${tarifaAplicada.toFixed(2)}/hr)`
          };
          const apiUrl = `/api/profesor/${profesorId}/pagos`;
          const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const responseText = await res.text();
          if (!res.ok) {
            let errorMessage = `Error ${res.status}.`;
            try {
              const errorResponse = JSON.parse(responseText);
              errorMessage = errorResponse.message || errorMessage;
            } catch {
              if (responseText.toLowerCase().includes("<!doctype html>")) {
                errorMessage += " Respuesta HTML inesperada del servidor.";
              } else if (responseText) {
                errorMessage += ` Detalles: ${responseText.substring(0, 100)}...`;
              }
            }
            throw new Error(errorMessage);
          }
          setSnackbar({ open: true, message: 'Pago registrado con éxito.', severity: 'success' });
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

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem('usuario');
    router.push('/Dashboard');
  };

  // Iniciales para avatar
  const getInitials = (name) => name ? name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : '??';

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: lightPaperBg, minHeight: '100vh', color: textMain }}>
      {/* Header */}
      <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: lightSecondary, color: textMain, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: lightPrimary, width: 56, height: 56, mr: 2 }}>
            <SchoolIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color={lightPrimary}>Gestión de Profesores</Typography>
            <Typography variant="subtitle1" color={textSoft}>Administra el registro académico, asistencia y pagos.</Typography>
          </Box>
        </Box>
        <Tooltip title="Cerrar sesión" arrow>
          <IconButton onClick={handleLogout} size="large" sx={{ color: lightPrimary }}>
            <LogoutIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Formulario */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: lightSecondary, color: textMain }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar profesor..."
              variant="outlined"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              size="small"
              sx={commonInputStyles()}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: lightPrimary }} /></InputAdornment>,
                endAdornment: searchTerm && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    title="Limpiar"
                    sx={{ color: lightPrimary }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              sx={buttonStyles.contained}
              startIcon={expanded ? <ExpandLessIcon /> : <AddIcon />}
              onClick={toggleExpand}
            >
              {expanded ? (isEditing ? 'Terminar Edición' : 'Ocultar Formulario') : 'Agregar Profesor'}
            </Button>
          </Grid>
        </Grid>

        {expanded && (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="nombre"
                  label="Nombre completo"
                  variant="outlined"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  sx={commonInputStyles()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="dni"
                  label="DNI"
                  type="number"
                  variant="outlined"
                  value={form.dni}
                  onChange={handleChange}
                  required
                  sx={commonInputStyles()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><FingerprintIcon /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="telefono"
                  label="Teléfono"
                  type="tel"
                  variant="outlined"
                  value={form.telefono}
                  onChange={handleChange}
                  sx={commonInputStyles()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="mail"
                  label="Correo"
                  type="email"
                  variant="outlined"
                  value={form.mail}
                  onChange={handleChange}
                  sx={commonInputStyles()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="tarifaPorHora"
                  label="Tarifa por Hora ($)"
                  type="number"
                  variant="outlined"
                  value={form.tarifaPorHora}
                  onChange={handleChange}
                  sx={commonInputStyles()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><MonetizationOnIcon sx={{ color: lightPrimary }} /></InputAdornment>,
                    inputProps: { min: 0, step: "0.01" },
                  }}
                  placeholder="Ej: 20.50"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" sx={commonInputStyles(true)}>
                  <InputLabel id="actividad-select-label">
                    <ActivityIcon sx={{ mr: 0.5, fontSize: '1.1rem', verticalAlign: 'middle', color: lightPrimary }} /> Actividad
                  </InputLabel>
                  <Select
                    labelId="actividad-select-label"
                    name="actividad"
                    value={form.actividad}
                    onChange={handleChange}
                    label="Actividad"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: lightSecondary,
                          borderColor: dividerGray,
                          '& .MuiMenuItem-root': {
                            color: textMain,
                            '&:hover': { bgcolor: softBlue },
                            '&.Mui-selected': {
                              backgroundColor: alpha(lightPrimary, 0.15),
                              '&:hover': { backgroundColor: alpha(lightPrimary, 0.25) }
                            }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ fontStyle: 'italic', color: textSoft }}>
                      <em>Ninguna</em>
                    </MenuItem>
                    {(listaActividades || []).map(act => (
                      <MenuItem key={act._id || act.id || act.nombre} value={act.nombre}>{act.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="domicilio"
                  label="Domicilio"
                  variant="outlined"
                  value={form.domicilio}
                  onChange={handleChange}
                  sx={commonInputStyles()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><HomeIcon /></InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
                <Button
                  onClick={toggleExpand}
                  sx={{ ...buttonStyles.outlined, mr: 1 }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  sx={buttonStyles.contained}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: lightSecondary }} /> : (isEditing ? <EditIcon /> : <CheckIcon />)}
                >
                  {isEditing ? 'Actualizar' : 'Guardar'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}

      </Paper>

      {/* Selector semana y botones */}
      <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: lightSecondary, color: textMain, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `1px solid ${dividerGray}` }}>
        <IconButton onClick={() => setSelectedDate(prev => subDays(prev, 7))} disabled={loadingAttendance || loadingPago} sx={{ color: lightPrimary }}>
          <ChevronLeftIcon />
        </IconButton>
        <Box textAlign="center">
          <Typography variant="h6" component="div" sx={{ color: lightPrimary }}>Semana {getISOWeek(selectedDate)}</Typography>
          <Typography variant="body1" sx={{ color: textSoft }}>
            {`${format(startOfWeek(selectedDate, { weekStartsOn: 1, locale: es }), 'dd/MM/yy', { locale: es })} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1, locale: es }), 'dd/MM/yy', { locale: es })}`}
          </Typography>
        </Box>
        <IconButton onClick={() => setSelectedDate(prev => addDays(prev, 7))} disabled={loadingAttendance || loadingPago} sx={{ color: lightPrimary }}>
          <ChevronRightIcon />
        </IconButton>
      </Paper>

      {/* Botón Guardar Asistencia */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          sx={buttonStyles.contained}
          onClick={saveAttendanceData}
          disabled={loadingAttendance || loadingPago}
          startIcon={loadingAttendance ? <CircularProgress size={20} sx={{ color: lightSecondary }} /> : <CheckIcon />}
        >
          Guardar Asistencia (Semana {getISOWeek(selectedDate)})
        </Button>
      </Box>

      {/* Error general */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla asistencia */}
      <EnhancedAttendanceTable
        filteredData={filteredData}
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
        colors={{ lightPrimary, lightSecondary, lightPaperBg, lightAccent, lightGray, dividerGray, textMain, textSoft, softBlue, alertColors, buttonStyles, commonInputStyles }}
        generateRandomColor={(name) => {
          const C = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1'];
          if (!name) return C[0];
          return C[name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % C.length];
        }}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity || 'info'}
          variant="filled"
          sx={{
            width: '100%',
            boxShadow: `0 4px 15px ${alpha(lightPrimary, 0.06)}`,
            bgcolor: alertColors[snackbar.severity]?.bg || lightSecondary,
            color: alertColors[snackbar.severity]?.text || lightPrimary,
            '& .MuiAlert-icon': { color: alertColors[snackbar.severity]?.text || lightPrimary }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Dialogo Confirmación */}
      <Dialog open={confirmDialogOpen} onClose={handleConfirmDialogClose} PaperProps={{
        sx: {
          bgcolor: lightSecondary,
          borderRadius: 2,
          border: `1px solid ${dividerGray}`,
          color: textMain,
          maxWidth: '450px',
        }
      }}>
        <DialogTitle sx={{ color: lightPrimary, borderBottom: `1px solid ${dividerGray}`, fontWeight: 'medium' }}>{confirmDialogData.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: textSoft }}>
            {confirmDialogData.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ borderTop: `1px solid ${dividerGray}`, p: 2 }}>
          <Button onClick={handleConfirmDialogClose} sx={{ ...buttonStyles.outlined, color: lightPrimary, borderColor: lightPrimary }}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDialogConfirm} sx={buttonStyles.contained} autoFocus>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialogo Historial de Pagos */}
      <Dialog
        open={historialPagosVisible}
        onClose={handleCloseHistorialPagos}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: lightSecondary,
            border: `1px solid ${dividerGray}`,
            color: textMain,
            maxHeight: '90vh',
            overflowY: 'auto',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: alpha(lightGray, 0.1), color: lightPrimary, borderBottom: `1px solid ${dividerGray}`, fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
          <HistoryIcon sx={{ mr: 1, color: lightAccent }} />
          Historial de Pagos: {profesorSeleccionadoHistorial?.nombre || ''}
          <IconButton aria-label="cerrar" onClick={handleCloseHistorialPagos} sx={{ position: 'absolute', right: 16, top: 16, color: lightPrimary }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {loadingHistorial && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
              <CircularProgress sx={{ color: lightPrimary }} />
            </Box>
          )}
          {errorHistorial && (
            <Alert severity="error" sx={{ m: 2 }}>
              {errorHistorial}
            </Alert>
          )}
          {!loadingHistorial && !errorHistorial && pagosDelProfesor.length === 0 && (
            <Typography sx={{ p: 3, textAlign: 'center', color: textSoft }}>No hay pagos registrados.</Typography>
          )}
          {!loadingHistorial && !errorHistorial && pagosDelProfesor.length > 0 && (
            <Box>
              {pagosDelProfesor.map(pago => (
                <Box key={pago._id || pago.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: `1px solid ${dividerGray}`, '&:last-child': { borderBottom: 'none' } }}>
                  <Box>
                    <Typography variant="body1" sx={{ color: lightAccent, display: 'flex', alignItems: 'center' }}>
                      <MonetizationOnIcon sx={{ mr: 0.5, fontSize: '1.2rem' }} />
                      <strong>${(pago.montoPagado || 0).toFixed(2)}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: textSoft }}>
                      {new Date(pago.fechaPago).toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} hs
                    </Typography>
                    {pago.descripcion && <Typography variant="body2" sx={{ fontStyle: 'italic', color: alpha(textSoft, 0.8), mt: 0.5 }}>{pago.descripcion}</Typography>}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${dividerGray}`, bgcolor: alpha(lightGray, 0.1) }}>
          <Button onClick={handleCloseHistorialPagos} sx={{ ...buttonStyles.outlined, color: lightPrimary, borderColor: lightPrimary }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
