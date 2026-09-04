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
import Ayuda from "./paginas/Ayuda";
import InicioSesion from "./paginas/InicioSesion";
import CrearCuenta from "./paginas/CrearCuenta";
import Nosotros from "./paginas/Nosotros";
import Ofertas from "./paginas/Ofertas";
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
import PasarelaPagos from "./paginas/PasarelaPagos";
import { AvisoSesionProvider } from "./contextos/AvisoSesionContext";
import { NotificacionProvider, useNotificacion } from "./contextos/NotificacionContext";

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
import RutaProtegida from './componentes/RutaProtegida'

function RestaurarScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContenido() {
  const { pathname } = useLocation();
  const { mostrarNotificacion } = useNotificacion();
  const esPanel = pathname.startsWith('/admin') || pathname.startsWith('/proveedor');

  /* Estado del carrito */
  const [carrito, setCarrito] = useState(leerCarrito);

  /* Estado de sesión de usuario y preferencias */
  const [usuario, setUsuario] = useState(obtenerUsuarioSesion);
  const [favoritos, setFavoritos] = useState([]);
  const [configuracion, setConfiguracion] = useState(obtenerConfiguracionUsuario);

  /* Cargar favoritos del usuario autenticado directamente desde MySQL */
  useEffect(() => {
    if (usuario?.id_usu) {
      obtenerFavoritosUsuario(usuario.id_usu).then((favs) => {
        setFavoritos(favs || []);
      });
    } else {
      setFavoritos([]);
    }
  }, [usuario]);

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

    const nombre = producto.titulo || producto.nombre || 'Producto';
    const imagen = producto.imagen || producto.imagen_url || producto.imagenUrl || '';

    mostrarNotificacion({
      tipo: 'carrito',
      titulo: '¡Agregado al carrito!',
      mensaje: `${nombre} (${cantidad} ud.)`,
      imagen,
      enlace: '/carrito',
      textoEnlace: 'Ver carrito',
      icono: '🛒'
    });
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

  /* Cerrar sesión */
  const handleAlternarSesion = () => {
    const nuevoUsuario = alternarEstadoSesion();
    setUsuario(nuevoUsuario);
    setFavoritos([]);
  };

  /* Alternar un producto en favoritos en MySQL con notificación */
  const handleAlternarFavorito = async (idProducto, nombreProducto) => {
    if (!usuario) return;
    const estabaEnFavoritos = favoritos && favoritos.includes(idProducto);
    const nuevosFavs = await alternarFavoritoUsuario(idProducto);
    setFavoritos(nuevosFavs || []);

    if (estabaEnFavoritos) {
      mostrarNotificacion({
        tipo: 'favorito-removido',
        titulo: 'Eliminado de favoritos',
        mensaje: nombreProducto ? `"${nombreProducto}" fue removido de tus favoritos.` : 'Producto eliminado de favoritos.',
        icono: '🤍'
      });
    } else {
      mostrarNotificacion({
        tipo: 'favorito',
        titulo: '¡Agregado a favoritos!',
        mensaje: nombreProducto ? `"${nombreProducto}" se guardó en tus favoritos.` : 'Producto agregado a tus favoritos.',
        enlace: '/usuario',
        textoEnlace: 'Ver mis favoritos',
        icono: '❤️'
      });
    }
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
        <Route
          path='/'
          element={
            <Inicio
              carrito={carrito}
              onLimpiarCarrito={() => setCarrito([])}
              onAgregarCarrito={agregarAlCarrito}
              usuario={usuario}
              favoritos={favoritos}
              onAlternarFavorito={handleAlternarFavorito}
            />
          }
        />
        <Route
          path='/productos'
          element={
            <Productos
              onAgregarCarrito={agregarAlCarrito}
              usuario={usuario}
              favoritos={favoritos}
              onAlternarFavorito={handleAlternarFavorito}
            />
          }
        />
        <Route
          path='/productos/:id'
          element={
            <DetalleProducto
              onAgregarCarrito={agregarAlCarrito}
              usuario={usuario}
              favoritos={favoritos}
              onAlternarFavorito={handleAlternarFavorito}
            />
          }
        />
        <Route
          path='/carrito'
          element={
            <Carrito
              carrito={carrito}
              usuario={usuario}
              onActualizarCant={actualizarCantCarrito}
              onRemoverLinea={removerDelCarrito}
            />
          }
        />
        <Route
          path='/checkout'
          element={
            <Checkout
              usuario={usuario}
              carrito={carrito}
              onLimpiarCarrito={() => setCarrito([])}
            />
          }
        />
        <Route
          path='/pasarela-pagos'
          element={
            <PasarelaPagos
              usuario={usuario}
              carrito={carrito}
              onLimpiarCarrito={() => setCarrito([])}
            />
          }
        />
        <Route
          path='/confirmacion'
          element={<Confirmacion />}
        />
        <Route path='/usuario' element={<Usuario usuario={usuario} favoritos={favoritos} configuracion={configuracion} onAlternarFavorito={handleAlternarFavorito} onAgregarCarrito={agregarAlCarrito} onActualizarUsuario={setUsuario} onActualizarConfig={setConfiguracion} onAlternarSesion={handleAlternarSesion} />} />
        <Route path='/inicio-sesion' element={<InicioSesion onIniciarSesion={setUsuario} />} />
        <Route path='/crear-cuenta' element={<CrearCuenta onIniciarSesion={setUsuario} />} />
        <Route path='/nosotros' element={<Nosotros />} />
        <Route path='/ofertas' element={<Ofertas onAgregarCarrito={agregarAlCarrito} usuario={usuario} favoritos={favoritos} onAlternarFavorito={handleAlternarFavorito} />} />
        <Route path='/ubicaciones' element={<Ubicaciones />} />
        <Route path='/ayuda' element={<Ayuda />} />

        {/* Panel de Administración */}
        <Route path='/admin' element={<RutaProtegida rolRequerido="admin"><AdminLayout /></RutaProtegida>}>
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
        <Route path='/proveedor' element={<RutaProtegida rolRequerido="proveedor"><ProveedorLayout /></RutaProtegida>}>
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

function App() {
  return (
    <NotificacionProvider>
      <AvisoSesionProvider>
        <AppContenido />
      </AvisoSesionProvider>
    </NotificacionProvider>
  );
}

export default App;

