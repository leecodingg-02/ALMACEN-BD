import { useLocation, Link } from "react-router-dom";
import { obtenerTotalCarrito } from "../servicios/carrito";
import { formatearPrecio } from "./Productos";
import "./Confirmacion.css";

/**
 * Confirmacion
 * Muestra el resumen de la orden una vez el checkout fue exitoso.
 * Recibe los datos a través de location.state.
 *
 * Datos esperados en state:
 *  - idOrden : identificador generado (mock o futuro id_venta de la BD)
 *  - orden   : objeto completo de la orden (ver ordenes.js)
 *  - carrito : array de líneas compradas
 */
const Confirmacion = () => {
  const { state } = useLocation();

  /* Si no hay state, el usuario llegó directo a la ruta */
  if (!state || !state.idOrden) {
    return (
      <main className="pagina-confirmacion confirmacion-vacio">
        <h1>No se encontró ninguna orden</h1>
        <p>Parece que llegaste aquí sin completar una compra.</p>
        <Link to="/productos" className="boton-carrito">
          Ver productos
        </Link>
      </main>
    );
  }

  const { idOrden, orden, carrito } = state;
  const total = obtenerTotalCarrito(carrito);

  return (
    <main className="pagina-confirmacion">
      {/* Cabecera de éxito */}
      <div className="confirmacion-cabecera">
        <div className="confirmacion-icono">✓</div>
        <span className="confirmacion-kicker">PEDIDO CONFIRMADO</span>
        <h1>¡Gracias por tu compra!</h1>
        <p className="confirmacion-id">
          Orden: <strong>{idOrden}</strong>
        </p>
      </div>

      <div className="confirmacion-contenido">
        {/* Datos del cliente */}
        <section className="confirmacion-seccion">
          <h2>Datos de envío</h2>
          <div className="confirmacion-datos">
            <div className="dato-fila">
              <span className="dato-label">Nombre</span>
              <span>{orden.cliente.nombre} {orden.cliente.apellido}</span>
            </div>
            <div className="dato-fila">
              <span className="dato-label">Documento</span>
              <span>{orden.cliente.tipo_doc} {orden.cliente.num_ident}</span>
            </div>
            <div className="dato-fila">
              <span className="dato-label">Teléfono</span>
              <span>{orden.cliente.telefono}</span>
            </div>
            <div className="dato-fila">
              <span className="dato-label">Correo</span>
              <span>{orden.cliente.correo}</span>
            </div>
            <div className="dato-fila">
              <span className="dato-label">Dirección</span>
              <span>
                {orden.cliente.direccion}, {orden.cliente.ciudad},{" "}
                {orden.cliente.departamento}
              </span>
            </div>
          </div>
        </section>

        {/* Resumen de productos */}
        <section className="confirmacion-seccion">
          <h2>Resumen del pedido</h2>
          <ul className="confirmacion-productos">
            {carrito.map((linea) => (
              <li key={linea.id_pro}>
                <div className="confirmacion-producto-info">
                  <span className="confirmacion-producto-nombre">{linea.nombre}</span>
                  <span className="confirmacion-producto-cant">× {linea.cantidad}</span>
                </div>
                <span className="confirmacion-producto-precio">
                  {formatearPrecio(linea.precio_unitario * linea.cantidad)}
                </span>
              </li>
            ))}
          </ul>

          {/* Total */}
          <div className="confirmacion-total">
            <span>Total pagado</span>
            <strong>{formatearPrecio(total)}</strong>
          </div>
        </section>

        {/* Estado de la orden */}
        <section className="confirmacion-seccion confirmacion-estado">
          <h2>Estado</h2>
          <div className="estado-badge">
            {orden.estado}
          </div>
          <p className="confirmacion-nota">
            Tu pedido ha sido registrado en el sistema.
            Podrás verlo reflejado en el panel de administrador
            una vez conectada la base de datos.
          </p>
        </section>

        {/* Botón volver */}
        <div className="confirmacion-acciones">
          <Link to="/" className="boton-carrito">
            Volver al inicio
          </Link>
          <Link to="/productos" className="boton-carrito boton-secundario">
            Seguir comprando
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Confirmacion;
