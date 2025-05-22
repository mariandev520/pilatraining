import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'baseprueba');
    const profesoresCollection = db.collection('profesor');
    const asistenciaCollection = db.collection('asistencia');

    // GET - Obtener todos los profesores
    if (req.method === 'GET') {
      const { semana } = req.query;
      const profesores = await profesoresCollection.find({}).sort({ nombre: 1 }).toArray();
      
      let asistenciaDataPorProfesorId = {};
      if (semana) {
        const asistenciaRecords = await asistenciaCollection.find({ 
          semana: parseInt(semana) 
        }).toArray();
        
        const DIAS_SEMANA_ASISTENCIA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        
        asistenciaRecords.forEach(item => {
          const diasCompletos = {};
          DIAS_SEMANA_ASISTENCIA.forEach(dia => {
            diasCompletos[dia] = { horas: item.dias?.[dia]?.horas || 0 }; 
          });
          // Asegurarse que el profesorId es un string para la clave del objeto
          asistenciaDataPorProfesorId[item.profesorId.toString()] = diasCompletos;
        });
      }
      
      const formattedProfesores = profesores.map(profesor => {
        const profesorIdStr = profesor._id.toString();
        const defaultAsistenciaSemanal = {};
        const DIAS_SEMANA_ASISTENCIA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        DIAS_SEMANA_ASISTENCIA.forEach(dia => defaultAsistenciaSemanal[dia] = { horas: 0 });

        return {
          id: profesorIdStr,
          nombre: profesor.nombre || '',
          telefono: profesor.telefono?.toString() || '',
          correo: profesor.mail || '',
          domicilio: profesor.domicilio || '',
          dni: profesor.dni?.toString() || '',
          actividad: profesor.actividad || '',
          tarifaPorHora: profesor.tarifaPorHora === undefined ? 0 : parseFloat(profesor.tarifaPorHora), // MODIFICADO: Devolver tarifaPorHora, default a 0
          isPaid: profesor.isPaid || false, 
          asistencia: asistenciaDataPorProfesorId[profesorIdStr] || defaultAsistenciaSemanal
        };
      });
      
      return res.status(200).json(formattedProfesores);
    }

    // POST - Crear un nuevo profesor
    if (req.method === 'POST') {
      const { nombre, telefono, mail, domicilio, dni, actividad, tarifaPorHora } = req.body; // MODIFICADO: Obtener tarifaPorHora

      if (!nombre) {
        return res.status(400).json({ message: 'El campo nombre es obligatorio' });
      }

      let nuevaTarifa = parseFloat(tarifaPorHora);
      if (isNaN(nuevaTarifa) || nuevaTarifa < 0) {
        nuevaTarifa = 0; // Default a 0 si es inválida
      }

      const nuevoProfesor = {
        nombre,
        telefono: telefono ? telefono.toString() : '',
        mail: mail || '',
        domicilio: domicilio || '',
        dni: dni ? dni.toString() : '',
        actividad: actividad || '',
        tarifaPorHora: nuevaTarifa, // MODIFICADO: Guardar tarifaPorHora
        isPaid: false, 
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await profesoresCollection.insertOne(nuevoProfesor);
      const profesorCreado = { ...nuevoProfesor, id: result.insertedId.toString(), _id: result.insertedId };
      return res.status(201).json(profesorCreado);
    }

    // PUT - Actualizar un profesor
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de profesor inválido o no proporcionado.' });
      }

      if (req.body.hasOwnProperty('isPaid')) {
        const { isPaid } = req.body;
        const result = await profesoresCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { isPaid: !!isPaid, updatedAt: new Date() } }
        );
        if (result.matchedCount === 0) return res.status(404).json({ message: 'Profesor no encontrado.' });
        return res.status(200).json({ message: `Profesor marcado como ${isPaid ? 'pagado' : 'pendiente'} con éxito` });
      } 
      else {
        const { nombre, telefono, mail, domicilio, dni, actividad, tarifaPorHora } = req.body; // MODIFICADO: Obtener tarifaPorHora

        if (!nombre && !req.body.hasOwnProperty('tarifaPorHora')) { // Permitir actualizar solo tarifaPorHora si es el único campo
          return res.status(400).json({ message: 'El nombre es obligatorio para actualizar (a menos que solo se actualice la tarifa).' });
        }
        
        const updateFields = { updatedAt: new Date() };
        if (nombre !== undefined) updateFields.nombre = nombre;
        if (telefono !== undefined) updateFields.telefono = telefono.toString();
        if (mail !== undefined) updateFields.mail = mail;
        if (domicilio !== undefined) updateFields.domicilio = domicilio;
        if (dni !== undefined) updateFields.dni = dni.toString();
        if (actividad !== undefined) updateFields.actividad = actividad;
        
        if (tarifaPorHora !== undefined) { // MODIFICADO: Actualizar tarifaPorHora
            let nuevaTarifa = parseFloat(tarifaPorHora);
            if (isNaN(nuevaTarifa) || nuevaTarifa < 0) {
                 // Si la tarifa enviada no es un número válido o es negativa,
                 // puedes optar por no actualizarla, ponerla a 0, o devolver un error.
                 // Aquí se opta por ponerla a 0 si no es válida.
                 updateFields.tarifaPorHora = 0;
            } else {
                 updateFields.tarifaPorHora = nuevaTarifa;
            }
        }

        if (Object.keys(updateFields).length === 1 && updateFields.updatedAt) { // Solo updatedAt, no hay otros campos para modificar
            return res.status(200).json({ message: 'No se proporcionaron campos para actualizar.', noChanges: true });
        }

        const result = await profesoresCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
        );
        
        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Profesor no encontrado.' });
        }
        // Incluso si modifiedCount es 0 pero matchedCount es 1, puede ser que los valores enviados fueran iguales a los existentes.
        // Devolvemos el profesor actualizado para consistencia.
        
        const profesorActualizado = await profesoresCollection.findOne({_id: new ObjectId(id)});
        const formattedProfesor = { 
            ...profesorActualizado, 
            id: profesorActualizado._id.toString(),
            tarifaPorHora: profesorActualizado.tarifaPorHora === undefined ? 0 : parseFloat(profesorActualizado.tarifaPorHora) // Asegurar que se devuelve como número
        };

        return res.status(200).json({ message: 'Profesor actualizado con éxito', profesor: formattedProfesor });
      }
    }

    // DELETE - Eliminar un profesor
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id || !ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID de profesor inválido o no proporcionado.' });
      }

      const profesorResult = await profesoresCollection.deleteOne({ _id: new ObjectId(id) });
      if (profesorResult.deletedCount === 0) {
        return res.status(404).json({ message: 'Profesor no encontrado.' });
      }

      // Eliminar registros de asistencia relacionados
      // Usar el ID como string si así se guarda en la colección de asistencia (profesorId: id.toString())
      // O como ObjectId si se guarda como ObjectId (profesorId: new ObjectId(id))
      // Basado en tu código original de GET, parece que usas profesorId.toString() como clave en asistenciaDataPorProfesorId,
      // lo que sugiere que podrías estar guardando el ID como string en la colección 'asistencia'. Verifica esto.
      // Si profesorId en 'asistencia' es un ObjectId, usa: await asistenciaCollection.deleteMany({ profesorId: new ObjectId(id) });
      await asistenciaCollection.deleteMany({ profesorId: id.toString() });


      return res.status(200).json({ message: 'Profesor y sus registros de asistencia eliminados con éxito' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Método ${req.method} no permitido.` });
    
  } catch (error) {
    console.error("❌ Error en la API /api/profesor:", error);
    return res.status(500).json({ 
      message: 'Error al procesar la solicitud en /api/profesor.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor.'
    });
  }
}