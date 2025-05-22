// /api/verificacion/diaria.js
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { addDays, isWeekend, format, parseISO } from 'date-fns';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { fecha, diasSinVerificar = {} } = req.body;
    const fechaActual = new Date(fecha);
    
    // Solo procesar días de semana (lunes a viernes)
    if (isWeekend(fechaActual)) {
      return res.status(200).json({
        message: 'No se procesan verificaciones los fines de semana',
        resultados: [],
        nuevoDiasSinVerificar: diasSinVerificar
      });
    }

    const client = await clientPromise;
    const db = client.db('baseprueba');
    
    // 1. Obtener verificaciones del día actual
    const fechaInicioDia = new Date(fechaActual);
    fechaInicioDia.setHours(0, 0, 0, 0);
    
    const fechaFinDia = new Date(fechaActual);
    fechaFinDia.setHours(23, 59, 59, 999);
    
    const verificacionesHoy = await db.collection('verificacion').find({
      fechaVerificacion: {
        $gte: fechaInicioDia,
        $lte: fechaFinDia
      }
    }).toArray();

    // 2. Obtener todos los clientes activos
    const clientes = await db.collection('clientes').find({
      estado: 'activo' // Asumiendo que tenemos un campo estado
    }).toArray();

    // 3. Identificar clientes que no verificaron hoy
    const clientesInactivosHoy = clientes.filter(cliente => {
      return !verificacionesHoy.some(v => v.dniCliente === parseInt(cliente.dni));
    });

    // 4. Actualizar contador de días sin verificar
    const nuevoDiasSinVerificar = { ...diasSinVerificar };
    const resultados = [];
    
    for (const cliente of clientesInactivosHoy) {
      const dni = cliente.dni.toString();
      
      // Incrementar días sin verificar
      nuevoDiasSinVerificar[dni] = (nuevoDiasSinVerificar[dni] || 0) + 1;
      
      // Obtener info de clases del cliente
      const infoClases = await db.collection('infoclases').find({
        $or: [
          { dniCliente: parseInt(cliente.dni) },
          { idCliente: cliente._id }
        ]
      }).toArray();

      if (infoClases.length === 0) continue;
      
      // Determinar plan de clases (asumimos que todas las actividades tienen el mismo plan)
      const planClases = infoClases[0].clasesMensuales || cliente.actividades[0]?.clasesMensuales || 0;
      
      // Aplicar reglas de verificación automática
      let aplicarVerificacion = false;
      let motivo = '';
      
      if (planClases === 1) {
        // Plan de 1 clase/mes - No se verifica automáticamente
        motivo = 'Plan de 1 clase/mes - No aplica verificación automática';
      } 
      else if (planClases === 12 && nuevoDiasSinVerificar[dni] >= 2) {
        // Plan de 12 clases/mes - 2 días sin verificar
        aplicarVerificacion = true;
        motivo = 'Plan de 12 clases - 2 días sin verificar';
      } 
      else if (planClases === 8 && nuevoDiasSinVerificar[dni] >= 3) {
        // Plan de 8 clases/mes - 3 días sin verificar
        aplicarVerificacion = true;
        motivo = 'Plan de 8 clases - 3 días sin verificar';
      }
      
      // Registrar acción (verificación o no)
      resultados.push({
        dniCliente: cliente.dni,
        nombreCliente: cliente.nombre,
        diasSinVerificar: nuevoDiasSinVerificar[dni],
        planClases,
        verificado: aplicarVerificacion,
        motivo
      });
      
      // Aplicar verificación automática si corresponde
      if (aplicarVerificacion) {
        for (const info of infoClases) {
          // Verificar que tenga clases pendientes
          if (info.clasesPendientes <= 0) {
            resultados[resultados.length - 1].motivo += ' (Sin clases pendientes)';
            continue;
          }
          
          // Registrar la verificación automática
          await db.collection('verificacion').insertOne({
            dniCliente: parseInt(cliente.dni),
            idCliente: cliente._id,
            nombreCliente: cliente.nombre,
            nombreActividad: info.nombreActividad,
            metodoVerificacion: 'automatica',
            tipo: 'clase_regular',
            fechaVerificacion: new Date(),
            motivo: `Días sin verificar: ${nuevoDiasSinVerificar[dni]}`,
            diasSinVerificar: nuevoDiasSinVerificar[dni]
          });
          
          // Actualizar info de clases
          await db.collection('infoclases').updateOne(
            { _id: info._id },
            {
              $inc: {
                clasesPendientes: -1,
                clasesEchas: 1,
                verificacionesSemana: 1
              },
              $set: {
                ultimaActualizacion: new Date()
              }
            }
          );
          
          // Reiniciar contador de días sin verificar
          nuevoDiasSinVerificar[dni] = 0;
        }
      }
    }

    return res.status(200).json({
      success: true,
      resultados,
      nuevoDiasSinVerificar
    });

  } catch (error) {
    console.error('Error en verificación diaria:', error);
    return res.status(500).json({ 
      message: 'Error al procesar la verificación diaria',
      error: error.message
    });
  }
}