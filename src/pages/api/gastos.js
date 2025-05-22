import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    const collection = db.collection('gastos');

    // GET - Todos los gastos/pagos
    if (req.method === 'GET') {
      const gastos = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return res.status(200).json(gastos);
    }

    // POST - Registrar nuevo gasto/pago
    if (req.method === 'POST') {
      const { proveedor, monto, descripcion, pagado } = req.body;
      if (!proveedor || !monto) return res.status(400).json({ message: 'Proveedor y monto son requeridos' });

      const montoNum = parseFloat(monto);
      const resultado = await collection.insertOne({
        proveedor,
        monto: montoNum,
        descripcion: descripcion || '',
        pagado: !!pagado,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return res.status(201).json({ message: 'Gasto registrado', id: resultado.insertedId });
    }

    // PUT - Actualizar gasto/pago
    if (req.method === 'PUT') {
      const { id } = req.query;
      const { proveedor, monto, descripcion, pagado } = req.body;
      if (!id || !proveedor || !monto) return res.status(400).json({ message: 'Datos incompletos' });

      const montoNum = parseFloat(monto);
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            proveedor,
            monto: montoNum,
            descripcion: descripcion || '',
            pagado: !!pagado,
            updatedAt: new Date()
          }
        }
      );
      if (!result.matchedCount) return res.status(404).json({ message: 'Gasto no encontrado' });
      return res.status(200).json({ message: 'Gasto actualizado' });
    }

    // DELETE - Eliminar gasto
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: 'Falta ID' });

      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      if (!result.deletedCount) return res.status(404).json({ message: 'Gasto no encontrado' });
      return res.status(200).json({ message: 'Gasto eliminado' });
    }

    return res.status(405).json({ message: 'Método no permitido' });

  } catch (error) {
    console.error("❌ Error Gastos API:", error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
}
