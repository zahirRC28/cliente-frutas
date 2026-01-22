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

/* const conectar = async (urlApi, method = 'GET', body = {}, token, responseType = 'json') => {
  try {
    let options = {
      method,
      headers: {},
      credentials: 'include'
    };
    //El blob es lo que se usa para tratar los archivos, como imgenes, pdf, etc
    // Si la respuesta NO es un blob, se asume JSON
    if (responseType !== 'blob') {
      options.headers['Content-Type'] = 'application/json';
    }

    // Si existe token, se agrega en headers para autorización
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Detecta si el body es FormData (para enviar archivos)
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    if (isFormData) {
      // FormData se envía sin Content-Type, el navegador lo maneja automáticamente
      if (options.headers && options.headers['Content-Type']) {
        delete options.headers['Content-Type'];
      }
    }
    // Solo los métodos con cuerpo necesitan body
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      options.body = isFormData ? body : JSON.stringify(body);
    }
    //console.log(options);
    const resp = await fetch(urlApi, options);

    // Devuelve la respuesta según el tipo esperado
    if (responseType === 'blob') {
      return await resp.blob();
    }

    if (responseType === 'arrayBuffer') {
      return await resp.arrayBuffer();
    }
    //asta qui.
    
    //console.log(resp);
    const datos = await resp.json();
    //console.log(datos);
    return datos;

  } catch (error) {
    console.log(error);
    return error;
  }
};

export default conectar ; */


/**
 * Helper para peticiones HTTP
 * CORREGIDO: Maneja errores HTML y envía Authorization Bearer
 */
const conectar = async (endpoint, method = 'GET', body, token) => {
    const url = endpoint; 

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Usamos Bearer como pide tu backend
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (method !== 'GET' && body) {
        options.body = JSON.stringify(body);
    }

    try {
        console.log(`📡 Fetch a: ${url}`); // Muestra la URL en consola
        const resp = await fetch(url, options);

        // --- PROTECCIÓN CONTRA ERRORES HTML ---
        // Si el servidor devuelve HTML (error 404, 500, etc.), leemos el texto para ver el error
        const contentType = resp.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const text = await resp.text();
            console.error("❌ EL SERVIDOR DEVOLVIÓ HTML (ERROR):", text);
            
            // Devolvemos un objeto de error controlado para que la app no explote
            return { 
                ok: false, 
                msg: `Error de ruta o servidor (${resp.status}). Mira la consola.` 
            };
        }

        const data = await resp.json();
        return data;

    } catch (error) {
        console.error("Error grave de conexión:", error);
        return { ok: false, msg: "Error de conexión (Backend caído o URL mal)" };
    }
};

export default conectar;