/* Servicio de Proveedor — Autenticación contra la tabla proveedor (NIT + contraseña) */
import { api } from "./api";

const CLAVE_PROVEEDOR = "almacenweb_proveedor";

// Obtiene el proveedor autenticado (retorna null si no ha iniciado sesión)
export const obtenerProveedorSesion = () => {
  try {
    const data = localStorage.getItem(CLAVE_PROVEEDOR);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

// Iniciar sesión consultando la tabla proveedor en MySQL (usuario = NIT)
export const iniciarSesionProveedor = async (nit, contrasena) => {
  const proveedor = await api.post("/proveedores/login", { nit, contrasena });
  if (proveedor && proveedor.id_proveedor) {
    localStorage.setItem(CLAVE_PROVEEDOR, JSON.stringify(proveedor));
    return proveedor;
  }
  throw new Error("Credenciales de proveedor inválidas");
};

// Cerrar sesión del proveedor
export const cerrarSesionProveedor = () => {
  localStorage.removeItem(CLAVE_PROVEEDOR);
  return null;
};