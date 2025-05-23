import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('test');
    const colSpinning = db.collection('spinning');
    
    // Método GET: Obtener asignaciones de espacios de spinning
    if (req.method === 'GET') {
      // Obtener el documento único de asignaciones de spinning
      const spinningDoc = await colSpinning.findOne({ tipo: 'asignaciones' });
      
      if (!spinningDoc) {
        // Si no existe, devolvemos un objeto vacío (no hay asignaciones aún)
        return res.status(200).json({});
      }
      
      // Devolvemos las asignaciones
      return res.status(200).json(spinningDoc.asignaciones || {});
    }
    
    // Método POST: Guardar/actualizar asignaciones de espacios de spinning
    if (req.method === 'POST') {
      // Validar el cuerpo de la solicitud
      if (!req.body || req.body.asignaciones === undefined) {
        return res.status(400).json({ message: 'Se requieren las asignaciones en el cuerpo de la solicitud' });
      }
      
      const { asignaciones } = req.body;
      
      // Validar que asignaciones sea un objeto (también permitimos objeto vacío para borrar todas)
      if (typeof asignaciones !== 'object' || asignaciones === null || Array.isArray(asignaciones)) {
        return res.status(400).json({ message: 'El formato de asignaciones no es válido' });
      }
      
      // Procesar las asignaciones para asegurar que tengan la estructura correcta
      // y evitar datos inyectados o maliciosos
      const asignacionesProcesadas = {};
      
      try {
        // Si hay asignaciones para procesar
        if (Object.keys(asignaciones).length > 0) {
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
              color: cliente.color || '#f57c00', // Color por defecto si no se proporciona
              clasesPendientes: cliente.clasesPendientes || 0
            };
          });
        }
        // Si no hay asignaciones, simplemente continuamos con un objeto vacío
      } catch (error) {
        console.error('Error al procesar asignaciones:', error);
        return res.status(400).json({ message: `Error al procesar asignaciones: ${error.message}` });
      }
      
      try {
        // Buscar si ya existe un documento de asignaciones
        const existeDoc = await colSpinning.findOne({ tipo: 'asignaciones' });
        
        if (existeDoc) {
          // Actualizar el documento existente
          await colSpinning.updateOne(
            { tipo: 'asignaciones' },
            { $set: { 
                asignaciones: asignacionesProcesadas,
                ultimaActualizacion: new Date()
              }
            }
          );
        } else {
          // Crear un nuevo documento
          await colSpinning.insertOne({
            tipo: 'asignaciones',
            asignaciones: asignacionesProcesadas,
            fechaCreacion: new Date(),
            ultimaActualizacion: new Date()
          });
        }
        
        // Registrar historial de cambios (opcional)
        await colSpinning.insertOne({
          tipo: 'historial',
          asignaciones: asignacionesProcesadas,
          fechaModificacion: new Date(),
          usuario: req.body.usuario || 'sistema', // Si tienes sistema de usuarios
          accion: Object.keys(asignacionesProcesadas).length === 0 ? 'borrado_completo' : 'actualización'
        });
        
        // Responder con éxito
        return res.status(200).json({ 
          message: Object.keys(asignacionesProcesadas).length === 0 
            ? 'Todas las asignaciones de spinning han sido eliminadas' 
            : 'Asignaciones de spinning guardadas correctamente',
          timestamp: new Date()
        });
      } catch (dbError) {
        console.error('Error al guardar en la base de datos:', dbError);
        return res.status(500).json({ message: 'Error al guardar en la base de datos' });
      }
    }
    
    // Método DELETE: Borrar todas las asignaciones o asignaciones específicas
    if (req.method === 'DELETE') {
      try {
        // Verificar si se especifica un día para borrar
        const { dia } = req.query;
        
        if (dia) {
          // Borrar asignaciones para un día específico
          const spinningDoc = await colSpinning.findOne({ tipo: 'asignaciones' });
          
          if (!spinningDoc || !spinningDoc.asignaciones) {
            return res.status(404).json({ message: 'No hay asignaciones para borrar' });
          }
          
          // Filtrar las asignaciones para mantener solo las que NO son del día especificado
          const asignacionesActualizadas = {};
          Object.entries(spinningDoc.asignaciones).forEach(([clave, valor]) => {
            if (!clave.startsWith(`${dia}-`)) {
              asignacionesActualizadas[clave] = valor;
            }
          });
          
          // Actualizar el documento con las asignaciones filtradas
          await colSpinning.updateOne(
            { tipo: 'asignaciones' },
            { $set: { 
                asignaciones: asignacionesActualizadas,
                ultimaActualizacion: new Date()
              }
            }
          );
          
          // Registrar en historial
          await colSpinning.insertOne({
            tipo: 'historial',
            accion: `borrado_dia_${dia}`,
            fechaModificacion: new Date(),
            usuario: req.body.usuario || 'sistema'
          });
          
          return res.status(200).json({ 
            message: `Asignaciones del día ${dia} borradas correctamente`,
            timestamp: new Date()
          });
          
        } else {
          // Borrar todas las asignaciones
          await colSpinning.updateOne(
            { tipo: 'asignaciones' },
            { $set: { 
                asignaciones: {},
                ultimaActualizacion: new Date()
              }
            }
          );
          
          // Registrar en historial
          await colSpinning.insertOne({
            tipo: 'historial',
            accion: 'borrado_completo',
            fechaModificacion: new Date(),
            usuario: req.body.usuario || 'sistema'
          });
          
          return res.status(200).json({ 
            message: 'Todas las asignaciones han sido borradas',
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Error al borrar asignaciones:', error);
        return res.status(500).json({ message: 'Error al borrar asignaciones', error: error.message });
      }
    }
    
    // Si no es GET, POST ni DELETE
    return res.status(405).json({ message: 'Método no permitido' });
    
  } catch (error) {
    console.error('Error en API de spinning:', error);
    return res.status(500).json({ 
      message: 'Error interno del servidor', 
      error: error.message 
    });
  }
}