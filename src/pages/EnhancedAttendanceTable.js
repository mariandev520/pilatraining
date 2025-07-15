import React, { useState } from 'react';
import {
    TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper,
    Typography, Box, CircularProgress, TextField, Tooltip,
    IconButton, Avatar, Chip, alpha, Collapse, Card, LinearProgress,
    Badge, Grid, Button, Zoom,
    Stack
} from '@mui/material';
import {
    Edit as EditIcon, Delete as DeleteIcon,
    AccessTime as TimeIcon, Assessment as AssessmentIcon,
    ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,
    ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon,
    Search as SearchIcon, Payment as PaymentIcon,
    AddCircleOutline as AddHourIcon, RemoveCircleOutline as RemoveHourIcon,
    History as HistoryIcon,
    FitnessCenter as ActivityIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    MonetizationOnOutlined as TarifaIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Paleta de colores (asumida)
const COLORS = {
  backgroundDefault: '#121212',
  backgroundPaper: '#1E1E1E',
  backgroundSubtle: '#2C2C2C',
  textPrimary: '#EAEAEA',
  textSecondary: '#B0B0B0',
  accentGreen: '#00E676',
  accentGreenHover: '#00C764',
  divider: 'rgba(224, 224, 224, 0.12)',
  errorLight: '#FF8A80',
  errorMain: '#FF5252',
  greyInactive: '#757575',
  white: '#FFFFFF',
};


const EnhancedAttendanceTable = ({
    filteredData = [],
    attendanceData = {},
    loadingAttendance = false,
    handleHoursChange = () => {},
    calculateTotalsForWeek = (profesorId, tarifaHora) => ({ totalHoras: 0, totalMonto: 0 }),
    handleEdit = () => {},
    handleDelete = () => {},
    generateRandomColor = (seed) => {
        let hash = 0;
        if (!seed) return `hsl(0, 30%, 30%)`;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        const H = hash % 360;
        return `hsl(${H}, 30%, 30%)`;
    },
    getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : '??',
    onVerHistorialPagos = () => {},
    onRegistrarPagoSemana = () => {},
    loadingPagoSemana = false,
    diasLaborables = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    onUpdateTarifaHora,
}) => {
    const [expandedRow, setExpandedRow] = useState(null);
    const [hoveredRow, setHoveredRow] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'ascending' });
    const [editingTarifas, setEditingTarifas] = useState({});

    const toggleRowExpand = (profesorId) => {
        const currentlyEditing = editingTarifas[profesorId];
        if (expandedRow === profesorId && currentlyEditing) {
            handleCancelEditTarifa(profesorId);
        }
        setExpandedRow(expandedRow === profesorId ? null : profesorId);
    };
    
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortedData = () => {
        if (!filteredData) return [];
        const dataToSort = [...filteredData];
        if (sortConfig.key) {
            dataToSort.sort((a, b) => {
                let valA, valB;
                if (sortConfig.key === 'nombre') {
                    valA = a.nombre?.toLowerCase() || ''; valB = b.nombre?.toLowerCase() || '';
                    if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                } else if (sortConfig.key === 'totalHoras') {
                    valA = calculateTotalsForWeek(a.id, a.tarifaHora).totalHoras;
                    valB = calculateTotalsForWeek(b.id, b.tarifaHora).totalHoras;
                } else if (sortConfig.key.startsWith('dia_')) {
                    const diaKey = sortConfig.key.substring(0, sortConfig.key.lastIndexOf('_'));
                    const dia = diaKey.split('_')[1];
                    valA = attendanceData[a.id]?.[dia]?.horas || 0; valB = attendanceData[b.id]?.[dia]?.horas || 0;
                } else { return 0; }
                return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
            });
        }
        return dataToSort;
    };
        
    const sortedData = getSortedData();

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } }),
        exit: { opacity: 0, x: -10, transition: { duration: 0.2, ease: "easeIn" } }
    };

    const getDiaAbreviatura = (diaCompleto) => {
        const map = {'Lunes': 'Lun', 'Martes': 'Mar', 'Miércoles': 'Mié', 'Jueves': 'Jue', 'Viernes': 'Vie'};
        return map[diaCompleto] || diaCompleto.substring(0,3);
    };

    const handleQuickAddHours = (profesorId, dia, increment) => {
        const currentHours = parseFloat(attendanceData[profesorId]?.[dia]?.horas || 0);
        const newHours = Math.max(0, currentHours + increment);
        handleHoursChange(profesorId, dia, newHours.toString());
    };

    const handleEditTarifaClick = (profesorId, tarifaActual) => {
        setEditingTarifas(prev => ({
            ...prev,
            [profesorId]: { valor: String(tarifaActual !== undefined && tarifaActual !== null ? tarifaActual : 0), guardando: false, error: null }
        }));
    };

    const handleCancelEditTarifa = (profesorId) => {
        setEditingTarifas(prev => {
            const newState = { ...prev };
            delete newState[profesorId];
            return newState;
        });
    };

    const handleTarifaInputChange = (profesorId, inputValue) => {
        setEditingTarifas(prev => ({
            ...prev,
            [profesorId]: { ...(prev[profesorId] || {}), valor: inputValue, error: null }
        }));
    };

    const handleSaveTarifa = async (profesorId) => {
        const tarifaEditState = editingTarifas[profesorId];
        if (!tarifaEditState || !onUpdateTarifaHora) return;
        const nuevaTarifaNum = parseFloat(tarifaEditState.valor);
        if (isNaN(nuevaTarifaNum) || nuevaTarifaNum < 0) {
            setEditingTarifas(prev => ({ ...prev, [profesorId]: { ...tarifaEditState, error: "Valor inválido", guardando: false } }));
            return;
        }
        setEditingTarifas(prev => ({ ...prev, [profesorId]: { ...tarifaEditState, guardando: true, error: null } }));
        try {
            await onUpdateTarifaHora(profesorId, nuevaTarifaNum);
            handleCancelEditTarifa(profesorId);
        } catch (error) {
            console.error("Error al actualizar tarifa:", error);
            const errorMessage = error.response?.data?.message || error.message || "Error al guardar.";
            setEditingTarifas(prev => ({ ...prev, [profesorId]: { ...tarifaEditState, guardando: false, error: errorMessage } }));
        }
    };

    const renderTableHeader = () => {
        const getSortableHeaderStyle = (key) => ({
            cursor: 'pointer', position: 'relative', py: 1, px: 1.5, fontSize: '0.8rem', color: COLORS.textSecondary,
            '&:hover': { bgcolor: alpha(COLORS.accentGreen, 0.08), color: COLORS.accentGreen },
            ...(sortConfig.key === key && { bgcolor: alpha(COLORS.accentGreen, 0.12), fontWeight: 'bold', color: COLORS.accentGreen })
        });
        const renderSortIcon = (key) => {
            if (sortConfig.key !== key) return null;
            return sortConfig.direction === 'ascending' ?
                <ArrowUpwardIcon sx={{ fontSize: '1rem', ml: 0.3, verticalAlign: 'middle', color: COLORS.accentGreen }} /> :
                <ArrowDownwardIcon sx={{ fontSize: '1rem', ml: 0.3, verticalAlign: 'middle', color: COLORS.accentGreen }} />;
        };
        return (
            <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: '600', borderBottom: `1px solid ${COLORS.divider}`, color: COLORS.textPrimary, bgcolor: COLORS.backgroundPaper, } }}>
                    <TableCell sx={{ ...getSortableHeaderStyle('nombre'), minWidth: 180, position: 'sticky', left: 0, zIndex: 10, borderRight: `1px solid ${COLORS.divider}` }} onClick={() => requestSort('nombre')}><Box sx={{ display: 'flex', alignItems: 'center' }}>Profesor {renderSortIcon('nombre')}</Box></TableCell>
                    {diasLaborables.map((diaCompleto) => {
                        const diaKey = `dia_${diaCompleto}_horas`;
                        return (
                            <TableCell key={diaKey} align="center" sx={{...getSortableHeaderStyle(diaKey), minWidth: 110}} onClick={() => requestSort(diaKey)}>
                                <Tooltip title={`${diaCompleto} - Horas`} arrow placement="top">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ color: 'inherit', fontWeight:'inherit', fontSize:'0.75rem' }}>{getDiaAbreviatura(diaCompleto)}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textSecondary, mt:0.1 }}>
                                            <TimeIcon sx={{ fontSize: 12, mr: 0.3 }} />
                                            <Typography variant="caption" sx={{ color: 'inherit', fontSize:'0.65rem' }}>Hrs</Typography>
                                            {renderSortIcon(diaKey)}
                                        </Box>
                                    </Box>
                                </Tooltip>
                            </TableCell>
                        )
                    })}
                    <TableCell align="center" sx={{ ...getSortableHeaderStyle('totalHoras'), color: COLORS.accentGreen, minWidth: 100 }} onClick={() => requestSort('totalHoras')}><Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Total Hrs {renderSortIcon('totalHoras')}</Box></TableCell>
                    <TableCell align="center" sx={{minWidth: 180, fontSize: '0.8rem', py:1, px: 1.5 }}>Acciones</TableCell>
                </TableRow>
            </TableHead>
        );
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '6px', maxHeight: 'calc(100vh - 260px)', overflow: 'auto', border: `1px solid ${COLORS.divider}`, bgcolor: COLORS.backgroundPaper, '&::-webkit-scrollbar': { width: '6px', height: '6px' }, '&::-webkit-scrollbar-track': { background: COLORS.backgroundPaper }, '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(COLORS.accentGreen, 0.25), borderRadius: '3px', '&:hover': { backgroundColor: alpha(COLORS.accentGreen, 0.45) } } }}>
                <Table stickyHeader aria-label="Tabla de asistencia de profesores" size="small">
                    {renderTableHeader()}
                    <TableBody>
                        {loadingAttendance ? (
                            <TableRow><TableCell colSpan={3 + diasLaborables.length} align="center" sx={{ py: 4, borderBottom: 'none' }}><CircularProgress size={30} sx={{ color: COLORS.accentGreen, mb: 1 }} /><Typography variant="body2" sx={{color: COLORS.textSecondary}}>Cargando asistencia...</Typography></TableCell></TableRow>
                        ) : sortedData.length > 0 ? (
                            <AnimatePresence initial={false}>
                                {sortedData.map((profesor, index) => {
                                    const profesorAttendance = attendanceData[profesor.id] || {};
                                    const { totalHoras, totalMonto } = calculateTotalsForWeek(profesor.id, profesor.tarifaHora);
                                    const isExpanded = expandedRow === profesor.id;
                                    const tarifaState = editingTarifas[profesor.id];

                                    return (
                                        <React.Fragment key={profesor.id}>
                                            <motion.tr component={TableRow} custom={index} initial="hidden" animate="visible" exit="exit" variants={rowVariants} onMouseEnter={() => setHoveredRow(profesor.id)} onMouseLeave={() => setHoveredRow(null)} sx={{ '& > .MuiTableCell-root': { py: 0.4, px: 1.5, borderBottom: `1px solid ${COLORS.divider}`, fontSize:'0.8rem' }, '&:hover': { bgcolor: COLORS.backgroundSubtle }, transition: 'background-color 0.15s ease-in-out', bgcolor: COLORS.backgroundPaper }}>
                                                <TableCell component="th" scope="row" sx={{ cursor: 'pointer', position: 'sticky', left: 0, bgcolor: 'inherit', zIndex: 1, borderRight: `1px solid ${COLORS.divider}`, borderLeft: isExpanded ? `3px solid ${COLORS.accentGreen}` : 'none', color: COLORS.textPrimary }} onClick={() => toggleRowExpand(profesor.id)}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                                                        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={isExpanded ? <ExpandLessIcon sx={{ fontSize: '0.8rem', color: COLORS.accentGreen, bgcolor: alpha(COLORS.accentGreen, 0.15), borderRadius: '50%' }} /> : <ExpandMoreIcon sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }} />}>
                                                            <Avatar sx={{ bgcolor: generateRandomColor(profesor.nombre), mr: 1.2, width: 32, height: 32, fontSize: '0.8rem', color: COLORS.textPrimary, transition: 'transform 0.15s ease-in-out', transform: isExpanded ? 'scale(1.03)' : 'scale(1)' }}>{getInitials(profesor.nombre)}</Avatar>
                                                        </Badge>
                                                        <Box>
                                                            <Typography variant="body1" fontWeight="500" noWrap sx={{color: COLORS.textPrimary, fontSize:'0.85rem'}}>{profesor.nombre}</Typography>
                                                            <Typography variant="caption" noWrap sx={{fontSize: '0.7rem', color: COLORS.textSecondary}}>{profesor.correo || profesor.telefono}</Typography>
                                                            {profesor.actividad && (<Tooltip title={`${profesor.actividad}`} placement="bottom-start" arrow><Typography variant="caption" noWrap sx={{fontSize: '0.65rem', display: 'flex', alignItems: 'center', mt: 0.2, fontStyle: 'italic', color: alpha(COLORS.accentGreen, 0.75) }}><ActivityIcon sx={{ fontSize: '0.8rem', mr: 0.3, opacity: 0.65 }} /> {profesor.actividad}</Typography></Tooltip>)}
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                {diasLaborables.map(diaCompleto => (
                                                  <TableCell key={`${profesor.id}_${diaCompleto}_horas`} align="center" sx={{color: COLORS.textPrimary}}>
                                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.2 }}>
                                                          <Tooltip title="Restar una hora" placement="top" arrow>
                                                              <IconButton
                                                                onClick={() => handleQuickAddHours(profesor.id, diaCompleto, -1)}
                                                                size="small"
                                                                sx={{p:0.1, color: alpha(COLORS.accentGreen, 0.6), '&:hover': {color: COLORS.accentGreenHover, bgcolor: alpha(COLORS.accentGreen, 0.1)} }}
                                                              >
                                                                  <RemoveHourIcon sx={{fontSize:"1.1rem"}} />
                                                              </IconButton>
                                                          </Tooltip>
                                                          <TextField
                                                              type="number"
                                                              size="small"
                                                              variant="outlined"
                                                              value={profesorAttendance[diaCompleto]?.horas ?? 0}
                                                              onChange={(e) => handleHoursChange(profesor.id, diaCompleto, e.target.value)}
                                                              inputProps={{
                                                                  min: 0,
                                                                  step: 1,
                                                                  style: { textAlign: 'center', padding: '6px 2px', fontSize: '0.8rem' }
                                                              }}
                                                              sx={{ width: '55px', '& .MuiOutlinedInput-root': { height: '30px', borderRadius: '4px', bgcolor: alpha(COLORS.backgroundDefault, 0.4), '& input': { fontWeight: (profesorAttendance[diaCompleto]?.horas || 0) > 0 ? 'bold' : 'normal', color: (profesorAttendance[diaCompleto]?.horas || 0) > 0 ? COLORS.accentGreen : COLORS.textPrimary }, '& fieldset': { borderColor: alpha(COLORS.accentGreen, 0.25) }, '&:hover fieldset': { borderColor: alpha(COLORS.accentGreen, 0.5) }, '&.Mui-focused fieldset': { borderColor: COLORS.accentGreen }, } }}
                                                          />
                                                          <Tooltip title="Sumar una hora" placement="top" arrow>
                                                              <IconButton
                                                                onClick={() => handleQuickAddHours(profesor.id, diaCompleto, 1)}
                                                                size="small"
                                                                sx={{p:0.1, color: alpha(COLORS.accentGreen, 0.6), '&:hover': {color: COLORS.accentGreenHover, bgcolor: alpha(COLORS.accentGreen, 0.1)} }}
                                                              >
                                                                  <AddHourIcon sx={{fontSize:"1.1rem"}} />
                                                              </IconButton>
                                                          </Tooltip>
                                                      </Box>
                                                  </TableCell>
                                                ))}
                                                <TableCell align="center" sx={{ fontWeight: '500' }}><Chip icon={<TimeIcon sx={{fontSize: '0.8rem', color: totalHoras > 0 ? COLORS.accentGreen : COLORS.greyInactive}}/>} label={`${totalHoras} Hrs`} variant="outlined" size="small" sx={{ fontWeight: '500', fontSize: '0.7rem', height:'22px', borderColor: totalHoras > 0 ? COLORS.accentGreen : COLORS.divider, color: totalHoras > 0 ? COLORS.accentGreen : COLORS.textSecondary, bgcolor: totalHoras > 0 ? alpha(COLORS.accentGreen, 0.08) : 'transparent' }} /></TableCell>
                                                <TableCell align="center"><Stack direction="row" spacing={0.2} justifyContent="center">
                                                    <Tooltip title="Ver historial de pagos" arrow><IconButton onClick={() => onVerHistorialPagos(profesor)} sx={{p:0.5, color: COLORS.textSecondary, '&:hover': { bgcolor: alpha(COLORS.accentGreen, 0.08), color: COLORS.accentGreen } }}><HistoryIcon sx={{fontSize:"1.1rem"}} /></IconButton></Tooltip>
                                                    <Tooltip title="Registrar pago de esta semana" arrow><span><IconButton onClick={() => onRegistrarPagoSemana(profesor.id)} sx={{p:0.5, color: totalHoras > 0 ? COLORS.accentGreen : COLORS.greyInactive, '&:hover': { bgcolor: totalHoras > 0 ? alpha(COLORS.accentGreen, 0.08) : undefined }, '&.Mui-disabled': {color: COLORS.greyInactive} }} disabled={loadingPagoSemana || totalHoras === 0}><PaymentIcon sx={{fontSize:"1.1rem"}} /> </IconButton></span></Tooltip>
                                                    <Tooltip title="Editar profesor" arrow><IconButton onClick={() => handleEdit(profesor)} sx={{p:0.5, color: COLORS.textSecondary, '&:hover': { bgcolor: alpha(COLORS.accentGreen, 0.08), color: COLORS.accentGreenHover } }}><EditIcon sx={{fontSize:"1.1rem"}} /></IconButton></Tooltip>
                                                    <Tooltip title="Eliminar profesor" arrow><IconButton onClick={() => handleDelete(profesor.id, profesor.nombre)} sx={{p:0.5, color: COLORS.errorLight, '&:hover': { bgcolor: alpha(COLORS.errorMain, 0.08), color: COLORS.errorMain } }}><DeleteIcon sx={{fontSize:"1.1rem"}} /></IconButton></Tooltip>
                                                </Stack></TableCell>
                                            </motion.tr>
                                            
                                            <TableRow sx={{bgcolor: COLORS.backgroundPaper}}>
                                                <TableCell colSpan={3 + diasLaborables.length} sx={{ p: 0, borderBottom: isExpanded ? `1px solid ${COLORS.divider}` : 'none' }}>
                                                    <Collapse in={isExpanded} timeout={ {enter: 300, exit: 150} } unmountOnExit>
                                                        <Zoom in={isExpanded} style={{ transitionDelay: isExpanded ? '50ms' : '0ms' }}>
                                                            <Card elevation={0} sx={{ m: 0.5, p: 1.5, bgcolor: COLORS.backgroundSubtle, borderRadius: '4px', border: `1px solid ${alpha(COLORS.divider, 0.6)}` }}>
                                                                <Typography variant="subtitle1" fontWeight="500" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: COLORS.textPrimary, mb: 1.5, fontSize:'0.9rem' }}>
                                                                    <AssessmentIcon sx={{mr:0.8, color: COLORS.accentGreen, fontSize:'1.2rem'}}/>Resumen: <Typography component="span" fontWeight="bold" sx={{color: COLORS.accentGreen, ml: 0.5, fontSize:'0.9rem'}}>{profesor.nombre}</Typography>
                                                                </Typography>
                                                                
                                                                {profesor.actividad && ( <Typography variant="body2" sx={{mb:1, display: 'flex', alignItems: 'center', color: COLORS.textSecondary, fontSize:'0.8rem'}}> <ActivityIcon sx={{mr:0.6, fontSize:'1rem', opacity:0.75, color: alpha(COLORS.accentGreen, 0.65) }}/><strong>Actividad:</strong>&nbsp;{profesor.actividad}</Typography>)}

                                                                <Grid container spacing={1.5} alignItems="flex-start">
                                                                    <Grid item xs={12} sm={6} md={3}>
                                                                        <Typography variant="caption" sx={{color: COLORS.textSecondary, fontSize:'0.7rem'}}>Total Horas:</Typography>
                                                                        <Typography variant="h6" fontWeight="bold" sx={{color: COLORS.accentGreen, fontSize:'1.1rem'}}>{totalHoras} hrs</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6} md={3}>
                                                                        <Typography variant="caption" sx={{color: COLORS.textSecondary, fontSize:'0.7rem'}}>Monto a Pagar:</Typography>
                                                                        <Typography variant="h6" fontWeight="bold" sx={{color: COLORS.accentGreen, fontSize:'1.1rem'}}>${totalMonto.toFixed(2)}</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6} md={3}>
                                                                        <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: '0.7rem', display: 'flex', alignItems: 'center', mb: 0.2 }}>
                                                                            <TarifaIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: alpha(COLORS.accentGreen,0.7) }}/> Valor Hora:
                                                                        </Typography>
                                                                        {!tarifaState && onUpdateTarifaHora ? (
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', minHeight:'30px' }}>
                                                                                <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.accentGreen, fontSize: '1.1rem', mr: 0.5 }}>
                                                                                    ${(profesor.tarifaHora !== undefined && profesor.tarifaHora !== null ? profesor.tarifaHora : 0).toFixed(2)}
                                                                                </Typography>
                                                                                <Tooltip title="Editar valor hora">
                                                                                    <IconButton size="small" onClick={() => handleEditTarifaClick(profesor.id, profesor.tarifaHora)} sx={{ p:0.3, color: COLORS.textSecondary, '&:hover': { color: COLORS.accentGreen, bgcolor: alpha(COLORS.accentGreen, 0.08) } }}>
                                                                                        <EditIcon sx={{ fontSize: '1rem' }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Box>
                                                                        ) : tarifaState ? (
                                                                            <Box sx={{ mt: 0.1 }}>
                                                                                <TextField
                                                                                    type="number" size="small" variant="outlined"
                                                                                    disabled={tarifaState.guardando}
                                                                                    value={tarifaState.valor}
                                                                                    onChange={(e) => handleTarifaInputChange(profesor.id, e.target.value)}
                                                                                    error={!!tarifaState.error}
                                                                                    inputProps={{ min: 0, step: 0.01, style: { padding: '7px 5px', fontSize: '0.85rem' } }}
                                                                                    sx={{ width: '90px', mr: 0.5, '& .MuiOutlinedInput-root': { height: '30px', borderRadius: '4px', bgcolor: alpha(COLORS.backgroundDefault, 0.7), '& input': { color: COLORS.accentGreen, fontWeight: 'bold' }, '& fieldset': { borderColor: tarifaState.error ? COLORS.errorMain : alpha(COLORS.accentGreen, 0.4) }, '&:hover fieldset': { borderColor: tarifaState.error ? COLORS.errorMain :alpha(COLORS.accentGreen, 0.7) }, '&.Mui-focused fieldset': { borderColor: tarifaState.error ? COLORS.errorMain :COLORS.accentGreen }}}}
                                                                                />
                                                                                <Tooltip title="Guardar Tarifa"><span>
                                                                                    <IconButton size="small" onClick={() => handleSaveTarifa(profesor.id)} disabled={tarifaState.guardando} sx={{ p:0.3, color: COLORS.accentGreen, '&:hover': { bgcolor: alpha(COLORS.accentGreen, 0.1) }, '&.Mui-disabled': { color: COLORS.greyInactive} }}>
                                                                                        {tarifaState.guardando ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: '1rem' }} />}
                                                                                    </IconButton>
                                                                                </span></Tooltip>
                                                                                <Tooltip title="Cancelar"><span>
                                                                                    <IconButton size="small" onClick={() => handleCancelEditTarifa(profesor.id)} disabled={tarifaState.guardando} sx={{ p:0.3, color: COLORS.errorLight, '&:hover': { bgcolor: alpha(COLORS.errorMain, 0.1) } }}>
                                                                                        <CancelIcon sx={{ fontSize: '1rem' }} />
                                                                                    </IconButton>
                                                                                </span></Tooltip>
                                                                                {tarifaState.error && <Typography variant="caption" color="error" sx={{display: 'block', fontSize:'0.65rem', mt:0.2, maxWidth:'150px'}}>{tarifaState.error}</Typography>}
                                                                            </Box>
                                                                        ) : (
                                                                            <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.accentGreen, fontSize: '1.1rem', minHeight:'30px', display:'flex', alignItems:'center' }}>
                                                                                ${(profesor.tarifaHora !== undefined && profesor.tarifaHora !== null ? profesor.tarifaHora : 0).toFixed(2)}
                                                                            </Typography>
                                                                        )}
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6} md={3} sx={{display: 'flex', alignItems: 'flex-end', justifyContent: {xs: 'flex-start', sm: 'flex-end'}, mt: {xs: 1, md: 0}}}>
                                                                        <Button variant="outlined" size="small" onClick={() => onVerHistorialPagos(profesor)} startIcon={<HistoryIcon sx={{fontSize:'1rem'}}/>} sx={{ fontSize:'0.7rem', py:0.3, px:1, color: COLORS.accentGreen, borderColor: alpha(COLORS.accentGreen, 0.4), '&:hover': { borderColor: COLORS.accentGreen, bgcolor: alpha(COLORS.accentGreen, 0.08) } }}>Historial</Button>
                                                                    </Grid>
                                                                </Grid>
                                                                {totalHoras > 0 && (
                                                                    <Box sx={{mt: 1.5}}>
                                                                        <Typography variant="caption" sx={{color: COLORS.textSecondary, fontSize:'0.7rem'}}>Progreso semanal (ref. 40hs):</Typography>
                                                                        <LinearProgress variant="determinate" value={Math.min((totalHoras / 40) * 100, 100)} sx={{height: 6, borderRadius: 3, bgcolor: alpha(COLORS.accentGreen, 0.15), '& .MuiLinearProgress-bar': {bgcolor: COLORS.accentGreen}}} />
                                                                    </Box>
                                                                )}
                                                            </Card>
                                                        </Zoom>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                            </AnimatePresence>
                        ) : ( <TableRow><TableCell colSpan={3 + diasLaborables.length} align="center" sx={{ py: 6, borderBottom: 'none' }}><Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}><SearchIcon sx={{ fontSize: 40, color: COLORS.greyInactive }} /><Typography variant="subtitle1" sx={{color: COLORS.textSecondary, fontSize:'0.9rem'}}>No se encontraron profesores.</Typography></Box></TableCell></TableRow> )}
                    </TableBody>
                </Table>
            </TableContainer>
        </motion.div>
    );
};

export default EnhancedAttendanceTable;