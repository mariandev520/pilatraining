// src/components/profesor/ProfesorForm.jsx
import { Grid, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import styles from './profesor.module.css';

export default function ProfesorForm({ form, isEditing, isLoading, actividades, onChange, onSubmit, onCancel }) {
    return (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Box component="form" onSubmit={onSubmit} className={styles.formCard}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    {isEditing ? 'Editar Profesor' : 'Nuevo Profesor'}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}><TextField fullWidth name="nombre" label="Nombre completo" value={form.nombre} onChange={onChange} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth name="dni" label="DNI" type="number" value={form.dni} onChange={onChange} required /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth name="telefono" label="Teléfono" type="tel" value={form.telefono} onChange={onChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth name="mail" label="Correo" type="email" value={form.mail} onChange={onChange} /></Grid>
                    <Grid item xs={12} sm={6}><TextField fullWidth name="tarifaPorHora" label="Tarifa por Hora ($)" type="number" value={form.tarifaPorHora} onChange={onChange} placeholder="Ej: 2500.50" /></Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Actividad Principal</InputLabel>
                            <Select name="actividad" value={form.actividad} onChange={onChange} label="Actividad Principal">
                                <MenuItem value=""><em>Ninguna</em></MenuItem>
                                {actividades.map(act => (<MenuItem key={act._id} value={act.nombre}>{act.nombre}</MenuItem>))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}><TextField fullWidth name="domicilio" label="Domicilio" value={form.domicilio} onChange={onChange} /></Grid>
                    <Grid item xs={12} sx={{ textAlign: 'right', mt: 1 }}>
                        <Button variant="outlined" onClick={onCancel} sx={{ mr: 1 }} disabled={isLoading}>Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : (isEditing ? <EditIcon /> : <AddIcon />)}>
                            {isEditing ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </motion.div>
    );
}