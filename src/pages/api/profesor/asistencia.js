// Archivo: /pages/api/profesor/asistencia.js
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    const profesoresCollection = db.collection('profesor');
    const asistenciaCollection = db.collection('asistencia');

    // GET - Obtener datos de asistencia para una semana específica
    if (req.method === 'GET') {
      const { semana } = req.query;
      
      if (!semana) {
        return res.status(400).json({ message: 'El parámetro semana es requerido' });
      }
      
      // Obtener todos los profesores
      const profesores = await profesoresCollection.find({}).toArray();
      
      // Obtener registros de asistencia para la semana
      const asistencia = await asistenciaCollection.find({ 
        semana: parseInt(semana) 
      }).toArray();
      
      // Formatear datos para el frontend
      const asistenciaData = {};
      
      asistencia.forEach(item => {
        asistenciaData[item.profesorId] = {
          Lunes: { horas: 0, monto: 0 },
          Martes: { horas: 0, monto: 0 },
          Miércoles: { horas: 0, monto: 0 },
          Jueves: { horas: 0, monto: 0 },
          Viernes: { horas: 0, monto: 0 },
          Sábado: { horas: 0, monto: 0 },
          Domingo: { horas: 0, monto: 0 },
          ...item.dias // Sobrescribe con datos actuales
        };
      });
      
      return res.status(200).json(asistenciaData);
    }
    
    // POST - Crear/actualizar asistencia para un profesor
    if (req.method === 'POST') {
      const { semana, profesorId, dias } = req.body;
      
      if (!semana || !profesorId || !dias) {
        return res.status(400).json({ message: 'Datos incompletos para registrar asistencia' });
      }
      
      // Verificar si ya existe un registro
      const existingRecord = await asistenciaCollection.findOne({
        semana: parseInt(semana),
        profesorId: profesorId
      });
      
      if (existingRecord) {
        // Actualizar registro existente
        const result = await asistenciaCollection.updateOne(
          { _id: existingRecord._id },
          { $set: { dias: dias } }
        );
        
        return res.status(200).json({ 
          message: 'Asistencia actualizada con éxito',
          id: existingRecord._id
        });
      } else {
        // Crear nuevo registro
        const result = await asistenciaCollection.insertOne({
          semana: parseInt(semana),
          profesorId: profesorId,
          dias: dias,
          createdAt: new Date()
        });
        
        return res.status(201).json({ 
          message: 'Asistencia registrada con éxito',
          id: result.insertedId
        });
      }
    }
    
    // Si llegamos aquí, es un método no soportado
    res.status(405).json({ message: 'Método no permitido' });
  } catch (error) {
    console.error("❌ Error en la API de Asistencia:", error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}