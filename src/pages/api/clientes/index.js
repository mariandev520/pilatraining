// /api/clientes/index.js (o como se llame tu archivo principal de clientes)

import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
// Asegúrate de importar la función handleRegistrarPago si sigue aquí, aunque idealmente estaría en pagos.js
// async function handleRegistrarPago(req, res, clientesCollection) { /* ... tu lógica ... */ }

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const clientesCollection = db.collection('clientes');
    const infoclasesCollection = db.collection('infoclases'); // Acceso a infoclases

    // --- OBTENER CLIENTES (GET) ---
    if (req.method === 'GET') {
      // Si se pide un ID específico, devolver solo ese cliente (sin info de clases aquí)
      if (req.query.id && ObjectId.isValid(req.query.id)) {
        const cliente = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
        if (!cliente) {
          return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        // NOTA: Si también quieres las clases pendientes para GET individual, añade la lógica aquí también.
        return res.status(200).json(cliente);
      }

      // Si no hay ID, obtener TODOS los clientes y enriquecerlos
      const clientes = await clientesCollection.find({}).sort({ nombre: 1 }).toArray(); // Ordenar alfabéticamente

      // Enriquecer cada cliente con el total de clases pendientes
      const clientesEnriquecidos = await Promise.all(clientes.map(async (cliente) => {
        if (!cliente.dni) {
          console.warn(`Cliente ${cliente._id} (${cliente.nombre}) no tiene DNI, no se pueden buscar clases.`);
          return { ...cliente, totalClasesPendientes: null }; // Indicar que no se pudo calcular
        }

        // Buscar todas las entradas de infoclases para este DNI
        const clasesInfo = await infoclasesCollection.find({
          dniCliente: cliente.dni // Asegúrate que el tipo coincida (Number vs String)
        }).project({ clasesPendientes: 1 }).toArray(); // Solo traer clasesPendientes

        // Sumar las clases pendientes
        const totalClasesPendientes = clasesInfo.reduce(
          (total, info) => total + (info.clasesPendientes || 0),
          0
        );

        // Devolver el objeto cliente original + el nuevo campo
        return {
          ...cliente,
          totalClasesPendientes: totalClasesPendientes
        };
      }));

      return res.status(200).json(clientesEnriquecidos); // Devolver clientes con la info añadida
    }

    // --- CREAR NUEVO CLIENTE (POST) ---
    if (req.method === 'POST') {
        // Comentado: La lógica de pagos debería estar en su propia API /api/clientes/[id]/pagos
        // if (req.query.id && req.query.pagos === 'true') {
        //   // Esta lógica probablemente debería moverse a /api/clientes/[id]/pagos.js
        //   // return handleRegistrarPago(req, res, clientesCollection);
        //   return res.status(400).json({ message: 'Endpoint de pago incorrecto. Usar /api/clientes/[id]/pagos' });
        // }

        const { dni, nombre, correo, direccion, telefono, actividades } = req.body;

        // Validaciones básicas (puedes añadir más)
        if (!dni || !nombre) {
            return res.status(400).json({ message: 'DNI y Nombre son requeridos.' });
        }
        // Validar DNI único si es necesario
        const existingClient = await clientesCollection.findOne({ dni: parseInt(dni) });
        if (existingClient) {
            return res.status(409).json({ message: `El DNI ${dni} ya está registrado.` });
        }

        const actividadesArray = (Array.isArray(actividades) ? actividades : [])
            .map(act => ({ // Asegurar estructura y _id para cada actividad
                ...act,
                _id: act._id ? new ObjectId(act._id) : new ObjectId(), // Asignar ObjectId si no existe
                tarifa: parseFloat(act.tarifa || 0),
                clasesPendientes: parseInt(act.clasesPendientes || 0) // Guardar como número
            }));

        const tarifa_mensual_total = actividadesArray.reduce((total, act) => total + act.tarifa, 0);
        // La suma inicial de clases pendientes para el cliente ahora viene de las actividades
        // const clasesPendientesTotalesIniciales = actividadesArray.reduce((total, act) => total + act.clasesPendientes, 0);

        const nuevoCliente = {
            dni: parseInt(dni), // Guardar DNI como número si es consistente
            nombre,
            correo,
            direccion,
            telefono,
            actividades: actividadesArray, // Guardar con _id
            // tarifa_mensual_total: tarifa_mensual_total, // Podría ser redundante si se calcula al vuelo
            // clasesPendientesTotales: clasesPendientesTotalesIniciales, // Redundante con infoclases
            pagado: false, // Estado inicial al crear
            estado: 'deudor', // Estado inicial al crear
            historialPagos: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const clienteInsertado = await clientesCollection.insertOne(nuevoCliente);
        const clienteIdInsertado = clienteInsertado.insertedId;

        // Crear entradas en 'infoclases'
        if (actividadesArray.length > 0) {
            const infoClasesNuevas = actividadesArray.map(actividad => ({
                dniCliente: parseInt(dni),
                idCliente: clienteIdInsertado,
                nombreActividad: actividad.nombre,
                idActividad: actividad._id, // Guardar referencia a la actividad en cliente
                clasesPendientes: actividad.clasesPendientes, // Usar el valor inicial
                clasesEchas: 0,
                clasePrueba: false, // O determinar según lógica
                ultimaActualizacion: new Date(),
                verificacionesSemana: 0,
                nombreProfesor: actividad.profesor || null
            }));
            await infoclasesCollection.insertMany(infoClasesNuevas);
        }

        // Devolver el cliente recién creado (sin clases pendientes añadidas aquí, se añadirán en el GET)
        const clienteCreado = await clientesCollection.findOne({ _id: clienteIdInsertado });
        return res.status(201).json(clienteCreado);
    }


    // --- ELIMINAR CLIENTE (DELETE) ---
     if (req.method === 'DELETE') {
       if (!req.query.id || !ObjectId.isValid(req.query.id)) {
         return res.status(400).json({ message: 'Se requiere un ID de cliente válido' });
       }
       const clienteObjectId = new ObjectId(req.query.id);

       // Obtener DNI antes de eliminar para borrar infoclases (si no usas idCliente en infoclases)
       const clienteAEliminar = await clientesCollection.findOne({ _id: clienteObjectId }, { projection: { dni: 1 } });

       // Eliminar el cliente
       const result = await clientesCollection.deleteOne({ _id: clienteObjectId });

       if (result.deletedCount === 0) {
         return res.status(404).json({ message: 'Cliente no encontrado' });
       }

       // Eliminar las infoclases asociadas (usando idCliente si existe, o dni como fallback)
       if (clienteAEliminar?.dni) {
           await infoclasesCollection.deleteMany({ dniCliente: clienteAEliminar.dni });
       } else {
           // Si idCliente está consistentemente guardado en infoclases, usarlo es mejor
           await infoclasesCollection.deleteMany({ idCliente: clienteObjectId });
       }


       return res.status(200).json({ message: 'Cliente y su información de clases eliminados correctamente' });
     }


    // --- ACTUALIZAR CLIENTE (PUT) ---
     if (req.method === 'PUT') {
       if (!req.query.id || !ObjectId.isValid(req.query.id)) {
         return res.status(400).json({ message: 'Se requiere un ID de cliente válido' });
       }
       const clienteObjectId = new ObjectId(req.query.id);
       const updateData = req.body;

       // Evitar actualizar campos protegidos directamente
       delete updateData._id;
       delete updateData.historialPagos; // Los pagos se manejan en su API
       delete updateData.createdAt;
       // delete updateData.estado; // El estado debe recalcularse, no setearse directamente aquí
       // delete updateData.pagado; // Idem

       // Validar y preparar actividades si vienen en la actualización
       let actividadesArray = undefined;
       if (updateData.actividades !== undefined) {
           actividadesArray = (Array.isArray(updateData.actividades) ? updateData.actividades : [])
               .map(act => ({
                   ...act,
                   _id: act._id ? new ObjectId(act._id) : new ObjectId(),
                   tarifa: parseFloat(act.tarifa || 0),
                   // NO actualizar clasesPendientes aquí, se manejan en infoclases PUT
                   // clasesPendientes: parseInt(act.clasesPendientes || 0)
               }));
           updateData.actividades = actividadesArray; // Reemplazar con el array validado/limpio
       }

       updateData.updatedAt = new Date(); // Siempre actualizar timestamp

       // Actualizar el cliente
       const resultado = await clientesCollection.updateOne(
         { _id: clienteObjectId },
         { $set: updateData }
       );

       // Si las actividades cambiaron, sincronizar infoclases (estrategia simple: borrar y recrear)
       // Una estrategia más compleja actualizaría/insertaría/eliminaría individualmente.
       if (actividadesArray !== undefined && updateData.dni) { // Necesitamos DNI
           console.log("Sincronizando infoclases debido a cambio en actividades...");
           await infoclasesCollection.deleteMany({ idCliente: clienteObjectId }); // Borrar antiguas

           if (actividadesArray.length > 0) {
               const infoClasesNuevas = actividadesArray.map(actividad => ({
                   dniCliente: parseInt(updateData.dni),
                   idCliente: clienteObjectId,
                   nombreActividad: actividad.nombre,
                   idActividad: actividad._id,
                   // Aquí SÍ necesitamos las clases pendientes iniciales para la actividad
                   clasesPendientes: parseInt(req.body.actividades.find(a => a._id.toString() === actividad._id.toString())?.clasesPendientes || 0),
                   clasesEchas: 0, // Resetear al actualizar? O mantener? Depende del caso de uso
                   clasePrueba: false,
                   ultimaActualizacion: new Date(),
                   verificacionesSemana: 0,
                   nombreProfesor: actividad.profesor || null
               }));
               await infoclasesCollection.insertMany(infoClasesNuevas);
               console.log(`Recreadas ${infoClasesNuevas.length} entradas en infoclases.`);
           }
       }

       // Recalcular y actualizar estado (si es necesario después de un PUT)
       // Esto podría ser opcional aquí si confías en que la API de pagos lo hará,
       // pero podría ser bueno para reflejar cambios en actividades/tarifas inmediatamente.
       // COMENTADO por ahora para evitar duplicidad con API pagos. Descomentar si es necesario.
       /*
       const clientePostPut = await clientesCollection.findOne({ _id: clienteObjectId });
       const estaPagadoPostPut = (clientePostPut.actividades || []).every(...) // Recalcular estaPagado
       const infoClasesPostPut = await infoclasesCollection.find({ dniCliente: clientePostPut.dni }).toArray();
       const tieneClasesPendientesPostPut = infoClasesPostPut.some(...) // Recalcular tieneClasesPendientes
       const estadoFinalPostPut = estaPagadoPostPut && !tieneClasesPendientesPostPut ? 'al día' : 'deudor';
       if (clientePostPut.estado !== estadoFinalPostPut || clientePostPut.pagado !== estaPagadoPostPut) {
           await clientesCollection.updateOne(...) // Actualizar estado/pagado
       }
       */

       if (resultado.matchedCount === 0) { // Usar matchedCount por si no hubo cambios reales
           return res.status(404).json({ message: 'Cliente no encontrado' });
       }
        if (resultado.modifiedCount === 0 && resultado.matchedCount === 1) {
             console.log("PUT Cliente: No hubo modificaciones netas en el documento.");
        }


       const clienteActualizado = await clientesCollection.findOne({ _id: clienteObjectId });
       return res.status(200).json(clienteActualizado); // Devolver cliente actualizado
     }


    // --- Método no permitido ---
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ message: 'Método no permitido' });

  } catch (error) {
    console.error("Error en API /api/clientes:", error);
    res.status(500).json({ message: 'Error al procesar la solicitud de cliente', error: error.message });
  }
}