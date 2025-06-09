// src/pages/clientes.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Head from "next/head";
import { Container, Box, Button, Typography, CircularProgress, Alert, TextField, Snackbar, useMediaQuery } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { motion, AnimatePresence } from "framer-motion";

// Importaciones de los nuevos componentes y estilos
import styles from './clientes.module.css';
import ClienteForm from '../components/clientes/ClienteForm';
import ClientesTable from '../components/clientes/ClientesTable';
import ConfirmDeleteDialog from '../components/clientes/ConfirmDeleteDialog';

// CONSTANTES
const ACTIVITY_NAME_PILATES = "Pilates";

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
  // =================================================================
  // 1. ESTADO DE LA PÁGINA
  // =================================================================
  const [clientes, setClientes] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState(initialFormState);
  const [editingClientId, setEditingClientId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useMediaQuery('(max-width:600px)');

  // =================================================================
  // 2. LÓGICA Y MANEJADORES DE EVENTOS
  // =================================================================

  // --- Helpers ---
  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };


  // --- Data Fetching ---
  const fetchClientes = useCallback(() => {
    setIsLoading(true);
    fetch("/api/clientes?actividad=Pilates", { cache: "no-store" })
      .then(res => res.ok ? res.json() : Promise.reject("Error cargando clientes"))
      .then(data => setClientes(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message || "Error al cargar datos."))
      .finally(() => setIsLoading(false));
  }, []);

  const fetchProfesores = useCallback(() => {
    fetch("/api/profesor", { cache: "no-store" })
        .then(res => res.ok ? res.json() : Promise.reject("Error cargando profesores"))
        .then(data => setProfesores(Array.isArray(data) ? data : []))
        .catch(() => setProfesores([]));
  }, []);

  useEffect(() => {
    fetchClientes();
    fetchProfesores();
  }, [fetchClientes, fetchProfesores]);


  // --- Form Handlers ---
  const handleToggleFormVisibility = () => {
    if (isFormVisible) {
      // Si el formulario está visible, al hacer clic se cierra y se resetea todo
      setIsFormVisible(false);
      setEditingClientId(null);
      setFormState(initialFormState);
      setError("");
    } else {
      // Si está oculto, simplemente se muestra
      setIsFormVisible(true);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
        ...prev,
        actividades: [{ ...prev.actividades[0], [name]: value }]
    }));
  };
  
  const handleDiaVisitaChange = (diaId, checked) => {
    setFormState(prev => {
      let currentDias = prev.actividades[0].diasVisita || [];
      const newDias = checked
        ? [...currentDias, diaId]
        : currentDias.filter(d => d !== diaId);
      
      return {
        ...prev,
        actividades: [{ ...prev.actividades[0], diasVisita: newDias.sort((a,b) => a-b) }]
      };
    });
  };

  const cancelEdit = () => {
    setFormState(initialFormState);
    setEditingClientId(null);
    setIsFormVisible(false);
    setError("");
  };

  // --- CRUD Operations ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const method = editingClientId ? "PUT" : "POST";
    const url = editingClientId ? `/api/clientes?id=${editingClientId}` : "/api/clientes";
    
    // Aquí puedes agregar la lógica de formato del `payload` que tenías antes
    const payload = { ...formState }; 

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al guardar cliente");
      
      showSnackbar(`Cliente ${editingClientId ? "actualizado" : "creado"} con éxito!`, "success");
      setIsFormVisible(false);
      setEditingClientId(null);
      setFormState(initialFormState);
      fetchClientes();
    } catch (err) {
      setError(err.message);
      showSnackbar(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditClick = (cliente) => {
    let fechaVenc = cliente.fechaVencimientoCuota ? new Date(cliente.fechaVencimientoCuota).toISOString().slice(0, 10) : "";
    setFormState({ ...initialFormState, ...cliente, fechaVencimientoCuota: fechaVenc });
    setEditingClientId(cliente._id);
    setIsFormVisible(true);
  };

  const handleDeleteRequest = (id) => {
    setClienteAEliminar(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clienteAEliminar) return;

    setIsLoading(true); // Puedes usar `isSubmitting` si prefieres
    try {
      const res = await fetch(`/api/clientes?id=${clienteAEliminar}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al eliminar.");
      
      showSnackbar("Cliente eliminado.", "success");
      fetchClientes();
    } catch (e) {
      showSnackbar(e.message, "error");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setClienteAEliminar(null);
    }
  };

  // --- Memoized Filtering ---
  const filteredClientes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clientes;
    return clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(term) ||
      String(cliente.dni).includes(term)
    );
  }, [clientes, searchTerm]);


  // =================================================================
  // 3. RENDERIZADO DEL COMPONENTE (JSX)
  // =================================================================
  return (
    <>
      <Head><title>Gestión Clientes Pilates</title></Head>
      <Container maxWidth="lg" className={styles.pageContainer}>
        <motion.div initial="hidden" animate="visible">
          <Box className={styles.header}>
            <Typography variant="h4" color="primary" className={styles.headerTitle}>
              Gestión Clientes Pilates
            </Typography>
            <Button
              variant="contained"
              color={isFormVisible ? "secondary" : "primary"}
              onClick={handleToggleFormVisibility}
              startIcon={isFormVisible ? <CloseIcon /> : <AddIcon />}
            >
              {isFormVisible ? "Cerrar Formulario" : "Nuevo Cliente"}
            </Button>
          </Box>

          {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

          <AnimatePresence>
            {isFormVisible && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <ClienteForm
                  formState={formState}
                  isEditing={!!editingClientId}
                  isLoading={isSubmitting}
                  profesores={profesores}
                  onFieldChange={handleFieldChange}
                  onActivityChange={handleActivityChange}
                  onDiaVisitaChange={handleDiaVisitaChange}
                  onSubmit={handleSubmit}
                  onCancel={cancelEdit}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <TextField
            label="Buscar por Nombre o DNI"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            className={styles.searchField}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} /> }}
            variant="outlined"
            size="small"
          />

          {isLoading ? (
            <Box textAlign="center" py={5}><CircularProgress /></Box>
          ) : (
            <ClientesTable
              clientes={filteredClientes}
              onEdit={handleEditClick}
              onDelete={handleDeleteRequest}
              isMobile={isMobile}
            />
          )}
        </motion.div>
        
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
        />
        
        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}