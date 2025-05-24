import clientPromise from '@/lib/mongodb'; // Asegúrate que la ruta a tu configuración de MongoDB sea correcta
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Log inicial para cada request que llega a este handler
    console.log(`[API Pagos Handler] Method: ${req.method}, URL: ${req.url}, Query:`, req.query);
    const { profesorId } = req.query;

    if (!ObjectId.isValid(profesorId)) {
        console.warn(`[API Pagos Handler] ID de profesor inválido en query: ${profesorId}`);
        return res.status(400).json({ message: 'ID de profesor inválido.' });
    }

    try {
        console.log(`[API Pagos Handler] Conectando a la base de datos para profesorId: ${profesorId}`);
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_DB || 'test'); // Usa variable de entorno para el nombre de la DB o tu default
        console.log(`[API Pagos Handler] Conectado a DB: ${db.databaseName}`);
        const pagosCollection = db.collection('historialPagos');
        const profesoresCollection = db.collection('profesor');

        const profesorObjectId = new ObjectId(profesorId);

        if (req.method === 'POST') {
            console.log('[API Pagos Handler] Procesando POST. Body:', req.body);
            const profesor = await profesoresCollection.findOne({ _id: profesorObjectId });
            if (!profesor) {
                console.warn(`[API Pagos Handler] Profesor no encontrado para POST: ${profesorId}`);
                return res.status(404).json({ message: 'Profesor no encontrado.' });
            }
            
            const { montoPagado, semanaISO, anioISO, descripcion } = req.body;

            // Validaciones del body
            if (typeof montoPagado !== 'number' || montoPagado <= 0) {
                console.warn('[API Pagos Handler] Monto pagado inválido:', montoPagado);
                return res.status(400).json({ message: 'Monto pagado es inválido.' });
            }
            if (typeof semanaISO !== 'number' || semanaISO < 1 || semanaISO > 53) {
                console.warn('[API Pagos Handler] Semana ISO inválida:', semanaISO);
                return res.status(400).json({ message: 'Semana ISO inválida.' });
            }
            if (typeof anioISO !== 'number' || anioISO < 2000 || anioISO > new Date().getFullYear() + 5) {
                console.warn('[API Pagos Handler] Año ISO inválido:', anioISO);
                return res.status(400).json({ message: 'Año ISO inválido.' });
            }
            
            // const pagoExistente = await pagosCollection.findOne({ // Lógica de pagoExistente comentada según tu versión
            //     profesorId: profesorObjectId,
            //     semanaISO: parseInt(semanaISO),
            //     anioISO: parseInt(anioISO)
            // });
            // if (pagoExistente) {
            //      console.warn('[API Pagos Handler] Intento de registrar pago duplicado (semana/año).');
            //      // return res.status(409).json({ message: `Ya existe un pago registrado para la semana ${semanaISO} del ${anioISO} para este profesor.` });
            // }

            const nuevoPago = {
                profesorId: profesorObjectId,
                montoPagado: parseFloat(montoPagado),
                semanaISO: parseInt(semanaISO),
                anioISO: parseInt(anioISO),
                descripcion: descripcion || `Pago semana ${semanaISO}/${anioISO}`,
                fechaPago: new Date(),
            };

            console.log('[API Pagos Handler] Insertando nuevo pago:', nuevoPago);
            const result = await pagosCollection.insertOne(nuevoPago);
            const pagoCreado = { ...nuevoPago, id: result.insertedId.toString(), _id: result.insertedId };
            
            console.log('[API Pagos Handler] Pago insertado con éxito. ID:', result.insertedId);
            return res.status(201).json(pagoCreado);

        } else if (req.method === 'GET') {
            console.log('[API Pagos Handler] Procesando GET.');
            const pagos = await pagosCollection
                .find({ profesorId: profesorObjectId })
                .sort({ fechaPago: -1 })
                .toArray();
            const formattedPagos = pagos.map(pago => ({ ...pago, id: pago._id.toString() }));
            console.log(`[API Pagos Handler] Encontrados ${formattedPagos.length} pagos para profesor ${profesorId}.`);
            return res.status(200).json(formattedPagos);

        } else {
            console.warn(`[API Pagos Handler] Método no permitido: ${req.method}`);
            res.setHeader('Allow', ['GET', 'POST']);
            return res.status(405).json({ message: `Método ${req.method} no permitido.` });
        }
    } catch (error) {
        console.error(`[API Pagos Handler] Error CRÍTICO en API pagos para profesor ${profesorId}:`, error.message, error.stack);
        // Asegurarse de que la respuesta de error también sea JSON
        return res.status(500).json({ 
            message: 'Error interno del servidor al procesar pagos.',
            errorDetails: process.env.NODE_ENV === 'development' ? { message: error.message, stack: error.stack } : 'Detalles no disponibles en producción.'
        });
    }
}