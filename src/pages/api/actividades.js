import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    const collection = db.collection('actividades');
    
    // GET - Obtener todas las actividades
    if (req.method === 'GET') {
      const actividades = await collection.find({}).sort({ createdAt: -1 }).toArray();
      console.log("📦 Actividades obtenidas:", actividades.length);
      return res.status(200).json(actividades);
    }
    
    // POST - Crear una nueva actividad
    if (req.method === 'POST') {
      const { nombre, horarios, valorPorClase, valorMensual } = req.body;
      
      // Validaciones básicas
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre de la actividad es requerido' });
      }
      
      // Verificar si ya existe una actividad con ese nombre
      const actividadExistente = await collection.findOne({ nombre });
      if (actividadExistente) {
        return res.status(400).json({ message: 'Ya existe una actividad con ese nombre' });
      }

      // Convertir valores a números si existen
      const valorClaseNum = valorPorClase ? parseInt(valorPorClase, 10) : 0;
      const valorMensualNum = valorMensual ? parseInt(valorMensual, 10) : 0;
      
      const resultado = await collection.insertOne({
        nombre,
        horarios: horarios || '',
        valorPorClase: valorClaseNum,
        valorMensual: valorMensualNum,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log("✅ Actividad creada:", resultado.insertedId);
      return res.status(201).json({ 
        message: 'Actividad creada con éxito',
        id: resultado.insertedId 
      });
    }
    
    // PUT - Actualizar una actividad existente
    if (req.method === 'PUT') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Se requiere un ID para actualizar' });
      }
      
      const { nombre, horarios, valorPorClase, valorMensual } = req.body;
      
      // Validaciones básicas
      if (!nombre) {
        return res.status(400).json({ message: 'El nombre de la actividad es requerido' });
      }
      
      // Verificar si ya existe otra actividad con ese nombre (excepto la actual)
      const actividadExistente = await collection.findOne({ 
        nombre, 
        _id: { $ne: new ObjectId(id) } 
      });
      
      if (actividadExistente) {
        return res.status(400).json({ message: 'Ya existe otra actividad con ese nombre' });
      }

      // Convertir valores a números si existen
      const valorClaseNum = valorPorClase ? parseInt(valorPorClase, 10) : 0;
      const valorMensualNum = valorMensual ? parseInt(valorMensual, 10) : 0;
      
      const resultado = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            nombre,
            horarios: horarios || '',
            valorPorClase: valorClaseNum,
            valorMensual: valorMensualNum,
            updatedAt: new Date()
          } 
        }
      );
      
      if (resultado.matchedCount === 0) {
        return res.status(404).json({ message: 'Actividad no encontrada' });
      }
      
      console.log("✅ Actividad actualizada:", id);
      return res.status(200).json({ message: 'Actividad actualizada con éxito' });
    }
    
    // DELETE - Eliminar una actividad
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Se requiere un ID para eliminar' });
      }
      
      const resultado = await collection.deleteOne({ _id: new ObjectId(id) });
      
      if (resultado.deletedCount === 0) {
        return res.status(404).json({ message: 'Actividad no encontrada' });
      }
      
      console.log("🗑️ Actividad eliminada:", id);
      return res.status(200).json({ message: 'Actividad eliminada con éxito' });
    }
    
    // Método no permitido
    return res.status(405).json({ message: 'Método no permitido' });
    
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message 
    });
  }
}