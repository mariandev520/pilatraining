// src/components/jumping/JumpingGrid.jsx
import React from 'react';
import { Paper, Box, Tabs, Tab, Grid, Typography, Card, CardContent, Avatar, Chip, Tooltip, IconButton } from '@mui/material';
import { Schedule as ScheduleIcon, Bed as BedIcon, Delete as DeleteIcon, Event as EventIcon } from '@mui/icons-material';
import styles from './jumping.module.css';

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const HORARIOS = ['8:00', '9:30', '11:00', '16:00', '17:30', '19:00'];

const CamaIndividual = ({ numero, cliente, onClick, onRemove }) => (
    <Card className={styles.camaCard} sx={{ border: cliente ? `2px solid ${cliente.color}` : '2px dashed #e0e0e0', bgcolor: cliente ? `rgba(${cliente.color.match(/\d+/g).join(',')}, 0.08)` : '#fff' }}>
        <Box className={styles.camaNumber} sx={{ bgcolor: cliente ? cliente.color : '#9e9e9e' }}>{numero}</Box>
        <CardContent className={styles.camaContent} onClick={onClick}>
            {cliente ? (
                <>
                    <Avatar className={styles.camaAvatar} sx={{ bgcolor: cliente.color }}>{cliente.nombre?.split(' ').map(n=>n[0]).join('')}</Avatar>
                    <Typography variant="body2" fontWeight="600" align="center" noWrap>{cliente.nombre}</Typography>
                    <Typography variant="caption" color="textSecondary" noWrap>DNI: {cliente.dni}</Typography>
                    <Chip label={`Clases: ${cliente.clasesPendientes ?? 0}`} size="small" sx={{ mt: 1 }} />
                </>
            ) : (
                <>
                    <BedIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                    <Typography variant="body2" align="center">Jump libre</Typography>
                </>
            )}
        </CardContent>
        {cliente && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1.5 }}>
                <Tooltip title="Quitar" arrow><IconButton size="small" onClick={onRemove} className={styles.deleteButton}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
            </Box>
        )}
    </Card>
);

export default function JumpingGrid({ diaSeleccionado, onDiaChange, camasAsignadas, onCamaClick, onRemoveCliente }) {
    return (
        <Paper className={styles.gridPaper}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={diaSeleccionado} onChange={onDiaChange} variant="scrollable" scrollButtons="auto">
                    {DIAS_SEMANA.map(dia => (
                        <Tab key={dia} label={dia} value={dia} icon={<EventIcon />} iconPosition="start" />
                    ))}
                </Tabs>
            </Box>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {HORARIOS.map(horario => (
                    <Box key={horario} sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="600" className={styles.scheduleHeader}>
                            <ScheduleIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> {horario}
                        </Typography>
                        <Grid container spacing={2} className={styles.scheduleGrid}>
                            {[1, 2, 3, 4, 5, 6, 7].map(numCama => {
                                const camaClave = `${diaSeleccionado}-${horario}-Cama ${numCama}`;
                                return (
                                    <Grid item xs={6} sm={4} md={3} key={numCama}>
                                        <CamaIndividual
                                            numero={numCama}
                                            cliente={camasAsignadas[camaClave]}
                                            onClick={() => onCamaClick(camaClave)}
                                            onRemove={() => onRemoveCliente(camaClave)}
                                        />
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}