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

  const idProducto = producto.id_pro || producto.id;
  const imagen = producto.imagen || producto.imagen_url || producto.imagenUrl || '';
  const nombre = producto.titulo || producto.nombre || 'Producto';

  const lineaExistente = carrito.find((linea) => linea.id_pro === idProducto);
  if (lineaExistente) {
    return carrito.map((linea) =>
      linea.id_pro === idProducto
        ? {
            ...linea,
            cantidad: linea.cantidad + cantidad,
            imagen: linea.imagen || imagen,
            imagen_url: linea.imagen_url || imagen,
          }
        : linea,
    );
  }

  return [
    ...carrito,
    {
      id_pro: idProducto,
      nombre,
      precio_unitario: producto.precio || producto.precio_unitario || 0,
      imagen,
      imagen_url: imagen,
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
