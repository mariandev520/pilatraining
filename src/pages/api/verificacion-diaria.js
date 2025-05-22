import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { startOfDay, endOfDay, differenceInDays, startOfWeek } from 'date-fns';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    const colVerificacion = db.collection('verificacion');
    const colInfoClases = db.collection('infoclases');
    const colClientes = db.collection('clientes');
    const { method } = req;

    // GET: clientes sin verificar / historial
    if (method === 'GET') {
      const { fecha, dni } = req.query;
      const fechaBase = fecha ? new Date(fecha) : new Date();
      const inicioDia = startOfDay(fechaBase);
      const finDia = endOfDay(fechaBase);
      
      if (dni) {
        const desde = req.query.desde ? new Date(req.query.desde) : startOfWeek(fechaBase);
        const hasta = req.query.hasta ? new Date(req.query.hasta) : finDia;
        const verificaciones = await colVerificacion.find({ dniCliente: parseInt(dni), fechaVerificacion: { $gte: desde, $lte: hasta } }).sort({ fechaVerificacion: -1 }).toArray();
        return res.status(200).json(verificaciones);
      }
      const verificacionesHoy = await colVerificacion.find({ fechaVerificacion: { $gte: inicioDia, $lte: finDia } }).toArray();
      const [clientes, infoclases] = await Promise.all([
        colClientes.find().project({ dni: 1, nombre: 1, clasesPendientesTotales: 1 }).toArray(),
        colInfoClases.find().toArray()
      ]);
      const clientesSinVerificar = [];
      for (const cliente of clientes) {
        const actividadesCliente = infoclases.filter(info => info.dniCliente === parseInt(cliente.dni));
        for (const actividad of actividadesCliente) {
          const verificoHoy = verificacionesHoy.some(v => v.dniCliente === parseInt(cliente.dni) && v.nombreActividad === actividad.nombreActividad);
          if (!verificoHoy) {
            const ultimaVerif = await colVerificacion.findOne({ dniCliente: parseInt(cliente.dni), nombreActividad: actividad.nombreActividad, metodoVerificacion: 'presencial' }, { sort: { fechaVerificacion: -1 }, projection: { fechaVerificacion: 1 } });
            let fechaUlt = actividad.ultimaActualizacion || ultimaVerif?.fechaVerificacion || null;
            let dias = fechaUlt ? differenceInDays(fechaBase, new Date(fechaUlt)) : 30;
            clientesSinVerificar.push({ cliente: { dni: cliente.dni, nombre: cliente.nombre, clasesPendientesTotales: cliente.clasesPendientesTotales }, actividad: actividad.nombreActividad, diasSinVerificar: dias, ultimaVerificacion: fechaUlt });
          }
        }
      }
      return res.status(200).json({ fecha: fechaBase, clientesSinVerificar, totalVerificacionesHoy: verificacionesHoy.length });
    }

    // POST: registrar verificación
    if (method === 'POST') {
      const { dniCliente, nombreCliente, nombreActividad, observaciones, automatica } = req.body;
      if (!dniCliente || !nombreCliente || !nombreActividad) return res.status(400).json({ message: 'Datos incompletos' });
      const fechaVerificacion = new Date();
      const metodo = automatica ? 'automatica' : 'presencial';
      const result = await colVerificacion.insertOne({ dniCliente: parseInt(dniCliente), nombreCliente, nombreActividad, fechaVerificacion, metodoVerificacion: metodo, observaciones: observaciones || `Verificación ${metodo}`, automatica: !!automatica });
      if (!automatica) {
        await colInfoClases.updateOne({ dniCliente: parseInt(dniCliente), nombreActividad }, { $set: { ultimaActualizacion: fechaVerificacion } }, { upsert: true });
      }
      return res.status(201).json({ success: true, insertedId: result.insertedId, fechaVerificacion });
    }

    // DELETE: eliminar verificación individual o historial completo
    if (method === 'DELETE') {
      const { id, dni } = req.query;
      if (id) {
        const del = await colVerificacion.deleteOne({ _id: new ObjectId(id) });
        return del.deletedCount === 1
          ? res.status(200).json({ message: 'Verificación eliminada.' })
          : res.status(404).json({ message: 'No se encontró esa verificación.' });
      } else if (dni) {
        const dniInt = parseInt(dni);
        const del = await colVerificacion.deleteMany({ dniCliente: dniInt });
        return res.status(200).json({ message: `Eliminadas ${del.deletedCount} verificaciones del DNI ${dni}.` });
      } else {
        return res.status(400).json({ message: 'Debe especificar id o dni.' });
      }
    }

    res.setHeader('Allow', ['GET','POST','DELETE']);
    return res.status(405).json({ message: `Método ${method} no permitido.` });
  } catch (error) {
    console.error('Error API Verificación:', error);
    return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
}
