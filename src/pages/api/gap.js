
import clientPromise from '@/lib/mongodb'; // Asegúrate que la ruta sea correcta

const ACTIVIDAD_KEY = 'gap'; // Clave para la colección y el tipo de documento
const DB_NAME = 'baseprueba'; // Nombre de tu base de datos

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    // Usamos una colección específica para gap o una genérica con filtro
    // Opción 1: Colección específica
    const colgap = db.collection(ACTIVIDAD_KEY);
    // Opción 2: Colección genérica (si prefieres tener todas las actividades juntas)
    // const colAsignaciones = db.collection('asignacionesActividades');

    const filtroDocumento = { tipo: ACTIVIDAD_KEY }; // Filtro para encontrar el doc de gap

    // Método GET: Obtener asignaciones de gap
    if (req.method === 'GET') {
      // Buscar el documento único para las asignaciones de gap
      // Usar colgap o colAsignaciones según la opción elegida arriba
      const gapDoc = await colgap.findOne(filtroDocumento);

      if (!gapDoc) {
        // Si no existe el documento, devolvemos un objeto vacío (no hay asignaciones aún)
        console.log(`Documento de asignaciones para '${ACTIVIDAD_KEY}' no encontrado. Devolviendo {}.`);
        return res.status(200).json({});
      }

      // Devolvemos solo el campo 'asignaciones', o un objeto vacío si ese campo no existe
      console.log(`Asignaciones para '${ACTIVIDAD_KEY}' encontradas.`);
      return res.status(200).json(gapDoc.asignaciones || {});
    }

    // Método POST: Guardar/actualizar asignaciones de gap
    if (req.method === 'POST') {
      // Validar el cuerpo de la solicitud
      if (!req.body || typeof req.body.asignaciones !== 'object' || req.body.asignaciones === null) {
          console.error("Error POST: Cuerpo de solicitud inválido o falta 'asignaciones'. Body:", req.body);
        return res.status(400).json({ message: "Se requiere un objeto 'asignaciones' en el cuerpo de la solicitud." });
      }

      const { asignaciones } = req.body;

      // Validar y limpiar las asignaciones recibidas
      const asignacionesValidadas = {};
      let isValid = true;
      const diasValidos = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']; // Ajustar si es necesario
      // Podrías obtener los horarios válidos también si quieres ser más estricto

      for (const [diaHorarioKey, clientesArray] of Object.entries(asignaciones)) {
        // 1. Validar la clave (formato Dia-Horario)
        const partes = diaHorarioKey.split('-');
        if (partes.length !== 2 || !diasValidos.includes(partes[0]) /* || !horariosValidos.includes(partes[1]) */) {
           console.warn(`Clave de asignación inválida omitida: ${diaHorarioKey}`);
           continue; // Opcionalmente, podrías marcar isValid = false y retornar error
        }

        // 2. Validar que el valor sea un array no vacío
        if (!Array.isArray(clientesArray) || clientesArray.length === 0) {
             console.warn(`Valor para la clave ${diaHorarioKey} no es un array válido o está vacío. Omitiendo.`);
            continue; // Omitimos claves con arrays vacíos o inválidos
        }

        // 3. Validar cada cliente dentro del array
        const clientesValidos = clientesArray.filter(cliente =>
            cliente && typeof cliente === 'object' && cliente.id && cliente.nombre // Requisitos mínimos
            // Podrías añadir más validaciones aquí (ej: cliente.dni)
        );

        // Si después de filtrar quedan clientes válidos, añadimos al objeto validado
        if (clientesValidos.length > 0) {
             // Opcional: Limpiar propiedades extra si es necesario
             const clientesLimpios = clientesValidos.map(c => ({
                 id: c.id,
                 nombre: c.nombre,
                 dni: c.dni || null, // Asegurar que exista o sea null
                 color: c.color || '#ff9800', // Color por defecto
                 clasesPendientes: c.clasesPendientes ?? null // Clases pendientes o null
             }));
             asignacionesValidadas[diaHorarioKey] = clientesLimpios;
        } else {
             console.warn(`Array para ${diaHorarioKey} no contiene clientes válidos después del filtro.`);
        }
      }

      // Actualizar (o crear si no existe) el documento en la base de datos
      // Usar colgap o colAsignaciones según la opción elegida
      const updateResult = await colgap.updateOne(
        filtroDocumento, // Filtro para encontrar el doc de gap
        {
          $set: {
              asignaciones: asignacionesValidadas, // Guardar solo las asignaciones validadas
              tipo: ACTIVIDAD_KEY, // Asegurarse que el tipo esté presente (importante para upsert)
              lastUpdated: new Date() // Guardar fecha de última actualización
            }
        },
        { upsert: true } // Crea el documento si no existe
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
    // Intentar obtener un mensaje de error más específico si es posible
    const errorMessage = error.message || 'Ocurrió un error en el servidor.';
    // Evitar exponer detalles sensibles en producción
    const statusCode = error.statusCode || 500; // Usar código de estado si existe

    return res.status(statusCode).json({ message: errorMessage });
  }
}