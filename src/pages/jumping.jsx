// src/pages/jumping.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Grid, CircularProgress, Alert, Snackbar } from '@mui/material';
import { FitnessCenter as FitnessCenterIcon } from '@mui/icons-material';

// Importamos los nuevos componentes
import ClientList from '../components/jumping/ClientList';
import JumpingGrid from '../components/jumping/JumpingGrid';
import styles from '../components/jumping/jumping.module.css';

// Función para generar colores consistentes
const getRandomColor = (index) => {
    const colors = [ '#5D5FEF', '#6C63FF', '#4F46E5', '#7C3AED', '#9333EA', '#C026D3', '#DB2777', '#E11D48', '#F43F5E', '#F97316' ];
    return colors[index % colors.length];
};

export default function JumpingPage() {
    const [clientesPilates, setClientesPilates] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [camasAsignadas, setCamasAsignadas] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingGuardado, setLoadingGuardado] = useState(false);
    const [error, setError] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
    const [isModificado, setIsModificado] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const API_ENDPOINT = '/api/jumping';

    // Carga de datos inicial
    const cargarDatos = useCallback(async () => {
        try {
            setLoading(true);
            const [clientesRes, asignacionesRes] = await Promise.all([ fetch('/api/clientes'), fetch(API_ENDPOINT) ]);
            if (!clientesRes.ok) throw new Error('Error al cargar clientes');
            if (!asignacionesRes.ok) throw new Error('Error al cargar asignaciones');
            const dataClientes = await clientesRes.json();
            const dataAsignaciones = await asignacionesRes.json();
            
            const clientesConJumping = dataClientes.filter(c => c.actividades?.some(act => act.nombre.toLowerCase().includes('jumping')))
                .map((c, i) => ({ ...c, id: c._id, color: getRandomColor(i) }));

            setClientesPilates(clientesConJumping);
            setCamasAsignadas(dataAsignaciones || {});
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Lógica para manejar interacciones
    const handleCamaClick = (camaClave) => {
        // ... (Tu lógica existente para handleCamaClick)
    };

    const handleRemoveCliente = (camaClave) => {
        // ... (Tu lógica existente para handleRemoveCliente)
    };

    const guardarAsignaciones = async () => {
        // ... (Tu lógica existente para guardarAsignaciones)
    };

    const limpiarAsignacionesDia = () => {
        // ... (Tu lógica existente para limpiarAsignacionesDia)
    };

    const handleDiaChange = (event, newValue) => {
        if (isModificado && !window.confirm("Hay cambios sin guardar. ¿Descartar?")) return;
        setDiaSeleccionado(newValue);
        setIsModificado(false);
        setClienteSeleccionado(null);
    };

    // Renderizado
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Container maxWidth="lg" sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            <Box className={styles.pageHeader}>
                <Typography variant="h3" component="h1" className={styles.pageTitle}>
                    <FitnessCenterIcon fontSize="large" />
                    Gestión de Jumping
                </Typography>
                <Typography variant="subtitle1" className={styles.pageSubtitle}>
                    Organiza las asignaciones diarias de clientes a las camas por horario.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <ClientList
                        clientes={clientesPilates}
                        clienteSeleccionado={clienteSeleccionado}
                        onSelectCliente={setClienteSeleccionado}
                        isModificado={isModificado}
                        isLoading={loadingGuardado}
                        onSave={guardarAsignaciones}
                        onClearDay={limpiarAsignacionesDia}
                    />
                </Grid>
                <Grid item xs={12} md={9}>
                    <JumpingGrid
                        diaSeleccionado={diaSeleccionado}
                        onDiaChange={handleDiaChange}
                        camasAsignadas={camasAsignadas}
                        onCamaClick={handleCamaClick}
                        onRemoveCliente={handleRemoveCliente}
                    />
                </Grid>
            </Grid>

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}