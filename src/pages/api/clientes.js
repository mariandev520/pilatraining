import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const mainTryCatchId = `APIClientes-${Date.now()}`;
    try {
        const client = await clientPromise;
        const db = client.db('test');
        const clientesCollection = db.collection('clientes');
        const infoclasesCollection = db.collection('infoclases');
        console.log(`[${mainTryCatchId}] Conectado a DB.`);

        // --- PUT SOLO clasesMensuales ---
        if (req.method === 'PUT' && req.query.campo === 'clasesMensuales') {
            const { actividadIndex, clasesMensuales } = req.body;
            if (!req.query.id || !ObjectId.isValid(req.query.id)) {
                return res.status(400).json({ message: 'ID inválido' });
            }
            if (typeof actividadIndex !== 'number' || actividadIndex < 0) {
                return res.status(400).json({ message: 'Índice de actividad inválido' });
            }
            const cliente = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
            if (!cliente || !Array.isArray(cliente.actividades) || actividadIndex >= cliente.actividades.length) {
                return res.status(404).json({ message: 'Cliente o actividad no encontrada' });
            }
            // Actualizar solo ese campo
            const actividadesActualizadas = [...cliente.actividades];
            actividadesActualizadas[actividadIndex].clasesMensuales = parseInt(clasesMensuales) || 0;
            // Recalcular el total
            const clasesMensualesTotales = actividadesActualizadas.reduce(
                (sum, act) => sum + (parseInt(act.clasesMensuales) || 0), 0
            );
            const resultado = await clientesCollection.updateOne(
                { _id: new ObjectId(req.query.id) },
                {
                    $set: {
                        [`actividades.${actividadIndex}.clasesMensuales`]: parseInt(clasesMensuales) || 0,
                        clasesMensualesTotales,
                        updatedAt: new Date()
                    }
                }
            );
            // Actualiza también infoclases si corresponde
            const actividad = actividadesActualizadas[actividadIndex];
            await infoclasesCollection.updateMany(
                { idCliente: new ObjectId(req.query.id), nombreActividad: actividad.nombre },
                { $set: { clasesMensuales: parseInt(clasesMensuales) || 0, ultimaActualizacion: new Date() } }
            );
            const clienteActualizado = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
            return res.status(200).json({ message: 'clasesMensuales actualizado correctamente', cliente: clienteActualizado });
        }

        // --- GET: Obtener Clientes ---
        if (req.method === 'GET') {
            if (req.query.id) {
                if (!ObjectId.isValid(req.query.id)) {
                    return res.status(400).json({ message: 'ID de cliente inválido' });
                }
                const cliente = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
                if (!cliente) {
                    return res.status(404).json({ message: 'Cliente no encontrado' });
                }
                return res.status(200).json(cliente);
            }
            const clientes = await clientesCollection.find({}).sort({ nombre: 1 }).toArray();
            return res.status(200).json(clientes);
        }

        // --- POST: Crear Nuevo Cliente ---
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
            const actividadesArray = Array.isArray(actividades) ? actividades : [];
            for (const actividad of actividadesArray) {
                actividad.diasVisita = (actividad.diasVisita || []).map(Number).filter(dia => !isNaN(dia) && dia >= 0 && dia <= 6).sort((a,b)=>a-b);
                actividad.clasesMensuales = (actividad.clasesMensuales !== undefined && actividad.clasesMensuales !== '') ? parseInt(actividad.clasesMensuales) : 0;
                actividad.clasesPendientes = parseInt(actividad.clasesPendientes) || 0;
                actividad.tarifa = parseFloat(actividad.tarifa) || 0;
            }
            const tarifa_mensual_total = actividadesArray.reduce((total, act) => total + act.tarifa, 0);
            const clasesPendientesTotales = actividadesArray.reduce((total, act) => total + act.clasesPendientes, 0);
            const clasesMensualesTotales = actividadesArray.reduce((total, act) => total + act.clasesMensuales, 0);

            const nuevoCliente = {
                dni: dniNum, nombre, correo: correo || null, direccion: direccion || null, telefono: telefono || null,
                fechaVencimientoCuota: fechaVencimientoCuota ? new Date(fechaVencimientoCuota + "T00:00:00.000-03:00") : null,
                actividades: actividadesArray,
                tarifa_mensual_total, clasesPendientesTotales, clasesMensualesTotales,
                pagado: false, historialPagos: [], createdAt: new Date(), updatedAt: new Date(), estado: 'activo'
            };
            const clienteInsertado = await clientesCollection.insertOne(nuevoCliente);
            for (const actividad of nuevoCliente.actividades) {
                const nuevoInfoClase = {
                    dniCliente: nuevoCliente.dni, idCliente: clienteInsertado.insertedId,
                    nombreActividad: actividad.nombre, nombreCliente: nuevoCliente.nombre,
                    clasesPendientes: actividad.clasesPendientes, clasesMensuales: actividad.clasesMensuales,
                    clasesEchas: 0, clasePrueba: actividad.clasePrueba || false,
                    diasVisita: actividad.diasVisita, ultimaActualizacion: new Date(),
                    verificacionesSemana: 0, nombreProfesor: actividad.profesor || null
                };
                await infoclasesCollection.insertOne(nuevoInfoClase);
            }
            return res.status(201).json({ message: 'Cliente e info de clases creados', clienteId: clienteInsertado.insertedId });
        }

        // --- PUT: Actualizar Cliente (edición global, igual que tu versión original) ---
        if (req.method === 'PUT') {
            if (!req.query.id) return res.status(400).json({ message: 'Se requiere ID del cliente' });
            if (!ObjectId.isValid(req.query.id)) return res.status(400).json({ message: 'ID de cliente inválido' });

            const { dni, nombre, correo, direccion, telefono, actividades, fechaVencimientoCuota, estado, pagado } = req.body;
            const updateFields = {};
            if (dni !== undefined) {
                const dniNum = parseInt(dni);
                if (isNaN(dniNum)) return res.status(400).json({ message: 'DNI debe ser numérico.' });
                updateFields.dni = dniNum;
            }
            if (nombre !== undefined) updateFields.nombre = nombre;
            if (correo !== undefined) updateFields.correo = correo || null;
            if (direccion !== undefined) updateFields.direccion = direccion || null;
            if (telefono !== undefined) updateFields.telefono = telefono || null;
            if (fechaVencimientoCuota !== undefined) {
                updateFields.fechaVencimientoCuota = fechaVencimientoCuota ? new Date(fechaVencimientoCuota + "T00:00:00.000-03:00") : null;
            }
            if (estado !== undefined) updateFields.estado = estado;
            if (pagado !== undefined) updateFields.pagado = typeof pagado === 'boolean' ? pagado : false;

            if (Array.isArray(actividades)) {
                const actividadesParseadas = actividades.map(act => {
                    const clasesMensualesNum = (act.clasesMensuales !== undefined && act.clasesMensuales !== '') ? parseInt(act.clasesMensuales) : 0;
                    const clasesPendientesNum = parseInt(act.clasesPendientes) || 0;
                    return {
                        nombre: act.nombre,
                        tarifa: parseFloat(act.tarifa) || 0,
                        clasesPendientes: clasesPendientesNum,
                        clasesMensuales: clasesMensualesNum,
                        profesor: act.profesor || null,
                        diasVisita: Array.isArray(act.diasVisita) ? act.diasVisita.map(Number).filter(d => !isNaN(d) && d >= 0 && d <= 6).sort((a, b) => a - b) : []
                    };
                });
                updateFields.actividades = actividadesParseadas;
                updateFields.tarifa_mensual_total = actividadesParseadas.reduce((total, act) => total + (act.tarifa || 0), 0);
                updateFields.clasesPendientesTotales = actividadesParseadas.reduce((total, act) => total + (act.clasesPendientes || 0), 0);
                updateFields.clasesMensualesTotales = actividadesParseadas.reduce((total, act) => total + (act.clasesMensuales || 0), 0);
            }
            if (Object.keys(updateFields).length === 0 && !Array.isArray(actividades)) {
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

            // Resincronizar infoclases si se envía el array de actividades
            if (Array.isArray(actividades)) {
                const clienteActualizado = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
                if (clienteActualizado) {
                    await infoclasesCollection.deleteMany({ idCliente: new ObjectId(req.query.id) });
                    for (const actividad of clienteActualizado.actividades) {
                        const nuevoInfoClase = {
                            dniCliente: clienteActualizado.dni,
                            idCliente: clienteActualizado._id,
                            nombreActividad: actividad.nombre,
                            nombreCliente: clienteActualizado.nombre,
                            clasesPendientes: parseInt(actividad.clasesPendientes) || 0,
                            clasesMensuales: parseInt(actividad.clasesMensuales) || 0,
                            clasesEchas: 0,
                            clasePrueba: actividad.clasePrueba || false,
                            diasVisita: actividad.diasVisita,
                            ultimaActualizacion: new Date(),
                            verificacionesSemana: 0,
                            nombreProfesor: actividad.profesor || null
                        };
                        await infoclasesCollection.insertOne(nuevoInfoClase);
                    }
                }
            }
            const clienteFinalParaRespuesta = await clientesCollection.findOne({ _id: new ObjectId(req.query.id) });
            return res.status(200).json({ message: 'Cliente actualizado correctamente', cliente: clienteFinalParaRespuesta });
        }

        // --- DELETE: Eliminar Cliente ---
        if (req.method === 'DELETE') {
            if (!req.query.id) return res.status(400).json({ message: 'Se requiere ID del cliente' });
            if (!ObjectId.isValid(req.query.id)) return res.status(400).json({ message: 'ID inválido' });
            const idClienteObj = new ObjectId(req.query.id);
            const clienteAEliminar = await clientesCollection.findOne({ _id: idClienteObj }, { projection: { dni: 1 } });
            const result = await clientesCollection.deleteOne({ _id: idClienteObj });
            if (result.deletedCount === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
            if (clienteAEliminar && clienteAEliminar.dni) {
                await infoclasesCollection.deleteMany({ dniCliente: clienteAEliminar.dni });
            } else {
                await infoclasesCollection.deleteMany({ idCliente: idClienteObj });
            }
            return res.status(200).json({ message: 'Cliente eliminado correctamente' });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ message: `Método ${req.method} no permitido.` });
    } catch (error) {
        res.status(500).json({ message: 'Error al procesar la solicitud.', errorDetails: error.message });
    }
}