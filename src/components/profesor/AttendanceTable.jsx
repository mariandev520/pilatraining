// src/components/profesor/AttendanceTable.jsx
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Avatar, Typography, Box, Tooltip, Collapse, Card, CardContent } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, History as HistoryIcon, Payment as PaymentIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import styles from './profesor.module.css';

const getInitials = (name) => name ? name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase() : '??';
const generateRandomColor = (seed) => `hsl(${seed.split('').reduce((a,c) => a + c.charCodeAt(0), 0) % 360}, 45%, 80%)`;

const AttendanceRow = ({ profesor, attendanceData, onHoursChange, onEdit, onDelete, onVerHistorial, onRegistrarPago }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const diasLaborables = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    return (
        <>
            <TableRow hover className={styles.rowHover}>
                <TableCell className={styles.stickyColumn} onClick={() => setIsExpanded(!isExpanded)} sx={{cursor: 'pointer'}}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: generateRandomColor(profesor.nombre), mr: 1.5, width: 36, height: 36 }}>{getInitials(profesor.nombre)}</Avatar>
                        <Box>
                            <Typography variant="body1" fontWeight="500">{profesor.nombre}</Typography>
                            <Typography variant="caption" color="text.secondary">{profesor.actividad || 'Sin actividad'}</Typography>
                        </Box>
                        <IconButton size="small" sx={{ ml: 1 }}>{isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
                    </Box>
                </TableCell>
                {diasLaborables.map(dia => (
                    <TableCell key={dia} align="center">
                        <input
                            type="number"
                            value={attendanceData?.[dia]?.horas || 0}
                            onChange={(e) => onHoursChange(profesor._id, dia, e.target.value)}
                            style={{ width: '60px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px', padding: '4px' }}
                            min="0"
                            step="0.5"
                        />
                    </TableCell>
                ))}
                <TableCell align="center">
                    <Tooltip title="Ver historial de pagos"><IconButton onClick={() => onVerHistorial(profesor)}><HistoryIcon /></IconButton></Tooltip>
                    <Tooltip title="Registrar pago"><IconButton onClick={() => onRegistrarPago(profesor._id)}><PaymentIcon /></IconButton></Tooltip>
                    <Tooltip title="Editar profesor"><IconButton onClick={() => onEdit(profesor)}><EditIcon /></IconButton></Tooltip>
                    <Tooltip title="Eliminar profesor"><IconButton color="error" onClick={() => onDelete(profesor._id, profesor.nombre)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <Card sx={{ m: 1, boxShadow: 'none', bgcolor: '#f7f9fc' }}>
                            <CardContent>
                                <Typography variant="body2">Información adicional para {profesor.nombre}.</Typography>
                            </CardContent>
                        </Card>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};

export default function AttendanceTable({ data, attendanceData, onHoursChange, onEdit, onDelete, onVerHistorial, onRegistrarPago }) {
    return (
        <TableContainer component={Paper} className={styles.attendanceTableContainer}>
            <Table stickyHeader size="small">
                <TableHead className={styles.tableHeader}>
                    <TableRow>
                        <TableCell className={`${styles.stickyColumn} ${styles.tableHeaderCell}`}>Profesor</TableCell>
                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(dia => (
                            <TableCell key={dia} align="center" className={styles.tableHeaderCell}>{dia}</TableCell>
                        ))}
                        <TableCell align="center" className={styles.tableHeaderCell}>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map(profesor => (
                        <AttendanceRow
                            key={profesor._id}
                            profesor={profesor}
                            attendanceData={attendanceData[profesor._id]}
                            onHoursChange={onHoursChange}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onVerHistorial={onVerHistorial}
                            onRegistrarPago={onRegistrarPago}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}