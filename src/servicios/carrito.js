const CLAVE_CARRITO = "almacenweb_carrito";

export const leerCarrito = () => {
  try {
    const carritoGuardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    return Array.isArray(carritoGuardado) ? carritoGuardado : [];
  } catch {
    return [];
  }
};

export const agregarLineaCarrito = (carrito, producto, cantidad = 1) => {
  if (!producto || cantidad < 1) return carrito;

  const lineaExistente = carrito.find((linea) => linea.id_pro === producto.id);
  if (lineaExistente) {
    return carrito.map((linea) =>
      linea.id_pro === producto.id
        ? { ...linea, cantidad: linea.cantidad + cantidad }
        : linea,
    );
  }

  return [
    ...carrito,
    {
      id_pro: producto.id,
      nombre: producto.titulo,
      precio_unitario: producto.precio,
      cantidad,
    },
  ];
};

export const obtenerCantidadTotal = (carrito) =>
  carrito.reduce((total, linea) => total + linea.cantidad, 0);

export const obtenerTotalCarrito = (carrito) =>
  carrito.reduce(
    (total, linea) => total + linea.precio_unitario * linea.cantidad,
    0,
  );

export const crearDetallesVenta = (carrito) =>
  carrito.map((linea) => ({
    id_pro: linea.id_pro,
    cantidad: linea.cantidad,
    precio_unitario: linea.precio_unitario,
    subtotal: linea.precio_unitario * linea.cantidad,
  }));

export const crearPayloadVenta = ({ carrito, idCliente, idSucursal }) => ({
  id_cli: idCliente,
  id_suc: idSucursal,
  total: obtenerTotalCarrito(carrito),
  detalles: crearDetallesVenta(carrito),
});
export const actualizarCantidad = (carrito, idProducto, nuevaCantidad) => {
  if (nuevaCantidad < 1) return carrito;
  return carrito.map(linea =>
    linea.id_pro === idProducto ? { ...linea, cantidad: nuevaCantidad } : linea
  );
};

export const removerLinea = (carrito, idProducto) => {
  return carrito.filter(linea => linea.id_pro !== idProducto);
};
