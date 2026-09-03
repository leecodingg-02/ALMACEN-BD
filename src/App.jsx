import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Encabezado from "./componentes/Encabezado";
import Inicio from "./paginas/Inicio";
import Productos from "./paginas/Productos";
import DetalleProducto from "./paginas/DetalleProducto";
import Carrito from "./paginas/Carrito";
import Checkout from "./paginas/Checkout";
import Confirmacion from "./paginas/Confirmacion";
import Usuario from "./paginas/Usuario";
import {
  agregarLineaCarrito,
  leerCarrito,
  obtenerCantidadTotal,
  actualizarCantidad,
  removerLinea,
} from "./servicios/carrito";
import {
  obtenerUsuarioSesion,
  alternarEstadoSesion,
  obtenerFavoritosUsuario,
  alternarFavoritoUsuario,
  obtenerConfiguracionUsuario,
} from "./servicios/usuario";

function RestaurarScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  /* Estado del carrito */
  const [carrito, setCarrito] = useState(leerCarrito);

  /* Estado de sesión de usuario y preferencias */
  const [usuario, setUsuario] = useState(obtenerUsuarioSesion);
  const [favoritos, setFavoritos] = useState(obtenerFavoritosUsuario);
  const [configuracion, setConfiguracion] = useState(obtenerConfiguracionUsuario);

  useEffect(() => {
    localStorage.setItem("almacenweb_carrito", JSON.stringify(carrito));
  }, [carrito]);

  /* Aplicar preferencias globales de accesibilidad (Alto contraste y escala de fuente) */
  useEffect(() => {
    const root = document.documentElement;

    /* Activar o desactivar alto contraste globalmente */
    if (configuracion?.altoContraste) {
      root.classList.add("modo-alto-contraste");
    } else {
      root.classList.remove("modo-alto-contraste");
    }

    /* Aplicar tamaño de fuente global en la raíz HTML */
    root.classList.remove("fuente-normal", "fuente-grande", "fuente-extra-grande");
    root.classList.add(`fuente-${configuracion?.tamanoFuente || "normal"}`);
  }, [configuracion]);

  /* Agregar línea al carrito */
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
    setCarrito((c) => actualizarCantidad(c, idProducto, nuevaCantidad));
  };

  /* Eliminar un producto del carrito */
  const removerDelCarrito = (idProducto) => {
    setCarrito((c) => removerLinea(c, idProducto));
  };

  /* Vaciar el carrito después de una compra exitosa */
  const vaciarCarrito = () => setCarrito([]);

  /* Alternar inicio/cierre de sesión demo */
  const handleAlternarSesion = () => {
    const nuevoUsuario = alternarEstadoSesion();
    setUsuario(nuevoUsuario);
  };

  /* Alternar un producto en favoritos */
  const handleAlternarFavorito = (idProducto) => {
    const nuevosFavs = alternarFavoritoUsuario(idProducto);
    setFavoritos(nuevosFavs);
  };

  return (
    <>
      <Encabezado
        cantidadCarrito={obtenerCantidadTotal(carrito)}
        usuario={usuario}
        cantidadFavoritos={favoritos.length}
        onAlternarSesion={handleAlternarSesion}
      />
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
        <Route
          path='/usuario'
          element={
            <Usuario
              usuario={usuario}
              favoritos={favoritos}
              configuracion={configuracion}
              onAlternarFavorito={handleAlternarFavorito}
              onAgregarCarrito={agregarAlCarrito}
              onActualizarUsuario={setUsuario}
              onActualizarConfig={setConfiguracion}
              onAlternarSesion={handleAlternarSesion}
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;
