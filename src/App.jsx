import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Encabezado from "./componentes/Encabezado";
import Inicio from "./paginas/Inicio";
import Productos from "./paginas/Productos";
import DetalleProducto from "./paginas/DetalleProducto";
import Carrito from "./paginas/Carrito";
import Checkout from "./paginas/Checkout";
import Confirmacion from "./paginas/Confirmacion";
import {
  agregarLineaCarrito,
  leerCarrito,
  obtenerCantidadTotal,
  actualizarCantidad,
  removerLinea,
} from "./servicios/carrito";

function RestaurarScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const [carrito, setCarrito] = useState(leerCarrito);

  useEffect(() => {
    localStorage.setItem("almacenweb_carrito", JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setCarrito((carritoActual) =>
      agregarLineaCarrito(carritoActual, producto, cantidad),
    );
  };

  /* Actualizar la cantidad de un producto en el carrito */
  const actualizarCantCarrito = (idProducto, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      setCarrito((c) => removerLinea(c, idProducto));
      return;
    }
    /*
      TODO: validar contra inventario.cantidad cuando se conecte la BD
      Por ahora se permite cualquier cantidad positiva
    */
    setCarrito((c) => actualizarCantidad(c, idProducto, nuevaCantidad));
  };

  /* Eliminar un producto del carrito */
  const removerDelCarrito = (idProducto) => {
    setCarrito((c) => removerLinea(c, idProducto));
  };

  /* Vaciar el carrito después de una compra exitosa */
  const vaciarCarrito = () => setCarrito([]);

  return (
    <>
      <Encabezado cantidadCarrito={obtenerCantidadTotal(carrito)} />
      <RestaurarScroll />
      <Routes>
        <Route path='/' element={<Inicio />} />
        <Route
          path='/productos'
          element={<Productos onAgregarCarrito={agregarAlCarrito} />}
        />
        <Route
          path='/productos/:id'
          element={<DetalleProducto onAgregarCarrito={agregarAlCarrito} />}
        />
        <Route
          path='/carrito'
          element={
            <Carrito
              carrito={carrito}
              onActualizarCant={actualizarCantCarrito}
              onRemoverLinea={removerDelCarrito}
            />
          }
        />
        <Route
          path='/checkout'
          element={<Checkout carrito={carrito} />}
        />
        <Route
          path='/confirmacion'
          element={<Confirmacion />}
        />
      </Routes>
    </>
  );
}

export default App;
