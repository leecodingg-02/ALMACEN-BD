/* Servicio de Usuario — Conectado 100% a la base de datos MySQL */
/* Gestiona autenticación, perfil, direcciones y favoritos reales */

import { api } from "./api";

const CLAVE_USUARIO = "almacenweb_usuario";
const CLAVE_CONFIGURACION = "almacenweb_configuracion";

// Normaliza nombre y apellido para evitar que el apellido quede duplicado
// dentro del nombre (p. ej. nombre="Juan Pérez", apellido="Pérez").
const normalizarNombreApellido = (nombre, apellido) => {
  let nom = (nombre || '').trim();
  let ape = (apellido || '').trim();

  // Si el nombre llega con espacios y apellido vacío, separarlo.
  if (!ape && nom.includes(' ')) {
    const partes = nom.split(/\s+/);
    nom = partes[0];
    ape = partes.slice(1).join(' ');
  }

  // Si el nombre termina con el apellido completo, quitarlo del nombre.
  if (nom && ape && nom.toLowerCase().endsWith(ape.toLowerCase())) {
    nom = nom.slice(0, nom.length - ape.length).trim();
  }

  return { nombre: nom, apellido: ape };
};

/* Configuración de accesibilidad por defecto */
const CONFIG_DEFAULT = {
  altoContraste: false,
  tamanoFuente: "normal",
  notificacionesEmail: true,
};

// Obtiene el usuario autenticado (retorna null si no ha iniciado sesión en la sesión actual)
export const obtenerUsuarioSesion = () => {
  try {
    // Limpiar residuos previos de localStorage si existen
    if (localStorage.getItem(CLAVE_USUARIO)) {
      localStorage.removeItem(CLAVE_USUARIO);
    }
    const data = sessionStorage.getItem(CLAVE_USUARIO);
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Iniciar sesión consultando la tabla usuario en MySQL
export const iniciarSesion = async (correo, contrasena) => {
  const usuario = await api.post("/usuarios/login", { correo, contrasena });
  if (usuario && usuario.id_usu) {
    // Normaliza nombre/apellido antes de guardar en sesión para no propagar
    // registros corruptos donde el apellido quedó duplicado en el nombre.
    const { nombre, apellido } = normalizarNombreApellido(usuario.nombre, usuario.apellido);
    const usuarioLimpio = { ...usuario, nombre, apellido };
    sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuarioLimpio));
    localStorage.removeItem(CLAVE_USUARIO);
    return usuarioLimpio;
  }
  throw new Error("Credenciales inválidas");
};

// Determina la ruta del panel según el rol del usuario autenticado
export const rutaPanelSegunRol = (usuario) => {
  const rol = (usuario?.rol || "").toString().toLowerCase();
  if (rol === "administrador") return "/admin";
  if (rol === "proveedor") return "/proveedor";
  return "/usuario";
};

// Registrar una nueva cuenta de cliente en MySQL
export const registrarUsuario = async (datos) => {
  const respuesta = await api.post("/usuarios", datos);
  if (respuesta && (respuesta.id_usu || respuesta.id)) {
    // Normaliza nombre/apellido para no propagar apellidos duplicados.
    const { nombre, apellido } = normalizarNombreApellido(respuesta.nombre, respuesta.apellido);
    // Guardar el objeto completo devuelto por el backend para no perder campos
    // como fecha_registro, id_suc, estado, etc.
    const usuario = {
      id_usu: respuesta.id_usu || respuesta.id,
      nombre,
      apellido,
      correo: respuesta.correo,
      telefono: respuesta.telefono,
      tipo_doc: respuesta.tipo_doc,
      num_ident: respuesta.num_ident,
      id_rol: respuesta.id_rol || 2,
      rol: respuesta.rol || "Cliente",
      estado: respuesta.estado || "Activo",
      fecha_registro: respuesta.fecha_registro || new Date().toISOString(),
    };
    sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    localStorage.removeItem(CLAVE_USUARIO);
    return usuario;
  }
  throw new Error("No se pudo registrar el usuario");
};

// Cerrar sesión del usuario
export const cerrarSesion = () => {
  sessionStorage.removeItem(CLAVE_USUARIO);
  localStorage.removeItem(CLAVE_USUARIO);
  return null;
};

// Alternar sesión (usado por botones de salir o cierre rápido)
export const alternarEstadoSesion = () => {
  const usuarioActual = obtenerUsuarioSesion();
  if (usuarioActual) {
    return cerrarSesion();
  }
  return null;
};

// Actualizar datos de perfil en MySQL
export const actualizarPerfilUsuario = async (datosActualizados) => {
  const usuarioActual = obtenerUsuarioSesion() || {};
  const nuevoPerfil = { ...usuarioActual, ...datosActualizados };

  // Normaliza nombre/apellido para evitar duplicar el apellido en el nombre.
  const { nombre, apellido } = normalizarNombreApellido(
    nuevoPerfil.nombre,
    nuevoPerfil.apellido
  );
  nuevoPerfil.nombre = nombre;
  nuevoPerfil.apellido = apellido;

  if (nuevoPerfil.id_usu) {
    await api.put(`/usuarios/${nuevoPerfil.id_usu}`, nuevoPerfil);
  }

  sessionStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevoPerfil));
  return nuevoPerfil;
};

// Obtener direcciones de un usuario desde la base de datos (tabla ubicacion)
export const obtenerDireccionesUsuario = async (idUsuario) => {
  const id = idUsuario || obtenerUsuarioSesion()?.id_usu;
  if (!id) return [];

  const direcciones = await api.get(`/usuarios/${id}/direcciones`, []);
  return direcciones || [];
};

// Guardar nueva dirección en MySQL
export const guardarDireccionUsuario = async (nuevaDireccion) => {
  const usuario = obtenerUsuarioSesion();
  if (!usuario?.id_usu) return [];

  await api.post(`/usuarios/${usuario.id_usu}/direcciones`, nuevaDireccion);
  return await obtenerDireccionesUsuario(usuario.id_usu);
};

// Eliminar dirección en MySQL
export const eliminarDireccionUsuario = async (idUbi) => {
  const usuario = obtenerUsuarioSesion();
  if (!usuario?.id_usu) return [];

  await api.delete(`/usuarios/direcciones/${idUbi}`);
  return await obtenerDireccionesUsuario(usuario.id_usu);
};

// Obtener favoritos desde la base de datos (tabla favorito)
export const obtenerFavoritosUsuario = async (idUsuario) => {
  const id = idUsuario || obtenerUsuarioSesion()?.id_usu;
  if (!id) return [];

  const favs = await api.get(`/usuarios/${id}/favoritos`, []);
  return favs || [];
};

// Alternar producto en favoritos en MySQL
export const alternarFavoritoUsuario = async (idProducto) => {
  const usuario = obtenerUsuarioSesion();
  if (!usuario?.id_usu) return [];

  await api.post(`/usuarios/${usuario.id_usu}/favoritos`, { id_pro: idProducto });
  return await obtenerFavoritosUsuario(usuario.id_usu);
};

// Obtener pedidos de un usuario desde MySQL
export const obtenerPedidosUsuario = async (idUsuario) => {
  const id = idUsuario || obtenerUsuarioSesion()?.id_usu;
  if (!id) return [];

  const pedidos = await api.get(`/usuarios/${id}/pedidos`, []);
  return pedidos || [];
};

// Configuración de accesibilidad y preferencias
export const obtenerConfiguracionUsuario = () => {
  try {
    const data = localStorage.getItem(CLAVE_CONFIGURACION);
    return data ? JSON.parse(data) : CONFIG_DEFAULT;
  } catch {
    return CONFIG_DEFAULT;
  }
};

export const guardarConfiguracionUsuario = (nuevaConfig) => {
  localStorage.setItem(CLAVE_CONFIGURACION, JSON.stringify(nuevaConfig));

  const usuario = obtenerUsuarioSesion();
  if (usuario?.id_usu) {
    api.put(`/usuarios/${usuario.id_usu}`, {
      alto_contraste: nuevaConfig.altoContraste,
      tamano_fuente: nuevaConfig.tamanoFuente,
      notificaciones_email: nuevaConfig.notificacionesEmail,
    }).catch(() => {});
  }

  return nuevaConfig;
};
