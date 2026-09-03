import './Inicio.css';
import { PRODUCTOS_DATA, TarjetaProducto } from './Productos';

const Inicio = () => {
    return (
        <>
            <div className="contenedor">
                {/* Sección Portada Principal */}
                <main className="portada">
                <div className="portada-contenido">
                    <h1>Haz de tu<br />hogar tu mejor<br /><span>versión.</span></h1>
                    <p>Herramientas, muebles y decoración para cada espacio.</p>
                    <div className="portada-botones">
                        <a href="#" className="boton boton-primario">Explorar productos &rarr;</a>
                        <a href="#" className="boton boton-contorno">
                            {/* Marcador de ícono */}
                            &#127991; Ver ofertas
                        </a>
                    </div>
                </div>
                <div className="portada-imagen">
                    <div className="portada-imagen-marcador">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDOONCYVxDQqUN4nUyqkkrnmBt9wX71toBwxkBJhXsfQRROzBYZuPMsSPt&s=10.jpg" alt="Imagen de portada" />
                    </div>
                </div>
            </main>

            {/* Sección Categorías */}
            <section className="categorias">
                <div className="tarjeta-categoria destacado">
                    <div className="categoria-imagen-marcador">
                        {/* Marcador de imagen de taladro */}
                        <img src="https://ferreterialider.com/wp-content/uploads/2022/08/Herramientas-para-la-casa-C-1-1024x682.jpg" alt="Herramientas" />
                    </div>
                    <div className="categoria-informacion">
                        <h3>Herramientas</h3>
                        <p>Todo para construir y reparar.</p>
                        <span className="categoria-icono">&rarr;</span>
                    </div>
                </div>
                <div className="tarjeta-categoria">
                    <div className="categoria-imagen-marcador">
                        <img src="https://blog.jamar.com/wp-content/uploads/Juego-sala-Gris-1200x900.jpg" alt="Muebles" />
                    </div>
                    <div className="categoria-informacion">
                        <h3>Muebles</h3>
                        <p>Diseños para cada espacio de tu hogar.</p>
                        <span className="categoria-icono">&rarr;</span>
                    </div>
                </div>
                <div className="tarjeta-categoria">
                    <div className="categoria-imagen-marcador">
                        <img src="https://www.tuoagency.com/uploads/blog/c%C3%B3mo%20decorar%20paredes%20con%20telas/como-decorar-con-telas2.jpg?1646062174189.jpg" alt="Decoración" />
                    </div>
                    <div className="categoria-informacion">
                        <h3>Decoración</h3>
                        <p>Detalles que transforman tus espacios.</p>
                        <span className="categoria-icono">&rarr;</span>
                    </div>
                </div>
                <div className="tarjeta-categoria">
                    <div className="categoria-imagen-marcador">
                        <img src="https://www.eglo.com/media/wysiwyg/Iluminaci_n_Vintage_Que_es_y_que_estilos_hay_5.jpg" alt="Iluminación" />
                    </div>
                    <div className="categoria-informacion">
                        <h3>Iluminación</h3>
                        <p>Ambientes que inspiran.</p>
                        <span className="categoria-icono">&rarr;</span>
                    </div>
                </div>
                <div className="tarjeta-categoria">
                    <div className="categoria-imagen-marcador">
                        <img src="https://dugal.es/wp-content/uploads/2024/05/Tendencias-en-diseno-de-interiores-2024.jpg" alt="Baño y Cocina" />
                    </div>
                    <div className="categoria-informacion">
                        <h3>Baño y Cocina</h3>
                        <p>Funcionalidad y estilo.</p>
                        <span className="categoria-icono">&rarr;</span>
                    </div>
                </div>
            </section>

            {/* Sección Características */}
            <section className="caracteristicas">
                <div className="caracteristica-elemento">
                    <div className="caracteristica-icono-marcador"></div>
                    <div className="caracteristica-texto">
                        <h4>Envíos rápidos</h4>
                        <p>A todo Colombia</p>
                    </div>
                </div>
                <div className="caracteristica-elemento">
                    <div className="caracteristica-icono-marcador"></div>
                    <div className="caracteristica-texto">
                        <h4>Pagos seguros</h4>
                        <p>Protección garantizada</p>
                    </div>
                </div>
                <div className="caracteristica-elemento">
                    <div className="caracteristica-icono-marcador"></div>
                    <div className="caracteristica-texto">
                        <h4>Devoluciones fáciles</h4>
                        <p>Hasta 30 días</p>
                    </div>
                </div>
                <div className="caracteristica-elemento">
                    <div className="caracteristica-icono-marcador"></div>
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
                    <a href="/productos" className="ver-todos">Ver todos &rarr;</a>
                </div>
                <div className="productos-cuadricula">
                    {PRODUCTOS_DATA.slice(0, 5).map(producto => (
                        <TarjetaProducto key={producto.id} producto={producto} />
                    ))}
                </div>
            </section>

            {/* Secciones Inferiores (Por qué elegirnos & Inspiración) */}
            <section className="secciones-inferiores">
                <div className="por-que-elegirnos">
                    <h2>¿Por qué elegir<br />NovaCasa?</h2>
                    <div className="beneficios-cuadricula">
                        <div className="beneficio-elemento">
                            <div className="beneficio-icono-marcador"></div>
                            <h4>Todo en un solo lugar</h4>
                            <p>Encuentra lo que necesitas.</p>
                        </div>
                        <div className="beneficio-elemento">
                            <div className="beneficio-icono-marcador"></div>
                            <h4>Las mejores marcas</h4>
                            <p>Productos de alta calidad.</p>
                        </div>
                        <div className="beneficio-elemento">
                            <div className="beneficio-icono-marcador"></div>
                            <h4>Precios que convienen</h4>
                            <p>Ofertas exclusivas para ti.</p>
                        </div>
                        <div className="beneficio-elemento">
                            <div className="beneficio-icono-marcador"></div>
                            <h4>Atención que te acompaña</h4>
                            <p>Estamos para ayudarte.</p>
                        </div>
                    </div>
                </div>

                <div className="banner-inspiracion">
                    <div className="inspiracion-fondo-marcador">
                        {/* Marcador de imagen para sala de estar con plantas */}
                    </div>
                    <div className="inspiracion-contenido">
                        <h2>Inspírate,<br />crea y disfruta<br />tu espacio.</h2>
                        <a href="#" className="boton boton-primario">Ver inspiración &rarr;</a>
                    </div>
                </div>
            </section>
        </div>
        </>
    );
};

export default Inicio;
