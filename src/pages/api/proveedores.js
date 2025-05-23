import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('proveedores');

    // GET - Obtener todos los proveedores
    if (req.method === 'GET') {
      const proveedores = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(proveedores);
    }

    // POST - Crear proveedor
    if (req.method === 'POST') {
      const { nombre, contacto } = req.body;
      if (!nombre) return res.status(400).json({ message: 'El nombre es obligatorio' });

      // Validación: nombre único
      const existe = await collection.findOne({ nombre });
      if (existe) return res.status(400).json({ message: 'Ya existe un proveedor con ese nombre' });

      const resultado = await collection.insertOne({
        nombre,
        contacto: contacto || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return res.status(201).json({ message: 'Proveedor creado', id: resultado.insertedId });
    }

    // PUT - Actualizar proveedor
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { nombre, contacto } = req.body;
      if (!id || !nombre) return res.status(400).json({ message: 'Datos incompletos' });

      // Evitar duplicados
      const existe = await collection.findOne({ nombre, _id: { $ne: new ObjectId(id) } });
      if (existe) return res.status(400).json({ message: 'Ya existe otro proveedor con ese nombre' });

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { nombre, contacto: contacto || '', updatedAt: new Date() } }
      );
      if (!result.matchedCount) return res.status(404).json({ message: 'Proveedor no encontrado' });
      return res.status(200).json({ message: 'Proveedor actualizado' });
    }

    // DELETE - Eliminar proveedor
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Falta ID' });

      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (!result.deletedCount) return res.status(404).json({ message: 'Proveedor no encontrado' });
      return res.status(200).json({ message: 'Proveedor eliminado' });
    }

    return res.status(405).json({ message: 'Método no permitido' });

  } catch (error) {
    console.error("❌ Error Proveedores API:", error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}
