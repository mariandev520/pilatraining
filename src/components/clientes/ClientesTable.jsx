import { Table, TableHead, TableBody, TableCell, TableContainer, TableRow, Paper, IconButton, Tooltip, Box, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from '../../pages/clientes.module.css';

const formatDate = (dateString) => { /* ... misma función de antes ... */ };
const isFechaVencida = (dateString) => { /* ... misma función de antes ... */ };

export default function ClientesTable({ clientes, onEdit, onDelete, isMobile }) {
  return (
    <TableContainer component={Paper} elevation={2} className={styles.tableContainer}>
      <Table size="small">
        <TableHead className={styles.tableHeader}>
          <TableRow>
            <TableCell className={styles.tableHeaderCell}>Nombre</TableCell>
            {/* ... otros headers ... */}
            <TableCell align="center" className={styles.tableHeaderCell}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente._id} hover className={styles.tableRowOdd}>
              <TableCell sx={{ fontWeight: 'medium' }}>{cliente.nombre}</TableCell>
              {/* ... otras celdas ... */}
              <TableCell align="center">
                <Box display="flex" justifyContent="center">
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => onEdit(cliente)} size="small" className={`${styles.actionButton} ${styles.editButton}`}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" onClick={() => onDelete(cliente._id)} size="small" className={`${styles.actionButton} ${styles.deleteButton}`}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}