import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    const colStretching = db.collection('stretching');
    
    // Método GET: Obtener asignaciones de espacios de stretching
    if (req.method === 'GET') {
      // Obtener el documento único de asignaciones de stretching
      const stretchingDoc = await colStretching.findOne({ tipo: 'asignaciones' });
      
      if (!stretchingDoc) {
        // Si no existe, devolvemos un objeto vacío (no hay asignaciones aún)
        return res.status(200).json({});
      }
      
      // Devolvemos las asignaciones
      return res.status(200).json(stretchingDoc.asignaciones || {});
    }
    
    // Método POST: Guardar/actualizar asignaciones de espacios de stretching
    if (req.method === 'POST') {
      // Validar el cuerpo de la solicitud
      if (!req.body || !req.body.asignaciones) {
        return res.status(400).json({ message: 'Se requieren las asignaciones en el cuerpo de la solicitud' });
      }
      
      const { asignaciones } = req.body;
      
      // Validar que asignaciones sea un objeto
      if (typeof asignaciones !== 'object' || asignaciones === null || Array.isArray(asignaciones)) {
        return res.status(400).json({ message: 'El formato de asignaciones no es válido' });
      }
      
      // Procesar las asignaciones para asegurar que tengan la estructura correcta
      // y evitar datos inyectados o maliciosos
      const asignacionesProcesadas = {};
      
      try {
        // Iterar sobre cada clave-valor en las asignaciones
        Object.entries(asignaciones).forEach(([espacioClave, cliente]) => {
          // Verificar el formato de la clave (día-horario-espacio)
          const partes = espacioClave.split('-');
          if (partes.length < 3) {
            throw new Error(`Formato de clave inválido: ${espacioClave}`);
          }
          
          // Validar los datos del cliente
          if (!cliente || !cliente.id || !cliente.nombre || !cliente.dni) {
            throw new Error(`Datos de cliente incompletos para ${espacioClave}`);
          }
          
          // Guardar solo los campos necesarios del cliente
          asignacionesProcesadas[espacioClave] = {
            id: cliente.id,
            nombre: cliente.nombre,
            dni: cliente.dni,
            color: cliente.color || '#00bcd4', // Color por defecto si no se proporciona
            clasesPendientes: cliente.clasesPendientes || 0
          };
        });
      } catch (error) {
        console.error('Error al procesar asignaciones:', error);
        return res.status(400).json({ message: `Error al procesar asignaciones: ${error.message}` });
      }
      
      try {
        // Buscar si ya existe un documento de asignaciones
        const existeDoc = await colStretching.findOne({ tipo: 'asignaciones' });
        
        if (existeDoc) {
          // Actualizar el documento existente
          await colStretching.updateOne(
            { tipo: 'asignaciones' },
            { $set: { 
                asignaciones: asignacionesProcesadas,
                ultimaActualizacion: new Date()
              }
            }
          );
        } else {
          // Crear un nuevo documento
          await colStretching.insertOne({
            tipo: 'asignaciones',
            asignaciones: asignacionesProcesadas,
            fechaCreacion: new Date(),
            ultimaActualizacion: new Date()
          });
        }
        
        // Registrar historial de cambios (opcional)
        await colStretching.insertOne({
          tipo: 'historial',
          asignaciones: asignacionesProcesadas,
          fechaModificacion: new Date(),
          usuario: req.body.usuario || 'sistema' // Si tienes sistema de usuarios
        });
        
        // Responder con éxito
        return res.status(200).json({ 
          message: 'Asignaciones de stretching guardadas correctamente',
          timestamp: new Date()
        });
      } catch (dbError) {
        console.error('Error al guardar en la base de datos:', dbError);
        return res.status(500).json({ message: 'Error al guardar en la base de datos' });
      }
    }
    
    // Si no es GET ni POST
    return res.status(405).json({ message: 'Método no permitido' });
    
  } catch (error) {
    console.error('Error en API de stretching:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: error.message 
    });
  }
}