import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SERVER_URL = 'http://69.62.93.244';
const UPLOAD_ENDPOINT = `${SERVER_URL}/drive/upload.php`;

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('baseprueba');
    const clientesCollection = db.collection('clientes');
    const infoclasesCollection = db.collection('infoclases');
    const { id } = req.query;

    if (req.method === 'POST') {
      const form = new IncomingForm({
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024
      });
      
      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve([fields, files]);
        });
      });

      const monto = parseFloat(fields.monto);
      const fechaPago = new Date().toISOString();
      
      if (!monto || isNaN(monto) || monto <= 0) {
        return res.status(400).json({ message: 'Monto inválido' });
      }

      const cliente = await clientesCollection.findOne({ _id: new ObjectId(id) });
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }

      let nuevoPago = {
        _id: new ObjectId(),
        monto: monto,
        fechaPago: fechaPago
      };

      if (fields.idActividad) {
        nuevoPago.idActividad = fields.idActividad;
      }

      if (files.comprobante) {
        const file = files.comprobante;
        
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
        if (!validTypes.includes(file.mimetype)) {
          return res.status(400).json({ 
            message: 'Formato de archivo no válido. Se aceptan: JPG, PNG, GIF y PDF' 
          });
        }

        try {
          const formattedDate = fechaPago
            .replace(/:/g, '-')
            .replace('T', '_')
            .split('.')[0];
          
          const normalizedClientName = cliente.nombre
            ? cliente.nombre.normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^\w\s]/gi, '')
                .replace(/\s+/g, '_')
                .toLowerCase()
            : 'cliente';
          
          const fileExt = path.extname(file.originalFilename || '.jpg');
          const fileName = `comprobante_${normalizedClientName}_${formattedDate}${fileExt}`;
          
          const formData = new FormData();
          const fileBuffer = fs.readFileSync(file.filepath);
          
          const blob = new Blob([fileBuffer], { type: file.mimetype });
          formData.append('file', blob, fileName);
          
          const tempDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
          }
          
          const localFilePath = path.join(tempDir, fileName);
          fs.copyFileSync(file.filepath, localFilePath);
          
          try {
            const FormData = require('form-data');
            const nodeFormData = new FormData();
            nodeFormData.append('file', fs.createReadStream(file.filepath), {
              filename: fileName,
              contentType: file.mimetype
            });
            
            const uploadResponse = await axios.post(UPLOAD_ENDPOINT, nodeFormData, {
              headers: nodeFormData.getHeaders()
            });
            
            if (uploadResponse.data && uploadResponse.data.success) {
              nuevoPago.comprobante = {
                url: `${SERVER_URL}/drive/${fileName}`,
                nombreArchivo: fileName,
                tipoArchivo: file.mimetype,
                urlLocal: `/uploads/${fileName}`
              };
            } else {
              throw new Error(uploadResponse.data?.message || 'Error al subir archivo');
            }
          } catch (uploadError) {
            nuevoPago.comprobante = {
              urlLocal: `/uploads/${fileName}`,
              nombreArchivo: fileName,
              tipoArchivo: file.mimetype,
              errorSubida: true
            };
          }
        } catch (processingError) {
          console.error('Error al procesar archivo:', processingError);
        }
      }

      const resultado = await clientesCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { historialPagos: nuevoPago },
          $set: { updatedAt: new Date() }
        }
      );

      if (resultado.modifiedCount === 0) {
        return res.status(500).json({ message: 'Error al registrar el pago' });
      }

      const clienteActualizado = await clientesCollection.findOne({ _id: new ObjectId(id) });
      
      // Verificar estado de pago considerando actividades específicas
      const estaPagado = clienteActualizado.actividades.every(actividad => {
        const pagosActividad = (clienteActualizado.historialPagos || [])
          .filter(pago => pago.idActividad === actividad._id)
          .reduce((sum, pago) => sum + pago.monto, 0);
        return pagosActividad >= actividad.tarifa;
      });

      // Verificar clases pendientes en infoclases
      const infoClases = await infoclasesCollection.find({ 
        dniCliente: clienteActualizado.dni 
      }).toArray();

      const tieneClasesPendientes = infoClases.some(
        clase => clase.clasesPendientes > 0
      );

      // Determinar estado final
      const estadoFinal = estaPagado && !tieneClasesPendientes ? 'al día' : 'deudor';

      if (clienteActualizado.pagado !== estaPagado || clienteActualizado.estado !== estadoFinal) {
        await clientesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { 
            pagado: estaPagado,
            estado: estadoFinal
          }}
        );
      }
      
      const clienteFinal = await clientesCollection.findOne({ _id: new ObjectId(id) });
      return res.status(200).json(clienteFinal);
    }
    
    if (req.method === 'DELETE') {
      const { pagoId } = req.query; // Asegúrate que pagoId viene en la query o params
    
      if (!pagoId || !ObjectId.isValid(pagoId)) { // Validar pagoId
         return res.status(400).json({ message: 'ID de pago inválido o no proporcionado' });
      }
    
      const cliente = await clientesCollection.findOne({ _id: new ObjectId(id) });
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
    
      // Encuentra el pago para obtener detalles (ej. comprobante a borrar) si es necesario
      const pagoAEliminar = cliente.historialPagos?.find(p => p._id.toString() === pagoId);
    
      // Eliminar el pago del array
      const updateResult = await clientesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $pull: { historialPagos: { _id: new ObjectId(pagoId) } } }
      );
    
      if (updateResult.modifiedCount === 0) {
         // Puede que el pago ya no existiera, pero no necesariamente un error grave
         console.warn(`No se eliminó el pago ${pagoId} para cliente ${id}. Puede que ya no existiera.`);
         // Continuar para recalcular estado de todas formas
      }
    
      // Opcional: Lógica para eliminar el comprobante del servidor externo si existe
      if (pagoAEliminar?.comprobante?.url) {
         // Lógica para llamar a un endpoint de eliminación en tu servidor de archivos
         // Ejemplo: await axios.delete(`<span class="math-inline">\{SERVER\_URL\}/drive/delete\.php?filename\=</span>{pagoAEliminar.comprobante.nombreArchivo}`);
         console.log(`Info: Se debería eliminar el archivo ${pagoAEliminar.comprobante.nombreArchivo}`);
      }
       if (pagoAEliminar?.comprobante?.urlLocal) {
         // Lógica para eliminar el archivo local
         try {
           const localPath = path.join(process.cwd(), 'public', pagoAEliminar.comprobante.urlLocal);
           if (fs.existsSync(localPath)) {
             fs.unlinkSync(localPath);
             console.log(`Archivo local eliminado: ${localPath}`);
           }
         } catch (unlinkErr) {
           console.error("Error eliminando archivo local:", unlinkErr);
         }
       }
    
    
      // --- RECALCULAR ESTADO (Copiar/Adaptar lógica del POST) ---
      const clienteDespuesDeEliminar = await clientesCollection.findOne({ _id: new ObjectId(id) }); // Obtener cliente con pago ya eliminado
    
      const estaPagado = (clienteDespuesDeEliminar.actividades || []).every(actividad => {
          const pagosActividad = (clienteDespuesDeEliminar.historialPagos || [])
              .filter(pago => pago.idActividad === actividad._id.toString()) // Asegurar comparación de strings si es necesario
              .reduce((sum, pago) => sum + pago.monto, 0);
          // Considerar tarifas como números
          return pagosActividad >= parseFloat(actividad.tarifa || 0);
      });
    
    
      const infoClases = await infoclasesCollection.find({
          dniCliente: clienteDespuesDeEliminar.dni
      }).toArray();
    
      const tieneClasesPendientes = infoClases.some(
          clase => clase.clasesPendientes > 0
      );
    
      // Determinar estado final (Corregido para que 'deudor' sea el default si no está 'al día')
      const estadoFinal = estaPagado && !tieneClasesPendientes ? 'al día' : 'deudor';
    
    
      // Actualizar 'pagado' y 'estado' en la BD
      await clientesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: {
              pagado: estaPagado, // Actualizar basado en si todas las actividades están pagadas
              estado: estadoFinal, // Actualizar estado ('al día' o 'deudor')
              updatedAt: new Date() // Actualizar fecha de modificación
          }}
      );
      // --- FIN RECALCULAR ESTADO ---
    
      // Devolver el cliente completamente actualizado
      const clienteFinal = await clientesCollection.findOne({ _id: new ObjectId(id) });
      return res.status(200).json(clienteFinal); // Devolver cliente actualizado
    }
    
    res.status(405).json({ message: 'Método no permitido' });
  } catch (error) {
    console.error('Error en API pagos:', error);
    res.status(500).json({ 
      message: 'Error al procesar pago', 
      error: error.message || 'Error desconocido'
    });
  }
}