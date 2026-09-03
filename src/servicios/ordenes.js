/* Servicio de órdenes — mock local */
/* Estructura alineada a las tablas venta / detalle_venta de bd_almacen_1 */

import { obtenerTotalCarrito, crearDetallesVenta } from "./carrito";

/* Almacén temporal en memoria (simula la tabla venta) */
let ordenesRegistradas = [];

/* Genera un ID simulado para la orden */
const generarIdOrden = () =>
  "ORD-" + Date.now().toString(36).toUpperCase();

/**
 * crearOrden
 * Arma el payload con la misma forma que la tabla `venta` + `detalle_venta`.
 * Cuando exista la API real, este método hará un POST al backend.
 *
 * Campos de la tabla venta:
 *   id_venta, id_cli, id_suc, fecha_venta, estado, total
 *
 * Campos de la tabla detalle_venta:
 *   id_detventa, id_venta, id_pro, cantidad, precio_unitario, subtotal
 */
export const crearOrden = async ({ carrito, cliente }) => {
  /* Simular latencia de red */
  await new Promise((r) => setTimeout(r, 400));

  const idOrden = generarIdOrden();

  const orden = {
    /* Tabla venta */
    id_venta: idOrden,
    id_cli: null,               // Se asignará cuando el usuario inicie sesión
    id_suc: null,               // Se asignará según la sucursal seleccionada
    fecha_venta: new Date().toISOString(),
    estado: "Completada",
    total: obtenerTotalCarrito(carrito),

    /* Tabla detalle_venta (array) */
    detalles: crearDetallesVenta(carrito),

    /* Datos del cliente (formulario checkout) */
    cliente,
  };

  /* Guardar en memoria para que el admin pueda consultarla */
  ordenesRegistradas.push(orden);
  console.log("Orden creada (mock):", orden);

  return { idOrden, orden };
};

/**
 * obtenerOrdenes
 * Devuelve todas las órdenes registradas en memoria.
 * Futuramente hará un GET al endpoint del administrador.
 */
export const obtenerOrdenes = () => [...ordenesRegistradas];

/**
 * obtenerOrden
 * Busca una orden por su ID.
 * Futuramente hará un GET /ventas/:id al backend.
 */
export const obtenerOrden = (idOrden) =>
  ordenesRegistradas.find((o) => o.id_venta === idOrden) || null;
