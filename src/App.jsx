import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Encabezado from "./componentes/Encabezado";
import Inicio from "./paginas/Inicio";
import Productos from "./paginas/Productos";
import DetalleProducto from "./paginas/DetalleProducto";

function RestaurarScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  // La cantidad vive aqui para que la cabecera la conserve al cambiar de pagina.
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  // Sumamos la cantidad elegida cada vez que se agrega un producto.
  const agregarAlCarrito = (cantidad = 1) => {
    setCantidadCarrito((cantidadActual) => cantidadActual + cantidad);
  };

  return (
    <>
      <Encabezado cantidadCarrito={cantidadCarrito} />
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
      </Routes>
    </>
  );
}

export default App;
