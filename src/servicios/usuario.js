/* Servicio de Usuario — Conectado 100% a la base de datos MySQL */
/* Gestiona autenticación, perfil, direcciones y favoritos reales */

import { api } from "./api";

const CLAVE_USUARIO = "almacenweb_usuario";
const CLAVE_CONFIGURACION = "almacenweb_configuracion";

/* Configuración de accesibilidad por defecto */
const CONFIG_DEFAULT = {
  altoContraste: false,
  tamanoFuente: "normal",
  notificacionesEmail: true,
};

// Obtiene el usuario autenticado (retorna null si no ha iniciado sesión)
export const obtenerUsuarioSesion = () => {
  try {
    const data = localStorage.getItem(CLAVE_USUARIO);
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
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    return usuario;
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
  if (respuesta && respuesta.id_usu) {
    const usuario = {
      id_usu: respuesta.id_usu,
      nombre: respuesta.nombre,
      apellido: respuesta.apellido,
      correo: respuesta.correo,
      telefono: respuesta.telefono,
      tipo_doc: respuesta.tipo_doc,
      num_ident: respuesta.num_ident,
      id_rol: respuesta.id_rol || 2,
      rol: "Cliente",
      estado: "Activo",
    };
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    return usuario;
  }
  throw new Error("No se pudo registrar el usuario");
};

// Cerrar sesión del usuario
export const cerrarSesion = () => {
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

  if (nuevoPerfil.id_usu) {
    await api.put(`/usuarios/${nuevoPerfil.id_usu}`, nuevoPerfil);
  }

  localStorage.setItem(CLAVE_USUARIO, JSON.stringify(nuevoPerfil));
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
