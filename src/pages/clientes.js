import React, { useState, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Select,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  Chip,
  Badge,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PlaceIcon from "@mui/icons-material/Place";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6baf',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: 0.5,
    },
  },
});

const ACTIVITY_NAME_PILATES = "Pilates";

const DIAS_SEMANA_OPTIONS = [
  { id: 0, nombre: "Dom", abrev: "D" },
  { id: 1, nombre: "Lun", abrev: "L" },
  { id: 2, nombre: "Mar", abrev: "M" },
  { id: 3, nombre: "Mié", abrev: "X" },
  { id: 4, nombre: "Jue", abrev: "J" },
  { id: 5, nombre: "Vie", abrev: "V" },
  { id: 6, nombre: "Sáb", abrev: "S" },
];

const initialPilatesActivityState = {
  nombre: ACTIVITY_NAME_PILATES,
  tarifa: "",
  clasesPendientes: "",
  clasesMensuales: "",
  profesor: "",
  diasVisita: [],
};

const initialFormState = {
  _id: null,
  dni: "",
  nombre: "",
  correo: "",
  direccion: "",
  telefono: "",
  fechaVencimientoCuota: "",
  actividades: [{ ...initialPilatesActivityState }],
};

export default function ClientesPilatesPage() {
  const [state, setState] = useState({
    clientes: [],
    form: initialFormState,
    editingClientId: null,
    listaProfesores: [],
    error: "",
    pageLoading: true,
    formSubmitLoading: false,
    editFormLoading: false,
    isFormVisible: false,
    snackbar: { open: false, message: "", severity: "info" },
    searchTerm: "",
  });

  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [editandoClases, setEditandoClases] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:600px)');

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const slideIn = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  const scaleUp = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
  };

  // Snackbar helpers
  const showSnackbar = useCallback((message, severity = "info") => {
    setState((prev) => ({
      ...prev,
      snackbar: { open: true, message, severity },
    }));
  }, []);

  const handleCloseSnackbar = () => {
    setState((prev) => ({ ...prev, snackbar: { ...prev.snackbar, open: false } }));
  };

  // Fetch clientes Pilates y profesores
  const fetchClientes = useCallback(() => {
    setState((prev) => ({ ...prev, pageLoading: true, error: "" }));
    fetch("/api/clientes?actividad=Pilates", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) return r.json().then((e) => Promise.reject(e.message || `Error ${r.status}`));
        return r.json();
      })
      .then((data) => {
        const clientesPilates = (Array.isArray(data) ? data : [])
          .map((cliente) => ({
            ...cliente,
            actividades:
              cliente.actividades && cliente.actividades.length > 0
                ? [cliente.actividades.find((a) => a.nombre === ACTIVITY_NAME_PILATES) || { ...initialPilatesActivityState }]
                : [{ ...initialPilatesActivityState }],
          }))
          .filter((cliente) => cliente.actividades[0]?.nombre === ACTIVITY_NAME_PILATES);
        setState((prev) => ({ ...prev, clientes: clientesPilates }));
      })
      .catch((err) => {
        setState((prev) => ({ ...prev, clientes: [], error: typeof err === "string" ? err : err.message || "Error cargando clientes." }));
      })
      .finally(() => setState((prev) => ({ ...prev, pageLoading: false })));
  }, []);

  useEffect(() => {
    fetchClientes();

    fetch("/api/profesor", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject("Error cargando profesores")))
      .then((data) => setState((prev) => ({ ...prev, listaProfesores: Array.isArray(data) ? data : [] })))
      .catch(() => setState((prev) => ({ ...prev, listaProfesores: [] })));
  }, [fetchClientes]);

  // Form toggling
  const handleToggleFormVisibility = () => {
    setState((prev) => {
      const newIsFormVisible = !prev.isFormVisible;
      if (newIsFormVisible && !prev.editingClientId) {
        return { ...prev, isFormVisible: true, form: { ...initialFormState }, editingClientId: null, error: "" };
      } else if (!newIsFormVisible) {
        return { ...prev, isFormVisible: false, form: initialFormState, editingClientId: null, error: "" };
      }
      return { ...prev, isFormVisible: newIsFormVisible, error: "" };
    });
  };

  // Form field changes (cliente)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, form: { ...prev.form, [name]: value } }));
  };

  // Pilates actividad changes
  const handlePilatesActivityDetailChange = (e) => {
    const { name, value } = e.target;
    setState((prev) => {
      const updatedPilates = { ...prev.form.actividades[0], [name]: value };
      return { ...prev, form: { ...prev.form, actividades: [updatedPilates] } };
    });
  };

  // Pilates dias visita change
  const handlePilatesDiaVisitaChange = (diaId, checked) => {
    setState((prev) => {
      let currentDias = Array.isArray(prev.form.actividades[0].diasVisita) ? [...prev.form.actividades[0].diasVisita] : [];
      if (checked) {
        if (!currentDias.includes(diaId)) currentDias.push(diaId);
      } else {
        currentDias = currentDias.filter((d) => d !== diaId);
      }
      const updatedPilates = { ...prev.form.actividades[0], diasVisita: currentDias.sort((a, b) => a - b) };
      return { ...prev, form: { ...prev.form, actividades: [updatedPilates] } };
    });
  };

  // Actualizar clases mensuales (PUT API)
  const handleUpdateClasesMensuales = async (clienteId, clasesMensualesNumerico) => {
    try {
      const res = await fetch(`/api/clientes?id=${clienteId}&campo=clasesMensuales`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actividadIndex: 0, clasesMensuales: clasesMensualesNumerico }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error actualizando clasesMensuales");
      showSnackbar("Clases mensuales de Pilates actualizadas!", "success");
      fetchClientes();
    } catch (e) {
      showSnackbar(e.message || "Error al actualizar clases.", "error");
      fetchClientes();
    }
  };

  // Inline edición clases
  const handleInlineClasesChange = (clienteId, value) => {
    setEditandoClases((prev) => ({ ...prev, [clienteId]: value }));
  };
  
  const handleInlineClasesBlur = (clienteId, valorOriginal) => {
    const valorEditado = editandoClases[clienteId];
    if (valorEditado === undefined || valorEditado === valorOriginal) {
      setEditandoClases((prev) => {
        const copy = { ...prev };
        delete copy[clienteId];
        return copy;
      });
      return;
    }
    let num = valorEditado.trim() === "" ? 0 : parseInt(valorEditado, 10);
    if (isNaN(num) || num < 0) {
      showSnackbar("El número de clases mensuales debe ser un número válido y no negativo.", "error");
      setEditandoClases((prev) => {
        const copy = { ...prev };
        delete copy[clienteId];
        return copy;
      });
      return;
    }
    handleUpdateClasesMensuales(clienteId, num);
    setEditandoClases((prev) => {
      const copy = { ...prev };
      delete copy[clienteId];
      return copy;
    });
  };

  // Editar cliente
  const handleEditClick = (cliente) => {
    setState((prev) => ({ ...prev, editingClientId: cliente._id, error: "", editFormLoading: true, isFormVisible: true }));
    try {
      let fechaVenc = "";
      if (cliente.fechaVencimientoCuota) {
        fechaVenc = new Date(cliente.fechaVencimientoCuota).toISOString().slice(0, 10);
      }
      const actividadPilates =
        cliente.actividades && cliente.actividades.length > 0 && cliente.actividades[0].nombre === ACTIVITY_NAME_PILATES
          ? { ...initialPilatesActivityState, ...cliente.actividades[0] }
          : { ...initialPilatesActivityState };

      setState((prev) => ({
        ...prev,
        form: {
          _id: cliente._id,
          dni: cliente.dni,
          nombre: cliente.nombre,
          correo: cliente.correo || "",
          direccion: cliente.direccion || "",
          telefono: cliente.telefono || "",
          fechaVencimientoCuota: fechaVenc,
          actividades: [actividadPilates],
        },
        editFormLoading: false,
      }));
    } catch (e) {
      const msg = e.message || "Error preparando datos para edición.";
      setState((prev) => ({ ...prev, error: msg, editingClientId: null, form: initialFormState, editFormLoading: false, isFormVisible: false }));
      showSnackbar(msg, "error");
    }
  };

  // Cancelar edición
  const cancelEdit = () => {
    setState((prev) => ({ ...prev, editingClientId: null, form: { ...initialFormState }, error: "", isFormVisible: false }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setState((prev) => ({ ...prev, error: "", formSubmitLoading: true }));
    const { form, editingClientId } = state;
    const pilatesActivity = form.actividades[0];
    if (pilatesActivity.nombre !== ACTIVITY_NAME_PILATES) {
      const errMsg = "La actividad debe ser Pilates.";
      setState((prev) => ({ ...prev, error: errMsg, formSubmitLoading: false }));
      showSnackbar(errMsg, "warning");
      return;
    }

    const payload = {
      dni: form.dni,
      nombre: form.nombre,
      correo: form.correo,
      direccion: form.direccion,
      telefono: form.telefono,
      fechaVencimientoCuota: form.fechaVencimientoCuota || null,
      actividades: [
        {
          nombre: ACTIVITY_NAME_PILATES,
          tarifa: parseFloat(pilatesActivity.tarifa) || 0,
          clasesPendientes: parseInt(pilatesActivity.clasesPendientes) || 0,
          clasesMensuales:
            pilatesActivity.clasesMensuales !== undefined && pilatesActivity.clasesMensuales !== ""
              ? parseInt(pilatesActivity.clasesMensuales)
              : 0,
          profesor: pilatesActivity.profesor || "",
          diasVisita: Array.isArray(pilatesActivity.diasVisita)
            ? pilatesActivity.diasVisita.map(Number).sort((a, b) => a - b)
            : [],
        },
      ],
    };

    const method = editingClientId ? "PUT" : "POST";
    const url = editingClientId ? `/api/clientes?id=${editingClientId}` : "/api/clientes";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || `Error al ${editingClientId ? "actualizar" : "crear"}.`);
      showSnackbar(resData.message || `Cliente ${editingClientId ? "actualizado" : "creado"}!`, "success");
      setState((prev) => ({ ...prev, form: { ...initialFormState }, editingClientId: null, isFormVisible: false, formSubmitLoading: false }));
      fetchClientes();
    } catch (e) {
      setState((prev) => ({ ...prev, error: e.message || "Error en el envío del formulario.", formSubmitLoading: false }));
      showSnackbar(e.message || "Error en el envío del formulario.", "error");
    }
  };

  // Eliminar cliente
  const handleDeleteRequest = (id) => {
    if (state.editingClientId === id) {
      showSnackbar("No puede eliminar un cliente que está en edición.", "warning");
      return;
    }
    setClienteAEliminar(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setClienteAEliminar(null);
  };

  const confirmDelete = async () => {
    if (!clienteAEliminar) return;
    const idToDelete = clienteAEliminar;
    setDeleteDialogOpen(false);
    setClienteAEliminar(null);
    setState((prev) => ({ ...prev, error: "", formSubmitLoading: true }));
    try {
      const res = await fetch(`/api/clientes?id=${idToDelete}`, { method: "DELETE" });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.message || "Error al eliminar.");
      showSnackbar(resData.message || "Cliente eliminado.", "success");
      if (state.editingClientId === idToDelete) {
        setState((prev) => ({ ...prev, editingClientId: null, form: { ...initialFormState }, isFormVisible: false }));
      }
      fetchClientes();
    } catch (e) {
      setState((prev) => ({ ...prev, error: e.message || "Error al eliminar el cliente." }));
      showSnackbar(e.message || "Error al eliminar el cliente.", "error");
    } finally {
      setState((prev) => ({ ...prev, formSubmitLoading: false }));
    }
  };

  // Buscador
  const handleSearchChange = (e) => {
    setState((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const filteredClientes = useMemo(() => {
    const term = state.searchTerm.trim().toLowerCase();
    return state.clientes.filter((cliente) => {
      return (
        !term ||
        cliente.nombre.toLowerCase().includes(term) ||
        String(cliente.dni).includes(term) ||
        (cliente.telefono || "").toLowerCase().includes(term)
      );
    });
  }, [state.clientes, state.searchTerm]);

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return "-";
    }
  };

  // Verificar si la fecha está vencida
  const isFechaVencida = (dateString) => {
    if (!dateString) return false;
    try {
      const fecha = new Date(dateString);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return fecha < hoy;
    } catch {
      return false;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Gestión Clientes Pilates</title>
      </Head>

      <Container maxWidth="lg" sx={{ py: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
        {/* Animación de entrada principal */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header con animación */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <motion.div variants={slideIn}>
              <Typography variant="h4" color="primary" gutterBottom sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                <FitnessCenterIcon sx={{ mr: 2 }} /> Gestión Clientes Pilates
              </Typography>
            </motion.div>
            
            {/* Botón Agregar con animación */}
            <motion.div variants={fadeIn}>
              <Button
                variant="contained"
                color={state.isFormVisible && !state.editingClientId ? "secondary" : "primary"}
                onClick={handleToggleFormVisibility}
                disabled={!!state.editingClientId && state.isFormVisible}
                startIcon={state.isFormVisible && !state.editingClientId ? <CloseIcon /> : <AddIcon />}
                sx={{ borderRadius: 2 }}
              >
                {isMobile ? (state.isFormVisible ? "Cerrar" : "Nuevo") : 
                  (state.isFormVisible && !state.editingClientId ? "Cerrar Formulario" : "Nuevo Cliente")}
              </Button>
            </motion.div>
          </Box>

          {/* Mensaje de error */}
          {state.error && (
            <motion.div variants={fadeIn}>
              <Alert 
                severity="error" 
                onClose={() => setState((prev) => ({ ...prev, error: "" }))} 
                sx={{ mb: 3 }}
              >
                {state.error}
              </Alert>
            </motion.div>
          )}

          {/* Formulario con animación */}
          <AnimatePresence>
            {state.isFormVisible && (
              <motion.div
                variants={scaleUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                  {state.editFormLoading ? (
                    <Box textAlign="center" py={4}>
                      <CircularProgress color="primary" size={50} />
                    </Box>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate>
                      <Grid container spacing={2}>
                        {/* Campos cliente */}
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="DNI"
                            name="dni"
                            value={state.form.dni}
                            onChange={handleChange}
                            fullWidth
                            required
                            disabled={!!state.editingClientId}
                            helperText={state.editingClientId ? "No se puede modificar el DNI" : ""}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Nombre Completo"
                            name="nombre"
                            value={state.form.nombre}
                            onChange={handleChange}
                            fullWidth
                            required
                            variant="outlined"
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            label="Fecha Vencimiento Cuota"
                            name="fechaVencimientoCuota"
                            type="date"
                            value={state.form.fechaVencimientoCuota || ""}
                            onChange={handleChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            variant="outlined"
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <TextField 
                            label="Correo Electrónico" 
                            name="correo" 
                            value={state.form.correo} 
                            onChange={handleChange} 
                            fullWidth 
                            type="email"
                            variant="outlined"
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <TextField 
                            label="Teléfono" 
                            name="telefono" 
                            value={state.form.telefono} 
                            onChange={handleChange} 
                            fullWidth 
                            type="tel"
                            variant="outlined"
                            size="small"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                          <TextField 
                            label="Dirección" 
                            name="direccion" 
                            value={state.form.direccion} 
                            onChange={handleChange} 
                            fullWidth
                            variant="outlined"
                            size="small"
                          />
                        </Grid>

                        {/* Detalles actividad Pilates */}
                        <Grid item xs={12}>
                          <Typography variant="h6" gutterBottom sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                            <FitnessCenterIcon sx={{ mr: 1 }} /> Detalles de Pilates
                          </Typography>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 3,
                              borderColor: 'primary.light',
                              backgroundColor: 'rgba(74, 107, 175, 0.05)',
                              borderRadius: 2,
                            }}
                          >
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Tarifa ($)"
                                  name="tarifa"
                                  type="number"
                                  value={state.form.actividades[0].tarifa}
                                  onChange={handlePilatesActivityDetailChange}
                                  fullWidth
                                  inputProps={{ min: 0, step: "0.01" }}
                                  variant="outlined"
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Clases a Cargar"
                                  name="clasesPendientes"
                                  type="number"
                                  value={state.form.actividades[0].clasesPendientes}
                                  onChange={handlePilatesActivityDetailChange}
                                  fullWidth
                                  inputProps={{ min: 0 }}
                                  variant="outlined"
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                  label="Clases Mensuales"
                                  name="clasesMensuales"
                                  type="number"
                                  value={state.form.actividades[0].clasesMensuales}
                                  onChange={handlePilatesActivityDetailChange}
                                  fullWidth
                                  inputProps={{ min: 0 }}
                                  variant="outlined"
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} sm={6} md={3}>
                                <FormControl fullWidth size="small">
                                  <InputLabel id="profesor-label">Profesor</InputLabel>
                                  <Select
                                    labelId="profesor-label"
                                    name="profesor"
                                    value={state.form.actividades[0].profesor || ""}
                                    label="Profesor"
                                    onChange={handlePilatesActivityDetailChange}
                                    variant="outlined"
                                  >
                                    <MenuItem value="">-- Seleccione --</MenuItem>
                                    {state.listaProfesores.map((prof) => (
                                      <MenuItem key={prof._id || prof.nombre} value={prof.nombre}>
                                        {prof.nombre}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>

                              <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Días de Visita:</Typography>
                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                  {DIAS_SEMANA_OPTIONS.map((dia) => (
                                    <Tooltip key={dia.id} title={dia.nombre}>
                                      <Chip
                                        label={isMobile ? dia.abrev : dia.nombre}
                                        onClick={() => handlePilatesDiaVisitaChange(dia.id, !state.form.actividades[0].diasVisita.includes(dia.id))}
                                        color={state.form.actividades[0].diasVisita.includes(dia.id) ? "primary" : "default"}
                                        variant={state.form.actividades[0].diasVisita.includes(dia.id) ? "filled" : "outlined"}
                                        size="small"
                                        clickable
                                      />
                                    </Tooltip>
                                  ))}
                                </Box>
                              </Grid>
                            </Grid>
                          </Paper>
                        </Grid>

                        {/* Botones Guardar / Cancelar */}
                        <Grid item xs={12} sx={{ mt: 2, textAlign: "right" }}>
                          <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            disabled={state.formSubmitLoading}
                            startIcon={state.formSubmitLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{ mr: 2, borderRadius: 2 }}
                          >
                            {state.formSubmitLoading ? "Guardando..." : state.editingClientId ? "Actualizar" : "Guardar"}
                          </Button>
                          <Button 
                            variant="outlined" 
                            onClick={cancelEdit} 
                            disabled={state.formSubmitLoading}
                            sx={{ borderRadius: 2 }}
                          >
                            Cancelar
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  )}
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buscador con animación */}
          <motion.div variants={fadeIn}>
            <TextField
              label="Buscar clientes"
              value={state.searchTerm}
              onChange={handleSearchChange}
              fullWidth
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
              variant="outlined"
              size="small"
            />
          </motion.div>

          {/* Tabla Clientes Pilates */}
          {state.pageLoading ? (
            <Box textAlign="center" py={6}>
              <CircularProgress color="primary" size={50} />
            </Box>
          ) : state.error ? (
            <Alert severity="error">{state.error}</Alert>
          ) : filteredClientes.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                {state.searchTerm ? "No se encontraron clientes con ese criterio." : "No hay clientes de Pilates registrados."}
              </Typography>
            </Paper>
          ) : (
            <motion.div variants={fadeIn}>
              <TableContainer 
                component={Paper} 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'primary.main',
                    borderRadius: '4px',
                  },
                }}
              >
                <Table size="small" aria-label="clientes Pilates">
                  <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>DNI</TableCell>
                      <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Nombre</TableCell>
                      {!isMobile && (
                        <>
                          <TableCell align="center" sx={{ color: 'common.white', fontWeight: 'bold' }}>Tarifa</TableCell>
                          <TableCell align="center" sx={{ color: 'common.white', fontWeight: 'bold' }}>Clases/Mes</TableCell>
                          <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Vencimiento</TableCell>
                          <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Días</TableCell>
                          <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Contacto</TableCell>
                        </>
                      )}
                      <TableCell align="center" sx={{ color: 'common.white', fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClientes.map((cliente) => {
                      const actividad = cliente.actividades[0] || initialPilatesActivityState;
                      const tarifa = parseFloat(actividad.tarifa) || 0;
                      const diasVisita = Array.isArray(actividad.diasVisita) && actividad.diasVisita.length > 0
                        ? actividad.diasVisita
                            .map((id) => DIAS_SEMANA_OPTIONS.find((opt) => opt.id === id)?.nombre || id)
                            .join(", ")
                        : "-";
                      const fechaVenc = formatDate(cliente.fechaVencimientoCuota);
                      const isVencido = isFechaVencida(cliente.fechaVencimientoCuota);
                      const clasesMensualesStr = actividad.clasesMensuales?.toString() || "0";

                      return (
                        <TableRow 
                          key={cliente._id} 
                          component={motion.tr} 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -10 }}
                          hover
                          sx={{ 
                            '&:nth-of-type(odd)': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <TableCell>{cliente.dni}</TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>{cliente.nombre}</TableCell>
                          
                          {!isMobile && (
                            <>
                              <TableCell align="center">${tarifa.toFixed(2)}</TableCell>
                              <TableCell align="center">
                                {editandoClases[cliente._id] !== undefined ? (
                                  <TextField
                                    type="number"
                                    value={editandoClases[cliente._id]}
                                    onChange={(e) => handleInlineClasesChange(cliente._id, e.target.value)}
                                    onBlur={() => handleInlineClasesBlur(cliente._id, clasesMensualesStr)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") e.target.blur();
                                      if (e.key === "Escape") setEditandoClases((p) => {
                                        const copy = { ...p };
                                        delete copy[cliente._id];
                                        return copy;
                                      });
                                    }}
                                    autoFocus
                                    size="small"
                                    inputProps={{ 
                                      style: { 
                                        textAlign: "center", 
                                        width: "50px" 
                                      }, 
                                      min: 0 
                                    }}
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                          borderColor: 'primary.main',
                                        },
                                      },
                                    }}
                                  />
                                ) : (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setEditandoClases((p) => ({ ...p, [cliente._id]: clasesMensualesStr }))}
                                    sx={{ 
                                      minWidth: 40, 
                                      minHeight: 30, 
                                      padding: '4px 8px', 
                                      fontSize: "0.8rem",
                                      borderColor: 'primary.light',
                                      color: 'text.primary',
                                      '&:hover': {
                                        borderColor: 'primary.main',
                                      }
                                    }}
                                  >
                                    {clasesMensualesStr}
                                  </Button>
                                )}
                              </TableCell>
                              <TableCell sx={{ color: isVencido ? "error.main" : "inherit" }}>
                                <Box display="flex" alignItems="center">
                                  <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                  {fechaVenc}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  {DIAS_SEMANA_OPTIONS.map(dia => (
                                    actividad.diasVisita?.includes(dia.id) && (
                                      <Tooltip key={dia.id} title={dia.nombre}>
                                        <Chip 
                                          label={dia.abrev} 
                                          size="small" 
                                          sx={{ 
                                            backgroundColor: 'primary.light', 
                                            color: 'primary.contrastText',
                                            fontSize: '0.7rem',
                                            height: '24px'
                                          }} 
                                        />
                                      </Tooltip>
                                    )
                                  ))}
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" flexDirection="column">
                                  {cliente.telefono && (
                                    <Box display="flex" alignItems="center" sx={{ mb: 0.5 }}>
                                      <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                      <Typography variant="body2">{cliente.telefono}</Typography>
                                    </Box>
                                  )}
                                  {cliente.correo && (
                                    <Box display="flex" alignItems="center">
                                      <EmailIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                      <Typography variant="body2" noWrap>{cliente.correo}</Typography>
                                    </Box>
                                  )}
                                </Box>
                              </TableCell>
                            </>
                          )}

                          <TableCell align="center">
                            <Box display="flex" justifyContent="center">
                              <Tooltip title="Editar">
                                <IconButton
                                  color="primary"
                                  onClick={() => handleEditClick(cliente)}
                                  disabled={state.formSubmitLoading || state.pageLoading}
                                  size="small"
                                  sx={{ 
                                    '&:hover': {
                                      backgroundColor: 'primary.light',
                                      color: 'primary.contrastText'
                                    }
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton
                                  color="error"
                                  onClick={() => handleDeleteRequest(cliente._id)}
                                  disabled={state.formSubmitLoading || state.pageLoading || state.editingClientId === cliente._id}
                                  size="small"
                                  sx={{ 
                                    '&:hover': {
                                      backgroundColor: 'error.light',
                                      color: 'error.contrastText'
                                    }
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </motion.div>
          )}
        </motion.div>

        {/* Dialogo de confirmación para eliminar */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirmar eliminación"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              ¿Está seguro que desea eliminar este cliente? Esta acción no se puede deshacer.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="primary">
              Cancelar
            </Button>
            <Button onClick={confirmDelete} color="error" autoFocus>
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar 
          open={state.snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar} 
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={state.snackbar.severity} 
            sx={{ width: "100%" }}
            variant="filled"
          >
            {state.snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}