import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const collection = db.collection('clientes');
    const { id } = req.query;

    if (req.method === 'GET') {
      const cliente = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      
      return res.status(200).json(cliente);
    }

    if (req.method === 'PUT') {
      const { estado, pagado } = req.body;
      
      // Validar los datos de entrada
      if (estado && !['al día', 'deudor'].includes(estado)) {
        return res.status(400).json({ message: 'Estado no válido' });
      }

      if (pagado !== undefined && typeof pagado !== 'boolean') {
        return res.status(400).json({ message: 'Valor pagado no válido' });
      }

      const clienteActual = await collection.findOne({ _id: new ObjectId(id) });
      if (!clienteActual) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }

      const updateData = {
        updatedAt: new Date()
      };

      if (estado !== undefined) updateData.estado = estado;
      if (pagado !== undefined) updateData.pagado = pagado;

      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.modifiedCount === 0) {
        return res.status(400).json({ message: 'No se realizaron cambios' });
      }

      const clienteActualizado = await collection.findOne({ _id: new ObjectId(id) });
      return res.status(200).json(clienteActualizado);
    }

    res.status(405).json({ message: 'Método no permitido' });
  } catch (error) {
    console.error('Error en API cliente:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message 
    });
  }
}