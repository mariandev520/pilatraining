import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    const collection = db.collection('calendario');
    
    // GET - Obtener todos los eventos de calendario
    if (req.method === 'GET') {
      const eventos = await collection.find({}).sort({ fecha: -1 }).toArray();
      console.log("📆 Eventos de calendario obtenidos:", eventos.length);
      return res.status(200).json(eventos);
    }
    
    // POST - Crear un nuevo evento en el calendario
    if (req.method === 'POST') {
      const { tipo, titulo, descripcion, fecha } = req.body;
      
      // Validaciones básicas
      if (!titulo) {
        return res.status(400).json({ message: 'El título del evento es requerido' });
      }
      
      if (!fecha) {
        return res.status(400).json({ message: 'La fecha del evento es requerida' });
      }

      // Guardar el nuevo evento
      const nuevoEvento = {
        tipo: tipo || 'note', // Por defecto es una nota si no se especifica
        titulo,
        descripcion: descripcion || '',
        fecha: new Date(fecha),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const resultado = await collection.insertOne(nuevoEvento);
      
      console.log("✅ Evento creado:", resultado.insertedId);
      return res.status(201).json({ 
        message: 'Evento creado con éxito',
        id: resultado.insertedId 
      });
    }
    
    // PUT - Actualizar un evento existente
    if (req.method === 'PUT') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Se requiere un ID para actualizar' });
      }
      
      const { tipo, titulo, descripcion, fecha } = req.body;
      
      // Validaciones básicas
      if (!titulo) {
        return res.status(400).json({ message: 'El título del evento es requerido' });
      }
      
      if (!fecha) {
        return res.status(400).json({ message: 'La fecha del evento es requerida' });
      }
      
      const resultado = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            tipo: tipo || 'note',
            titulo,
            descripcion: descripcion || '',
            fecha: new Date(fecha),
            updatedAt: new Date()
          } 
        }
      );
      
      if (resultado.matchedCount === 0) {
        return res.status(404).json({ message: 'Evento no encontrado' });
      }
      
      console.log("✅ Evento actualizado:", id);
      return res.status(200).json({ message: 'Evento actualizado con éxito' });
    }
    
    // DELETE - Eliminar un evento
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Se requiere un ID para eliminar' });
      }
      
      const resultado = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (resultado.deletedCount === 0) {
        return res.status(404).json({ message: 'Evento no encontrado' });
      }
      
      console.log("🗑️ Evento eliminado:", id);
      return res.status(200).json({ message: 'Evento eliminado con éxito' });
    }
    
    // Método no permitido
    return res.status(405).json({ message: 'Método no permitido' });
    
  } catch (error) {
    console.error("❌ Error en la API de calendario:", error);
    return res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message 
    });
  }
}