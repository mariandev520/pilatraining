// pages/api/profesor/asistencia/bulk.js
import clientPromise from '@/lib/mongodb'; // Ajusta la ruta
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const client = await clientPromise;
            const db = client.db('baseprueba');
            const asistenciaCollection = db.collection('asistencia');
            const updatesPayload = req.body; // Array de { semana, profesorId, dias }

            if (!Array.isArray(updatesPayload)) {
                return res.status(400).json({ message: 'El payload debe ser un array.' });
            }

            const bulkOps = updatesPayload.map(item => {
                const diasParaGuardar = {};
                // Asegurar que solo se guardan horas
                for (const diaNombre in item.dias) {
                    diasParaGuardar[diaNombre] = { horas: item.dias[diaNombre]?.horas || 0 };
                }
                return {
                    updateOne: {
                        filter: { semana: parseInt(item.semana), profesorId: item.profesorId.toString() },
                        update: { $set: { dias: diasParaGuardar, updatedAt: new Date() } },
                        upsert: true,
                    },
                };
            });

            if (bulkOps.length === 0) {
                return res.status(200).json({ message: 'No hay datos de asistencia para guardar.' });
            }

            const result = await asistenciaCollection.bulkWrite(bulkOps);
            
            return res.status(200).json({ 
                message: 'Asistencia masiva guardada/actualizada con éxito',
                result: result 
            });

        } catch (error) {
            console.error("❌ Error en API asistencia bulk:", error);
            res.status(500).json({ 
                message: 'Error al procesar la solicitud de asistencia masiva',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
            });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Método ${req.method} no permitido.` });
    }
}