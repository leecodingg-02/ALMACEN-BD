import { Navigate } from 'react-router-dom';
import { obtenerUsuarioSesion } from '../servicios/usuario';
import { obtenerProveedorSesion } from '../servicios/proveedor';

// Guarda las rutas de los paneles según la sesión del usuario o del proveedor.
// rolRequerido: "admin" | "proveedor"
//   - "admin"     → validado contra la tabla usuario (rol Administrador)
//   - "proveedor" → validado contra la tabla proveedor (sesión de proveedor)
const RutaProtegida = ({ rolRequerido, children }) => {
  if (rolRequerido === 'proveedor') {
    const proveedor = obtenerProveedorSesion();
    if (!proveedor) {
      return <Navigate to="/inicio-sesion" replace />;
    }
    return children;
  }

  const usuario = obtenerUsuarioSesion();
  const rol = (usuario?.rol || '').toString().toLowerCase();

  const autorizado = rolRequerido === 'admin' && rol === 'administrador';

  if (!autorizado) {
    return <Navigate to="/inicio-sesion" replace />;
  }

  return children;
};

export default RutaProtegida;