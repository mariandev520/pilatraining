import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Paper, Box, Grid, Avatar,
    Chip, Card, CardContent, CircularProgress, Alert,
    Divider, IconButton, Button, List, ListItem, ListItemAvatar,
    ListItemText, Tab, Tabs, Snackbar, alpha, Tooltip, ListItemSecondaryAction,
    Badge
} from '@mui/material';
import {
    Person as PersonIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    FitnessCenter as FitnessCenterIcon,
    CheckCircle as CheckCircleIcon,
    ArrowRightAlt as ArrowRightAltIcon,
    ErrorOutline as ErrorOutlineIcon,
    Info as InfoIcon,
    Clear as ClearIcon,
    AddCircleOutline as AddCircleOutlineIcon,
    Group as GroupIcon,
    Schedule as ScheduleIcon
} from '@mui/icons-material';

// Constantes
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORARIOS = ['8:00', '9:30', '11:00', '16:00', '17:30', '19:00'];
const ACTIVIDAD_KEY = 'gap';

// Componente ClienteItem optimizado
const ClienteItem = React.memo(({ cliente, seleccionado, onClick }) => {
    return (
        <ListItem
            button
            onClick={() => onClick(cliente)}
            selected={seleccionado}
            sx={{
                mb: 1, borderRadius: 1,
                border: `1px solid ${seleccionado ? cliente.color || '#ff9800' : 'transparent'}`,
                bgcolor: seleccionado ? alpha(cliente.color || '#ff9800', 0.1) : 'transparent',
                '&:hover': { bgcolor: alpha(cliente.color || '#ff9800', 0.15) }
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: cliente.color || '#ff9800', width: 36, height: 36 }}>
                    {cliente.nombre?.split(' ').map(n => n[0]).join('')}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={<Typography noWrap fontWeight={seleccionado ? 'bold' : 'normal'}>{cliente.nombre}</Typography>}
                secondary={`Clases: ${cliente.clasesPendientes ?? 'N/A'}`}
                secondaryTypographyProps={{ variant: 'caption' }}
            />
            {seleccionado && <ArrowRightAltIcon sx={{ color: 'warning.main' }} />}
        </ListItem>
    );
});

// Componente SeccionHorariogapmanager mejorado
const SeccionHorariogapmanager = React.memo(({
    horario,
    diaSeleccionado,
    clientesAsignados = [],
    clienteSeleccionado,
    onAsignarCliente,
    onRemoveCliente
}) => {
    const diaHorarioKey = `${diaSeleccionado}-${horario}`;
    const totalClientes = clientesAsignados.length;

    return (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
            <Box sx={{
                bgcolor: 'warning.light',
                color: 'warning.contrastText',
                px: 2, py: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">{horario}</Typography>
                </Box>
                
                <Badge 
                    badgeContent={totalClientes} 
                    color="primary" 
                    sx={{ mr: 1 }}
                />
                
                {clienteSeleccionado && (
                    <Button
                        variant="contained"
                        size="small"
                        color="warning"
                        sx={{ 
                            bgcolor: 'warning.dark', 
                            '&:hover': { bgcolor: 'warning.main' },
                            color: '#fff'
                        }}
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => onAsignarCliente(diaHorarioKey)}
                    >
                        Asignar
                    </Button>
                )}
            </Box>

            <CardContent sx={{ p: 0 }}>
                {totalClientes > 0 ? (
                    <List dense sx={{ pt: 0 }}>
                        {clientesAsignados.map((cliente) => (
                            <ListItem key={`${cliente.id}-${diaHorarioKey}`} divider>
                                <ListItemAvatar>
                                    <Avatar sx={{ 
                                        width: 32, 
                                        height: 32,
                                        bgcolor: cliente.color || '#ff9800'
                                    }}>
                                        {cliente.nombre?.split(' ').map(n => n[0]).join('')}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={cliente.nombre}
                                    secondary={`DNI: ${cliente.dni || 'N/A'}`}
                                    primaryTypographyProps={{ noWrap: true, variant: 'body2' }}
                                    secondaryTypographyProps={{ noWrap: true, variant: 'caption' }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        edge="end"
                                        size="small"
                                        color="error"
                                        onClick={() => onRemoveCliente(diaHorarioKey, cliente.id)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 3, px: 2 }}>
                        <GroupIcon sx={{ fontSize: 30, color: 'grey.400', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                            No hay clientes asignados
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
});

// Componente principal optimizado
const gap = () => {
    const [state, setState] = useState({
        clientes: [],
        clientesgapmanager: [],
        clienteSeleccionado: null,
        asignaciones: {},
        loading: true,
        loadingGuardado: false,
        error: null,
        diaSeleccionado: 'Lunes',
        isModificado: false,
        snackbar: { open: false, message: '', severity: 'success' }
    });

    const API_ENDPOINT = `/api/${ACTIVIDAD_KEY}`;

    // Función para generar colores
    const getRandomColor = useCallback((index) => {
        const colors = ['#ff9800', '#fb8c00', '#f57c00', '#ef6c00', '#e65100', '#ffb74d'];
        return colors[index % colors.length];
    }, []);

    // Carga inicial de datos
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));
                
                const [respClientes, respAsignaciones] = await Promise.all([
                    fetch('/api/clientes'),
                    fetch(API_ENDPOINT)
                ]);

                if (!respClientes.ok) throw new Error('Error al cargar clientes');
                const dataClientes = await respClientes.json();

                // Filtrar y formatear clientes
                const clientesFiltrados = dataClientes
                    .filter(c => c.actividades?.some(act => act.nombre.toLowerCase().includes(ACTIVIDAD_KEY)))
                    .map((cliente, index) => ({
                        id: cliente._id || `cliente-${index}`,
                        dni: cliente.dni,
                        nombre: cliente.nombre,
                        color: getRandomColor(index),
                        clasesPendientes: cliente.clasesPendientesTotales
                    }));

                // Procesar asignaciones
                const dataAsignaciones = respAsignaciones.ok 
                    ? await respAsignaciones.json() 
                    : {};

                setState(prev => ({
                    ...prev,
                    clientes: dataClientes,
                    clientesgapmanager: clientesFiltrados,
                    asignaciones: dataAsignaciones,
                    loading: false
                }));

            } catch (err) {
                console.error('Error cargando datos:', err);
                setState(prev => ({
                    ...prev,
                    error: `Error al cargar datos: ${err.message}`,
                    loading: false
                }));
            }
        };

        cargarDatos();
    }, [API_ENDPOINT, getRandomColor]);

    // Funciones de manejo de estado
    const updateState = (updates) => {
        setState(prev => ({ ...prev, ...updates }));
    };

    const seleccionarCliente = (cliente) => {
        updateState({
            clienteSeleccionado: state.clienteSeleccionado?.id === cliente.id ? null : cliente
        });
    };

    const handleAsignarCliente = (diaHorarioKey) => {
        if (!state.clienteSeleccionado) return;

        const { asignaciones, clienteSeleccionado } = state;
        const asignacionesActuales = asignaciones[diaHorarioKey] || [];

        // Validaciones
        if (asignacionesActuales.some(c => c.id === clienteSeleccionado.id)) {
            updateState({
                snackbar: {
                    open: true,
                    message: `${clienteSeleccionado.nombre} ya está en este horario`,
                    severity: 'warning'
                }
            });
            return;
        }

        if (clienteSeleccionado.clasesPendientes <= 0 && 
            !window.confirm(`${clienteSeleccionado.nombre} no tiene clases pendientes. ¿Asignar igual?`)) {
            return;
        }

        // Actualizar asignaciones
        const nuevasAsignaciones = {
            ...asignaciones,
            [diaHorarioKey]: [...asignacionesActuales, clienteSeleccionado]
        };

        updateState({
            asignaciones: nuevasAsignaciones,
            clienteSeleccionado: null,
            isModificado: true,
            snackbar: {
                open: true,
                message: `${clienteSeleccionado.nombre} asignado correctamente`,
                severity: 'success'
            }
        });
    };

    const handleRemoveCliente = (diaHorarioKey, clienteId) => {
        const { asignaciones } = state;
        const nuevasAsignaciones = asignaciones[diaHorarioKey]?.filter(c => c.id !== clienteId);

        const updatedAsignaciones = { ...asignaciones };
        if (nuevasAsignaciones?.length > 0) {
            updatedAsignaciones[diaHorarioKey] = nuevasAsignaciones;
        } else {
            delete updatedAsignaciones[diaHorarioKey];
        }

        updateState({
            asignaciones: updatedAsignaciones,
            isModificado: true,
            snackbar: {
                open: true,
                message: 'Cliente eliminado del horario',
                severity: 'info'
            }
        });
    };

    const limpiarAsignacionesDia = () => {
        const { diaSeleccionado, asignaciones } = state;
        const keysToDelete = Object.keys(asignaciones).filter(key => key.startsWith(`${diaSeleccionado}-`));

        if (keysToDelete.length === 0 || !window.confirm(`¿Eliminar todas las asignaciones del ${diaSeleccionado}?`)) {
            return;
        }

        const nuevasAsignaciones = { ...asignaciones };
        keysToDelete.forEach(key => delete nuevasAsignaciones[key]);

        updateState({
            asignaciones: nuevasAsignaciones,
            isModificado: true,
            snackbar: {
                open: true,
                message: `Asignaciones del ${diaSeleccionado} eliminadas`,
                severity: 'success'
            }
        });
    };

    const handleDiaChange = (event, newValue) => {
        if (state.isModificado && !window.confirm("Hay cambios sin guardar. ¿Continuar?")) {
            return;
        }
        updateState({ diaSeleccionado: newValue, clienteSeleccionado: null });
    };

    const guardarAsignaciones = async () => {
        updateState({ loadingGuardado: true, error: null });
        
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asignaciones: state.asignaciones })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}`);
            }

            updateState({
                isModificado: false,
                loadingGuardado: false,
                snackbar: {
                    open: true,
                    message: 'Asignaciones guardadas correctamente',
                    severity: 'success'
                }
            });

        } catch (err) {
            console.error('Error guardando asignaciones:', err);
            updateState({
                loadingGuardado: false,
                snackbar: {
                    open: true,
                    message: `Error al guardar: ${err.message}`,
                    severity: 'error'
                }
            });
        }
    };

    const handleCloseSnackbar = () => {
        updateState({ snackbar: { ...state.snackbar, open: false } });
    };

    // Renderizado condicional
    if (state.loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} color="warning" />
                <Typography sx={{ ml: 2 }}>Cargando clases gapmanageres...</Typography>
            </Box>
        );
    }

    if (state.error && !Object.keys(state.asignaciones).length && state.clientesgapmanager.length === 0) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" action={
                    <Button color="inherit" size="small" onClick={() => window.location.reload()}>
                        Recargar
                    </Button>
                }>
                    {state.error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            {/* Encabezado */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 1, 
                    fontWeight: 'bold' 
                }}>
                    <FitnessCenterIcon fontSize="large" color="warning" /> 
                    Gestión de Clases Gap
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" align="center">
                    Asigna múltiples clientes a cada horario de entrenamiento gapmanager
                </Typography>
            </Box>

            {/* Mostrar error no crítico */}
            {state.error && (
                <Alert severity="warning" sx={{ mb: 2 }} onClose={() => updateState({ error: null })}>
                    {state.error}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Panel lateral de clientes */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={2} sx={{ 
                        p: 1.5, 
                        borderRadius: 2, 
                        height: '100%', 
                        position: 'sticky', 
                        top: 20, 
                        display: 'flex', 
                        flexDirection: 'column' 
                    }}>
                        <Typography variant="h6" sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1, 
                            pb: 1, 
                            borderBottom: '1px solid #eee' 
                        }}>
                            <PersonIcon color="warning" sx={{ mr: 1 }} /> 
                            Clientes Disponibles
                        </Typography>

                        {state.clienteSeleccionado && (
                            <Alert severity="info" sx={{ mb: 1.5 }} icon={<CheckCircleIcon fontSize="small" />}>
                                <Typography variant="body2">
                                    <strong>{state.clienteSeleccionado.nombre}</strong> seleccionado
                                </Typography>
                                <Typography variant="caption">
                                    Haz clic en "Asignar" en el horario deseado
                                </Typography>
                            </Alert>
                        )}

                        <Box sx={{ 
                            flexGrow: 1, 
                            overflowY: 'auto', 
                            maxHeight: 'calc(100vh - 350px)'
                        }}>
                            {state.clientesgapmanager.length > 0 ? (
                                <List dense sx={{ pt: 0 }}>
                                    {state.clientesgapmanager.map(cliente => (
                                        <ClienteItem
                                            key={cliente.id}
                                            cliente={cliente}
                                            seleccionado={state.clienteSeleccionado?.id === cliente.id}
                                            onClick={seleccionarCliente}
                                        />
                                    ))}
                                </List>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No hay clientes disponibles
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Botones de acción */}
                        <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="warning"
                                startIcon={state.loadingGuardado ? 
                                    <CircularProgress size={20} color="inherit" /> : 
                                    <SaveIcon />}
                                onClick={guardarAsignaciones}
                                disabled={!state.isModificado || state.loadingGuardado}
                            >
                                {state.loadingGuardado ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>

                            {state.isModificado && (
                                <Typography variant="caption" color="text.secondary" sx={{ 
                                    display: 'block', 
                                    textAlign: 'center', 
                                    mt: 0.5 
                                }}>
                                    Cambios pendientes
                                </Typography>
                            )}

                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<ClearIcon />}
                                onClick={limpiarAsignacionesDia}
                                sx={{ mt: 1.5 }}
                                disabled={!Object.keys(state.asignaciones).some(
                                    key => key.startsWith(`${state.diaSeleccionado}-`)
                                )}
                            >
                                Limpiar {state.diaSeleccionado}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Panel principal de horarios */}
                <Grid item xs={12} md={9}>
                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        {/* Tabs de días */}
                        <Box sx={{ bgcolor: 'grey.100', borderBottom: '1px solid #e0e0e0' }}>
                            <Tabs
                                value={state.diaSeleccionado}
                                onChange={handleDiaChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                textColor="warning"
                                indicatorColor="warning"
                            >
                                {DIAS_SEMANA.map(dia => (
                                    <Tab
                                        key={dia}
                                        label={dia}
                                        value={dia}
                                        sx={{
                                            fontWeight: state.diaSeleccionado === dia ? 'bold' : 'normal',
                                            px: { xs: 1.5, sm: 2 }
                                        }}
                                    />
                                ))}
                            </Tabs>
                        </Box>

                        {/* Contenido de horarios */}
                        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                            {HORARIOS.map(horario => {
                                const diaHorarioKey = `${state.diaSeleccionado}-${horario}`;
                                return (
                                    <SeccionHorariogapmanager
                                        key={diaHorarioKey}
                                        horario={horario}
                                        diaSeleccionado={state.diaSeleccionado}
                                        clientesAsignados={state.asignaciones[diaHorarioKey] || []}
                                        clienteSeleccionado={state.clienteSeleccionado}
                                        onAsignarCliente={handleAsignarCliente}
                                        onRemoveCliente={handleRemoveCliente}
                                    />
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Snackbar de notificaciones */}
            <Snackbar
                open={state.snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={state.snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {state.snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default gap;