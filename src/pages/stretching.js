import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Paper, Box, Grid, Avatar,
    Chip, Card, CardContent, CircularProgress, Alert,
    Divider, IconButton, Button, List, ListItem, ListItemAvatar,
    ListItemText, Tab, Tabs, Snackbar, alpha, Tooltip
} from '@mui/material';
import {
    Person as PersonIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    FitnessCenter as FitnessCenterIcon,
    CheckCircle as CheckCircleIcon,
    ArrowRightAlt as ArrowRightAltIcon,
    Today as TodayIcon,
    ErrorOutline as ErrorOutlineIcon,
    Info as InfoIcon,
    Clear as ClearIcon,
    AccessibilityNew as AccessibilityNewIcon
} from '@mui/icons-material';

// Constantes
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORARIOS = ['8:00', '9:30', '11:00', '16:00', '17:30', '19:00'];
const TOTAL_ESPACIOS = 8; // Definimos 12 espacios para stretching

// Componente EspacioStretching
const EspacioStretching = ({ numero, cliente, onClickEspacio, onRemoveCliente }) => {
    return (
        <Card
            elevation={3}
            sx={{
                height: '150px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                position: 'relative',
                overflow: 'visible',
                border: cliente ? `2px solid ${cliente.color || '#00bcd4'}` : '2px dashed #e0e0e0',
                bgcolor: cliente ? alpha(cliente.color || '#00bcd4', 0.08) : '#f9f9f9',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    boxShadow: 6,
                    borderColor: cliente ? cliente.color : '#bdbdbd',
                }
            }}
        >
            <Box
                sx={{
                    position: 'absolute', top: -15, left: 15,
                    backgroundColor: cliente ? (cliente.color || '#00bcd4') : '#9e9e9e',
                    color: '#fff', width: 30, height: 30,
                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    fontWeight: 'bold', zIndex: 1
                }}
            >
                {numero}
            </Box>

            <CardContent sx={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '25px 10px 5px',
                cursor: 'pointer'
            }} onClick={onClickEspacio}>
                {cliente ? (
                    <>
                        <Avatar
                            sx={{
                                width: 44, height: 44,
                                bgcolor: cliente.color || '#00bcd4', mb: 0.5,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)', fontSize: '1rem'
                            }}
                        >
                            {cliente.nombre?.split(' ').map(n=>n[0]).join('')}
                        </Avatar>
                        <Typography variant="body2" fontWeight="bold" align="center" sx={{ mb: 0, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cliente.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" align="center" sx={{ display:'block', width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            DNI: {cliente.dni}
                        </Typography>
                        <Chip
                           label={`Clases: ${cliente.clasesPendientes ?? 0}`}
                           size="small"
                           sx={{ mt: 1, bgcolor: alpha(cliente.color || '#00bcd4', 0.2), height: 20, fontSize: '0.7rem' }}
                         />
                    </>
                ) : (
                    <>
                        <AccessibilityNewIcon sx={{ fontSize: 35, color: '#bdbdbd', mb: 1 }} />
                        <Typography variant="body2" align="center" color="text.secondary">
                            Espacio Libre
                        </Typography>
                        <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 0.5 }}>
                            Clic para asignar
                        </Typography>
                    </>
                )}
            </CardContent>

            {cliente && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1 }}>
                    <Tooltip title={`Quitar a ${cliente.nombre}`}>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`¿Quitar a ${cliente.nombre} del espacio ${numero}?`)) {
                                    onRemoveCliente();
                                }
                            }}
                            sx={{ bgcolor: 'rgba(244, 67, 54, 0.1)', '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.2)' } }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
        </Card>
    );
};

// Componente para cliente en la lista
const ClienteItem = ({ cliente, seleccionado, onClick }) => {
    return (
        <ListItem
            button
            onClick={() => onClick(cliente)}
            selected={seleccionado}
            sx={{
                mb: 1, borderRadius: 1,
                border: `1px solid ${seleccionado ? cliente.color || '#00bcd4' : 'transparent'}`,
                bgcolor: seleccionado ? alpha(cliente.color || '#00bcd4', 0.1) : 'transparent',
                '&:hover': { bgcolor: alpha(cliente.color || '#00bcd4', 0.15) }
            }}
        >
            <ListItemAvatar>
                <Avatar sx={{ bgcolor: cliente.color || '#00bcd4', width: 36, height: 36 }}><PersonIcon fontSize='small' /></Avatar>
            </ListItemAvatar>
            <ListItemText
                primary={<Typography noWrap variant="body2" fontWeight={seleccionado ? 'bold' : 'normal'}>{cliente.nombre}</Typography>}
                secondary={`Clases: ${cliente.clasesPendientes ?? 0}`}
                secondaryTypographyProps={{ variant: 'caption' }}
            />
            {seleccionado && (
                <ArrowRightAltIcon color="primary" />
            )}
        </ListItem>
    );
};

// Sección de horario
const SeccionHorario = ({ horario, diaSeleccionado, espaciosAsignados, onEspacioClick, onRemoveCliente }) => {
    return (
        <Box sx={{ mb: 3 }}>
            <Box
                sx={{
                    bgcolor: 'info.light',
                    color: 'info.contrastText',
                    px: 2, py: 0.8,
                    borderRadius: '8px 8px 0 0',
                    display: 'flex', alignItems: 'center'
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold">{horario}</Typography>
            </Box>

            <Grid container spacing={2} sx={{ mt: 0, p: 1.5, bgcolor: '#fdfdfd', borderRadius: '0 0 8px 8px', border: '1px solid', borderColor: 'grey.200', borderTop: 'none'}}>
                {[...Array(TOTAL_ESPACIOS)].map((_, index) => {
                    const numEspacio = index + 1;
                    const espacioClave = `${diaSeleccionado}-${horario}-Espacio ${numEspacio}`;
                    return (
                        <Grid item xs={6} sm={4} md={2} lg={2} key={numEspacio} sx={{ mb: 2 }}>
                            <EspacioStretching
                                numero={numEspacio}
                                cliente={espaciosAsignados[espacioClave]}
                                onClickEspacio={() => onEspacioClick(espacioClave)}
                                onRemoveCliente={() => onRemoveCliente(espacioClave)}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

// Componente principal de Stretching
const Stretching = () => {
    const [clientes, setClientes] = useState([]);
    const [clientesStretching, setClientesStretching] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [espaciosAsignados, setEspaciosAsignados] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingGuardado, setLoadingGuardado] = useState(false);
    const [error, setError] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState('Lunes');
    const [isModificado, setIsModificado] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Función para generar colores
    const getRandomColor = (index) => {
        const colors = ['#00bcd4', '#0097a7', '#00838f', '#006064', '#80deea', '#4dd0e1', '#26c6da', '#00acc1', '#0097a7', '#00838f', '#40c4ff', '#00b0ff'];
        return colors[index % colors.length];
    };

    // Carga Inicial
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar Clientes
                const respClientes = await fetch('/api/clientes');
                if (!respClientes.ok) throw new Error('Error al cargar clientes');
                const dataClientes = await respClientes.json();
                const clientesConStretching = dataClientes.filter(c => 
                    c.actividades?.some(act => 
                        act.nombre.toLowerCase().includes('stretch') || 
                        act.nombre.toLowerCase().includes('estiramiento') ||
                        act.nombre.toLowerCase().includes('flexibilidad')
                    )
                );
                const clientesFormateados = clientesConStretching.map((cliente, index) => ({
                    id: cliente._id || `cliente-${index}`, dni: cliente.dni, nombre: cliente.nombre,
                    actividades: cliente.actividades, color: getRandomColor(index),
                    clasesPendientes: cliente.clasesPendientesTotales ?? 0
                }));
                setClientes(dataClientes);
                setClientesStretching(clientesFormateados);

                // Cargar Asignaciones
                await cargarAsignaciones();

            } catch (err) {
                console.error('Error cargando datos iniciales:', err);
                setError(`Error al cargar datos: ${err.message}. Intente recargar.`);
                setEspaciosAsignados({});
            } finally {
                setLoading(false);
            }
        };
        cargarDatos();
    }, []);

    const cargarAsignaciones = async () => {
      try {
          const apiUrl = '/api/stretching'; // Ruta de la API para stretching
          const respAsignaciones = await fetch(apiUrl);

          if (!respAsignaciones.ok) {
              // Si la respuesta no es OK, intentamos obtener detalles del error
              // pero usamos un objeto vacío como fallback en caso de error al parsear
              const errorText = await respAsignaciones.text();
              let errorMessage = `Error ${respAsignaciones.status} al cargar asignaciones`;
              
              try {
                  // Intentamos parsear el texto como JSON
                  const errorData = JSON.parse(errorText);
                  if (errorData && errorData.message) {
                      errorMessage = errorData.message;
                  }
              } catch (parseError) {
                  // Si falla el parsing, usamos el texto original o el mensaje de error genérico
                  console.error('Error parseando respuesta de error:', parseError);
              }
              
              throw new Error(errorMessage);
          }

          // Si la respuesta es OK, procesamos los datos
          const dataAsignaciones = await respAsignaciones.json();
          setEspaciosAsignados(dataAsignaciones || {}); // Asignar datos o objeto vacío
          setIsModificado(false);
          console.log("Asignaciones de stretching cargadas desde API.");

      } catch (err) {
          console.error('Error cargando asignaciones de stretching desde API:', err);
          setError(`Error al cargar asignaciones: ${err.message}`);
          setSnackbar({ open: true, message: `Error al cargar asignaciones: ${err.message}`, severity: 'error' });
          setEspaciosAsignados({}); // Dejar vacío si hay error
          setIsModificado(false); // No hay cambios pendientes si falló la carga
      }
    };

    // Seleccionar cliente
    const seleccionarCliente = (cliente) => {
        setClienteSeleccionado(prev => prev?.id === cliente.id ? null : cliente);
    };

    // Manejar clic en espacio
    const handleEspacioClick = (espacioClave) => {
        if (clienteSeleccionado) {
            const [dia, horario] = espacioClave.split('-');
            const estaEnEsteHorario = Object.entries(espaciosAsignados).some(
                ([key, cli]) => key.startsWith(`${dia}-${horario}-`) && cli.id === clienteSeleccionado.id
            );

            if (estaEnEsteHorario) {
                setSnackbar({ open: true, message: `${clienteSeleccionado.nombre} ya tiene un espacio a las ${horario}`, severity: 'warning' });
                return;
            }
            
            // Verificar si el cliente ya está asignado en otro horario el mismo día
            const estaAsignadoEnDia = Object.entries(espaciosAsignados).some(
                ([key, cliente]) => 
                    key.split('-')[0] === diaSeleccionado && 
                    cliente.id === clienteSeleccionado.id
            );
            
            if (estaAsignadoEnDia) {
                setSnackbar({
                    open: true,
                    message: 'Este cliente ya tiene un espacio asignado en este día',
                    severity: 'warning'
                });
                return;
            }

            if (clienteSeleccionado.clasesPendientes <= 0) {
                 if (!window.confirm(`${clienteSeleccionado.nombre} no tiene clases pendientes. ¿Asignar igual?`)) return;
            }

            console.log(`Asignando cliente ${clienteSeleccionado.id} a espacio ${espacioClave}`);
            setEspaciosAsignados(prev => ({ ...prev, [espacioClave]: clienteSeleccionado }));
            setClienteSeleccionado(null);
            setIsModificado(true);
        } else {
             const clienteEnEspacio = espaciosAsignados[espacioClave];
             if(clienteEnEspacio) setSnackbar({ open: true, message: `Espacio ocupado por: ${clienteEnEspacio.nombre}`, severity: 'info' });
             console.log("Clic en espacio sin cliente seleccionado:", espacioClave);
        }
    };

    // Eliminar cliente de espacio
    const handleRemoveCliente = (espacioClave) => {
        setEspaciosAsignados(prev => {
            const nuevasAsignaciones = { ...prev };
            delete nuevasAsignaciones[espacioClave];
            return nuevasAsignaciones;
        });
        setIsModificado(true);
        setSnackbar({
            open: true,
            message: `Cliente eliminado del espacio`,
            severity: 'success'
        });
    };

    // Limpiar todas las asignaciones del día
    const limpiarAsignacionesDia = () => {
        if (window.confirm(`¿Borrar todas las asignaciones del ${diaSeleccionado}?`)) {
            const nuevasAsignaciones = { ...espaciosAsignados };
            
            Object.keys(nuevasAsignaciones).forEach(key => {
                if (key.startsWith(`${diaSeleccionado}-`)) {
                    delete nuevasAsignaciones[key];
                }
            });
            
            setEspaciosAsignados(nuevasAsignaciones);
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
         if (isModificado && !window.confirm("Hay cambios sin guardar. ¿Descartar cambios y cambiar de día?")) {
            return;
         }
         setDiaSeleccionado(newValue);
         setIsModificado(false);
         setClienteSeleccionado(null);
    };

    // Guardar Asignaciones
    const guardarAsignaciones = async () => {
        console.log("Intentando guardar asignaciones de stretching...");
        setLoadingGuardado(true);
        setError(null);
        setSnackbar({ open: false, message:'', severity: 'info'});

        try {
            console.log("Guardando Asignaciones - Payload:", JSON.stringify({ asignaciones: espaciosAsignados }, null, 2));
            const response = await fetch('/api/stretching', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ asignaciones: espaciosAsignados }),
            });

            console.log("[guardarAsignaciones] Respuesta API recibida:", response.status, response.statusText);

            if (!response.ok) {
                let errorMsg = `Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorData.error || errorMsg;
                    console.error("Error API (JSON):", errorData);
                } catch (jsonError) {
                    const textError = await response.text();
                    console.error("Error API (No JSON - Texto):", textError);
                    errorMsg = `Error del servidor (${response.status}). Revisa los logs.`;
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            console.log("[guardarAsignaciones] Respuesta Éxito:", result);
            setIsModificado(false);
            setSnackbar({ open: true, message: result.message || 'Asignaciones guardadas correctamente en el servidor', severity: 'success' });

        } catch (err) {
            console.error('Error guardando asignaciones catch:', err);
            setSnackbar({ open: true, message: `Error al guardar en servidor: ${err.message}`, severity: 'error' });
        } finally {
            setLoadingGuardado(false);
        }
    };

    // Cerrar snackbar
    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };

    // Renderizado
    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60} /><Typography sx={{ml:2}}>Cargando datos...</Typography></Box>;
    }

    if (error && !Object.keys(espaciosAsignados).length && !clientesStretching.length) {
         return <Container maxWidth="lg" sx={{ mt: 4 }}><Alert severity="error" action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Recargar</Button>}>{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
            {/* Encabezado */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontWeight: 'bold' }}>
                    <AccessibilityNewIcon fontSize="large" color="info"/> Distribución de Espacios Stretching
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" align="center">
                    Organiza las asignaciones de clientes a los espacios de stretching por día y horario.
                </Typography>
            </Box>

            {error && (Object.keys(espaciosAsignados).length > 0 || clientesStretching.length > 0) && (
                 <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>
            )}

            <Grid container spacing={3}>
                {/* Sección Lateral (Clientes) */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={2} sx={{ p: 1.5, borderRadius: 2, height: '100%', position: 'sticky', top: 20, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 1, pb: 1, borderBottom: '1px solid #eee' }}>
                            <PersonIcon color="info" sx={{ mr: 1 }} /> Clientes Stretching
                        </Typography>
                        
                        {clienteSeleccionado && ( 
                            <Alert severity="success" sx={{ mb: 1.5, fontSize: '0.8rem' }} icon={<CheckCircleIcon fontSize='small'/>}>
                                Seleccionado: <strong>{clienteSeleccionado.nombre}</strong>. Clic en 'Libre'.
                            </Alert> 
                        )}
                        
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                            {clientesStretching.length > 0 ? (
                                <List dense sx={{pt:0}}> 
                                    {clientesStretching.map(cliente => (
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
                                    <Typography variant="body2" color="text.secondary">No hay clientes de stretching.</Typography>
                                </Box>
                            )}
                        </Box>
                        
                        <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                color="info" 
                                startIcon={loadingGuardado ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
                                onClick={guardarAsignaciones} 
                                disabled={!isModificado || loadingGuardado}
                            >
                                {loadingGuardado ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                            
                            {isModificado && (
                                <Typography variant="caption" color="warning.main" sx={{display: 'block', textAlign: 'center', mt: 0.5}}>
                                    Cambios sin guardar
                                </Typography>
                            )}
                            
                            <Button 
                                fullWidth 
                                variant="outlined" 
                                color="error" 
                                startIcon={<ClearIcon />}
                                onClick={limpiarAsignacionesDia}
                                sx={{ mt: 2 }}
                                disabled={!Object.keys(espaciosAsignados).some(key => key.startsWith(`${diaSeleccionado}-`))}
                            >
                                Limpiar día
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Distribución de Espacios (Tabs y Horarios) */}
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
                                textColor="info" 
                                indicatorColor="info"
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
                            {clienteSeleccionado && (
                                <Box
                                    sx={{
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        p: 1.5, 
                                        mb: 2,
                                        borderRadius: 2, 
                                        bgcolor: alpha(clienteSeleccionado.color || '#00bcd4', 0.1),
                                        border: `1px solid ${alpha(clienteSeleccionado.color || '#00bcd4', 0.3)}`
                                    }}
                                >
                                    <Avatar sx={{ 
                                        bgcolor: clienteSeleccionado.color || '#00bcd4', 
                                        mr: 1.5, 
                                        width: 32, 
                                        height: 32 
                                    }}>
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box sx={{flexGrow: 1}}>
                                        <Typography variant="body2" fontWeight="medium">
                                            {clienteSeleccionado.nombre}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Selecciona un espacio libre para asignar
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
                            {HORARIOS.map(horario => (
                                <SeccionHorario
                                    key={horario}
                                    horario={horario}
                                    diaSeleccionado={diaSeleccionado}
                                    espaciosAsignados={espaciosAsignados}
                                    onEspacioClick={handleEspacioClick}
                                    onRemoveCliente={handleRemoveCliente}
                                />
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Snackbar para notificaciones */}
            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={snackbar.severity === 'error' ? null : 4000} 
                onClose={handleCloseSnackbar} 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    variant="filled" 
                    sx={{ width: '100%', boxShadow: 6 }} 
                    iconMapping={{ 
                        success: <CheckCircleIcon fontSize="inherit" />, 
                        error: <ErrorOutlineIcon fontSize="inherit" />, 
                        warning: <ErrorOutlineIcon fontSize="inherit" />, 
                        info: <InfoIcon fontSize="inherit" /> 
                    }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Stretching;