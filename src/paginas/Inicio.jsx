import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Inicio.css';
import { PRODUCTOS_DATA, TarjetaProducto, formatearPrecio } from './Productos';
import { api } from '../servicios/api';
import { crearOrden } from '../servicios/ordenes';
import { obtenerTotalCarrito } from '../servicios/carrito';

const IMAGENES_CATEGORIAS_DEF = {
  Herramientas: 'https://ferreterialider.com/wp-content/uploads/2022/08/Herramientas-para-la-casa-C-1-1024x682.jpg',
  Muebles: 'https://blog.jamar.com/wp-content/uploads/Juego-sala-Gris-1200x900.jpg',
  Decoración: 'https://www.tuoagency.com/uploads/blog/c%C3%B3mo%20decorar%20paredes%20con%20telas/como-decorar-con-telas2.jpg?1646062174189.jpg',
  Iluminación: 'https://www.eglo.com/media/wysiwyg/Iluminaci_n_Vintage_Que_es_y_que_estilos_hay_5.jpg',
  'Baño y Cocina': 'https://dugal.es/wp-content/uploads/2024/05/Tendencias-en-diseno-de-interiores-2024.jpg'
};

const Inicio = ({ carrito = [], onLimpiarCarrito }) => {
  const [categoriasBD, setCategoriasBD] = useState([]);
  const [productosBD, setProductosBD] = useState([]);

  // Estado del Módulo de Pagos
  const [formPago, setFormPago] = useState({
    nombre: '',
    apellido: '',
    tipoDoc: 'C.C',
    numIdent: '',
    telefono: '',
    correo: '',
    direccion: '',
    ciudad: 'Bogotá',
    metodoPago: 'Tarjeta'
  });

  const [procesandoPago, setProcesandoPago] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(null);
  const [mensajeError, setMensajeError] = useState(null);

  // Cargar categorías y productos directamente desde la base de datos MySQL
  useEffect(() => {
    api.get('/categorias').then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setCategoriasBD(res);
      }
    });

    api.get('/productos').then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setProductosBD(res);
      }
    });
  }, []);

  const totalCarrito = obtenerTotalCarrito(carrito);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormPago((prev) => ({ ...prev, [name]: value }));
    if (mensajeError) setMensajeError(null);
  };

  const handleProcesarPago = async (e) => {
    e.preventDefault();
    setMensajeError(null);
    setMensajeExito(null);

    // Validar formulario de pago
    if (!formPago.nombre.trim() || !formPago.apellido.trim() || !formPago.numIdent.trim() || !formPago.correo.trim() || !formPago.direccion.trim()) {
      setMensajeError('Por favor completa todos los campos requeridos (*)');
      return;
    }

    if (carrito.length === 0) {
      setMensajeError('No hay productos en tu carrito de compras para procesar el pago. Agrega algunos productos arriba.');
      return;
    }

    setProcesandoPago(true);

    try {
      const { idOrden } = await crearOrden({
        carrito,
        cliente: {
          nombre: formPago.nombre,
          apellido: formPago.apellido,
          tipo_doc: formPago.tipoDoc,
          num_ident: formPago.numIdent,
          telefono: formPago.telefono,
          correo: formPago.correo,
          departamento: 'Cundinamarca',
          ciudad: formPago.ciudad,
          direccion: formPago.direccion,
          metodoPago: formPago.metodoPago
        }
      });

      setProcesandoPago(false);
      setMensajeExito(`¡Pago de ${formatearPrecio(totalCarrito)} aprobado con éxito! Tu número de orden registrada en MySQL es: ${idOrden}`);

      // Limpiar carrito
      if (typeof onLimpiarCarrito === 'function') {
        onLimpiarCarrito();
      }
      localStorage.removeItem('almacenweb_carrito');

      // Limpiar formulario
      setFormPago({
        nombre: '',
        apellido: '',
        tipoDoc: 'C.C',
        numIdent: '',
        telefono: '',
        correo: '',
        direccion: '',
        ciudad: 'Bogotá',
        metodoPago: 'Tarjeta'
      });
    } catch (err) {
      console.error('Error procesando pago:', err);
      setProcesandoPago(false);
      setMensajeError('Ocurrió un fallo al conectar con la pasarela de pago o registrar en MySQL.');
    }
  };

  // Categorías a renderizar (BD o fallback)
  const listaCategorias = categoriasBD.length > 0
    ? categoriasBD.map((c) => ({
        nombre: c.nombre,
        descripcion: c.descripcion || `Catálogo de ${c.nombre}`,
        imagen: IMAGENES_CATEGORIAS_DEF[c.nombre] || IMAGENES_CATEGORIAS_DEF.Herramientas
      }))
    : [
        { nombre: 'Herramientas', descripcion: 'Todo para construir y reparar.', imagen: IMAGENES_CATEGORIAS_DEF.Herramientas },
        { nombre: 'Muebles', descripcion: 'Diseños para cada espacio de tu hogar.', imagen: IMAGENES_CATEGORIAS_DEF.Muebles },
        { nombre: 'Decoración', descripcion: 'Detalles que transforman tus espacios.', imagen: IMAGENES_CATEGORIAS_DEF.Decoración },
        { nombre: 'Iluminación', descripcion: 'Ambientes que inspiran.', imagen: IMAGENES_CATEGORIAS_DEF.Iluminación },
        { nombre: 'Baño y Cocina', descripcion: 'Funcionalidad y estilo.', imagen: IMAGENES_CATEGORIAS_DEF['Baño y Cocina'] }
      ];

  // Productos destacados (BD o fallback)
  const productosDestacados = productosBD.length > 0
    ? productosBD.slice(0, 5).map((p) => ({
        id: p.id_pro || p.id,
        titulo: p.nombre,
        precio: p.precio,
        imagen: p.imagen_url || 'https://admin.wurth.co/uploads/ec5f5dc6_8a5c_45c1_8630_f7dc139a3e30_7b732362fb.jpg',
        categoria: p.categoria || 'GENERAL',
        calificacion: 5,
        valoraciones: 45
      }))
    : PRODUCTOS_DATA.slice(0, 5);

  return (
    <>
      <div className="contenedor">
        {/* Sección Portada Principal */}
        <main className="portada">
          <div className="portada-contenido">
            <h1>Haz de tu<br />hogar tu mejor<br /><span>versión.</span></h1>
            <p>Herramientas, muebles y decoración para cada espacio con datos reales en tiempo real.</p>
            <div className="portada-botones">
              <Link to="/productos" className="boton boton-primario">Explorar productos</Link>
              <Link to="/ofertas" className="boton boton-contorno">Ver ofertas</Link>
            </div>
          </div>
          <div className="portada-imagen">
            <div className="portada-imagen-marcador">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDOONCYVxDQqUN4nUyqkkrnmBt9wX71toBwxkBJhXsfQRROzBYZuPMsSPt&s=10.jpg" alt="Imagen de portada" />
            </div>
          </div>
        </main>

        {/* Sección Categorías Destacadas (Actualizadas por backend) */}
        <section className="categorias">
          {listaCategorias.map((cat, idx) => (
            <Link
              to={`/productos?categoria=${encodeURIComponent(cat.nombre)}`}
              className={`tarjeta-categoria ${idx === 0 ? 'destacado' : ''}`}
              key={cat.nombre}
            >
              <div className="categoria-imagen-marcador">
                <img src={cat.imagen} alt={cat.nombre} />
              </div>
              <div className="categoria-informacion">
                <h3>{cat.nombre}</h3>
                <p>{cat.descripcion}</p>
                <span className="categoria-icono">&rarr;</span>
              </div>
            </Link>
          ))}
        </section>

        {/* Sección Características */}
        <section className="caracteristicas">
          <div className="caracteristica-elemento">
            <div className="caracteristica-icono-marcador">
              <img src="/src/imagenes/entrega.png" alt="Envíos rápidos" />
            </div>
            <div className="caracteristica-texto">
              <h4>Envíos rápidos</h4>
              <p>A todo Colombia</p>
            </div>
          </div>
          <div className="caracteristica-elemento">
            <div className="caracteristica-icono-marcador">
              <img src="/src/imagenes/mano.png" alt="Pagos seguros" />
            </div>
            <div className="caracteristica-texto">
              <h4>Pagos seguros</h4>
              <p>Protección garantizada</p>
            </div>
          </div>
          <div className="caracteristica-elemento">
            <div className="caracteristica-icono-marcador">
              <img src="/src/imagenes/devolucion.png" alt="Devoluciones fáciles" />
            </div>
            <div className="caracteristica-texto">
              <h4>Devoluciones fáciles</h4>
              <p>Hasta 30 días</p>
            </div>
          </div>
          <div className="caracteristica-elemento">
            <div className="caracteristica-icono-marcador">
              <img src="/src/imagenes/calidad.png" alt="Calidad garantizada" />
            </div>
            <div className="caracteristica-texto">
              <h4>Calidad garantizada</h4>
              <p>Productos de confianza</p>
            </div>
          </div>
        </section>

        {/* Sección Productos Destacados */}
        <section className="productos">
          <div className="productos-encabezado">
            <h2>Productos destacados</h2>
            <Link to="/productos" className="ver-todos">Ver todos &rarr;</Link>
          </div>
          <div className="productos-cuadricula">
            {productosDestacados.map((producto) => (
              <TarjetaProducto key={producto.id} producto={producto} />
            ))}
          </div>
        </section>

        {/* MÓDULO DE PAGOS FUNCIONAL NOVACASA */}
        <section className="modulo-pagos-seccion" id="modulo-pagos">
          <div className="tarjeta-modulo-pagos">
            <div className="encabezado-modulo-pagos">
              <div className="icono-pago-insignia">⚡</div>
              <div>
                <h2>Módulo de Pagos Seguros en Línea</h2>
                <p>Procesa tu compra de forma instantánea y regístrala directamente en el sistema.</p>
              </div>
            </div>

            {/* Alertas de Respuesta */}
            {mensajeExito && (
              <div className="alerta-pago exito">
                <span className="alerta-icono">✓</span>
                <div>
                  <strong>¡Pago Aprobado!</strong>
                  <p>{mensajeExito}</p>
                </div>
              </div>
            )}

            {mensajeError && (
              <div className="alerta-pago error">
                <span className="alerta-icono">⚠️</span>
                <div>
                  <strong>Atención</strong>
                  <p>{mensajeError}</p>
                </div>
              </div>
            )}

            <form className="formulario-modulo-pagos" onSubmit={handleProcesarPago}>
              <div className="grilla-campos-pago">
                {/* Datos Comprador */}
                <div className="campo-pago">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Ej: Carlos"
                    value={formPago.nombre}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="campo-pago">
                  <label>Apellido *</label>
                  <input
                    type="text"
                    name="apellido"
                    placeholder="Ej: Gómez"
                    value={formPago.apellido}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="campo-pago">
                  <label>Tipo Documento *</label>
                  <select name="tipoDoc" value={formPago.tipoDoc} onChange={handleInputChange}>
                    <option value="C.C">C.C</option>
                    <option value="C.E">C.E</option>
                    <option value="NIT">NIT</option>
                    <option value="PAS">PAS</option>
                  </select>
                </div>

                <div className="campo-pago">
                  <label>N° Documento *</label>
                  <input
                    type="text"
                    name="numIdent"
                    placeholder="Ej: 1020304050"
                    value={formPago.numIdent}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="campo-pago">
                  <label>Teléfono *</label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="Ej: 3001234567"
                    value={formPago.telefono}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="campo-pago">
                  <label>Correo Electrónico *</label>
                  <input
                    type="email"
                    name="correo"
                    placeholder="cliente@correo.com"
                    value={formPago.correo}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="campo-pago campo-completo">
                  <label>Dirección de Entrega *</label>
                  <input
                    type="text"
                    name="direccion"
                    placeholder="Ej: Calle 100 #15-20"
                    value={formPago.direccion}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="campo-pago campo-completo">
                  <label>Método de Pago *</label>
                  <div className="selector-metodos-pago">
                    {[
                      { id: 'Tarjeta', label: '💳 Tarjeta Crédito/Débito' },
                      { id: 'PSE', label: '🏦 Transferencia PSE' },
                      { id: 'Nequi', label: '📱 Nequi / Daviplata' },
                      { id: 'Efectivo', label: '💵 Efectivo Contra Entrega' }
                    ].map((met) => (
                      <button
                        key={met.id}
                        type="button"
                        className={`opcion-metodo-pago ${formPago.metodoPago === met.id ? 'activo' : ''}`}
                        onClick={() => setFormPago((prev) => ({ ...prev, metodoPago: met.id }))}
                      >
                        {met.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resumen del Carrito y Botón de Pago */}
              <div className="resumen-pago-pie">
                <div className="info-total-pago">
                  <span>Total a pagar ({carrito.length} artículos):</span>
                  <strong>{formatearPrecio(totalCarrito)}</strong>
                </div>

                <button
                  type="submit"
                  className="boton boton-primario btn-procesar-pago-modulo"
                  disabled={procesandoPago}
                >
                  {procesandoPago ? (
                    <span className="loader-pago">Procesando pago seguro...</span>
                  ) : (
                    <>Completar Pago Seguro &rarr;</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Secciones Inferiores (Por qué elegirnos & Inspiración) */}
        <section className="secciones-inferiores">
          <div className="por-que-elegirnos">
            <h2>¿Por qué elegir<br />NovaCasa?</h2>
            <div className="beneficios-cuadricula">
              <div className="beneficio-elemento">
                <div className="beneficio-icono-marcador">
                  <img src="/src/imagenes/sitio.png" alt="Todo en un solo lugar" />
                </div>
                <h4>Todo en un solo lugar</h4>
                <p>Encuentra lo que necesitas.</p>
              </div>
              <div className="beneficio-elemento">
                <div className="beneficio-icono-marcador">
                  <img src="/src/imagenes/calidad_1.png" alt="Las mejores marcas" />
                </div>
                <h4>Las mejores marcas</h4>
                <p>Productos de alta calidad.</p>
              </div>
              <div className="beneficio-elemento">
                <div className="beneficio-icono-marcador">
                  <img src="/src/imagenes/dolar.png" alt="Precios que convienen" />
                </div>
                <h4>Precios que convienen</h4>
                <p>Ofertas exclusivas para ti.</p>
              </div>
              <div className="beneficio-elemento">
                <div className="beneficio-icono-marcador">
                  <img src="/src/imagenes/apoyo.png" alt="Atención que te acompaña" />
                </div>
                <h4>Atención que te acompaña</h4>
                <p>Estamos para ayudarte.</p>
              </div>
            </div>
          </div>

          <div className="banner-inspiracion">
            <div className="inspiracion-fondo-marcador">
              <img src="https://media.admagazine.com/photos/63472117052e230ddc1793c3/master/pass/plantas-altas-decoracion-interiores.jpg" alt="Inspiración para tu hogar" />
            </div>
            <div className="inspiracion-contenido">
              <h2>Inspírate,<br />crea y disfruta<br />tu espacio.</h2>
              <Link to="/productos" className="boton boton-primario">Ver inspiración &rarr;</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Inicio;
