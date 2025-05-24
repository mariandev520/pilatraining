import React, { useState, useMemo } from 'react';
import {
    TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper,
    Typography, Box, CircularProgress, TextField, InputAdornment, Tooltip,
    IconButton, Avatar, Chip, alpha, Collapse, Card, LinearProgress,
    Badge, Grid, Button, Zoom,
    Stack, useTheme, useMediaQuery // MUI Responsive utilities
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

// Paleta de colores MODO CLARO
const LIGHT_COLORS = {
    backgroundDefault: '#F4F6F8',
    backgroundPaper: '#FFFFFF',
    backgroundSubtle: '#E9EFF3',
    textPrimary: '#212529',
    textSecondary: '#6C757D',
    accentGreen: '#00B85E',
    accentGreenHover: '#009A4D',
    divider: 'rgba(0, 0, 0, 0.12)',
    errorLight: '#F44336',
    errorMain: '#D32F2F',
    greyInactive: '#B0BEC5',
    white: '#FFFFFF',
    black: '#000000',
};

const COLORS = LIGHT_COLORS;

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
        if (!seed) return `hsl(0, 45%, 75%)`;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
            hash = hash & hash;
        }
        const H = hash % 360;
        return `hsl(${H}, 45%, 80%)`;
    },
    getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : '??',
    onVerHistorialPagos = () => {},
    onRegistrarPagoSemana = () => {},
    loadingPagoSemana = false,
    diasLaborables = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
    onUpdateTarifaHora,
}) => {
    const [expandedRow, setExpandedRow] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'ascending' });
    const [editingTarifas, setEditingTarifas] = useState({});

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Breakpoint para cambiar la tabla

    const toggleRowExpand = (profesorId) => {
        const profIdStr = (profesorId.id || profesorId._id || profesorId).toString();
        const currentlyEditing = editingTarifas[profIdStr];
        if (expandedRow === profIdStr && currentlyEditing) {
            handleCancelEditTarifa(profIdStr);
        }
        setExpandedRow(expandedRow === profIdStr ? null : profIdStr);
    };
    
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!filteredData) return [];
        const dataToSort = [...filteredData];
        if (sortConfig.key) {
            dataToSort.sort((a, b) => {
                let valA, valB;
                const profAId = (a.id || a._id).toString();
                const profBId = (b.id || b._id).toString();

                if (sortConfig.key === 'nombre') {
                    valA = a.nombre?.toLowerCase() || ''; valB = b.nombre?.toLowerCase() || '';
                    if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                } else if (sortConfig.key === 'totalHoras') {
                    valA = calculateTotalsForWeek(profAId, a.tarifaHora).totalHoras;
                    valB = calculateTotalsForWeek(profBId, b.tarifaHora).totalHoras;
                } else if (sortConfig.key.startsWith('dia_') && !isMobile) { // Sort by day only if columns are visible
                    const dia = sortConfig.key.split('_')[1];
                    valA = attendanceData[profAId]?.[dia]?.horas || 0;
                    valB = attendanceData[profBId]?.[dia]?.horas || 0;
                } else { return 0; }
                return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
            });
        }
        return dataToSort;
    }, [filteredData, sortConfig, attendanceData, calculateTotalsForWeek, isMobile]);
        
    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } }),
        exit: { opacity: 0, x: -10, transition: { duration: 0.2, ease: "easeIn" } }
    };

    const getDiaAbreviatura = (diaCompleto) => {
        const map = {'Lunes': 'Lu', 'Martes': 'Ma', 'Miércoles': 'Mi', 'Jueves': 'Ju', 'Viernes': 'Vi'};
        return map[diaCompleto] || diaCompleto.substring(0,2);
    };

    const handleQuickAddHours = (profesorId, dia, increment) => {
        const profIdStr = (profesorId.id || profesorId._id || profesorId).toString();
        const currentHours = parseFloat(attendanceData[profIdStr]?.[dia]?.horas || 0);
        const newHours = Math.max(0, currentHours + increment);
        handleHoursChange(profIdStr, dia, newHours.toString());
    };
    
    const handleEditTarifaClick = (profesorId, tarifaActual) => {
        const profIdStr = (profesorId.id || profesorId._id || profesorId).toString();
        setEditingTarifas(prev => ({
            ...prev,
            [profIdStr]: { valor: String(tarifaActual !== undefined && tarifaActual !== null ? tarifaActual : 0), guardando: false, error: null }
        }));
    };

    const handleCancelEditTarifa = (profesorId) => {
        const profIdStr = (profesorId.id || profesorId._id || profesorId).toString();
        setEditingTarifas(prev => {
            const newState = { ...prev };
            delete newState[profIdStr];
            return newState;
        });
    };

    const handleTarifaInputChange = (profesorId, inputValue) => {
        const profIdStr = (profesorId.id || profesorId._id || profesorId).toString();
        setEditingTarifas(prev => ({
            ...prev,
            [profIdStr]: { ...(prev[profIdStr] || {}), valor: inputValue, error: null }
        }));
    };

    const handleSaveTarifa = async (profesorId) => {
        const profIdStr = (profesorId.id || profesorId._id || profesorId).toString();
        const tarifaEditState = editingTarifas[profIdStr];
        if (!tarifaEditState || !onUpdateTarifaHora) return;

        const nuevaTarifaNum = parseFloat(tarifaEditState.valor);

        if (isNaN(nuevaTarifaNum) || nuevaTarifaNum < 0) {
            setEditingTarifas(prev => ({ ...prev, [profIdStr]: { ...tarifaEditState, error: "Valor inválido", guardando: false }}));
            return;
        }

        setEditingTarifas(prev => ({ ...prev, [profIdStr]: { ...tarifaEditState, guardando: true, error: null }}));

        try {
            await onUpdateTarifaHora(profIdStr, nuevaTarifaNum);
            handleCancelEditTarifa(profIdStr);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || "Error al guardar.";
            setEditingTarifas(prev => ({ ...prev, [profIdStr]: { ...tarifaEditState, guardando: false, error: errorMessage }}));
        }
    };

    const renderTableHeader = () => {
        const getSortableHeaderStyle = (key, isDayColumn = false) => ({
            cursor: (isDayColumn && isMobile) ? 'default' : 'pointer', // No sort cursor for day columns on mobile
            position: 'relative',
            py: {xs: 0.8, sm: 1}, px: {xs: 0.5, sm: 1, md: 1.5},
            fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
            color: COLORS.textSecondary,
            whiteSpace: 'nowrap',
            '&:hover': (isDayColumn && isMobile) ? {} : { bgcolor: alpha(COLORS.accentGreen, 0.08), color: COLORS.accentGreen },
            ...(sortConfig.key === key && { bgcolor: alpha(COLORS.accentGreen, 0.12), fontWeight: 'bold', color: COLORS.accentGreen })
        });
        const renderSortIcon = (key, isDayColumn = false) => {
            if (isDayColumn && isMobile) return null; // No sort icon for day columns on mobile
            if (sortConfig.key !== key) return null;
            return sortConfig.direction === 'ascending' ?
                <ArrowUpwardIcon sx={{ fontSize: {xs: '0.8rem', sm: '1rem'}, ml: 0.3, verticalAlign: 'middle', color: COLORS.accentGreen }} /> :
                <ArrowDownwardIcon sx={{ fontSize: {xs: '0.8rem', sm: '1rem'}, ml: 0.3, verticalAlign: 'middle', color: COLORS.accentGreen }} />;
        };
        return (
            <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': { fontWeight: '600', borderBottom: `2px solid ${COLORS.accentGreen}`, color: COLORS.textPrimary, bgcolor: alpha(COLORS.backgroundSubtle, 0.7) } }}>
                    <TableCell sx={{ ...getSortableHeaderStyle('nombre'), minWidth: {xs: 140, sm:180}, position: 'sticky', left: 0, zIndex: 11, bgcolor: alpha(COLORS.backgroundSubtle, 0.9), borderRight: `1px solid ${COLORS.divider}` }} onClick={() => requestSort('nombre')}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>Profesor {renderSortIcon('nombre')}</Box>
                    </TableCell>
                    
                    {!isMobile && diasLaborables.map((diaCompleto) => {
                        const diaKey = `dia_${diaCompleto}_horas`;
                        return (
                            <TableCell key={diaKey} align="center" sx={{...getSortableHeaderStyle(diaKey, true), minWidth: {sm: 100, md: 110} }} onClick={() => !isMobile && requestSort(diaKey)}>
                                <Tooltip title={`${diaCompleto} - Horas`} arrow placement="top">
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ color: 'inherit', fontWeight:'inherit', fontSize: {sm: '0.75rem', md: '0.8rem'} }}>{getDiaAbreviatura(diaCompleto)}</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textSecondary, mt:0.1 }}>
                                            <TimeIcon sx={{ fontSize: {sm: 12}, mr: 0.3 }} />
                                            <Typography variant="caption" sx={{ color: 'inherit', fontSize: {sm: '0.65rem'} }}>Hrs</Typography>
                                            {renderSortIcon(diaKey, true)}
                                        </Box>
                                    </Box>
                                </Tooltip>
                            </TableCell>
                        )
                    })}
                    <TableCell align="center" sx={{ ...getSortableHeaderStyle('totalHoras'), color: COLORS.accentGreen, minWidth: {xs: 70, sm:90, md:100}, px: {xs: 0.5, sm: 1} }} onClick={() => requestSort('totalHoras')}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: {xs: 'column', sm: 'row'} }}>
                           <Typography component="span" sx={{fontSize: {xs:'0.65rem', sm:'inherit'}}}>Total</Typography>
                           <Typography component="span" sx={{ml: {sm:0.5}, fontSize: {xs:'0.65rem', sm:'inherit'}}}>Hrs</Typography>
                           {renderSortIcon('totalHoras')}
                        </Box>
                    </TableCell>
                    <TableCell align="center" sx={{minWidth: {xs: 90, sm: 120, md: 150}, fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' }, py:1, px: {xs:0.5, sm:1}}}>Acciones</TableCell>
                </TableRow>
            </TableHead>
        );
    };

    const visibleColumnsCount = 1 + (isMobile ? 0 : diasLaborables.length) + 1 + 1;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '6px', maxHeight: 'calc(100vh - 300px)', overflow: 'auto', border: `1px solid ${COLORS.divider}`, bgcolor: COLORS.backgroundPaper, '&::-webkit-scrollbar': { width: '8px', height: '8px' }, '&::-webkit-scrollbar-track': { background: COLORS.backgroundDefault }, '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(COLORS.accentGreen, 0.4), borderRadius: '4px', '&:hover': { backgroundColor: alpha(COLORS.accentGreen, 0.6) } } }}>
                <Table stickyHeader aria-label="Tabla de asistencia de profesores" size="small">
                    {renderTableHeader()}
                    <TableBody>
                        {loadingAttendance ? (
                            <TableRow><TableCell colSpan={visibleColumnsCount} align="center" sx={{ py: 4, borderBottom: 'none' }}><CircularProgress size={30} sx={{ color: COLORS.accentGreen, mb: 1 }} /><Typography variant="body2" sx={{color: COLORS.textSecondary}}>Cargando asistencia...</Typography></TableCell></TableRow>
                        ) : sortedData.length > 0 ? (
                            <AnimatePresence initial={false}>
                                {sortedData.map((profesor, index) => {
                                    const profesorId = (profesor.id || profesor._id).toString();
                                    const profesorAttendance = attendanceData[profesorId] || {};
                                    const { totalHoras, totalMonto } = calculateTotalsForWeek(profesorId, profesor.tarifaHora);
                                    const isExpanded = expandedRow === profesorId;
                                    const tarifaState = editingTarifas[profesorId];

                                    return (
                                        <React.Fragment key={profesorId}>
                                            <motion.tr component={TableRow} custom={index} initial="hidden" animate="visible" exit="exit" variants={rowVariants} sx={{ '& > .MuiTableCell-root': { py: {xs:0.3, sm:0.4}, px: {xs:0.5, sm:1, md:1.5}, borderBottom: `1px solid ${COLORS.divider}`, fontSize: {xs:'0.75rem', sm:'0.8rem'} }, '&:hover': { bgcolor: COLORS.backgroundSubtle }, transition: 'background-color 0.15s ease-in-out', bgcolor: COLORS.backgroundPaper }}>
                                                <TableCell component="th" scope="row" sx={{ cursor: 'pointer', position: 'sticky', left: 0, bgcolor: 'inherit', zIndex: 10, borderRight: `1px solid ${COLORS.divider}`, borderLeft: isExpanded ? `3px solid ${COLORS.accentGreen}` : 'none', color: COLORS.textPrimary }} onClick={() => toggleRowExpand(profesorId)}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', py: {xs:0.3, sm:0.5} }}>
                                                        <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} badgeContent={isExpanded ? <ExpandLessIcon sx={{ fontSize: '0.8rem', color: COLORS.accentGreen, bgcolor: alpha(COLORS.accentGreen, 0.15), borderRadius: '50%' }} /> : <ExpandMoreIcon sx={{ fontSize: '0.8rem', color: COLORS.textSecondary }} />}>
                                                            <Avatar sx={{ bgcolor: generateRandomColor(profesor.nombre), mr: 1.2, width: {xs:28, sm:32}, height: {xs:28, sm:32}, fontSize: {xs:'0.7rem', sm:'0.8rem'}, color: COLORS.textPrimary, transition: 'transform 0.15s ease-in-out', transform: isExpanded ? 'scale(1.03)' : 'scale(1)' }}>{getInitials(profesor.nombre)}</Avatar>
                                                        </Badge>
                                                        <Box sx={{minWidth: 0}}>
                                                            <Typography variant="body1" fontWeight="500" noWrap sx={{color: COLORS.textPrimary, fontSize:{xs:'0.8rem', sm:'0.85rem'}}}>{profesor.nombre}</Typography>
                                                            <Typography variant="caption" noWrap sx={{fontSize: {xs:'0.65rem', sm:'0.7rem'}, color: COLORS.textSecondary}}>{ isMobile ? `DNI: ${profesor.dni || 'N/A'}` : (profesor.mail || profesor.telefono || `DNI: ${profesor.dni || 'N/A'}`)}</Typography>
                                                            {!isMobile && profesor.actividad && (<Tooltip title={`${profesor.actividad}`} placement="bottom-start" arrow><Typography variant="caption" noWrap sx={{fontSize: {xs:'0.6rem', sm:'0.65rem'}, display: 'flex', alignItems: 'center', mt: 0.2, fontStyle: 'italic', color: alpha(COLORS.accentGreen, 0.85) }}><ActivityIcon sx={{ fontSize: {xs:'0.7rem', sm:'0.8rem'}, mr: 0.3, opacity: 0.75 }} /> {profesor.actividad}</Typography></Tooltip>)}
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {!isMobile && diasLaborables.map(diaCompleto => (<TableCell key={`${profesorId}_${diaCompleto}_horas`} align="center" sx={{color: COLORS.textPrimary}}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: {xs:0.1, sm:0.2} }}>
                                                        <Tooltip title="Restar media hora" placement="top" arrow><IconButton onClick={() => handleQuickAddHours(profesorId, diaCompleto, -0.5)} size="small" sx={{p:{xs:0.3, sm:0.4}, color: alpha(COLORS.accentGreen, 0.7), '&:hover': {color: COLORS.accentGreenHover, bgcolor: alpha(COLORS.accentGreen, 0.1)} }}><RemoveHourIcon sx={{fontSize:{xs:"1rem", sm:"1.1rem"}}} /></IconButton></Tooltip>
                                                        <TextField type="number" size="small" variant="outlined" value={profesorAttendance[diaCompleto]?.horas ?? 0} onChange={(e) => handleHoursChange(profesorId, diaCompleto, e.target.value)} inputProps={{ min: 0, step: 0.5, style: { textAlign: 'center', padding: '6px 2px', fontSize: '0.8rem' } }} sx={{ width: {xs:'50px', sm:'55px'}, '& .MuiOutlinedInput-root': { height: '30px', borderRadius: '4px', bgcolor: alpha(COLORS.black, 0.03), '& input': { fontWeight: (profesorAttendance[diaCompleto]?.horas || 0) > 0 ? 'bold' : 'normal', color: (profesorAttendance[diaCompleto]?.horas || 0) > 0 ? COLORS.accentGreen : COLORS.textPrimary }, '& fieldset': { borderColor: alpha(COLORS.accentGreen, 0.35) }, '&:hover fieldset': { borderColor: alpha(COLORS.accentGreen, 0.6) }, '&.Mui-focused fieldset': { borderColor: COLORS.accentGreen }, } }} />
                                                        <Tooltip title="Sumar media hora" placement="top" arrow><IconButton onClick={() => handleQuickAddHours(profesorId, diaCompleto, 0.5)} size="small" sx={{p:{xs:0.3, sm:0.4}, color: alpha(COLORS.accentGreen, 0.7), '&:hover': {color: COLORS.accentGreenHover, bgcolor: alpha(COLORS.accentGreen, 0.1)} }}><AddHourIcon sx={{fontSize:{xs:"1rem", sm:"1.1rem"}}} /></IconButton></Tooltip>
                                                    </Box>
                                                </TableCell>))}
                                                
                                                <TableCell align="center" sx={{ fontWeight: '500' }}><Chip icon={<TimeIcon sx={{fontSize: '0.8rem', color: totalHoras > 0 ? COLORS.accentGreen : COLORS.greyInactive}}/>} label={`${totalHoras} Hrs`} variant="outlined" size="small" sx={{ fontWeight: '500', fontSize: {xs: '0.65rem', sm:'0.7rem'}, height:'22px', borderColor: totalHoras > 0 ? alpha(COLORS.accentGreen, 0.7) : COLORS.divider, color: totalHoras > 0 ? COLORS.accentGreen : COLORS.textSecondary, bgcolor: totalHoras > 0 ? alpha(COLORS.accentGreen, 0.08) : 'transparent', px: {xs:0.5, sm:1} }} /></TableCell>
                                                
                                                <TableCell align="center">
                                                    <Stack 
                                                      direction={{xs: 'column', sm: 'row'}} 
                                                      spacing={{xs:0.2, sm:0.2}} // Reducir spacing en xs si es necesario
                                                      justifyContent="center" 
                                                      alignItems="center"
                                                    >
                                                        <Tooltip title="Ver historial de pagos" arrow><IconButton onClick={() => onVerHistorialPagos(profesor)} sx={{p:0.5, color: COLORS.textSecondary, '&:hover': { bgcolor: alpha(COLORS.accentGreen, 0.08), color: COLORS.accentGreen } }}><HistoryIcon sx={{fontSize:{xs:"0.9rem", sm:"1.1rem"}}} /></IconButton></Tooltip>
                                                        <Tooltip title="Registrar pago" arrow><span><IconButton onClick={() => onRegistrarPagoSemana(profesorId)} sx={{p:0.5, color: totalHoras > 0 ? COLORS.accentGreen : COLORS.greyInactive, '&:hover': { bgcolor: totalHoras > 0 ? alpha(COLORS.accentGreen, 0.08) : undefined }, '&.Mui-disabled': {color: COLORS.greyInactive} }} disabled={loadingPagoSemana || totalHoras === 0}><PaymentIcon sx={{fontSize:{xs:"0.9rem", sm:"1.1rem"}}} /> </IconButton></span></Tooltip>
                                                        <Tooltip title="Editar profesor" arrow><IconButton onClick={() => handleEdit(profesor)} sx={{p:0.5, color: COLORS.textSecondary, '&:hover': { bgcolor: alpha(COLORS.accentGreen, 0.08), color: COLORS.accentGreenHover } }}><EditIcon sx={{fontSize:{xs:"0.9rem", sm:"1.1rem"}}} /></IconButton></Tooltip>
                                                        <Tooltip title="Eliminar profesor" arrow><IconButton onClick={() => handleDelete(profesorId, profesor.nombre)} sx={{p:0.5, color: COLORS.errorMain, '&:hover': { bgcolor: alpha(COLORS.errorMain, 0.08), color: COLORS.errorMain } }}><DeleteIcon sx={{fontSize:{xs:"0.9rem", sm:"1.1rem"}}} /></IconButton></Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </motion.tr>
                                            
                                            <TableRow sx={{bgcolor: COLORS.backgroundPaper}}>
                                                <TableCell colSpan={visibleColumnsCount} sx={{ p: 0, borderBottom: isExpanded ? `1px solid ${COLORS.divider}` : 'none', transition: 'padding 0.3s ease-in-out' }}>
                                                    <Collapse in={isExpanded} timeout={ {enter: 300, exit: 150} } unmountOnExit>
                                                        <Zoom in={isExpanded} style={{ transitionDelay: isExpanded ? '50ms' : '0ms' }}>
                                                            <Card elevation={0} sx={{ m: {xs:0.2, sm:0.5}, p: {xs:1, sm:1.5}, bgcolor: COLORS.backgroundSubtle, borderRadius: '4px', border: `1px solid ${alpha(COLORS.divider, 0.7)}` }}>
                                                                <Typography variant="subtitle1" fontWeight="500" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: COLORS.textPrimary, mb: 1.5, fontSize:{xs:'0.8rem', sm:'0.9rem'} }}>
                                                                    <AssessmentIcon sx={{mr:0.8, color: COLORS.accentGreen, fontSize:{xs:'1rem', sm:'1.2rem'}}}/>Resumen: <Typography component="span" fontWeight="bold" sx={{color: COLORS.accentGreen, ml: 0.5, fontSize:{xs:'0.8rem', sm:'0.9rem'}}}>{profesor.nombre}</Typography>
                                                                </Typography>
                                                                
                                                                {profesor.actividad && ( <Typography variant="body2" sx={{mb:1, display: 'flex', alignItems: 'center', color: COLORS.textSecondary, fontSize:{xs:'0.75rem', sm:'0.8rem'}}}> <ActivityIcon sx={{mr:0.6, fontSize:'1rem', opacity:0.75, color: alpha(COLORS.accentGreen, 0.75) }}/><strong>Actividad:</strong>&nbsp;{profesor.actividad}</Typography>)}

                                                                {/* INPUTS DE HORAS DIARIAS PARA MOBILE */}
                                                                {isMobile && (
                                                                    <Box sx={{mt: 2, mb: 1.5, p:1, border: `1px dashed ${alpha(COLORS.accentGreen,0.3)}`, borderRadius:1}}>
                                                                        <Typography variant="subtitle2" sx={{mb:1, color: COLORS.textPrimary, fontSize: '0.85rem'}}>Horas de la Semana:</Typography>
                                                                        <Grid container spacing={{xs:1, sm:1.5}}>
                                                                            {diasLaborables.map(diaCompleto => (
                                                                                <Grid item xs={6} sm={4} key={`${profesorId}_expanded_${diaCompleto}`}>
                                                                                    <Typography variant="caption" display="block" sx={{color: COLORS.textSecondary, fontSize: '0.7rem', mb:0.2}}>{diaCompleto}:</Typography>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 0.5 }}>
                                                                                        <Tooltip title="Restar media hora"><IconButton onClick={() => handleQuickAddHours(profesorId, diaCompleto, -0.5)} size="small" sx={{p:0.3, color: alpha(COLORS.accentGreen, 0.8), '&:hover': {color: COLORS.accentGreenHover, bgcolor: alpha(COLORS.accentGreen, 0.1)} }}><RemoveHourIcon fontSize="small"/></IconButton></Tooltip>
                                                                                        <TextField
                                                                                            type="number" size="small" variant="outlined"
                                                                                            value={profesorAttendance[diaCompleto]?.horas ?? 0}
                                                                                            onChange={(e) => handleHoursChange(profesorId, diaCompleto, e.target.value)}
                                                                                            inputProps={{ min: 0, step: 0.5, style: { textAlign: 'center', padding: '6px 4px', fontSize: '0.8rem' } }}
                                                                                            sx={{ width: '60px', '& .MuiOutlinedInput-root': { height: '30px', bgcolor: COLORS.backgroundPaper } }}
                                                                                        />
                                                                                        <Tooltip title="Sumar media hora"><IconButton onClick={() => handleQuickAddHours(profesorId, diaCompleto, 0.5)} size="small" sx={{p:0.3, color: alpha(COLORS.accentGreen, 0.8), '&:hover': {color: COLORS.accentGreenHover, bgcolor: alpha(COLORS.accentGreen, 0.1)} }}><AddHourIcon fontSize="small"/></IconButton></Tooltip>
                                                                                    </Box>
                                                                                </Grid>
                                                                            ))}
                                                                        </Grid>
                                                                    </Box>
                                                                )}
                                                                
                                                                <Grid container spacing={{xs:1, sm:1.5}} alignItems="flex-start" sx={{mt: isMobile ? 1 : 0}}>
                                                                    <Grid item xs={12} sm={6} md={isMobile ? 6 : 3}>
                                                                        <Typography variant="caption" sx={{color: COLORS.textSecondary, fontSize:{xs:'0.65rem', sm:'0.7rem'}}}>Total Horas:</Typography>
                                                                        <Typography variant="h6" fontWeight="bold" sx={{color: COLORS.accentGreen, fontSize:{xs:'1rem', sm:'1.1rem'}}}>{totalHoras} hrs</Typography>
                                                                    </Grid>
                                                                    <Grid item xs={12} sm={6} md={isMobile ? 6 : 3}>
                                                                        <Typography variant="caption" sx={{color: COLORS.textSecondary, fontSize:{xs:'0.65rem', sm:'0.7rem'}}}>Monto a Pagar:</Typography>
                                                                        <Typography variant="h6" fontWeight="bold" sx={{color: COLORS.accentGreen, fontSize:{xs:'1rem', sm:'1.1rem'}}}>${totalMonto.toFixed(2)}</Typography>
                                                                    </Grid>

                                                                    <Grid item xs={12} sm={6} md={isMobile ? 12 : 3}>
                                                                        <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: {xs:'0.65rem', sm:'0.7rem'}, display: 'flex', alignItems: 'center', mb: 0.2 }}>
                                                                            <TarifaIcon sx={{ fontSize: {xs:'0.8rem', sm:'0.9rem'}, mr: 0.5, color: alpha(COLORS.accentGreen,0.8) }}/> Valor Hora:
                                                                        </Typography>
                                                                        {!tarifaState && onUpdateTarifaHora ? (
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', minHeight:'30px' }}>
                                                                                <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.accentGreen, fontSize: {xs:'1rem', sm:'1.1rem'}, mr: 0.5 }}>
                                                                                    ${(profesor.tarifaHora !== undefined && profesor.tarifaHora !== null ? profesor.tarifaHora : 0).toFixed(2)}
                                                                                </Typography>
                                                                                <Tooltip title="Editar valor hora">
                                                                                    <IconButton size="small" onClick={() => handleEditTarifaClick(profesorId, profesor.tarifaHora)} sx={{ p:0.3, color: COLORS.textSecondary, '&:hover': { color: COLORS.accentGreen, bgcolor: alpha(COLORS.accentGreen, 0.08) } }}>
                                                                                        <EditIcon sx={{ fontSize: {xs:'0.9rem', sm:'1rem'} }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </Box>
                                                                        ) : tarifaState ? (
                                                                            <Box sx={{ mt: 0.1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                                                                                <TextField
                                                                                    type="number" size="small" variant="outlined"
                                                                                    disabled={tarifaState.guardando}
                                                                                    value={tarifaState.valor}
                                                                                    onChange={(e) => handleTarifaInputChange(profesorId, e.target.value)}
                                                                                    error={!!tarifaState.error}
                                                                                    helperText={tarifaState.error}
                                                                                    FormHelperTextProps={{sx: {fontSize: '0.6rem', mx: 0, whiteSpace: 'normal'}}}
                                                                                    inputProps={{ min: 0, step: 0.01, style: { padding: '7px 5px', fontSize: {xs:'0.8rem', sm:'0.85rem'} } }}
                                                                                    sx={{ width: '90px', '& .MuiOutlinedInput-root': { height: '30px', borderRadius: '4px', bgcolor: alpha(COLORS.black, 0.04), '& input': { color: COLORS.accentGreen, fontWeight: 'bold' }, '& fieldset': { borderColor: tarifaState.error ? COLORS.errorMain : alpha(COLORS.accentGreen, 0.5) }, '&:hover fieldset': { borderColor: tarifaState.error ? COLORS.errorMain :alpha(COLORS.accentGreen, 0.8) }, '&.Mui-focused fieldset': { borderColor: tarifaState.error ? COLORS.errorMain :COLORS.accentGreen }}}}
                                                                                />
                                                                                <Tooltip title="Guardar Tarifa"><span>
                                                                                    <IconButton size="small" onClick={() => handleSaveTarifa(profesorId)} disabled={tarifaState.guardando} sx={{ p:0.3, color: COLORS.accentGreen, '&:hover': { bgcolor: alpha(COLORS.accentGreen, 0.1) }, '&.Mui-disabled': { color: COLORS.greyInactive} }}>
                                                                                        {tarifaState.guardando ? <CircularProgress size={14} color="inherit" /> : <SaveIcon sx={{ fontSize: {xs:'0.9rem', sm:'1rem'} }} />}
                                                                                    </IconButton>
                                                                                </span></Tooltip>
                                                                                <Tooltip title="Cancelar"><span>
                                                                                    <IconButton size="small" onClick={() => handleCancelEditTarifa(profesorId)} disabled={tarifaState.guardando} sx={{ p:0.3, color: COLORS.errorMain, '&:hover': { bgcolor: alpha(COLORS.errorMain, 0.1) } }}>
                                                                                        <CancelIcon sx={{ fontSize: {xs:'0.9rem', sm:'1rem'} }} />
                                                                                    </IconButton>
                                                                                </span></Tooltip>
                                                                            </Box>
                                                                        ) : ( // Si onUpdateTarifaHora no está definida o no hay tarifaState
                                                                            <Typography variant="h6" fontWeight="bold" sx={{ color: COLORS.accentGreen, fontSize: {xs:'1rem', sm:'1.1rem'}, minHeight:'30px', display:'flex', alignItems:'center' }}>
                                                                                ${(profesor.tarifaHora !== undefined && profesor.tarifaHora !== null ? profesor.tarifaHora : 0).toFixed(2)}
                                                                            </Typography>
                                                                        )}
                                                                    </Grid>
                                                                    <Grid item xs={12} md={isMobile ? 12 : 3} sx={{display: 'flex', alignItems: 'flex-end', justifyContent: {xs: 'flex-start', sm: 'flex-start', md:'flex-end'}, mt: {xs: 1, md: 0}}}>
                                                                        <Button variant="outlined" size="small" onClick={() => onVerHistorialPagos(profesor)} startIcon={<HistoryIcon sx={{fontSize:'1rem'}}/>} sx={{ fontSize:{xs:'0.65rem', sm:'0.7rem'}, py:0.3, px:1, color: COLORS.accentGreen, borderColor: alpha(COLORS.accentGreen, 0.5), '&:hover': { borderColor: COLORS.accentGreen, bgcolor: alpha(COLORS.accentGreen, 0.08) }, textTransform: 'none' }}>Historial Pagos</Button>
                                                                    </Grid>
                                                                </Grid>
                                                                {totalHoras > 0 && ( <Box sx={{mt: 1.5}}> <Typography variant="caption" sx={{color: COLORS.textSecondary, fontSize:{xs:'0.65rem', sm:'0.7rem'}}}>Progreso semanal (ref. 40hs):</Typography><LinearProgress variant="determinate" value={Math.min((totalHoras / 40) * 100, 100)} sx={{height: 6, borderRadius: 3, bgcolor: alpha(COLORS.accentGreen, 0.2), '& .MuiLinearProgress-bar': {bgcolor: COLORS.accentGreen}}} /></Box> )}
                                                            </Card>
                                                        </Zoom>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })}
                            </AnimatePresence>
                        ) : ( <TableRow><TableCell colSpan={visibleColumnsCount} align="center" sx={{ py: {xs:4, sm:6}, borderBottom: 'none' }}><Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}><SearchIcon sx={{ fontSize: {xs:32, sm:40}, color: COLORS.greyInactive }} /><Typography variant="subtitle1" sx={{color: COLORS.textSecondary, fontSize:{xs:'0.8rem', sm:'0.9rem'}}}>No se encontraron profesores que coincidan con la búsqueda.</Typography></Box></TableCell></TableRow> )}
                    </TableBody>
                </Table>
            </TableContainer>
        </motion.div>
    );
};

export default EnhancedAttendanceTable;