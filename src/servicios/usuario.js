/* Servicio de Usuario — mock local de autenticación, perfil, direcciones y favoritos */
/* Estructura totalmente alineada a las tablas `usuario` y `ubicacion` de bd_almacen_1 */

const CLAVE_USUARIO = "almacenweb_usuario";
const CLAVE_FAVORITOS = "almacenweb_favoritos";
const CLAVE_DIRECCIONES = "almacenweb_direcciones";
const CLAVE_CONFIGURACION = "almacenweb_configuracion";

/* Datos por defecto del usuario demo */
const USUARIO_DEMO_DEFAULT = {
  id_usu: 1,
  tipo_doc: "C.C",
  num_ident: "1020304050",
  nombre: "Juan",
  apellido: "Pérez",
  telefono: "3001234567",
  correo: "juan.perez@almacen.com",
  estado: "Activo",
  id_rol: 2,
};

/* Direcciones por defecto (coincide con tabla `ubicacion`) */
const DIRECCIONES_DEFAULT = [
  {
    id_ubi: 1,
    departamento: "Bogotá D.C.",
    ciudad: "Bogotá",
    direccion: "Carrera 7 # 45 - 20, Apto 502",
    id_usu: 1,
  },
  {
    id_ubi: 2,
    departamento: "Antioquia",
    ciudad: "Medellín",
    direccion: "Calle 10 # 30 - 15, El Poblado",
    id_usu: 1,
  },
];

/* Favoritos iniciales (IDs de productos de prueba) */
const FAVORITOS_DEFAULT = [1, 2];

/* Configuración de accesibilidad y preferencias */
const CONFIG_DEFAULT = {
  altoContraste: false,
  tamanoFuente: "normal",
  notificacionesEmail: true,
};

/**
 * Obtiene el usuario actualmente autenticado desde localStorage.
 * Retorna `null` si la sesión no está activa.
 */
export const obtenerUsuarioSesion = () => {
  try {
    const data = localStorage.getItem(CLAVE_USUARIO);
    if (data === null) {
      /* Por defecto iniciamos con la sesión activa del usuario demo para facilitar pruebas */
      localStorage.setItem(CLAVE_USUARIO, JSON.stringify(USUARIO_DEMO_DEFAULT));
      return USUARIO_DEMO_DEFAULT;
    }
    return JSON.parse(data);
  } catch {
    return null;
  }
};

/**
 * Alterna el estado de sesión (Iniciar / Cerrar sesión).
 */
export const alternarEstadoSesion = () => {
  const usuarioActual = obtenerUsuarioSesion();
  if (usuarioActual) {
    localStorage.removeItem(CLAVE_USUARIO);
    return null;
  } else {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(USUARIO_DEMO_DEFAULT));
    return USUARIO_DEMO_DEFAULT;
  }
};

/**
 * Guarda los cambios del perfil del usuario (Tabla `usuario`).
 */
export const actualizarPerfilUsuario = (datosActualizados) => {
  const usuarioActual = obtenerUsuarioSesion() || {};
  const nuevoPerfil = { ...usuarioActual, ...datosActualizados };
  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevoPerfil));
  return nuevoPerfil;
};

/**
 * Obtiene las direcciones guardadas del usuario (Tabla `ubicacion`).
 */
export const obtenerDireccionesUsuario = () => {
  try {
    const data = localStorage.getItem(CLAVE_DIRECCIONES);
    if (!data) {
      localStorage.setItem(CLAVE_DIRECCIONES, JSON.stringify(DIRECCIONES_DEFAULT));
      return DIRECCIONES_DEFAULT;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

/**
 * Agrega o actualiza una dirección en el sistema.
 */
export const guardarDireccionUsuario = (nuevaDireccion) => {
  const direcciones = obtenerDireccionesUsuario();
  let listaActualizada;

  if (nuevaDireccion.id_ubi) {
    listaActualizada = direcciones.map((dir) =>
      dir.id_ubi === nuevaDireccion.id_ubi ? nuevaDireccion : dir
    );
  } else {
    const nuevoId = Date.now();
    listaActualizada = [
      ...direcciones,
      { ...nuevaDireccion, id_ubi: nuevoId, id_usu: 1 },
    ];
  }

  localStorage.setItem(CLAVE_DIRECCIONES, JSON.stringify(listaActualizada));
  return listaActualizada;
};

/**
 * Elimina una dirección de usuario por su id_ubi.
 */
export const eliminarDireccionUsuario = (idUbi) => {
  const direcciones = obtenerDireccionesUsuario();
  const listaActualizada = direcciones.filter((dir) => dir.id_ubi !== idUbi);
  localStorage.setItem(CLAVE_DIRECCIONES, JSON.stringify(listaActualizada));
  return listaActualizada;
};

/**
 * Obtiene el listado de IDs de productos guardados en Favoritos.
 */
export const obtenerFavoritosUsuario = () => {
  try {
    const data = localStorage.getItem(CLAVE_FAVORITOS);
    if (!data) {
      localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(FAVORITOS_DEFAULT));
      return FAVORITOS_DEFAULT;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

/**
 * Alterna un producto en la lista de favoritos.
 */
export const alternarFavoritoUsuario = (idProducto) => {
  const favoritos = obtenerFavoritosUsuario();
  let nuevosFavoritos;
  if (favoritos.includes(idProducto)) {
    nuevosFavoritos = favoritos.filter((id) => id !== idProducto);
  } else {
    nuevosFavoritos = [...favoritos, idProducto];
  }
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(nuevosFavoritos));
  return nuevosFavoritos;
};

/**
 * Obtiene la configuración de accesibilidad y preferencias.
 */
export const obtenerConfiguracionUsuario = () => {
  try {
    const data = localStorage.getItem(CLAVE_CONFIGURACION);
    if (!data) {
      localStorage.setItem(CLAVE_CONFIGURACION, JSON.stringify(CONFIG_DEFAULT));
      return CONFIG_DEFAULT;
    }
    return JSON.parse(data);
  } catch {
    return CONFIG_DEFAULT;
  }
};

/**
 * Guarda la configuración de accesibilidad del usuario.
 */
export const guardarConfiguracionUsuario = (nuevaConfig) => {
  localStorage.setItem(CLAVE_CONFIGURACION, JSON.stringify(nuevaConfig));
  return nuevaConfig;
};
