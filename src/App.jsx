import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Encabezado from "./componentes/Encabezado";
import PiePagina from "./componentes/PiePagina";
import Inicio from "./paginas/Inicio";
import Productos from "./paginas/Productos";
import DetalleProducto from "./paginas/DetalleProducto";
import Carrito from "./paginas/Carrito";
import Checkout from "./paginas/Checkout";
import Confirmacion from "./paginas/Confirmacion";
import Usuario from "./paginas/Usuario";
import Ubicaciones from "./paginas/Ubicaciones";
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

// Panel de Administración
import AdminLayout from './componentes/AdminLayout'
import AdminDashboard from './paginas/AdminDashboard'
import AdminProductos from './paginas/AdminProductos'
import AdminCategorias from './paginas/AdminCategorias'
import AdminMarcas from './paginas/AdminMarcas'
import AdminInventario from './paginas/AdminInventario'
import AdminVentas from './paginas/AdminVentas'
import AdminCompras from './paginas/AdminCompras'
import AdminUsuarios from './paginas/AdminUsuarios'
import AdminRoles from './paginas/AdminRoles'
import AdminSucursales from './paginas/AdminSucursales'
import AdminUbicaciones from './paginas/AdminUbicaciones'

// Panel de Proveedores
import ProveedorLayout from './componentes/ProveedorLayout'
import ProveedorDashboard from './paginas/ProveedorDashboard'
import ProveedorProductos from './paginas/ProveedorProductos'
import ProveedorPedidos from './paginas/ProveedorPedidos'
import ProveedorDespachos from './paginas/ProveedorDespachos'
import ProveedorFacturas from './paginas/ProveedorFacturas'
import ProveedorEmpresa from './paginas/ProveedorEmpresa'

function RestaurarScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const { pathname } = useLocation();
  const esPanel = pathname.startsWith('/admin') || pathname.startsWith('/proveedor');

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
      {!esPanel && (
        <Encabezado
          cantidadCarrito={obtenerCantidadTotal(carrito)}
          usuario={usuario}
          cantidadFavoritos={favoritos.length}
          onAlternarSesion={handleAlternarSesion}
        />
      )}
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
        <Route path='/ubicaciones' element={<Ubicaciones />} />

        {/* Panel de Administración */}
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path='productos' element={<AdminProductos />} />
          <Route path='categorias' element={<AdminCategorias />} />
          <Route path='marcas' element={<AdminMarcas />} />
          <Route path='inventario' element={<AdminInventario />} />
          <Route path='ventas' element={<AdminVentas />} />
          <Route path='compras' element={<AdminCompras />} />
          <Route path='usuarios' element={<AdminUsuarios />} />
          <Route path='roles' element={<AdminRoles />} />
          <Route path='sucursales' element={<AdminSucursales />} />
          <Route path='ubicaciones' element={<AdminUbicaciones />} />
        </Route>

        {/* Panel de Proveedores */}
        <Route path='/proveedor' element={<ProveedorLayout />}>
          <Route index element={<ProveedorDashboard />} />
          <Route path='productos' element={<ProveedorProductos />} />
          <Route path='pedidos' element={<ProveedorPedidos />} />
          <Route path='despachos' element={<ProveedorDespachos />} />
          <Route path='facturas' element={<ProveedorFacturas />} />
          <Route path='empresa' element={<ProveedorEmpresa />} />
        </Route>
      </Routes>
      {!esPanel && <PiePagina />}
    </>
  );
}

export default App;
