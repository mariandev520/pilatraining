import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('baseprueba'); // Asegúrate que sea tu base de datos
  const col = db.collection('infoclases');
  const { method } = req;

  try {
    if (method === 'GET') {
      // Obtener registros de infoclases
      const docs = await col.find().toArray();

      // Obtener clientes para hacer match por dniCliente o idCliente
      const clientes = await db.collection('clientes')
        .find({}, { projection: { _id: 1, dni: 1, nombre: 1 } }) // Proyectar solo los campos necesarios
        .toArray();

      // Enriquecer los datos con nombre del cliente
      const enrichedDocs = docs.map(doc => {
        const cliente = clientes.find(c =>
          (doc.idCliente && c._id.equals(new ObjectId(doc.idCliente))) || // Asegurarse que doc.idCliente es ObjectId si es string
          parseInt(c.dni) === parseInt(doc.dniCliente)
        );

        return {
          ...doc,
          nombreCliente: cliente?.nombre || 'No encontrado' // Usar optional chaining y un fallback
        };
      });

      return res.status(200).json(enrichedDocs);
    }

    // POST
    if (method === 'POST') {
      const {
        dniCliente,
        idCliente, // Puede venir como string desde el cliente
        nombreActividad,
        nombreProfesor,
        clasesPendientes = 0,
        clasesEchas = 0,
        clasePrueba = false,
        diasVisita = [] // Asegurar que sea un array
      } = req.body;

      if (!dniCliente || !nombreActividad) {
        return res.status(400).json({ message: 'Faltan dniCliente o nombreActividad' });
      }

      const doc = {
        dniCliente: parseInt(dniCliente), // Convertir a número
        idCliente: idCliente ? new ObjectId(idCliente) : null, // Convertir a ObjectId si existe
        nombreActividad,
        nombreProfesor: nombreProfesor || null,
        clasesPendientes: parseInt(clasesPendientes), // Convertir a número
        clasesEchas: parseInt(clasesEchas),       // Convertir a número
        clasePrueba: !!clasePrueba,               // Convertir a booleano
        diasVisita: Array.isArray(diasVisita) ? diasVisita.map(Number).sort((a,b) => a-b) : [], // Validar que sea array, convertir a números y ordenar
        ultimaActualizacion: new Date(),
        verificacionesSemana: 0 // Añadido según el esquema de clientes, aunque no estaba en el POST original de infoclases
      };

      const result = await col.insertOne(doc);
      return res.status(201).json({ message: 'Creado', id: result.insertedId, doc });
    }

    // PUT
    if (method === 'PUT') {
      const {
        _id, // Puede venir como string
        dniCliente, // Usado para el filtro si no hay _id, y para la propagación
        nombreActividad, // Usado para el filtro si no hay _id, y para la propagación
        clasesPendientes,
        clasesEchas,
        clasePrueba,
        diasVisita, // Este es el campo clave para la sincronización
        nombreProfesor // Añadido para permitir su actualización
        // Se pueden añadir más campos para actualizar si es necesario
      } = req.body;

      // Determinar el filtro: por _id si se provee, sino por la combinación dniCliente y nombreActividad
      const filter = _id
        ? { _id: new ObjectId(_id) } // Convertir _id a ObjectId
        : { dniCliente: parseInt(dniCliente), nombreActividad }; // dniCliente como número

      const set = {};
      // Solo añadir campos al $set si están definidos en el body para permitir actualizaciones parciales
      if (clasesPendientes !== undefined) set.clasesPendientes = parseInt(clasesPendientes);
      if (clasesEchas !== undefined) set.clasesEchas = parseInt(clasesEchas);
      if (clasePrueba !== undefined) set.clasePrueba = !!clasePrueba;
      if (nombreProfesor !== undefined) set.nombreProfesor = nombreProfesor || null;
      
      if (Array.isArray(diasVisita)) {
        set.diasVisita = diasVisita.map(Number).filter(dia => !isNaN(dia) && dia >= 0 && dia <=6).sort((a,b) => a-b);
      }
      
      // Añadir otros campos aquí si es necesario
      
      if (Object.keys(set).length === 0) {
        return res.status(400).json({ message: 'No hay campos válidos para actualizar.' });
      }
      
      set.ultimaActualizacion = new Date(); // Buena práctica actualizar la fecha de modificación

      const result = await col.updateOne(filter, { $set: set });

      // --- INICIO DE CÓDIGO AÑADIDO/MODIFICADO PARA SINCRONIZACIÓN ---
      if (result.matchedCount > 0 && set.diasVisita !== undefined) {
        // Se actualizó una infoclase y el campo diasVisita estaba en los datos a actualizar.
        // Ahora, propagamos este cambio a la colección 'clientes'.

        // Primero, obtenemos el documento infoclase actualizado para tener sus detalles
        // Es importante usar el mismo filtro que se usó para la actualización.
        const updatedInfoClase = await col.findOne(filter); 

        if (updatedInfoClase && 
            (updatedInfoClase.idCliente || updatedInfoClase.dniCliente) && // Necesitamos una forma de identificar al cliente
            updatedInfoClase.nombreActividad) { // Necesitamos el nombre de la actividad para ubicarla en el array del cliente

            const clientesCollection = db.collection('clientes');
            let clienteIdentifier;

            if (updatedInfoClase.idCliente) {
                clienteIdentifier = { _id: new ObjectId(updatedInfoClase.idCliente) };
            } else {
                // Fallback por DNI si idCliente no está presente por alguna razón
                // (aunque el POST a infoclases debería intentar setearlo si el cliente es creado por la API de clientes)
                clienteIdentifier = { dni: parseInt(updatedInfoClase.dniCliente) };
            }

            // Actualizar el campo diasVisita dentro del array 'actividades' del cliente
            // que coincida con el idCliente/dniCliente y el nombreActividad.
            const updateClienteResult = await clientesCollection.updateOne(
                { 
                    ...clienteIdentifier, 
                    "actividades.nombre": updatedInfoClase.nombreActividad 
                },
                { 
                    // Usamos los diasVisita ya procesados (set.diasVisita) para asegurar consistencia
                    $set: { "actividades.$.diasVisita": set.diasVisita } 
                }
            );

            if (updateClienteResult.modifiedCount === 0) {
                console.warn(`Advertencia Sincronización: diasVisita en infoclase ${updatedInfoClase._id} fue actualizado, pero no se pudo propagar al cliente/actividad correspondiente. Cliente: ${JSON.stringify(clienteIdentifier)}, Actividad: ${updatedInfoClase.nombreActividad}`);
            } else {
                console.log(`Sincronización Exitosa: diasVisita de infoclase ${updatedInfoClase._id} propagado al cliente y actividad correspondientes.`);
            }
        } else {
            console.warn(`Advertencia Sincronización: No se pudo propagar el cambio de diasVisita para la infoclase con filtro ${JSON.stringify(filter)} porque faltan datos clave (idCliente, dniCliente o nombreActividad) en el documento actualizado, o el documento no fue encontrado post-actualización.`);
        }
      }
      // --- FIN DE CÓDIGO AÑADIDO/MODIFICADO PARA SINCRONIZACIÓN ---


      if (result.matchedCount === 0 && result.upsertedCount === 0) { // Modificado para considerar upsert si se implementara
        return res.status(404).json({ message: 'No se encontró registro a actualizar.' });
      }

      return res.status(200).json({ message: 'Actualizado', modifiedCount: result.modifiedCount, upsertedId: result.upsertedId });
    }

    // DELETE
    if (method === 'DELETE') {
      const { id } = req.query; // Asumiendo que el ID viene por query params
      if (!id) return res.status(400).json({ message: 'Falta id en query.' });

      const result = await col.deleteOne({ _id: new ObjectId(id) }); // Convertir a ObjectId
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'No se encontró para eliminar.' });
      }

      return res.status(200).json({ message: 'Eliminado' });
    }

    // Si no es GET, POST, PUT, o DELETE
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Método ${method} no permitido.` });

  } catch (err) {
    console.error('Error en API infoclases:', err.message, err.stack); // Loguear el stack también puede ser útil
    // Verificar si el error es de MongoDB por ID inválido
    if (err.name === 'BSONTypeError' || (err.message && err.message.toLowerCase().includes("objectid"))) {
        return res.status(400).json({ message: 'ID proporcionado no es válido.', error: err.message });
    }
    return res.status(500).json({ message: 'Error interno del servidor', error: err.message });
  }
}