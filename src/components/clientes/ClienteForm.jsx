import { Paper, Grid, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem, Chip, Tooltip, Box, CircularProgress } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import styles from '../../pages/clientes.module.css'; // Usamos el mismo CSS Module

const DIAS_SEMANA_OPTIONS = [
  { id: 1, nombre: "Lun", abrev: "L" }, // Ajustado para ser más estándar
  // ... resto de días
];

export default function ClienteForm({
  formState,
  isEditing,
  isLoading,
  profesores,
  onFieldChange,
  onActivityChange,
  onDiaVisitaChange,
  onSubmit,
  onCancel,
}) {
  const pilatesActivity = formState.actividades[0];

  return (
    <Paper elevation={3} className={styles.formPaper}>
      <form onSubmit={onSubmit} noValidate>
        <Grid container spacing={2}>
          {/* ... Campos del formulario (DNI, Nombre, etc) usando los `value` de `formState` y los `onChange` de las props ... */}
          {/* Ejemplo de un campo */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="DNI"
              name="dni"
              value={formState.dni}
              onChange={onFieldChange}
              fullWidth
              required
              disabled={isEditing}
              helperText={isEditing ? "No se puede modificar el DNI" : ""}
              variant="outlined"
              size="small"
            />
          </Grid>
          {/* ... Repetir para todos los campos de texto ... */}

          {/* Detalles de Pilates */}
          <Grid item xs={12} className={styles.pilatesDetailsSection}>
            <Typography variant="h6" gutterBottom><FitnessCenterIcon sx={{ mr: 1 }} /> Detalles de Pilates</Typography>
            <Paper variant="outlined" className={styles.pilatesDetailsPaper}>
              <Grid container spacing={2} alignItems="center">
                {/* ... Campos de la actividad (Tarifa, Clases, etc) ... */}
                {/* Ejemplo del select de profesor */}
                 <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Profesor</InputLabel>
                    <Select
                      name="profesor"
                      value={pilatesActivity.profesor || ""}
                      label="Profesor"
                      onChange={onActivityChange}
                    >
                      <MenuItem value="">-- Seleccione --</MenuItem>
                      {profesores.map((prof) => (
                        <MenuItem key={prof._id} value={prof.nombre}>{prof.nombre}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {/* ... Días de visita con Chip y Tooltip ... */}
              </Grid>
            </Paper>
          </Grid>

          {/* Acciones */}
          <Grid item xs={12} className={styles.formActions}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ mr: 2 }}
            >
              {isLoading ? "Guardando..." : isEditing ? "Actualizar" : "Guardar"}
            </Button>
            <Button variant="outlined" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}