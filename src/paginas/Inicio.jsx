import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Inicio.css';
import { PRODUCTOS_DATA, TarjetaProducto, formatearPrecio } from './Productos';
import { api } from '../servicios/api';
import { useAvisoSesion } from '../contextos/AvisoSesionContext';

const IMAGENES_CATEGORIAS_DEF = {
  Herramientas: 'https://ferreterialider.com/wp-content/uploads/2022/08/Herramientas-para-la-casa-C-1-1024x682.jpg',
  Muebles: 'https://blog.jamar.com/wp-content/uploads/Juego-sala-Gris-1200x900.jpg',
  Decoración: 'https://www.tuoagency.com/uploads/blog/c%C3%B3mo%20decorar%20paredes%20con%20telas/como-decorar-con-telas2.jpg?1646062174189.jpg',
  Iluminación: 'https://www.eglo.com/media/wysiwyg/Iluminaci_n_Vintage_Que_es_y_que_estilos_hay_5.jpg',
  'Baño y Cocina': 'https://dugal.es/wp-content/uploads/2024/05/Tendencias-en-diseno-de-interiores-2024.jpg'
};

const Inicio = ({ 
  carrito = [], 
  onLimpiarCarrito, 
  onAgregarCarrito, 
  usuario, 
  favoritos = [], 
  onAlternarFavorito 
}) => {
  const { mostrarAvisoSesion } = useAvisoSesion();
  const [categoriasBD, setCategoriasBD] = useState([]);
  const [productosBD, setProductosBD] = useState([]);

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
  // Busca imagen coincidente en PRODUCTOS_DATA para evitar imagen genérica única
  const buscarImagenLocal = (nombreProducto) => {
    const coincidencia = PRODUCTOS_DATA.find(
      (pd) => pd.titulo.toLowerCase() === (nombreProducto || '').toLowerCase()
    );
    return coincidencia?.imagen || null;
  };

  const productosDestacados = productosBD.length > 0
    ? productosBD.slice(0, 5).map((p) => ({
        id: p.id_pro || p.id,
        titulo: p.nombre,
        precio: p.precio,
        imagen: p.imagen_url || buscarImagenLocal(p.nombre) || PRODUCTOS_DATA[0]?.imagen,
        categoria: p.categoria || 'GENERAL',
        calificacion: p.calificacion || 0,
        valoraciones: p.valoraciones || 0
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
              <TarjetaProducto
                key={producto.id}
                producto={producto}
                onAgregarCarrito={onAgregarCarrito}
                usuario={usuario}
                favoritos={favoritos}
                onAlternarFavorito={onAlternarFavorito}
              />
            ))}
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
