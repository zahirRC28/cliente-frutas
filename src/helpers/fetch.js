/**
 * Función helper para realizar llamadas HTTP a la API
 *
 * @async
 * @function conectar
 * @param {string} urlApi - URL del endpoint de la API
 * @param {string} [method='GET'] - Método HTTP ('GET', 'POST', 'PUT', 'DELETE', etc.)
 * @param {Object|FormData} [body={}] - Cuerpo de la petición. Puede ser un objeto JSON o FormData para archivos
 * @param {string} [token] - Token JWT para autorización (opcional)
 * @param {('json'|'blob'|'arrayBuffer')} [responseType='json'] - Tipo de respuesta esperada
 *    - 'json': Devuelve respuesta parseada a JSON (default)
 *    - 'blob': Devuelve la respuesta como Blob (archivos binarios, imágenes, pdf)
 *    - 'arrayBuffer': Devuelve la respuesta como ArrayBuffer (para manipulación de bytes)
 * @returns {Promise<Object|Blob|ArrayBuffer|Error>} - Retorna la respuesta de la API según `responseType`, o un objeto de error
 *
 * @example
 * // Llamada GET a la API con token
 * const datos = await conectar('/api/incidencias', 'GET', {}, miToken);
 *
 * @example
 * // Llamada POST con body JSON
 * const datos = await conectar('/api/incidencias', 'POST', { titulo: 'Prueba' }, miToken);
 *
 * @example
 * // Descargar archivo como Blob
 * const archivo = await conectar('/api/incidencias/1/pdf', 'GET', {}, miToken, 'blob');
 */

const conectar = async (urlApi, method = 'GET', body = {}, token, responseType = 'json') => {
  try {
    let options = {
      method,
      headers: {},
      credentials: 'include'
    };
    
    // Solo agregar Content-Type para JSON
    if (responseType === 'json') {
      options.headers['Content-Type'] = 'application/json';
    }

    // Si existe token, se agrega en headers para autorización
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Detecta si el body es FormData (para enviar archivos)
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (isFormData) {
      // FormData se envía sin Content-Type
      delete options.headers['Content-Type'];
    }
    
    // Solo los métodos con cuerpo necesitan body
    if (method === 'POST' || method === 'PUT' || method === 'DELETE'|| method === 'PATCH') {
      options.body = isFormData ? body : JSON.stringify(body);
    }

    const resp = await fetch(urlApi, options);

    // --- CORRECCIÓN: VERIFICAR SI ES JSON VÁLIDO ANTES DE PARSEAR ---
    const contentType = resp.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // Devuelve la respuesta según el tipo esperado
    if (responseType === 'blob') {
      return await resp.blob();
    }

    if (responseType === 'arrayBuffer') {
      return await resp.arrayBuffer();
    }

    // Si esperamos JSON pero la respuesta no es JSON
    if (!isJson) {
      const text = await resp.text();
      console.error('Respuesta no-JSON del servidor:', {
        url: urlApi,
        status: resp.status,
        statusText: resp.statusText,
        contentType,
        body: text.substring(0, 500)
      });
      
      throw new Error(`El servidor respondió con ${resp.status} (${resp.statusText}). No es JSON.`);
    }

    // Si es JSON pero la respuesta está vacía
    if (resp.status === 204 || resp.status === 205) {
      return null; // No Content, No hay cuerpo
    }

    // Verificar si la respuesta es OK
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      const error = new Error(errorData.message || `Error ${resp.status}`);
      error.status = resp.status;
      error.data = errorData;
      throw error;
    }

    // Ahora sí parsear JSON
    const datos = await resp.json();
    return datos;

  } catch (error) {
    console.error('Error en conectar:', {
      url: urlApi,
      method,
      error: error.message,
      stack: error.stack
    });
    
    // Devolver error estructurado
    return {
      error: true,
      message: error.message,
      status: error.status,
      data: error.data
    };
  }
};

export default conectar;