import clientPromise from '@/lib/mongodb';
import { startOfDay, endOfDay } from 'date-fns';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    const colVerificacion = db.collection('verificacion');
    const colClientes = db.collection('clientes');
    const colInfoClases = db.collection('infoclases');

    // GET - Obtener verificaciones en un rango de fechas
    if (req.method === 'GET') {
      const { desde, hasta, dniCliente, metodoVerificacion } = req.query;

      let query = {};

      if (desde || hasta) {
        query.fechaVerificacion = {};
        if (desde) query.fechaVerificacion.$gte = new Date(desde);
        if (hasta) query.fechaVerificacion.$lte = new Date(hasta);
      }

      if (dniCliente) query.dniCliente = parseInt(dniCliente);
      if (metodoVerificacion) query.metodoVerificacion = metodoVerificacion;

      const verificaciones = await colVerificacion.find(query).toArray();
      return res.status(200).json(verificaciones);
    }

    // POST - Crear una nueva verificación
    if (req.method === 'POST') {
      const {
        dniCliente,
        nombreCliente,
        nombreActividad,
        fechaVerificacion,
        metodoVerificacion = 'presencial',
        observaciones
      } = req.body;

      if (!dniCliente || !nombreActividad) {
        return res.status(400).json({
          message: 'Los campos dniCliente y nombreActividad son obligatorios'
        });
      }

      // Buscar el nombre del cliente si no se proporciona
      let nombreFinalCliente = nombreCliente;
      if (!nombreFinalCliente) {
        const clienteDoc = await colClientes.findOne({ dni: parseInt(dniCliente) });
        nombreFinalCliente = clienteDoc?.nombre || 'Desconocido';
      }

      const nuevaVerificacion = {
        dniCliente: parseInt(dniCliente),
        nombreCliente: nombreFinalCliente,
        nombreActividad,
        fechaVerificacion: fechaVerificacion ? new Date(fechaVerificacion) : new Date(),
        metodoVerificacion,
        observaciones,
        fechaCreacion: new Date()
      };

      const inicioDia = startOfDay(nuevaVerificacion.fechaVerificacion);
      const finDia = endOfDay(nuevaVerificacion.fechaVerificacion);

      const verificacionExistente = await colVerificacion.findOne({
        dniCliente: nuevaVerificacion.dniCliente,
        nombreActividad: nuevaVerificacion.nombreActividad,
        metodoVerificacion: nuevaVerificacion.metodoVerificacion,
        fechaVerificacion: {
          $gte: inicioDia,
          $lte: finDia
        }
      });

      if (verificacionExistente && metodoVerificacion === 'presencial') {
        return res.status(409).json({
          message: 'Ya existe una verificación presencial para este cliente, actividad y día'
        });
      }

      const resultado = await colVerificacion.insertOne(nuevaVerificacion);

      await colInfoClases.updateOne(
        {
          dniCliente: nuevaVerificacion.dniCliente,
          nombreActividad: nuevaVerificacion.nombreActividad
        },
        {
          $set: {
            ultimaActualizacion: nuevaVerificacion.fechaVerificacion
          }
        }
      );

      return res.status(201).json({
        message: 'Verificación registrada correctamente',
        id: resultado.insertedId,
        verificacion: nuevaVerificacion
      });
    }

    // DELETE - Eliminar una verificación por ID
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          message: 'Se requiere el ID de la verificación'
        });
      }

      const resultado = await colVerificacion.deleteOne({
        _id: new ObjectId(id)
      });

      if (resultado.deletedCount === 0) {
        return res.status(404).json({
          message: 'No se encontró la verificación'
        });
      }

      return res.status(200).json({
        message: 'Verificación eliminada correctamente'
      });
    }

    // Método no permitido
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({ message: 'Método no permitido' });

  } catch (error) {
    console.error('Error en API verificación:', error);
    return res.status(500).json({
      message: 'Error interno del servidor',
      error: error.message
    });
  }
}
