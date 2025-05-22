// services/fileUploadService.js
import axios from 'axios';

const SERVER_URL = 'http://69.62.93.244'; // URL del servidor Linux

/**
 * Sube un archivo al servidor Linux
 * @param {File} file - El archivo a subir
 * @param {string} clienteName - Nombre del cliente para nombrar el archivo
 * @param {string} paymentDate - Fecha del pago para nombrar el archivo
 * @returns {Promise<string>} - URL del archivo subido
 */
export const uploadPaymentReceipt = async (file, clienteName, paymentDate) => {
  if (!file) {
    throw new Error('No se ha seleccionado ningún archivo');
  }
  
  // Formatear la fecha para el nombre del archivo (ej: 2023-04-10_14-30-25)
  const formattedDate = paymentDate 
    ? new Date(paymentDate).toISOString().replace(/:/g, '-').replace('T', '_').split('.')[0]
    : new Date().toISOString().replace(/:/g, '-').replace('T', '_').split('.')[0];
  
  // Normalizar el nombre del cliente (quitar espacios y caracteres especiales)
  const normalizedClientName = clienteName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
  
  // Crear un nombre único para el archivo
  const fileName = `comprobante_${normalizedClientName}_${formattedDate}${getFileExtension(file.name)}`;
  
  // Crear FormData para enviar el archivo
  const formData = new FormData();
  formData.append('file', file, fileName);
  
  try {
    // Realizar la petición al endpoint para subir archivos
    const response = await axios.post(`${SERVER_URL}/drive/upload.php`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data && response.data.success) {
      // Devolver la URL completa del archivo
      return `${SERVER_URL}/drive/${fileName}`;
    } else {
      throw new Error(response.data.message || 'Error al subir el archivo');
    }
  } catch (error) {
    console.error('Error al subir el archivo:', error);
    throw new Error('No se pudo subir el archivo al servidor');
  }
};

/**
 * Obtiene la extensión de un archivo
 * @param {string} filename - Nombre del archivo
 * @returns {string} - Extensión del archivo
 */
const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 1);
};

/**
 * Verifica si un archivo es una imagen válida
 * @param {File} file - El archivo a verificar
 * @returns {boolean} - true si es una imagen válida
 */
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
  return file && validTypes.includes(file.type);
};