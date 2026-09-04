// Servicio central de API para conectar el Frontend con el Backend MySQL
// Hace peticiones a Node/Express (puerto 3001) y mantiene sincronizada la información

const BASE_URL = 'http://localhost:3001/api';

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
      throw new Error(`Error en el servidor: ${respuesta.status} ${respuesta.statusText}`);
    }

    return await respuesta.json();
  } catch (error) {
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
