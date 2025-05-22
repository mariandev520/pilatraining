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
    SportsKabaddi as SportsKabaddiIcon,
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
const ACTIVIDAD_KEY = 'kickboxing';

// Componente ClienteItem optimizado
const ClienteItem = React.memo(({ cliente, seleccionado, onClick }) => {
    return (
        <ListItem
            button
            onClick={() => onClick(cliente)}
            selected={seleccionado}
            sx={{
                mb: 1, borderRadius: 1,
                border: `1px solid ${seleccionado ? cliente.color || '#ba68c8' : 'transparent'}`,
                bgcolor: seleccionado ? alpha(cliente.color || '#ba68c8', 0.1) : 'transparent',
                '&:hover': { bgcolor: alpha(cliente.color || '#ba68c8', 0.15) }
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: cliente.color || '#ba68c8', width: 36, height: 36 }}>
                    {cliente.nombre?.split(' ').map(n => n[0]).join('')}
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={<Typography noWrap fontWeight={seleccionado ? 'bold' : 'normal'}>{cliente.nombre}</Typography>}
                secondary={`Clases: ${cliente.clasesPendientes ?? 'N/A'} | Nivel: ${cliente.nivel || 'Principiante'}`}
                secondaryTypographyProps={{ variant: 'caption' }}
            />
            {seleccionado && <ArrowRightAltIcon sx={{ color: 'secondary.main' }} />}
        </ListItem>
    );
});

// Componente SeccionHorarioKickboxing mejorado
const SeccionHorarioKickboxing = React.memo(({
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
                bgcolor: 'secondary.light',
                color: 'secondary.contrastText',
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
                        color="secondary"
                        sx={{ 
                            bgcolor: 'secondary.dark', 
                            '&:hover': { bgcolor: 'secondary.main' },
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
                                        bgcolor: cliente.color || '#ba68c8'
                                    }}>
                                        {cliente.nombre?.split(' ').map(n => n[0]).join('')}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={cliente.nombre}
                                    secondary={`Nivel: ${cliente.nivel || 'Principiante'}`}
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
                            No hay practicantes asignados
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
});

// Componente principal optimizado
const kickboxing = () => {
    const [state, setState] = useState({
        clientes: [],
        clientesKickboxing: [],
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

    // Función para generar colores violetas
    const getRandomColor = useCallback((index) => {
        const colors = ['#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2', '#6a1b9a'];
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
                        nivel: cliente.nivel || 'Principiante',
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
                    clientesKickboxing: clientesFiltrados,
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
                message: 'Practicante eliminado del horario',
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
                <CircularProgress size={60} color="secondary" />
                <Typography sx={{ ml: 2 }}>Cargando clases de Kickboxing...</Typography>
            </Box>
        );
    }

    if (state.error && !Object.keys(state.asignaciones).length && state.clientesKickboxing.length === 0) {
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
                    <SportsKabaddiIcon fontSize="large" color="secondary" /> 
                    Gestión de Clases de Kickboxing
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" align="center">
                    Asigna practicantes a cada horario de entrenamiento de Kickboxing
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
                        flexDirection: 'column',
                        bgcolor: '#f5f0f7' // Fondo pastel violeta claro
                    }}>
                        <Typography variant="h6" sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1, 
                            pb: 1, 
                            borderBottom: '1px solid #ede7f6' 
                        }}>
                            <PersonIcon color="secondary" sx={{ mr: 1 }} /> 
                            Practicantes Disponibles
                        </Typography>

                        {state.clienteSeleccionado && (
                            <Alert severity="info" sx={{ mb: 1.5 }} icon={<CheckCircleIcon fontSize="small" />}>
                                <Typography variant="body2">
                                    <strong>{state.clienteSeleccionado.nombre}</strong> seleccionado
                                </Typography>
                                <Typography variant="caption">
                                    Nivel: {state.clienteSeleccionado.nivel}
                                </Typography>
                            </Alert>
                        )}

                        <Box sx={{ 
                            flexGrow: 1, 
                            overflowY: 'auto', 
                            maxHeight: 'calc(100vh - 350px)'
                        }}>
                            {state.clientesKickboxing.length > 0 ? (
                                <List dense sx={{ pt: 0 }}>
                                    {state.clientesKickboxing.map(cliente => (
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
                                        No hay practicantes disponibles
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Botones de acción */}
                        <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="secondary"
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
                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#f5f0f7' }}>
                        {/* Tabs de días */}
                        <Box sx={{ bgcolor: '#ede7f6', borderBottom: '1px solid #d1c4e9' }}>
                            <Tabs
                                value={state.diaSeleccionado}
                                onChange={handleDiaChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                textColor="secondary"
                                indicatorColor="secondary"
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
                                    <SeccionHorarioKickboxing
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

export default kickboxing;