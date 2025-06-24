// src/components/jumping/ClientList.jsx
import React from 'react';
import { Paper, Typography, Box, Chip, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, CircularProgress } from '@mui/material';
import { Person as PersonIcon, Save as SaveIcon, Clear as ClearIcon, Info as InfoIcon, ArrowRightAlt as ArrowRightAltIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import styles from './jumping.module.css';

const ClienteItem = React.memo(({ cliente, seleccionado, onClick }) => (
    <ListItem button onClick={() => onClick(cliente)} selected={seleccionado} className={styles.clientListItem}>
        <ListItemAvatar>
            <Avatar sx={{ bgcolor: cliente.color, width: 38, height: 38 }}><PersonIcon fontSize='small' /></Avatar>
        </ListItemAvatar>
        <ListItemText
            primary={<Typography noWrap variant="body2" fontWeight={seleccionado ? '600' : '500'}>{cliente.nombre}</Typography>}
            secondary={`Clases: ${cliente.clasesPendientes ?? 0}`}
        />
        {seleccionado && <ArrowRightAltIcon sx={{ color: cliente.color }}/>}
    </ListItem>
));

export default function ClientList({
    clientes,
    clienteSeleccionado,
    onSelectCliente,
    isModificado,
    isLoading,
    onSave,
    onClearDay,
}) {
    return (
        <Paper className={styles.clientListPaper}>
            <Typography variant="h5" className={styles.clientListHeader}>
                <PersonIcon sx={{ color: 'var(--jumping-primary)', mr: 1.5 }} />
                Clientes Jumping
                <Chip label={clientes.length} size="small" className={styles.clientListChip} />
            </Typography>

            {clienteSeleccionado && (
                <Alert severity="success" icon={<CheckCircleIcon fontSize='small'/>}>
                    <strong>Seleccionado:</strong> {clienteSeleccionado.nombre}
                </Alert>
            )}

            <Box className={styles.clientListContainer}>
                <List dense>
                    {clientes.map((cliente) => (
                        <ClienteItem
                            key={cliente.id}
                            cliente={cliente}
                            seleccionado={clienteSeleccionado?.id === cliente.id}
                            onClick={onSelectCliente}
                        />
                    ))}
                </List>
            </Box>

            <Box className={styles.clientListActions}>
                <Button fullWidth variant="contained" color="primary" onClick={onSave} disabled={!isModificado || isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} className={styles.saveButton}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
                {isModificado && (
                    <Typography variant="caption" className={styles.unsavedChangesText}>
                        <InfoIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                        Cambios sin guardar
                    </Typography>
                )}
                <Button fullWidth variant="outlined" color="error" startIcon={<ClearIcon />} onClick={onClearDay} sx={{ mt: 2 }}>
                    Limpiar día
                </Button>
            </Box>
        </Paper>
    );
}