import clientPromise from '@/lib/mongodb';

const ACTIVIDAD_KEY = 'kickboxing'; // Clave para la colección y el tipo de documento
const DB_NAME = 'baseprueba'; // Nombre de tu base de datos

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const colKickboxing = db.collection(ACTIVIDAD_KEY);

    const filtroDocumento = { tipo: ACTIVIDAD_KEY };

    // Método GET: Obtener asignaciones de kickboxing
    if (req.method === 'GET') {
      const kickboxingDoc = await colKickboxing.findOne(filtroDocumento);

      if (!kickboxingDoc) {
        console.log(`Documento de asignaciones para '${ACTIVIDAD_KEY}' no encontrado. Devolviendo {}.`);
        return res.status(200).json({});
      }

      console.log(`Asignaciones para '${ACTIVIDAD_KEY}' encontradas.`);
      return res.status(200).json(kickboxingDoc.asignaciones || {});
    }

    // Método POST: Guardar/actualizar asignaciones de kickboxing
    if (req.method === 'POST') {
      if (!req.body || typeof req.body.asignaciones !== 'object' || req.body.asignaciones === null) {
          console.error("Error POST: Cuerpo de solicitud inválido o falta 'asignaciones'. Body:", req.body);
        return res.status(400).json({ message: "Se requiere un objeto 'asignaciones' en el cuerpo de la solicitud." });
      }

      const { asignaciones } = req.body;

      // Validar y limpiar las asignaciones recibidas
      const asignacionesValidadas = {};
      const diasValidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

      for (const [diaHorarioKey, clientesArray] of Object.entries(asignaciones)) {
        const partes = diaHorarioKey.split('-');
        if (partes.length !== 2 || !diasValidos.includes(partes[0])) {
           console.warn(`Clave de asignación inválida omitida: ${diaHorarioKey}`);
           continue;
        }

        if (!Array.isArray(clientesArray) || clientesArray.length === 0) {
             console.warn(`Valor para la clave ${diaHorarioKey} no es un array válido o está vacío. Omitiendo.`);
            continue;
        }

        const clientesValidos = clientesArray.filter(cliente =>
            cliente && typeof cliente === 'object' && cliente.id && cliente.nombre
        );

        if (clientesValidos.length > 0) {
             const clientesLimpios = clientesValidos.map(c => ({
                 id: c.id,
                 nombre: c.nombre,
                 nivel: c.nivel || 'Principiante',
                 color: c.color || '#ba68c8',
                 clasesPendientes: c.clasesPendientes ?? null
             }));
             asignacionesValidadas[diaHorarioKey] = clientesLimpios;
        } else {
             console.warn(`Array para ${diaHorarioKey} no contiene practicantes válidos después del filtro.`);
        }
      }

      const updateResult = await colKickboxing.updateOne(
        filtroDocumento,
        {
          $set: {
              asignaciones: asignacionesValidadas,
              tipo: ACTIVIDAD_KEY,
              lastUpdated: new Date()
            }
        },
        { upsert: true }
      );

      console.log(`Resultado de la actualización para '${ACTIVIDAD_KEY}':`, updateResult);

      if (updateResult.acknowledged) {
        return res.status(200).json({ message: `Asignaciones de ${ACTIVIDAD_KEY} guardadas correctamente.` });
      } else {
         console.error("Error POST: La operación de actualización no fue reconocida por la BD.");
        return res.status(500).json({ message: 'Error al guardar las asignaciones en la base de datos.' });
      }
    }

    // Si no es GET ni POST
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);

  } catch (error) {
    console.error(`Error en API /api/${ACTIVIDAD_KEY}:`, error);
    const errorMessage = error.message || 'Ocurrió un error en el servidor.';
    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({ message: errorMessage });
  }
}