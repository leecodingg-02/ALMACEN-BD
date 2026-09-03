import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PRODUCTOS_DATA,
  formatearPrecio,
  renderizarEstrellas,
  TarjetaProducto,
} from "./Productos";
import "./DetalleProducto.css";

const DetalleProducto = ({ onAgregarCarrito }) => {
  const { id } = useParams();
  const producto = PRODUCTOS_DATA.find((p) => p.id === parseInt(id, 10));

  const [colorSeleccionado, setColorSeleccionado] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [acordeonAbierto, setAcordeonAbierto] = useState("specs");
  const [imagenActiva, setImagenActiva] = useState(0);

  // Imagen activa (simuladas con colores de fondo)
  const fondosGaleria = ["#e0e0e0", "#d0d0d0", "#c8c8c8", "#bebebe"];

  if (!producto) {
    return (
      <>
        <div className='detalle-no-encontrado'>
          <h2>Producto no encontrado</h2>
          <p>El producto que buscas no existe o fue eliminado.</p>
          <Link to='/productos' className='boton-volver'>
            ← Volver a productos
          </Link>
        </div>
      </>
    );
  }

  const productosRelacionados = PRODUCTOS_DATA.filter((p) =>
    producto.relacionados.includes(p.id),
  );

  const toggleAcordeon = (seccion) => {
    setAcordeonAbierto((prev) => (prev === seccion ? null : seccion));
  };

  return (
    <>
      <div className='pagina-detalle'>
        {/* Breadcrumb */}
        <nav className='breadcrumb'>
          <Link to='/'>Inicio</Link>
          <span>›</span>
          <Link to='/productos'>Productos</Link>
          <span>›</span>
          <span>{producto.subcategoria}</span>
          <span>›</span>
          <span className='breadcrumb-actual'>{producto.titulo}</span>
        </nav>

        {/* Contenido principal */}
        <div className='detalle-contenido'>
          {/* Galería de imágenes */}
          <div className='galeria'>
            <div className='galeria-miniaturas'>
              {fondosGaleria.map((fondo, i) => (
                <div
                  key={i}
                  className={`miniatura ${imagenActiva === i ? "activa" : ""}`}
                  style={{ backgroundColor: fondo }}
                  onClick={() => setImagenActiva(i)}
                >
                  <span>Vista {i + 1}</span>
                </div>
              ))}
            </div>
            <div className='galeria-principal'>
              {producto.etiqueta && (
                <span
                  className={`etiqueta-detalle ${producto.etiqueta.toLowerCase()}`}
                >
                  {producto.etiqueta}
                </span>
              )}
              <button className='favorito-detalle'>&#9825;</button>
              <div
                className='imagen-principal'
                style={{ backgroundColor: fondosGaleria[imagenActiva] }}
              >
                <span className='imagen-placeholder-texto'>
                  {producto.titulo} — Vista {imagenActiva + 1}
                </span>
              </div>
            </div>
          </div>

          {/* Información del producto */}
          <div className='detalle-info'>
            <span className='detalle-categoria'>{producto.categoria}</span>
            <h1 className='detalle-titulo'>{producto.titulo}</h1>

            <div className='detalle-calificacion'>
              {renderizarEstrellas(producto.calificacion)}
              <span className='detalle-valoraciones'>
                ({producto.valoraciones} reseñas)
              </span>
            </div>

            <div className='detalle-precios'>
              <span className='detalle-precio-actual'>
                {formatearPrecio(producto.precio)}
              </span>
              {producto.precioAnterior && (
                <span className='detalle-precio-anterior'>
                  {formatearPrecio(producto.precioAnterior)}
                </span>
              )}
            </div>

            <p className='detalle-descripcion'>{producto.descripcion}</p>

            {/* Selector de color */}
            {producto.colores && producto.colores.length > 1 && (
              <div className='detalle-colores'>
                <span className='detalle-label'>COLOR:</span>
                <div className='colores-lista'>
                  {producto.colores.map((color, i) => (
                    <button
                      key={i}
                      className={`color-circulo ${colorSeleccionado === i ? "seleccionado" : ""}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setColorSeleccionado(i)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad + Agregar al carrito */}
            <div className='detalle-accion'>
              <div className='selector-cantidad'>
                <button onClick={() => setCantidad((q) => Math.max(1, q - 1))}>
                  −
                </button>
                <span>{cantidad}</span>
                <button onClick={() => setCantidad((q) => q + 1)}>+</button>
              </div>
              <button
                className='boton-carrito-detalle'
                onClick={() => onAgregarCarrito?.(cantidad)}
              >
                🛒 Añadir al carrito
              </button>
            </div>

            {/* Acordeones */}
            <div className='acordeones'>
              {/* Especificaciones */}
              <div className='acordeon'>
                <button
                  className={`acordeon-cabecera ${acordeonAbierto === "specs" ? "abierto" : ""}`}
                  onClick={() => toggleAcordeon("specs")}
                >
                  <span>Especificaciones Técnicas</span>
                  <span className='acordeon-flecha'>
                    {acordeonAbierto === "specs" ? "∧" : "∨"}
                  </span>
                </button>
                {acordeonAbierto === "specs" && (
                  <div className='acordeon-contenido specs-grid'>
                    {Object.entries(producto.specs).map(([clave, valor]) => (
                      <div key={clave} className='spec-item'>
                        <span className='spec-clave'>{clave}:</span>
                        <span className='spec-valor'>{valor}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Envíos */}
              <div className='acordeon'>
                <button
                  className={`acordeon-cabecera ${acordeonAbierto === "envios" ? "abierto" : ""}`}
                  onClick={() => toggleAcordeon("envios")}
                >
                  <span>Envíos y Devoluciones</span>
                  <span className='acordeon-flecha'>
                    {acordeonAbierto === "envios" ? "∧" : "∨"}
                  </span>
                </button>
                {acordeonAbierto === "envios" && (
                  <div className='acordeon-contenido'>
                    <p>
                      Envíos a todo Colombia en 3-7 días hábiles. Envío gratis
                      en compras mayores a $200.000.
                    </p>
                    <p style={{ marginTop: "8px" }}>
                      Devoluciones gratuitas dentro de los primeros 30 días. El
                      producto debe estar en su empaque original sin uso.
                    </p>
                  </div>
                )}
              </div>

              {/* Garantía */}
              <div className='acordeon'>
                <button
                  className={`acordeon-cabecera ${acordeonAbierto === "garantia" ? "abierto" : ""}`}
                  onClick={() => toggleAcordeon("garantia")}
                >
                  <span>Garantía</span>
                  <span className='acordeon-flecha'>
                    {acordeonAbierto === "garantia" ? "∧" : "∨"}
                  </span>
                </button>
                {acordeonAbierto === "garantia" && (
                  <div className='acordeon-contenido'>
                    <p>
                      Este producto cuenta con garantía de fábrica de 12 meses
                      contra defectos de fabricación. Para hacer válida la
                      garantía, conserva tu factura de compra.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Badges de confianza */}
            <div className='confianza-badges'>
              <div className='badge'>
                <span className='badge-icono'>🚚</span>
                <span>Envío seguro</span>
              </div>
              <div className='badge'>
                <span className='badge-icono'>🛡️</span>
                <span>Garantía 1 año</span>
              </div>
              <div className='badge'>
                <span className='badge-icono'>💳</span>
                <span>Pago seguro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Completa el look */}
        {productosRelacionados.length > 0 && (
          <section className='relacionados'>
            <div className='relacionados-cabecera'>
              <h2>Completa el look</h2>
              <Link to='/productos' className='ver-mas-link'>
                VER MÁS →
              </Link>
            </div>
            <div className='relacionados-grid'>
              {productosRelacionados.map((p) => (
                <TarjetaProducto
                  key={p.id}
                  producto={p}
                  onAgregarCarrito={onAgregarCarrito}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default DetalleProducto;
