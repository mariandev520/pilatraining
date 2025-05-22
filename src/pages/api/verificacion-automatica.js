import clientPromise from '@/lib/mongodb';
import { getDay, startOfWeek, endOfWeek, parseISO, startOfDay, addDays, format, isBefore } from 'date-fns';

const DIA_MAP = {
  domingo: 0, lunes: 1, martes: 2,
  miércoles: 3, miercoles: 3, jueves: 4, viernes: 5, sábado: 6
};

function normalizeDiasVisita(dias) {
  if (!Array.isArray(dias)) {
    return [];
  }
  return dias.map(d => {
    if (typeof d === 'number' && d >= 0 && d <= 6) return d;
    if (typeof d === 'string') {
      const key = d.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (key in DIA_MAP) return DIA_MAP[key];
    }
    return undefined;
  }).filter(d => d !== undefined);
}

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('baseprueba');
  const colClientes = db.collection('clientes');
  const colInfoClases = db.collection('infoclases');
  const colVerificacion = db.collection('verificacion');

  if (req.method === 'GET') {
    try {
      const { fecha } = req.query;
      const fechaDeEvaluacion = fecha ? parseISO(fecha) : new Date();
      const inicioSemanaEvaluacion = startOfWeek(fechaDeEvaluacion, { weekStartsOn: 1 });
      const finSemanaEvaluacion = endOfWeek(fechaDeEvaluacion, { weekStartsOn: 1 });

      const [clientes, infoclases, verifsSemana] = await Promise.all([
        colClientes.find().project({
            dni: 1,
            nombre: 1,
            createdAt: 1 // Aseguramos traer 'createdAt'
        }).toArray(),
        colInfoClases.find().toArray(),
        colVerificacion.find({
          fechaVerificacion: { $gte: inicioSemanaEvaluacion, $lte: finSemanaEvaluacion }
        }).toArray(),
      ]);

      const resumen = [];

      for (const c of clientes) {
        const actividadesCliente = infoclases.filter(i => i.dniCliente === parseInt(c.dni));
        
        // Usamos c.createdAt para obtener la fecha de creación
        const fechaCreacionCliente = c.createdAt ? startOfDay(new Date(c.createdAt)) : null;

        for (const a of actividadesCliente) {
          const diasVisitaNumericos = normalizeDiasVisita(a.diasVisita || []);

          if (diasVisitaNumericos.length === 0) {
            resumen.push({
              cliente: { dni: c.dni, nombre: c.nombre, fechaCreacion: c.createdAt ? c.createdAt.toISOString() : null },
              actividad: a.nombreActividad,
              clasesPendientes: a.clasesPendientes,
              ultimaVerificacion: null, // Considerar si este campo es necesario o cómo se calcula
              visitasAsignadas: diasVisitaNumericos,
              tieneVerificacionesPendientes: false,
              diasParaVerificarAutomaticamente: [],
            });
            continue;
          }

          const verificacionesClienteActividadEstaSemana = verifsSemana.filter(v =>
            v.dniCliente === parseInt(c.dni) &&
            v.nombreActividad === a.nombreActividad
          );

          const diasYaVerificadosEnSemana = new Set(
            verificacionesClienteActividadEstaSemana.map(v => getDay(new Date(v.fechaVerificacion)))
          );

          const diasParaVerificarAutomaticamente = [];

          for (let i = 0; i < 7; i++) {
            const fechaDelDiaIterado = addDays(inicioSemanaEvaluacion, i);
            
            if (fechaDelDiaIterado > fechaDeEvaluacion) {
              break; 
            }
            const diaNumeroDelIterado = getDay(fechaDelDiaIterado);

            if (diasVisitaNumericos.includes(diaNumeroDelIterado) && !diasYaVerificadosEnSemana.has(diaNumeroDelIterado)) {
              
              let esDiaValidoPorCreacion = true;
              if (fechaCreacionCliente) {
                if (isBefore(startOfDay(fechaDelDiaIterado), fechaCreacionCliente)) {
                  esDiaValidoPorCreacion = false;
                }
              }

              if (esDiaValidoPorCreacion) {
                diasParaVerificarAutomaticamente.push({
                  diaNumero: diaNumeroDelIterado,
                  fechaEspecificaParaVerificar: fechaDelDiaIterado.toISOString()
                });
              }
            }
          }

          const tienePendientes = diasParaVerificarAutomaticamente.length > 0 && a.clasesPendientes > 0;

          resumen.push({
            cliente: { dni: c.dni, nombre: c.nombre, fechaCreacion: c.createdAt ? c.createdAt.toISOString() : null },
            actividad: a.nombreActividad,
            clasesPendientes: a.clasesPendientes,
            ultimaVerificacion: null,
            visitasAsignadas: diasVisitaNumericos,
            tieneVerificacionesPendientes: tienePendientes,
            diasParaVerificarAutomaticamente: diasParaVerificarAutomaticamente
          });
        }
      }
      return res.status(200).json({ fecha: fechaDeEvaluacion.toISOString(), resumen });
    } catch (err) {
      console.error('[API GET] Error en /api/verificacion-automatica (GET):', err.message, err.stack);
      return res.status(500).json({ message: 'Error interno del servidor al obtener el resumen.', error: err.message });
    }

  } else if (req.method === 'POST') {
    try {
      const { itemsAProcesar } = req.body;

      if (!Array.isArray(itemsAProcesar) || itemsAProcesar.length === 0) {
        return res.status(400).json({ message: 'No se proporcionaron items para procesar.' });
      }

      let verificacionesCreadasEnTotal = 0;
      let clasesActualizadasEnTotal = 0;
      const erroresDetallados = [];
      const resultadosDetallados = [];

      const itemsOrdenados = [...itemsAProcesar].sort((a, b) => {
        const fechaA = a.diasParaVerificarAutomaticamente[0]?.fechaEspecificaParaVerificar;
        const fechaB = b.diasParaVerificarAutomaticamente[0]?.fechaEspecificaParaVerificar;
        return new Date(fechaA) - new Date(fechaB);
      });

      for (const item of itemsOrdenados) {
        const dniClienteNum = parseInt(item.cliente.dni);
        const actividadNombre = item.actividad;
        const diasAProcesar = item.diasParaVerificarAutomaticamente;

        if (!dniClienteNum || !actividadNombre || !Array.isArray(diasAProcesar) || diasAProcesar.length === 0) {
          erroresDetallados.push({ 
            clienteDni: dniClienteNum, 
            actividad: actividadNombre, 
            error: 'Datos incompletos o sin días para procesar para este item.' 
          });
          continue;
        }

        diasAProcesar.sort((a, b) => new Date(a.fechaEspecificaParaVerificar) - new Date(b.fechaEspecificaParaVerificar));

        for (const diaInfo of diasAProcesar) {
          const fechaVerificacionParaRegistrar = parseISO(diaInfo.fechaEspecificaParaVerificar);
          
          const infoClaseActual = await colInfoClases.findOne({ 
            dniCliente: dniClienteNum, 
            nombreActividad: actividadNombre 
          });

          if (!infoClaseActual || infoClaseActual.clasesPendientes <= 0) {
            erroresDetallados.push({
              clienteDni: dniClienteNum, 
              actividad: actividadNombre,
              fecha: format(fechaVerificacionParaRegistrar, 'yyyy-MM-dd'),
              error: `No hay clases pendientes antes de verificar este día. (Clases restantes: ${infoClaseActual ? infoClaseActual.clasesPendientes : 'N/A'})`
            });
            continue;
          }

          const inicioDelDiaVerificacion = startOfDay(fechaVerificacionParaRegistrar);
          const finDelDiaVerificacion = new Date(inicioDelDiaVerificacion.getTime() + 24 * 60 * 60 * 1000 - 1);

          const existeVerificacionEseDia = await colVerificacion.findOne({
            dniCliente: dniClienteNum, 
            nombreActividad: actividadNombre,
            fechaVerificacion: { $gte: inicioDelDiaVerificacion, $lte: finDelDiaVerificacion }
          });

          if (existeVerificacionEseDia) {
            erroresDetallados.push({
              clienteDni: dniClienteNum, 
              actividad: actividadNombre,
              fecha: format(fechaVerificacionParaRegistrar, 'yyyy-MM-dd'),
              error: `Ya existe una verificación para este día.`
            });
            continue;
          }
          
          const nuevaVerificacion = {
            dniCliente: dniClienteNum, 
            nombreCliente: item.cliente.nombre,
            nombreActividad: actividadNombre, 
            fechaVerificacion: fechaVerificacionParaRegistrar,
            metodoVerificacion: 'automatica',
          };

          const resultVerif = await colVerificacion.insertOne(nuevaVerificacion);
          if (resultVerif.insertedId) {
            verificacionesCreadasEnTotal++;
            const resultInfoUpdate = await colInfoClases.updateOne(
              { dniCliente: dniClienteNum, nombreActividad: actividadNombre },
              {
                $inc: { clasesPendientes: -1, clasesEchas: 1 },
                $set: { ultimaActualizacion: fechaVerificacionParaRegistrar }
              }
            );
            if (resultInfoUpdate.modifiedCount > 0) {
              clasesActualizadasEnTotal++;
              resultadosDetallados.push({ 
                clienteDni: dniClienteNum, 
                actividad: actividadNombre, 
                fecha: format(fechaVerificacionParaRegistrar, 'yyyy-MM-dd'), 
                status: 'Verificado y clase actualizada' 
              });
            } else {
              erroresDetallados.push({ 
                clienteDni: dniClienteNum, 
                actividad: actividadNombre, 
                fecha: format(fechaVerificacionParaRegistrar, 'yyyy-MM-dd'), 
                error: `Verificación creada pero no se pudo actualizar infoclases.` 
              });
            }
          } else {
            erroresDetallados.push({ 
              clienteDni: dniClienteNum, 
              actividad: actividadNombre, 
              fecha: format(fechaVerificacionParaRegistrar, 'yyyy-MM-dd'), 
              error: `No se pudo crear la verificación.` 
            });
          }
        }
      }

      return res.status(200).json({
        message: 'Proceso de verificación automática masiva completado.',
        verificacionesCreadas: verificacionesCreadasEnTotal,
        clasesActualizadas: clasesActualizadasEnTotal,
        resultados: resultadosDetallados,
        errores: erroresDetallados
      });

    } catch (err) {
      console.error('[API POST] Error en /api/verificacion-automatica (POST):', err.message, err.stack);
      return res.status(500).json({ 
        message: 'Error interno del servidor al procesar verificaciones.', 
        error: err.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Método ${req.method} no permitido.` });
  }
}