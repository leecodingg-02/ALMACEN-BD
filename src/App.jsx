import { Routes, Route } from 'react-router-dom'
import Encabezado from './componentes/Encabezado'
import Pagina_inicio from './paginas/Pagina_inicio'

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

function App() {
  return (
    <Routes>
      {/* Rutas públicas (con encabezado) */}
      <Route
        path="/"
        element={
          <>
            <Encabezado />
            <Pagina_inicio />
          </>
        }
      />

      {/* Panel de Administrador (sin encabezado público) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProductos />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="marcas" element={<AdminMarcas />} />
        <Route path="inventario" element={<AdminInventario />} />
        <Route path="ventas" element={<AdminVentas />} />
        <Route path="compras" element={<AdminCompras />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="sucursales" element={<AdminSucursales />} />
        <Route path="ubicaciones" element={<AdminUbicaciones />} />
      </Route>
    </Routes>
  )
}

export default App
