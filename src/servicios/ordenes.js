// Servicio de órdenes y ventas conectado a la base de datos MySQL

import { obtenerTotalCarrito, crearDetallesVenta } from "./carrito";
import { api } from "./api";

// Almacén temporal en memoria por si el servidor no está corriendo
let ordenesEnMemoria = [];

// Registrar una nueva venta en MySQL
export const crearOrden = async ({ carrito, cliente }) => {
  const total = obtenerTotalCarrito(carrito);
  const detalles = crearDetallesVenta(carrito);

  if (!cliente?.id_usu) {
    throw new Error('Debes iniciar sesión para realizar una compra.');
  }

  // El campo pago.metodo en MySQL es un ENUM:
  // 'Efectivo','Tarjeta','PSE','Nequi','Daviplata','Transferencia'.
  // Normalizamos cualquier valor recibido a uno válido para evitar que el
  // INSERT INTO pago falle (lo que hacía rollback de toda la venta).
  const metodoRecibido = String(cliente?.metodoPagoBD || cliente?.metodoPago || '').toLowerCase();
  const metodoValido = metodoRecibido.includes('pse') ? 'PSE' :
                       metodoRecibido.includes('daviplata') ? 'Daviplata' :
                       metodoRecibido.includes('nequi') ? 'Nequi' :
                       metodoRecibido.includes('tarjeta') ? 'Tarjeta' : 'Efectivo';

  const payload = {
    id_cli: cliente.id_usu,
    id_suc: 1, // Sede Principal por defecto
    total,
    metodo: metodoValido,
    estado: 'Completada',
    detalles
  };

  // Guardar directamente en la base de datos MySQL (propaga error si falla)
  const respuesta = await api.post('/ventas', payload);
  const idVenta = respuesta.id_venta;
  const idOrden = respuesta.idOrden || `ORD-${idVenta}`;
  const orden = { ...payload, id_venta: idOrden, fecha_venta: new Date().toISOString(), cliente };
  ordenesEnMemoria.push(orden);

  // Registrar el despacho en la tabla envio si la compra tiene dirección
  if (cliente?.direccion && idVenta) {
    try {
      await api.post('/envios', {
        id_venta: idVenta,
        costo_envio: Number(cliente.costoEnvio) || 0,
        observacion: `Entrega: ${cliente.direccion}${cliente.ciudad ? ', ' + cliente.ciudad : ''}`,
        estado: 'Preparando'
      });
    } catch (e) {
      // El envío es opcional; si falla, no se bloquea la confirmación de la orden
      console.warn('No se pudo registrar el envío asociado:', e.message);
    }
  }

  return { idOrden, orden, idVenta };
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
