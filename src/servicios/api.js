// Servicio central de API para conectar el Frontend con el Backend MySQL
// Hace peticiones a Node/Express (puerto 3001) y mantiene sincronizada la información

// Usa rutas relativas para que el proxy de Vite redirija al backend
const BASE_URL = '/api';

// Petición genérica con reintento y fallback seguro
async function peticion(endpoint, opciones = {}) {
  try {
    const respuesta = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...opciones.headers,
      },
      ...opciones,
    });

    if (!respuesta.ok) {
      // Intentar leer el mensaje de error del backend
      let detalle = '';
      try {
        const cuerpo = await respuesta.json();
        detalle = cuerpo.error || cuerpo.mensaje || '';
      } catch {
        detalle = '';
      }
      throw new Error(detalle || `Error en el servidor: ${respuesta.status} ${respuesta.statusText}`);
    }

    return await respuesta.json();
  } catch (error) {
    // Traducir el error de red a un mensaje claro para el usuario
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.');
    }
    console.warn(`[API] Error al consultar ${endpoint}:`, error.message);
    throw error;
  }
}

// Objeto principal para interactuar con la base de datos
export const api = {
  // GET: Obtener información
  async get(endpoint, datosPorDefecto = null) {
    try {
      return await peticion(endpoint);
    } catch {
      return datosPorDefecto;
    }
  },

  // POST: Crear nuevo registro en la base de datos
  async post(endpoint, cuerpo) {
    return await peticion(endpoint, {
      method: 'POST',
      body: JSON.stringify(cuerpo),
    });
  },

  // PUT: Actualizar registro existente
  async put(endpoint, cuerpo) {
    return await peticion(endpoint, {
      method: 'PUT',
      body: JSON.stringify(cuerpo),
    });
  },

  // DELETE: Eliminar registro
  async delete(endpoint) {
    return await peticion(endpoint, {
      method: 'DELETE',
    });
  },

  // Comprueba si el backend y la base de datos MySQL están conectados
  async comprobarEstado() {
    try {
      return await peticion('/estado');
    } catch {
      return { estado: 'desconectado', mensaje: 'No hay conexión con el servidor backend' };
    }
  }
};

export default api;
