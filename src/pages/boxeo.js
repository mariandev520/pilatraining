import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Typography, Paper, Box, Grid, Avatar,
    Chip, Card, CardContent, CircularProgress, Alert,
    Divider, IconButton, Button, List, ListItem, ListItemAvatar,
    ListItemText, Tab, Tabs, Snackbar, alpha, Tooltip, ListItemSecondaryAction
} from '@mui/material';
import {
    Person as PersonIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    FitnessCenter as FitnessCenterIcon, // Icono representativo para boxeo
    CheckCircle as CheckCircleIcon,
    ArrowRightAlt as ArrowRightAltIcon,
    Today as TodayIcon,
    ErrorOutline as ErrorOutlineIcon,
    Info as InfoIcon,
    Clear as ClearIcon,
    AddCircleOutline as AddCircleOutlineIcon, // Para agregar cliente
    Group as GroupIcon // Para la lista de clientes
} from '@mui/icons-material';

// Constantes
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORARIOS = ['8:00', '9:30', '11:00', '16:00', '17:30', '19:00']; // Ajusta según necesidad
const ACTIVIDAD_KEY = 'boxeo'; // Palabra clave para filtrar clientes y API

// Componente para cliente en la lista lateral (reutilizado)
const ClienteItem = ({ cliente, seleccionado, onClick }) => {
    return (
        <ListItem
            button
            onClick={() => onClick(cliente)}
            selected={seleccionado}
            sx={{
                mb: 1, borderRadius: 1,
                border: `1px solid ${seleccionado ? cliente.color || '#ff9800' : 'transparent'}`, // Color naranja para boxeo
                bgcolor: seleccionado ? alpha(cliente.color || '#ff9800', 0.1) : 'transparent',
                '&:hover': { bgcolor: alpha(cliente.color || '#ff9800', 0.15) }
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: cliente.color || '#ff9800', width: 36, height: 36 }}><PersonIcon fontSize='small' /></Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={<Typography noWrap variant="body2" fontWeight={seleccionado ? 'bold' : 'normal'}>{cliente.nombre}</Typography>}
                secondary={`Clases: ${cliente.clasesPendientes ?? 'N/A'}`} // Mostrar N/A si no hay dato
                secondaryTypographyProps={{ variant: 'caption' }}
            />
            {seleccionado && (
                <ArrowRightAltIcon sx={{ color: 'warning.main' }}/> // Color naranja
            )}
        </ListItem>
    );
};

// Sección de horario adaptada para lista de clientes
const SeccionHorarioboxeo = ({
    horario,
    diaSeleccionado,
    clientesAsignados = [], // Array de clientes para este horario
    clienteSeleccionado,
    onAsignarCliente,
    onRemoveCliente
}) => {
    const diaHorarioKey = `${diaSeleccionado}-${horario}`;

    return (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'hidden' }}>
            <Box
                sx={{
                    bgcolor: 'warning.light', // Color naranja
                    color: 'warning.contrastText',
                    px: 2, py: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold">{horario}</Typography>
                {/* Botón para agregar cliente si hay uno seleccionado */}
                {clienteSeleccionado && (
                    <Tooltip title={`Asignar a ${clienteSeleccionado.nombre} a las ${horario}`}>
                        <Button
                            variant="contained"
                            size="small"
                            color="warning" // Usar el color del tema para consistencia
                            sx={{ bgcolor: 'warning.dark', '&:hover': { bgcolor: 'warning.main' }, color: '#fff' }}
                            startIcon={<AddCircleOutlineIcon />}
                            onClick={() => onAsignarCliente(diaHorarioKey)}
                        >
                            Asignar
                        </Button>
                    </Tooltip>
                )}
            </Box>

            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                {clientesAsignados.length > 0 ? (
                    <List dense sx={{pt: 0}}>
                        {clientesAsignados.map((cliente, index) => (
                            <ListItem key={cliente.id || index} divider>
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            width: 32, height: 32,
                                            bgcolor: cliente.color || '#ff9800',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                     {cliente.nombre?.split(' ').map(n=>n[0]).join('')}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<Typography variant="body2" noWrap>{cliente.nombre}</Typography>}
                                    secondary={<Typography variant="caption" color="text.secondary" noWrap>DNI: {cliente.dni || 'N/A'}</Typography>}
                                />
                                <ListItemSecondaryAction>
                                    <Tooltip title={`Quitar a ${cliente.nombre}`}>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                 if (window.confirm(`¿Quitar a ${cliente.nombre} de ${diaSeleccionado} ${horario}?`)) {
                                                     onRemoveCliente(diaHorarioKey, cliente.id);
                                                 }
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 3, px: 2 }}>
                         <GroupIcon sx={{ fontSize: 30, color: 'grey.400', mb: 1 }}/>
                        <Typography variant="body2" color="text.secondary">
                            No hay clientes asignados en este horario.
                        </Typography>
                        {clienteSeleccionado && (
                             <Typography variant="caption" color="text.secondary" sx={{mt: 0.5}}>
                                Presiona 'Asignar' arriba para agregar a {clienteSeleccionado.nombre}.
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

// Componente principal de boxeo
const boxeo = () => {
    const [clientes, setClientes] = useState([]); // Todos los clientes
    const [clientesboxeo, setClientesboxeo] = useState([]); // Clientes filtrados para boxeo
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [asignaciones, setAsignaciones] = useState({}); // Estructura: { "Dia-Horario": [cliente1, cliente2] }
    const [loading, setLoading] = useState(true);
    const [loadingGuardado, setLoadingGuardado] = useState(false);
    const [error, setError] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
    const [isModificado, setIsModificado] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const API_ENDPOINT = `/api/${ACTIVIDAD_KEY}`; // Endpoint dinámico

    // Función para generar colores (mejorada para más variedad)
    const getRandomColor = useCallback((index) => {
        const colors = [
            '#ff9800', '#fb8c00', '#f57c00', '#ef6c00', '#e65100', // Naranjas
            '#ffb74d', '#ffa726', '#ffcc80', '#ffe0b2',
            '#4caf50', '#66bb6a', '#81c784', // Verdes (alternativa)
            '#2196f3', '#64b5f6', '#90caf9' // Azules (alternativa)
        ];
        return colors[index % colors.length];
    }, []);

    // Carga Inicial de Clientes y Asignaciones
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar Clientes
                const respClientes = await fetch('/api/clientes');
                if (!respClientes.ok) throw new Error('Error al cargar clientes');
                const dataClientes = await respClientes.json();
                setClientes(dataClientes);

                // Filtrar clientes para boxeo
                const clientesFiltrados = dataClientes.filter(c =>
                    c.actividades?.some(act =>
                        act.nombre.toLowerCase().includes(ACTIVIDAD_KEY)
                        // Podrías añadir más keywords si es necesario:
                        // || act.nombre.toLowerCase().includes('entrenamiento boxeo')
                    )
                );

                const clientesFormateados = clientesFiltrados.map((cliente, index) => ({
                    id: cliente._id || `cliente-${index}`, // Usar _id si existe
                    dni: cliente.dni,
                    nombre: cliente.nombre,
                    color: getRandomColor(index),
                    clasesPendientes: cliente.clasesPendientesTotales // Asegúrate que este campo exista o ajusta
                }));
                setClientesboxeo(clientesFormateados);

                // Cargar Asignaciones
                await cargarAsignaciones();

            } catch (err) {
                console.error('Error cargando datos iniciales:', err);
                setError(`Error al cargar datos: ${err.message}. Intente recargar.`);
                setAsignaciones({}); // Resetear asignaciones en caso de error
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, [API_ENDPOINT, getRandomColor]); // Dependencia API_ENDPOINT y getRandomColor

    // Cargar asignaciones desde la API
    const cargarAsignaciones = async () => {
         try {
            const respAsignaciones = await fetch(API_ENDPOINT);
            if (!respAsignaciones.ok) {
                 const errorText = await respAsignaciones.text();
                 let errorMessage = `Error ${respAsignaciones.status} al cargar asignaciones`;
                 try {
                     const errorData = JSON.parse(errorText);
                     errorMessage = errorData.message || errorMessage;
                 } catch (parseError) { /* Usar el mensaje genérico */ }
                 throw new Error(errorMessage);
             }
             const dataAsignaciones = await respAsignaciones.json();
             setAsignaciones(dataAsignaciones || {}); // Asignar datos o objeto vacío
             setIsModificado(false); // Resetear estado modificado
             console.log(`Asignaciones de ${ACTIVIDAD_KEY} cargadas.`);

         } catch (err) {
             console.error(`Error cargando asignaciones de ${ACTIVIDAD_KEY}:`, err);
             // Mantenemos el error general, pero mostramos snackbar específico
             setSnackbar({ open: true, message: `Error cargando asignaciones: ${err.message}`, severity: 'error' });
             setAsignaciones({}); // Dejar vacío si hay error
             setIsModificado(false);
         }
     };

    // Seleccionar cliente de la lista
    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(prev => prev?.id === cliente.id ? null : cliente);
    };

    // Asignar cliente a un horario
    const handleAsignarCliente = (diaHorarioKey) => {
        if (!clienteSeleccionado) return;

        const [dia] = diaHorarioKey.split('-');
        const asignacionesActuales = asignaciones[diaHorarioKey] || [];

        // 1. Verificar si ya está en este horario específico
        if (asignacionesActuales.some(c => c.id === clienteSeleccionado.id)) {
            setSnackbar({ open: true, message: `${clienteSeleccionado.nombre} ya está asignado a este horario.`, severity: 'warning' });
            return;
        }

        // 2. Verificar si ya está asignado en OTRO horario del MISMO día
        const estaAsignadoEnDia = Object.entries(asignaciones).some(
             ([key, clientesEnSlot]) =>
                 key.startsWith(`${dia}-`) && // Mismo día
                 key !== diaHorarioKey &&      // Diferente horario
                 clientesEnSlot.some(c => c.id === clienteSeleccionado.id) // Contiene al cliente
         );

         if (estaAsignadoEnDia) {
            if (!window.confirm(`${clienteSeleccionado.nombre} ya tiene otra clase asignada el ${dia}. ¿Asignar igualmente?`)) {
                return; // No asignar si el usuario cancela
            }
             // Si el usuario confirma, continuamos (podría mostrarse un warning más leve después)
             setSnackbar({ open: true, message: `${clienteSeleccionado.nombre} tiene otra clase este día.`, severity: 'info' });
         }

        // 3. Verificar clases pendientes (opcional, como en el original)
        if (!clienteSeleccionado.clasesPendientes || clienteSeleccionado.clasesPendientes <= 0) {
             if (!window.confirm(`${clienteSeleccionado.nombre} no tiene clases pendientes (${clienteSeleccionado.clasesPendientes ?? 0}). ¿Asignar igual?`)) return;
        }

        // Proceder con la asignación
        const nuevasAsignaciones = [...asignacionesActuales, clienteSeleccionado];

        setAsignaciones(prev => ({
            ...prev,
            [diaHorarioKey]: nuevasAsignaciones
        }));

        setClienteSeleccionado(null); // Deseleccionar cliente después de asignar
        setIsModificado(true);
        setSnackbar({ open: true, message: `${clienteSeleccionado.nombre} asignado a ${diaHorarioKey}.`, severity: 'success' });
    };

    // Eliminar cliente de un horario
    const handleRemoveCliente = (diaHorarioKey, clienteId) => {
        const asignacionesActuales = asignaciones[diaHorarioKey] || [];
        const nuevasAsignaciones = asignacionesActuales.filter(c => c.id !== clienteId);

        setAsignaciones(prev => {
            const newState = { ...prev };
            if (nuevasAsignaciones.length > 0) {
                newState[diaHorarioKey] = nuevasAsignaciones;
            } else {
                // Si el array queda vacío, eliminamos la clave del objeto
                delete newState[diaHorarioKey];
            }
            return newState;
        });

        setIsModificado(true);
        setSnackbar({ open: true, message: `Cliente eliminado de ${diaHorarioKey}.`, severity: 'success' });
    };

     // Limpiar todas las asignaciones del día seleccionado
    const limpiarAsignacionesDia = () => {
        const asignacionesDelDia = Object.keys(asignaciones).filter(key => key.startsWith(`${diaSeleccionado}-`));

        if (asignacionesDelDia.length === 0) {
            setSnackbar({ open: true, message: `No hay asignaciones para limpiar el ${diaSeleccionado}.`, severity: 'info' });
            return;
        }

        if (window.confirm(`¿Borrar todas las ${asignacionesDelDia.length} asignaciones del ${diaSeleccionado}?`)) {
            setAsignaciones(prev => {
                const nuevasAsignaciones = { ...prev };
                asignacionesDelDia.forEach(key => {
                    delete nuevasAsignaciones[key];
                });
                return nuevasAsignaciones;
            });
            setIsModificado(true);
            setSnackbar({
                open: true,
                message: `Todas las asignaciones del ${diaSeleccionado} han sido eliminadas`,
                severity: 'info'
            });
        }
    };

    // Cambiar día seleccionado
    const handleDiaChange = (event, newValue) => {
         if (isModificado) {
            const confirmar = window.confirm("Hay cambios sin guardar. ¿Descartar cambios y cambiar de día?");
             if (!confirmar) {
                 return; // No cambiar de día si el usuario cancela
             }
             // Si confirma, resetear estado modificado y continuar
             setIsModificado(false);
         }
         setDiaSeleccionado(newValue);
         setClienteSeleccionado(null); // Deseleccionar cliente al cambiar de día
     };

    // Guardar Asignaciones en la API
    const guardarAsignaciones = async () => {
        console.log(`Intentando guardar asignaciones de ${ACTIVIDAD_KEY}...`);
        setLoadingGuardado(true);
        setError(null); // Limpiar errores previos
        setSnackbar({ open: false, message:'', severity: 'info'}); // Ocultar snackbar anterior

        try {
            // console.log("Guardando Asignaciones - Payload:", JSON.stringify({ asignaciones: asignaciones }, null, 2));
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asignaciones: asignaciones }), // Enviar el estado actual
            });

            console.log(`[guardarAsignaciones ${ACTIVIDAD_KEY}] Respuesta API:`, response.status, response.statusText);

            if (!response.ok) {
                let errorMsg = `Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                    console.error("Error API (JSON):", errorData);
                } catch (jsonError) {
                     try {
                        const textError = await response.text();
                        console.error("Error API (No JSON - Texto):", textError);
                        errorMsg = textError || `Error del servidor (${response.status}).`;
                    } catch (textParseError) {
                        console.error("Error al leer texto de la respuesta:", textParseError);
                         errorMsg = `Error del servidor (${response.status}). Respuesta no legible.`;
                    }
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            console.log(`[guardarAsignaciones ${ACTIVIDAD_KEY}] Respuesta Éxito:`, result);
            setIsModificado(false); // Marcar como no modificado después de guardar
            setSnackbar({ open: true, message: result.message || 'Asignaciones guardadas correctamente.', severity: 'success' });

        } catch (err) {
            console.error(`Error guardando asignaciones (${ACTIVIDAD_KEY}) catch:`, err);
            // Mantenemos el error general para posible Alert, pero mostramos snackbar específico
            setError(`Error al guardar: ${err.message}`); // Guardar el error para mostrarlo si es necesario
            setSnackbar({ open: true, message: `Error al guardar: ${err.message}`, severity: 'error' });
        } finally {
            setLoadingGuardado(false);
        }
    };

    // Cerrar snackbar
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    // ----- Renderizado -----
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60} color="warning" /><Typography sx={{ml:2}}>Cargando datos de boxeo...</Typography></Box>;
    }

    // Error Crítico (no se cargaron ni clientes ni asignaciones iniciales)
     if (error && !Object.keys(asignaciones).length && clientesboxeo.length === 0) {
         return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Recargar Página</Button>}>
                    {error}
                </Alert>
            </Container>
         );
     }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            {/* Encabezado */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontWeight: 'bold' }}>
                    <FitnessCenterIcon fontSize="large" color="warning"/> Gestión de Clases boxeo
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" align="center">
                    Asigna clientes a los horarios de entrenamiento boxeo para cada día.
                </Typography>
            </Box>

            {/* Mostrar Error no crítico (si ocurrió después de cargar algo) */}
            {error && (Object.keys(asignaciones).length > 0 || clientesboxeo.length > 0) && (
                 <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
                     {error} (Puede que algunos datos no se hayan cargado o guardado correctamente)
                 </Alert>
            )}

            <Grid container spacing={3}>
                {/* Sección Lateral (Clientes boxeo) */}
                <Grid item xs={12} md={3}>
                     <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, height: '100%', position: 'sticky', top: 20, display: 'flex', flexDirection: 'column' }}>
                         <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                             <PersonIcon color="warning" sx={{ mr: 1 }} /> Clientes boxeo
                         </Typography>

                         {clienteSeleccionado && (
                             <Alert severity="success" sx={{ mb: 1.5, fontSize: '0.8rem' }} icon={<CheckCircleIcon fontSize='small'/>}>
                                 Seleccionado: <strong>{clienteSeleccionado.nombre}</strong>.<br/>
                                 <Typography variant='caption'>Haz clic en 'Asignar' en el horario deseado.</Typography>
                             </Alert>
                         )}

                         <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 350px)' }}> {/* Ajustar altura max */}
                             {clientesboxeo.length > 0 ? (
                                 <List dense sx={{pt:0}}>
                                     {clientesboxeo.map(cliente => (
                                         <ClienteItem
                                             key={cliente.id}
                                             cliente={cliente}
                                             seleccionado={clienteSeleccionado?.id === cliente.id}
                                             onClick={seleccionarCliente}
                                         />
                                     ))}
                                 </List>
                             ) : (
                                 <Box sx={{ textAlign: 'center', py: 4 }}>
                                     <Typography variant="body2" color="text.secondary">No hay clientes inscritos en boxeo.</Typography>
                                 </Box>
                             )}
                         </Box>

                         {/* Botones de Acción */}
                         <Box sx={{ mt: 'auto', pt: 2 }}>
                             <Button
                                 fullWidth
                                 variant="contained"
                                 color="warning" // Naranja
                                 startIcon={loadingGuardado ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                 onClick={guardarAsignaciones}
                                 disabled={!isModificado || loadingGuardado}
                             >
                                 {loadingGuardado ? 'Guardando...' : 'Guardar Cambios'}
                             </Button>

                             {isModificado && !loadingGuardado && (
                                 <Typography variant="caption" color="error.main" sx={{display: 'block', textAlign: 'center', mt: 0.5}}>
                                     Cambios pendientes de guardar
                                 </Typography>
                             )}
                              <Button
                                 fullWidth
                                 variant="outlined"
                                 color="error"
                                 startIcon={<ClearIcon />}
                                 onClick={limpiarAsignacionesDia}
                                 sx={{ mt: 1.5 }} // Más espacio
                                 disabled={!Object.keys(asignaciones).some(key => key.startsWith(`${diaSeleccionado}-`))}
                             >
                                 Limpiar {diaSeleccionado}
                             </Button>
                         </Box>
                     </Paper>
                </Grid>

                 {/* Horarios y Asignaciones */}
                <Grid item xs={12} md={9}>
                    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        {/* Tabs para los Días */}
                         <Box sx={{ bgcolor: 'grey.100', borderBottom: '1px solid #e0e0e0' }}>
                             <Tabs
                                 value={diaSeleccionado}
                                 onChange={handleDiaChange}
                                 variant="scrollable"
                                 scrollButtons="auto"
                                 allowScrollButtonsMobile
                                 textColor="warning" // Naranja
                                 indicatorColor="warning" // Naranja
                             >
                                 {DIAS_SEMANA.map(dia => (
                                     <Tab
                                         key={dia}
                                         label={dia}
                                         value={dia}
                                         sx={{
                                             fontWeight: diaSeleccionado === dia ? 'bold' : 'normal',
                                             px: {xs: 1.5, sm: 2}
                                         }}
                                     />
                                 ))}
                             </Tabs>
                         </Box>

                        {/* Contenido del Día Seleccionado */}
                        <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                             {/* Info de Cliente Seleccionado (si aplica) */}
                             {clienteSeleccionado && (
                                <Box
                                    sx={{
                                        display: 'flex', alignItems: 'center', p: 1.5, mb: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(clienteSeleccionado.color || '#ff9800', 0.1),
                                        border: `1px solid ${alpha(clienteSeleccionado.color || '#ff9800', 0.3)}`
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: clienteSeleccionado.color || '#ff9800', mr: 1.5, width: 32, height: 32 }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box sx={{flexGrow: 1}}>
                                        <Typography variant="body2" fontWeight="medium">
                                            {clienteSeleccionado.nombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Listo para asignar. Presiona 'Asignar' en el horario deseado.
                                        </Typography>
                                    </Box>
                                    <Button
                                        sx={{ ml: 'auto', flexShrink: 0 }}
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setClienteSeleccionado(null)}
                                    >
                                        Cancelar Selección
                                    </Button>
                                </Box>
                             )}

                            {/* Renderizar Secciones de Horario */}
                            {HORARIOS.map(horario => {
                                const diaHorarioKey = `${diaSeleccionado}-${horario}`;
                                return (
                                    <SeccionHorarioboxeo
                                        key={diaHorarioKey}
                                        horario={horario}
                                        diaSeleccionado={diaSeleccionado}
                                        clientesAsignados={asignaciones[diaHorarioKey] || []}
                                        clienteSeleccionado={clienteSeleccionado}
                                        onAsignarCliente={handleAsignarCliente}
                                        onRemoveCliente={handleRemoveCliente}
                                    />
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={snackbar.severity === 'error' ? 8000 : 4000} // Más tiempo para errores
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                 <Alert
                     onClose={handleCloseSnackbar}
                     severity={snackbar.severity}
                     variant="filled"
                     sx={{ width: '100%', boxShadow: 6 }}
                     iconMapping={{ // Iconos personalizados si quieres
                         success: <CheckCircleIcon fontSize="inherit" />,
                         error: <ErrorOutlineIcon fontSize="inherit" />,
                         warning: <ErrorOutlineIcon fontSize="inherit" />, // Mismo para warning
                         info: <InfoIcon fontSize="inherit" />
                     }}
                 >
                     {snackbar.message}
                 </Alert>
            </Snackbar>
        </Container>
    );
};

export default boxeo;