import { Link, useNavigate } from "react-router-dom";
import {
  obtenerTotalCarrito,
  obtenerCantidadTotal,
} from "../servicios/carrito";
import { formatearPrecio } from "./Productos";
import "./Carrito.css";

/**
 * Carrito
 * Muestra los productos agregados con controles para modificar cantidad
 * y eliminar líneas. El botón "Ir al checkout" navega a /checkout.
 *
 * Props:
 *  - carrito           : array de líneas del carrito
 *  - onActualizarCant  : (idProducto, nuevaCantidad) => void
 *  - onRemoverLinea    : (idProducto) => void
 */
const Carrito = ({ carrito, onActualizarCant, onRemoverLinea }) => {
  const navigate = useNavigate();
  const total = obtenerTotalCarrito(carrito);
  const cantidadTotal = obtenerCantidadTotal(carrito);

  /* Navegar al checkout pasando el carrito en state */
  const irAlCheckout = () => {
    navigate("/checkout", { state: { carrito } });
  };

  /* Carrito vacío */
  if (carrito.length === 0) {
    return (
      <main className='pagina-carrito carrito-vacio'>
        <div className='carrito-vacio-icono' aria-hidden='true'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='carrito-vacio-svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1-1.5 0Z'
            />
          </svg>
        </div>
        <h1>Tu carrito está vacío</h1>
        <p>Agrega productos para comenzar tu compra.</p>
        <Link to='/productos' className='boton-carrito boton-vacio'>
          Ver productos
        </Link>
      </main>
    );
  }

  return (
    <main className='pagina-carrito'>
      {/* Cabecera */}
      <div className='carrito-cabecera'>
        <div>
          <span className='carrito-kicker'>COMPRA</span>
          <h1>Tu carrito</h1>
        </div>
        <span className='carrito-cantidad-total'>
          {cantidadTotal} artículo(s)
        </span>
      </div>

      <div className='carrito-contenido'>
        {/* Lista de productos */}
        <section className='carrito-lista' aria-label='Productos agregados'>
          {carrito.map((linea) => (
            <article className='carrito-linea' key={linea.id_pro}>
              {/* Imagen placeholder */}
              <div className='carrito-imagen'>Img {linea.id_pro}</div>

              {/* Información del producto */}
              <div className='carrito-linea-info'>
                <span>Producto #{linea.id_pro}</span>
                <h2>{linea.nombre}</h2>
                <p className='carrito-precio-unitario'>
                  {formatearPrecio(linea.precio_unitario)} c/u
                </p>
              </div>

              {/* Controles de cantidad */}
              <div className='carrito-controles'>
                <div className='carrito-cantidad'>
                  <button
                    className='btn-cantidad'
                    onClick={() =>
                      onActualizarCant(linea.id_pro, linea.cantidad - 1)
                    }
                    disabled={linea.cantidad <= 1}
                    aria-label='Reducir cantidad'
                  >
                    −
                  </button>
                  <span className='cantidad-valor'>{linea.cantidad}</span>
                  {/*
                    TODO: limitar al stock real cuando se conecte la BD
                    (tabla inventario.cantidad)
                  */}
                  <button
                    className='btn-cantidad'
                    onClick={() =>
                      onActualizarCant(linea.id_pro, linea.cantidad + 1)
                    }
                    aria-label='Aumentar cantidad'
                  >
                    +
                  </button>
                </div>

                {/* Subtotal de la línea */}
                <strong className='carrito-subtotal'>
                  {formatearPrecio(linea.precio_unitario * linea.cantidad)}
                </strong>

                {/* Botón eliminar */}
                <button
                  className='btn-eliminar'
                  onClick={() => onRemoverLinea(linea.id_pro)}
                  aria-label={`Eliminar ${linea.nombre}`}
                >
                  ✕
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Resumen lateral */}
        <aside className='carrito-resumen'>
          <h2>Resumen del pedido</h2>

          {/* Desglose por línea */}
          <ul className='resumen-desglose'>
            {carrito.map((linea) => (
              <li key={linea.id_pro}>
                <span>
                  {linea.nombre} × {linea.cantidad}
                </span>
                <span>
                  {formatearPrecio(linea.precio_unitario * linea.cantidad)}
                </span>
              </li>
            ))}
          </ul>

          <div className='carrito-total'>
            <span>Total</span>
            <strong>{formatearPrecio(total)}</strong>
          </div>

          <button
            className='boton-carrito boton-comprar'
            onClick={irAlCheckout}
          >
            Ir al checkout
          </button>

          <p className='carrito-nota'>
            La compra se registrará en el sistema y podrá verse en el
            administrador.
          </p>
        </aside>
      </div>
    </main>
  );
};

export default Carrito;
