import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const ACTIVITY_NAME_PILATES = "Pilates"; // Definir globalmente

export default async function handler(req, res) {
    const mainTryCatchId = `APIClientesPilates-${Date.now()}`;
    try {
        const client = await clientPromise;
        const db = client.db('test');
        const clientesCollection = db.collection('clientes');
        const infoclasesCollection = db.collection('infoclases');
        // console.log(`[${mainTryCatchId}] Conectado a DB.`);

        // --- PUT SOLO clasesMensuales (para Pilates) ---
        if (req.method === 'PUT' && req.query.campo === 'clasesMensuales') {
            const { clasesMensuales } = req.body; // actividadIndex ya no se necesita del body, siempre es 0
            const actividadIndex = 0; // Siempre la primera (y única) actividad Pilates

            if (!req.query.id || !ObjectId.isValid(req.query.id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }
            
            const cliente = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
            if (!cliente || !Array.isArray(cliente.actividades) || cliente.actividades.length === 0 || cliente.actividades[actividadIndex].nombre !== ACTIVITY_NAME_PILATES) {
                return res.status(404).json({ message: 'Cliente o actividad Pilates no encontrada' });
            }
            
            const clasesMensualesNum = parseInt(clasesMensuales) || 0;

            // Recalcular el total (ahora solo para Pilates)
            // En este caso, clasesMensualesTotales será igual a clasesMensualesNum de Pilates
            const clasesMensualesTotales = clasesMensualesNum; 
            
            const resultado = await clientesCollection.updateOne(
                { _id: new ObjectId(req.query.id) },
                {
                    $set: {
                        [`actividades.${actividadIndex}.clasesMensuales`]: clasesMensualesNum,
                        clasesMensualesTotales, // Actualizar el total general del cliente
                        updatedAt: new Date()
                    }
                }
            );
            
            await infoclasesCollection.updateMany(
                { idCliente: new ObjectId(req.query.id), nombreActividad: ACTIVITY_NAME_PILATES },
                { $set: { clasesMensuales: clasesMensualesNum, ultimaActualizacion: new Date() } }
            );
            
            const clienteActualizado = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
            return res.status(200).json({ message: 'Clases mensuales de Pilates actualizadas', cliente: clienteActualizado });
        }

        // --- GET: Obtener Clientes (Opcional: filtrar por actividad Pilates en API) ---
        if (req.method === 'GET') {
            const queryFilter = {};
            // Si el frontend envía ?actividad=Pilates, o si queremos forzarlo siempre:
            // queryFilter['actividades.nombre'] = ACTIVITY_NAME_PILATES; 

            if (req.query.id) {
                if (!ObjectId.isValid(req.query.id)) {
                    return res.status(400).json({ message: 'ID de cliente inválido' });
                }
                queryFilter._id = new ObjectId(req.query.id);
                const cliente = await clientesCollection.findOne(queryFilter);
                if (!cliente) {
                    return res.status(404).json({ message: 'Cliente no encontrado' });
                }
                return res.status(200).json(cliente);
            }
            // Para la lista general, si no se filtra por API, el frontend lo hará.
            // Pero si se quiere, se puede añadir queryFilter aquí también.
            const clientes = await clientesCollection.find(queryFilter).sort({ nombre: 1 }).toArray();
            return res.status(200).json(clientes);
        }

        // --- POST: Crear Nuevo Cliente (enfocado en Pilates) ---
        if (req.method === 'POST') {
            const { dni, nombre, correo, direccion, telefono, actividades, fechaVencimientoCuota } = req.body;
            if (!dni || !nombre) {
                return res.status(400).json({ message: 'DNI y Nombre son campos obligatorios' });
            }
            const dniNum = parseInt(dni);
            if (isNaN(dniNum)) return res.status(400).json({ message: 'DNI debe ser numérico.' });

            const clienteExistente = await clientesCollection.findOne({ dni: dniNum });
            if (clienteExistente) {
                return res.status(409).json({ message: `Cliente con DNI ${dniNum} ya existe.` });
            }

            // Asegurar que la actividad sea solo Pilates
            if (!Array.isArray(actividades) || actividades.length !== 1 || actividades[0].nombre !== ACTIVITY_NAME_PILATES) {
                return res.status(400).json({ message: `El cliente debe tener únicamente la actividad ${ACTIVITY_NAME_PILATES}.` });
            }
            const actividadPilatesData = actividades[0];

            actividadPilatesData.diasVisita = (actividadPilatesData.diasVisita || []).map(Number).filter(dia => !isNaN(dia) && dia >= 0 && dia <= 6).sort((a,b)=>a-b);
            actividadPilatesData.clasesMensuales = (actividadPilatesData.clasesMensuales !== undefined && actividadPilatesData.clasesMensuales !== '') ? parseInt(actividadPilatesData.clasesMensuales) : 0;
            actividadPilatesData.clasesPendientes = parseInt(actividadPilatesData.clasesPendientes) || 0;
            actividadPilatesData.tarifa = parseFloat(actividadPilatesData.tarifa) || 0;
            
            // Totales basados en la única actividad Pilates
            const tarifa_mensual_total = actividadPilatesData.tarifa;
            const clasesPendientesTotales = actividadPilatesData.clasesPendientes;
            const clasesMensualesTotales = actividadPilatesData.clasesMensuales;

            const nuevoCliente = {
                dni: dniNum, nombre, correo: correo || null, direccion: direccion || null, telefono: telefono || null,
                fechaVencimientoCuota: fechaVencimientoCuota ? new Date(fechaVencimientoCuota + "T00:00:00.000-03:00") : null, // Ajustar timezone si es necesario
                actividades: [actividadPilatesData], // Array con la única actividad
                tarifa_mensual_total, clasesPendientesTotales, clasesMensualesTotales,
                pagado: false, historialPagos: [], createdAt: new Date(), updatedAt: new Date(), estado: 'activo'
            };
            const clienteInsertado = await clientesCollection.insertOne(nuevoCliente);
            
            // Crear infoClase para Pilates
            const nuevoInfoClase = {
                dniCliente: nuevoCliente.dni, idCliente: clienteInsertado.insertedId,
                nombreActividad: ACTIVITY_NAME_PILATES, nombreCliente: nuevoCliente.nombre,
                clasesPendientes: actividadPilatesData.clasesPendientes, clasesMensuales: actividadPilatesData.clasesMensuales,
                clasesEchas: 0, clasePrueba: actividadPilatesData.clasePrueba || false,
                diasVisita: actividadPilatesData.diasVisita, ultimaActualizacion: new Date(),
                verificacionesSemana: 0, nombreProfesor: actividadPilatesData.profesor || null
            };
            await infoclasesCollection.insertOne(nuevoInfoClase);
            
            return res.status(201).json({ message: 'Cliente de Pilates e info de clases creados', clienteId: clienteInsertado.insertedId });
        }

        // --- PUT: Actualizar Cliente (enfocado en Pilates) ---
        if (req.method === 'PUT') {
            if (!req.query.id || !ObjectId.isValid(req.query.id)) {
                return res.status(400).json({ message: 'ID de cliente inválido' });
            }

            const { dni, nombre, correo, direccion, telefono, actividades, fechaVencimientoCuota, estado, pagado } = req.body;
            const updateFields = {};
            
            // Campos directos del cliente
            if (dni !== undefined) { /* DNI no debería cambiar, pero si se permite: */ const dniNum = parseInt(dni); if (isNaN(dniNum)) return res.status(400).json({ message: 'DNI debe ser numérico.' }); updateFields.dni = dniNum; }
            if (nombre !== undefined) updateFields.nombre = nombre;
            if (correo !== undefined) updateFields.correo = correo || null;
            if (direccion !== undefined) updateFields.direccion = direccion || null;
            if (telefono !== undefined) updateFields.telefono = telefono || null;
            if (fechaVencimientoCuota !== undefined) {
                updateFields.fechaVencimientoCuota = fechaVencimientoCuota ? new Date(fechaVencimientoCuota + "T00:00:00.000-03:00") : null;
            }
            if (estado !== undefined) updateFields.estado = estado;
            if (pagado !== undefined) updateFields.pagado = typeof pagado === 'boolean' ? pagado : false;

            // Actividad Pilates
            if (Array.isArray(actividades) && actividades.length === 1 && actividades[0].nombre === ACTIVITY_NAME_PILATES) {
                const actividadPilatesData = actividades[0];
                const actividadPilatesParseada = {
                    nombre: ACTIVITY_NAME_PILATES,
                    tarifa: parseFloat(actividadPilatesData.tarifa) || 0,
                    clasesPendientes: parseInt(actividadPilatesData.clasesPendientes) || 0,
                    clasesMensuales: (actividadPilatesData.clasesMensuales !== undefined && actividadPilatesData.clasesMensuales !== '') ? parseInt(actividadPilatesData.clasesMensuales) : 0,
                    profesor: actividadPilatesData.profesor || null,
                    diasVisita: Array.isArray(actividadPilatesData.diasVisita) ? actividadPilatesData.diasVisita.map(Number).filter(d => !isNaN(d) && d >= 0 && d <= 6).sort((a, b) => a - b) : []
                };
                updateFields.actividades = [actividadPilatesParseada];
                updateFields.tarifa_mensual_total = actividadPilatesParseada.tarifa;
                updateFields.clasesPendientesTotales = actividadPilatesParseada.clasesPendientes;
                updateFields.clasesMensualesTotales = actividadPilatesParseada.clasesMensuales;
            } else if (Array.isArray(actividades)) { // Si envían actividades pero no es el formato esperado
                return res.status(400).json({ message: `La actualización debe ser solo para la actividad ${ACTIVITY_NAME_PILATES}.` });
            }
            
            if (Object.keys(updateFields).length === 0) {
                return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
            }
            updateFields.updatedAt = new Date();
            
            const resultadoClienteUpdate = await clientesCollection.updateOne(
                { _id: new ObjectId(req.query.id) },
                { $set: updateFields }
            );
            if (resultadoClienteUpdate.matchedCount === 0) {
                return res.status(404).json({ message: 'Cliente no encontrado para actualizar' });
            }

            // Resincronizar infoclases si se actualizaron las actividades
            if (updateFields.actividades) { // Solo si se envió y procesó el array de actividades
                const clienteActualizado = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
                if (clienteActualizado && clienteActualizado.actividades && clienteActualizado.actividades.length > 0) {
                    await infoclasesCollection.deleteMany({ idCliente: new ObjectId(req.query.id) }); // Borra todas las anteriores para este cliente
                    // Y crea la nueva (o actualizada) info para Pilates
                    const actividadPilatesActualizada = clienteActualizado.actividades[0];
                    const nuevoInfoClase = {
                        dniCliente: clienteActualizado.dni, idCliente: clienteActualizado._id,
                        nombreActividad: ACTIVITY_NAME_PILATES, nombreCliente: clienteActualizado.nombre,
                        clasesPendientes: parseInt(actividadPilatesActualizada.clasesPendientes) || 0,
                        clasesMensuales: parseInt(actividadPilatesActualizada.clasesMensuales) || 0,
                        clasesEchas: 0, // Resetear o mantener lógica previa si existe
                        clasePrueba: actividadPilatesActualizada.clasePrueba || false,
                        diasVisita: actividadPilatesActualizada.diasVisita,
                        ultimaActualizacion: new Date(), verificacionesSemana: 0,
                        nombreProfesor: actividadPilatesActualizada.profesor || null
                    };
                    await infoclasesCollection.insertOne(nuevoInfoClase);
                }
            }
            
            const clienteFinalParaRespuesta = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
            return res.status(200).json({ message: 'Cliente actualizado correctamente', cliente: clienteFinalParaRespuesta });
        }

        // --- DELETE: Eliminar Cliente (sin cambios, ya elimina infoclases asociadas) ---
        if (req.method === 'DELETE') {
            // ... (la lógica de DELETE puede permanecer igual ya que borra por idCliente o dniCliente)
             if (!req.query.id || !ObjectId.isValid(req.query.id)) {
                return res.status(400).json({ message: 'ID inválido para eliminar' });
            }
            const idClienteObj = new ObjectId(req.query.id);
            // Opcional: Obtener DNI antes de eliminar para asegurar limpieza de infoclases si idCliente no fuera suficiente
            // const clienteAEliminarDatos = await clientesCollection.findOne({ _id: idClienteObj }, { projection: { dni: 1 } });

            const result = await clientesCollection.deleteOne({ _id: idClienteObj });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: 'Cliente no encontrado para eliminar' });
            }
            // Eliminar de infoclases. Asumimos que idCliente es suficiente.
            await infoclasesCollection.deleteMany({ idCliente: idClienteObj });
            return res.status(200).json({ message: 'Cliente e información de clases asociadas eliminados' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Método ${req.method} no permitido.` });

    } catch (error) {
        console.error(`[${mainTryCatchId}] Error:`, error);
        res.status(500).json({ message: 'Error interno del servidor.', errorDetails: error.message });
    }
}