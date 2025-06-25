// src/pages/profesor.js
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Container, Box, Typography, Button, CircularProgress, Snackbar, Alert, Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Importaciones de los nuevos componentes
import ProfesorForm from '../components/profesor/ProfesorForm';
import AttendanceTable from '../components/profesor/AttendanceTable';
import styles from '../components/profesor/profesor.module.css';

// El getServerSideProps permanece igual
export async function getServerSideProps() {
    // ...
}

export default function ProfesorPage({ data = [], actividadesServer = [] }) {
    const router = useRouter();
    const [form, setForm] = useState({ nombre: '', telefono: '', mail: '', domicilio: '', dni: '', actividad: '', tarifaPorHora: '', id: null });
    const [profesores, setProfesores] = useState(data);
    const [actividades, setActividades] = useState(actividadesServer);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [attendanceData, setAttendanceData] = useState({}); // Nuevo estado para la asistencia

    // Lógica para manejar cambios en el formulario
    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    // Lógica para abrir/cerrar el formulario
    const toggleExpand = () => {
        if (expanded && isEditing) {
            setForm({ nombre: '', telefono: '', mail: '', domicilio: '', dni: '', actividad: '', tarifaPorHora: '', id: null });
            setIsEditing(false);
        }
        setExpanded(!expanded);
    };

    const handleEdit = (profesor) => {
        setForm({
            nombre: profesor.nombre || '',
            telefono: profesor.telefono || '',
            mail: profesor.mail || '',
            domicilio: profesor.domicilio || '',
            dni: profesor.dni || '',
            actividad: profesor.actividad || '',
            tarifaPorHora: profesor.tarifaPorHora?.toString() || '',
            id: profesor._id
        });
        setIsEditing(true);
        setExpanded(true);
    };

    // Lógica para enviar el formulario (crear/actualizar)
    const handleSubmit = async (e) => {
        // ... (Tu lógica de handleSubmit existente, pero usando los nuevos estados)
    };

    // Lógica para eliminar un profesor
    const handleDelete = async (id, nombre) => {
        // ... (Tu lógica de handleDelete existente, pero usando los nuevos estados)
    };
    
    // Lógica para manejar cambios en la tabla de asistencia
    const handleHoursChange = (profesorId, day, value) => {
        setAttendanceData(prev => ({
            ...prev,
            [profesorId]: {
                ...(prev[profesorId] || {}),
                [day]: { horas: value }
            }
        }));
    };

    return (
        <Container maxWidth="xl" className={styles.pageContainer}>
            <Box className={styles.header}>
                <Typography variant="h4" className={styles.headerTitle}>
                    <SchoolIcon fontSize="large" /> Gestión de Profesores
                </Typography>
                <Button variant="contained" startIcon={expanded ? <ExpandLessIcon /> : <AddIcon />} onClick={toggleExpand}>
                    {expanded ? 'Ocultar Formulario' : 'Agregar Profesor'}
                </Button>
            </Box>

            <Collapse in={expanded}>
                <ProfesorForm
                    form={form}
                    isEditing={isEditing}
                    isLoading={loading}
                    actividades={actividades}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={toggleExpand}
                />
            </Collapse>

            {/* Aquí irían los otros componentes como WeekSelector y la tabla */}
            <AttendanceTable
                data={profesores}
                attendanceData={attendanceData}
                onHoursChange={handleHoursChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
                // Pasa las otras funciones necesarias...
            />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}