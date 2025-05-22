import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Container, Box, Typography, Button, Grid, Card, CardContent,
    CardHeader, Avatar, IconButton, Dialog, DialogActions, DialogContent,
    DialogTitle, Alert, Snackbar, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, TextField, Tooltip, Chip, Divider,
    // --- NUEVO: Para el tema claro ---
    createTheme, ThemeProvider, CssBaseline, alpha
} from "@mui/material";
import {
    PeopleAlt as PeopleAltIcon, Add as AddIcon, Save as SaveIcon, Close as CloseIcon,
    MonetizationOn as MonetizationOnIcon, ReceiptLong as ReceiptLongIcon, Delete as DeleteIcon,
    CreditScore as CreditScoreIcon
} from "@mui/icons-material";
import { styled } from "@mui/material/styles"; // Ya lo tenías

// --- TEMA CLARO ---
const lightTheme = createTheme({
    palette: {
        mode: 'light', // Modo claro
        primary: {
            main: '#15599a', // Azul principal (mantenemos el tuyo)
            light: '#2e82c7', // Un azul más claro
            contrastText: '#ffffff', // Texto blanco para botones primarios
        },
        secondary: {
            main: '#14A38B', // Verde acento (mantenemos el tuyo)
            contrastText: '#ffffff',
        },
        background: {
            default: '#f4f6f8', // Un gris muy claro para el fondo de la página
            paper: '#ffffff',    // Blanco para fondos de tarjetas/papel
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',  // Texto principal oscuro
            secondary: 'rgba(0, 0, 0, 0.6)', // Texto secundario gris
        },
        error: { main: '#d32f2f' },    // Rojo error estándar
        warning: { main: '#ffa000' },  // Naranja warning estándar
        info: { main: '#1976d2' },     // Azul info estándar
        success: { main: '#2e7d32' },  // Verde éxito estándar
        // Colores semánticos que definiste, adaptados:
        custom: {
            pending: '#F8C471', // Amarillo para pendiente
            pendingText: 'rgba(0, 0, 0, 0.87)', // Texto oscuro para pendiente
            paid: '#27AE60',   // Verde para pagado
            paidText: '#ffffff', // Texto blanco para pagado
            danger: '#e74c3c',  // Rojo peligro
            dangerText: '#ffffff',
        }
    },
    typography: {
        fontFamily: "Montserrat, sans-serif",
        h4: { fontWeight: 700 },
        subtitle1: { color: 'rgba(0, 0, 0, 0.6)' } // Ajustar si es necesario
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                elevation1: { boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'},
                elevation3: { boxShadow: '0 10px 20px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.1)' },
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    textTransform: 'none',
                    fontWeight: 600, // Un poco menos bold que antes
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 'bold',
                    backgroundColor: alpha('#000000', 0.03) // Un gris muy sutil para cabeceras
                }
            }
        }
    }
});
// --- FIN TEMA CLARO ---


// --- Componentes Estilizados Adaptados al Tema ---
const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 16,
    background: theme.palette.background.paper, // Usa el color de papel del tema
    color: theme.palette.text.primary,         // Usa el color de texto primario del tema
    boxShadow: theme.shadows[3],                // Sombra más estándar de MUI
    border: `1px solid ${theme.palette.divider}`, // Borde con color de divisor del tema
    overflow: "hidden",
}));

const StyledButton = styled(Button)(({ theme, color = "primary" }) => ({
    // Estilos base ya definidos en theme.components.MuiButton
    // Aquí se pueden añadir o sobrescribir cosas específicas si el color es primary
    ...(color === "primary" && {
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}`,
        transition: "all .2s",
        '&:hover': {
            background: theme.palette.primary.light,
            transform: "translateY(-2px) scale(1.03)",
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
        },
    }),
    // Podrías añadir otros colores si usas <StyledButton color="secondary"> etc.
}));

const StyledAvatar = styled(Avatar)(({ theme, bgcolor }) => ({ // bgcolor prop para color dinámico
    background: bgcolor || theme.palette.primary.main, // Fallback a primary si no se especifica
    color: theme.palette.getContrastText(bgcolor || theme.palette.primary.main),
    fontWeight: 700, // Ligeramente menos bold
    width: 56,
    height: 56,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    "& .MuiOutlinedInput-root": {
        borderRadius: 9,
        backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.common.black, 0.03) : alpha(theme.palette.common.white, 0.05), // Fondo sutil
        '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.light,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: '1.5px',
        },
    },
    "& .MuiInputLabel-root": {
        // Estilos para el label si es necesario
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: theme.palette.primary.main,
    }
}));

// --- Componente Principal ---
export default function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newProveedor, setNewProveedor] = useState({ nombre: "", contacto: "" });
    const [newGasto, setNewGasto] = useState({ proveedor: "", monto: "", descripcion: "", pagado: false });
    const [openGastoDialog, setOpenGastoDialog] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, msg: "", sev: "success" });

    // --- Fetch inicial ---
    useEffect(() => {
        fetchProveedores();
        fetchGastos();
    }, []);


     // --- Llamadas a API ---
  const fetchProveedores = async () => {
    try {
      const res = await fetch("/api/proveedores");
      if (res.ok) setProveedores(await res.json());
    } catch {}
  };

  const fetchGastos = async () => {
    try {
      const res = await fetch("/api/gastos");
      if (res.ok) setGastos(await res.json());
    } catch {}
  };

  // --- Acciones Proveedores ---
  const handleAddProveedor = async () => {
    if (!newProveedor.nombre) {
      setSnackbar({ open: true, msg: "Nombre obligatorio", sev: "error" });
      return;
    }
    try {
      const res = await fetch("/api/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProveedor),
      });
      if (res.ok) {
        setSnackbar({ open: true, msg: "Proveedor agregado", sev: "success" });
        setOpenDialog(false);
        setNewProveedor({ nombre: "", contacto: "" });
        fetchProveedores();
      }
    } catch {
      setSnackbar({ open: true, msg: "Error al agregar", sev: "error" });
    }
  };

  // --- Acciones Gastos ---
  const handleAddGasto = async () => {
    if (!newGasto.proveedor || !newGasto.monto) {
      setSnackbar({ open: true, msg: "Completa los campos requeridos", sev: "error" });
      return;
    }
    try {
      const res = await fetch("/api/gastos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGasto),
      });
      if (res.ok) {
        setSnackbar({ open: true, msg: "Gasto registrado", sev: "success" });
        setOpenGastoDialog(false);
        setNewGasto({ proveedor: "", monto: "", descripcion: "", pagado: false });
        fetchGastos();
      }
    } catch {
      setSnackbar({ open: true, msg: "Error al registrar gasto", sev: "error" });
    }
  };

  const handleDeleteGasto = async (id) => {
    try {
      const res = await fetch(`/api/gastos?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSnackbar({ open: true, msg: "Gasto eliminado", sev: "success" });
        fetchGastos();
      }
    } catch {
      setSnackbar({ open: true, msg: "Error al eliminar", sev: "error" });
    }
  };



    // --- Calculos (sin cambios) ---
    const totalPagado = gastos.filter(g => g.pagado).reduce((acc, g) => acc + Number(g.monto || 0), 0);
    const totalPendiente = gastos.filter(g => !g.pagado).reduce((acc, g) => acc + Number(g.monto || 0), 0);

    // --- Render ---
    return (
        <ThemeProvider theme={lightTheme}> {/* Aplicar el tema claro */}
            <CssBaseline /> {/* Normaliza estilos base */}
            <Container maxWidth="xl" sx={{ py: 4, fontFamily: "Montserrat, sans-serif", bgcolor: 'background.default', minHeight: "100vh" }}>
                {/* Header */}
                <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45 }}>
                    <StyledCard sx={{ mb: 4 }}>
                        <CardHeader
                            avatar={<StyledAvatar><PeopleAltIcon fontSize="large" /></StyledAvatar>} // Usará primary.main por defecto
                            title={<Typography variant="h4" fontWeight={700} color="text.primary">Proveedores</Typography>}
                            subheader={<Typography variant="subtitle1" color="text.secondary">Administrá los proveedores y gastos</Typography>}
                            action={
                                <StyledButton startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                                    Nuevo proveedor
                                </StyledButton>
                            }
                            sx={{ px: 3, pt: 2, pb: 1 }}
                        />
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={6} md={3}>
                                    <Chip
                                        icon={<MonetizationOnIcon />}
                                        label={`Total pagado: $${totalPagado.toFixed(2)}`} // toFixed para formato
                                        sx={{ bgcolor: lightTheme.palette.custom.paid, color: lightTheme.palette.custom.paidText, fontWeight: 600, fontSize: {xs: 13, sm:15}, p: {xs:1, sm:1.5} }}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Chip
                                        icon={<ReceiptLongIcon />}
                                        label={`Pendiente: $${totalPendiente.toFixed(2)}`}
                                        sx={{ bgcolor: lightTheme.palette.custom.pending, color: lightTheme.palette.custom.pendingText, fontWeight: 600, fontSize: {xs: 13, sm:15}, p: {xs:1, sm:1.5} }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6} sx={{textAlign: {xs:'left', md:'right'}}}> {/* Alineación responsiva */}
                                    <StyledButton variant="outlined" color="primary" // Usará el color primario del tema para borde y texto
                                        sx={{ ml: {md:2}, mt: { xs: 2, md: 0 }}}
                                        startIcon={<AddIcon />} onClick={() => setOpenGastoDialog(true)}>
                                        Registrar gasto/pago
                                    </StyledButton>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </StyledCard>
                </motion.div>

                {/* Tabla de proveedores */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .32 }}>
                    <StyledCard sx={{ mb: 4 }}>
                        <CardHeader title={<Typography variant="h6" color="text.primary">Listado de Proveedores</Typography>} sx={{ pb: 0, pt: 2, px: 3 }} />
                        <CardContent>
                            <TableContainer component={Paper} sx={{ bgcolor: "transparent", boxShadow: 'none' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nombre</TableCell> {/* MUI TableCell ya usa color de texto del tema */}
                                            <TableCell>Contacto</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {proveedores.map((p) => (
                                            <TableRow key={p._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell sx={{ fontWeight: 500 }}>{p.nombre}</TableCell>
                                                <TableCell sx={{ color: "text.secondary" }}>{p.contacto}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </StyledCard>
                </motion.div>

                {/* Tabla de gastos */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .38 }}>
                    <StyledCard>
                        <CardHeader title={<Typography variant="h6" color="text.primary">Gastos / Pagos</Typography>} sx={{ pb: 0, pt: 2, px: 3 }} />
                        <CardContent>
                            <TableContainer component={Paper} sx={{ bgcolor: "transparent", boxShadow: 'none' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Proveedor</TableCell>
                                            <TableCell>Descripción</TableCell>
                                            <TableCell>Monto</TableCell>
                                            <TableCell>Estado</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {gastos.map((g) => (
                                            <TableRow key={g._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                <TableCell>{g.proveedor}</TableCell>
                                                <TableCell sx={{ color: "text.secondary" }}>{g.descripcion}</TableCell>
                                                <TableCell>${g.monto}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={g.pagado ? "Pagado" : "Pendiente"}
                                                        sx={{
                                                            bgcolor: g.pagado ? lightTheme.palette.custom.paid : lightTheme.palette.custom.pending,
                                                            color: g.pagado ? lightTheme.palette.custom.paidText : lightTheme.palette.custom.pendingText,
                                                            fontWeight: 700, minWidth: 90
                                                        }}
                                                        icon={g.pagado ? <CreditScoreIcon sx={{color: lightTheme.palette.custom.paidText}}/> : <ReceiptLongIcon sx={{color: lightTheme.palette.custom.pendingText}}/>}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="Eliminar">
                                                        <IconButton size="small" onClick={() => handleDeleteGasto(g._id)}>
                                                            <DeleteIcon sx={{ color: lightTheme.palette.custom.danger }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </StyledCard>
                </motion.div>

                {/* Dialog agregar proveedor */}
                <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{ sx: { borderRadius: 2 }}}>
                    <DialogTitle>Nuevo Proveedor</DialogTitle>
                    <DialogContent>
                        <StyledTextField autoFocus margin="normal" label="Nombre" value={newProveedor.nombre} onChange={e => setNewProveedor({ ...newProveedor, nombre: e.target.value })} fullWidth required />
                        <StyledTextField margin="normal" label="Contacto (Tel, Email, etc.)" value={newProveedor.contacto} onChange={e => setNewProveedor({ ...newProveedor, contacto: e.target.value })} fullWidth />
                    </DialogContent>
                    <DialogActions sx={{p:2}}>
                        <Button startIcon={<CloseIcon />} onClick={() => setOpenDialog(false)} color="inherit">Cancelar</Button>
                        <StyledButton startIcon={<SaveIcon />} onClick={handleAddProveedor}>Guardar</StyledButton>
                    </DialogActions>
                </Dialog>

                {/* Dialog registrar gasto */}
                <Dialog open={openGastoDialog} onClose={() => setOpenGastoDialog(false)} PaperProps={{ sx: { borderRadius: 2 }}}>
                    <DialogTitle>Registrar Gasto / Pago</DialogTitle>
                    <DialogContent>
                        <StyledTextField select SelectProps={{ native: true }} margin="normal" label="Proveedor" value={newGasto.proveedor} onChange={e => setNewGasto({ ...newGasto, proveedor: e.target.value })} fullWidth required>
                            <option value="">Seleccione proveedor</option>
                            {proveedores.map(p => ( <option key={p._id} value={p.nombre}>{p.nombre}</option> ))}
                        </StyledTextField>
                        <StyledTextField margin="normal" label="Monto" type="number" value={newGasto.monto} onChange={e => setNewGasto({ ...newGasto, monto: e.target.value })} fullWidth required InputProps={{ inputProps: { min: 0, step: "0.01" }}}/>
                        <StyledTextField margin="normal" label="Descripción" value={newGasto.descripcion} onChange={e => setNewGasto({ ...newGasto, descripcion: e.target.value })} fullWidth multiline rows={2}/>
                        <Box sx={{ mt: 2, textAlign:'center' }}> {/* Centrar el chip y texto */}
                            <Chip
                                label={newGasto.pagado ? "Pagado" : "Pendiente"}
                                onClick={() => setNewGasto({ ...newGasto, pagado: !newGasto.pagado })}
                                sx={{
                                    bgcolor: newGasto.pagado ? lightTheme.palette.custom.paid : lightTheme.palette.custom.pending,
                                    color: newGasto.pagado ? lightTheme.palette.custom.paidText : lightTheme.palette.custom.pendingText,
                                    fontWeight: 700, cursor: "pointer", px:2, py:0.5, fontSize: '0.9rem'
                                }}
                                icon={newGasto.pagado ? <CreditScoreIcon /> : <ReceiptLongIcon />}
                            />
                             {/* <Typography sx={{ ml: 2, display: "inline", color: 'text.secondary', verticalAlign: 'middle' }}>Marcar estado</Typography> */}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{p:2}}>
                        <Button startIcon={<CloseIcon />} onClick={() => setOpenGastoDialog(false)} color="inherit">Cancelar</Button>
                        <StyledButton startIcon={<SaveIcon />} onClick={handleAddGasto}>Registrar</StyledButton>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3500}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }} // Posición más estándar
                >
                    <Alert
                        onClose={() => setSnackbar({ ...snackbar, open: false })}
                        severity={snackbar.sev}
                        variant="filled" // Filled se ve mejor para notificaciones
                        sx={{ width: '100%', boxShadow: 6 }} // Sombra para destacar
                    >
                        {snackbar.msg}
                    </Alert>
                </Snackbar>
            </Container>
        </ThemeProvider>
    );
}