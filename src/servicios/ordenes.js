// Servicio de órdenes y ventas conectado a la base de datos MySQL

import { obtenerTotalCarrito, crearDetallesVenta } from "./carrito";
import { api } from "./api";

// Almacén temporal en memoria por si el servidor no está corriendo
let ordenesEnMemoria = [];

// Genera un ID de orden en caso de operar fuera de línea
const generarIdOrden = () => "ORD-" + Date.now().toString(36).toUpperCase();

// Registrar una nueva venta en MySQL
export const crearOrden = async ({ carrito, cliente }) => {
  const total = obtenerTotalCarrito(carrito);
  const detalles = crearDetallesVenta(carrito);

  const payload = {
    id_cli: cliente?.id_usu || null,
    id_suc: 1, // Sede Principal por defecto
    total,
    metodo: cliente?.metodoPago || 'Tarjeta',
    estado: 'Completada',
    detalles
  };

  try {
    // Intentar guardar directamente en la base de datos MySQL
    const respuesta = await api.post('/ventas', payload);
    const idOrden = respuesta.idOrden || `ORD-${respuesta.id_venta}`;
    const orden = { ...payload, id_venta: idOrden, fecha_venta: new Date().toISOString(), cliente };
    ordenesEnMemoria.push(orden);
    return { idOrden, orden };
  } catch {
    // Si la base de datos está desconectada, guardar en memoria local
    console.warn("No se pudo conectar a la base de datos. Guardando orden en memoria local.");
    const idOrden = generarIdOrden();
    const orden = { ...payload, id_venta: idOrden, fecha_venta: new Date().toISOString(), cliente };
    ordenesEnMemoria.push(orden);
    return { idOrden, orden };
  }
};

// Obtener todas las órdenes registradas desde MySQL
export const obtenerOrdenes = async () => {
  const ventas = await api.get('/ventas', null);
  return ventas || [...ordenesEnMemoria];
};

// Buscar una orden por su ID
export const obtenerOrden = async (idOrden) => {
  const idNumerico = idOrden.toString().replace('ORD-', '');
  const orden = await api.get(`/ventas/${idNumerico}`, null);
  if (orden) return orden;
  return ordenesEnMemoria.find((o) => o.id_venta === idOrden) || null;
};
