import './Ofertas.css';
import { PRODUCTOS_DATA, TarjetaProducto } from './Productos';
import { Link } from 'react-router-dom';

const Ofertas = () => {
    // Filtrar productos que están en oferta o tienen etiqueta relacionada
    const productosEnOferta = PRODUCTOS_DATA.filter(p => p.precioAnterior || p.etiqueta === 'OFERTA' || p.etiqueta === 'CYBER OFERTA' || p.etiqueta === 'NUEVO');

    // Cambiamos manualmente algunas etiquetas a los productos para simular la imagen si no existen las etiquetas exactas
    // (Opcional, en un escenario real se ajustarían los datos de PRODUCTOS_DATA)
    const productosMostrar = productosEnOferta.map(p => {
        let etiqueta = p.etiqueta;
        let descuento = '';
        if(p.id === 3) {
            etiqueta = 'DESTACADO';
            descuento = '-35%';
        } else if (p.id === 2) {
            etiqueta = 'CYBER OFERTA';
        } else if (p.id === 14) {
            descuento = '-20%';
        } else if (p.id === 8) {
            etiqueta = 'ÚLTIMAS UNIDADES';
            descuento = '-45%';
        }

        return { ...p, etiqueta: etiqueta || p.etiqueta, descuentoTag: descuento };
    }).slice(0, 5); // Mostramos 5 productos

    return (
        <>
            <div className="contenedor">
                {/* Sección Portada Principal Ofertas */}
                <main className="portada-ofertas">
                    <div className="portada-ofertas-contenido">
                        <span className="oferta-badge">GRAN VENTA DE TEMPORADA</span>
                        <h1>Sale hasta<br /><span>50% OFF</span></h1>
                        <p>Renueva tu hogar con descuentos exclusivos en<br/>herramientas, muebles y decoración. Ofertas por<br/>tiempo limitado.</p>
                        <div className="portada-ofertas-botones">
                            <a href="#productos-oferta" className="boton boton-primario">COMPRAR AHORA &rarr;</a>
                        </div>
                    </div>
                    <div className="portada-ofertas-imagen">
                        <div className="portada-ofertas-marcador">
                            <div className="ofertas-imagen-placeholder">
                                <img src="https://images.sodimac.com/v3/assets/blt2f8082df109cfbfb/bltf768b33a78a7b7a2/673dfeb5554dc38d3cc6a2ab/LND-GC-499-PC1-La-importancia-de-una-buena-iluminacion-en-la-sala.jpg" alt="Ofertas Banner" className="ofertas-banner-imagen" />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Sección Categorías (Misma estructura que Inicio) */}
                <section className="categorias">
                    <Link to="/productos?categoria=Herramientas" className="categoria-enlace">
                    <div className="tarjeta-categoria destacado">
                        <div className="categoria-imagen-marcador">
                            <img src="https://ferreterialider.com/wp-content/uploads/2022/08/Herramientas-para-la-casa-C-1-1024x682.jpg" alt="Herramientas" />
                        </div>
                        <div className="categoria-informacion">
                            <h3>Herramientas</h3>
                            <p>Todo para construir y reparar.</p>
                            <span className="tag-descuento">Hasta -50%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    </Link>
                    <Link to="/productos?categoria=Muebles" className="categoria-enlace">
                    <div className="tarjeta-categoria">
                        <div className="categoria-imagen-marcador">
                            <img src="https://blog.jamar.com/wp-content/uploads/Juego-sala-Gris-1200x900.jpg" alt="Muebles" />
                        </div>
                        <div className="categoria-informacion">
                            <h3>Muebles</h3>
                            <p>Diseños para cada espacio de tu hogar.</p>
                            <span className="tag-descuento">Hasta -40%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    </Link>
                    <Link to="/productos?categoria=Decoración" className="categoria-enlace">
                    <div className="tarjeta-categoria">
                        <div className="categoria-imagen-marcador">
                            <img src="https://www.tuoagency.com/uploads/blog/c%C3%B3mo%20decorar%20paredes%20con%20telas/como-decorar-con-telas2.jpg?1646062174189.jpg" alt="Decoración" />
                        </div>
                        <div className="categoria-informacion">
                            <h3>Decoración</h3>
                            <p>Detalles que transforman tus espacios.</p>
                            <span className="tag-descuento">Hasta -30%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    </Link>
                    <Link to="/productos?categoria=Iluminación" className="categoria-enlace">
                    <div className="tarjeta-categoria">
                        <div className="categoria-imagen-marcador">
                            <img src="https://www.eglo.com/media/wysiwyg/Iluminaci_n_Vintage_Que_es_y_que_estilos_hay_5.jpg" alt="Iluminación" />
                        </div>
                        <div className="categoria-informacion">
                            <h3>Iluminación</h3>
                            <p>Ambientes que inspiran.</p>
                            <span className="tag-descuento">Hasta -60%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    </Link>
                    <Link to="/productos?categoria=Baño%20y%20Cocina" className="categoria-enlace">
                    <div className="tarjeta-categoria">
                        <div className="categoria-imagen-marcador">
                            <img src="https://dugal.es/wp-content/uploads/2024/05/Tendencias-en-diseno-de-interiores-2024.jpg" alt="Baño y Cocina" />
                        </div>
                        <div className="categoria-informacion">
                            <h3>Baño y Cocina</h3>
                            <p>Funcionalidad y estilo.</p>
                            <span className="tag-descuento">Hasta -20%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    </Link>
                </section>

                {/* Sección Productos Destacados */}
                <section id="productos-oferta" className="productos" style={{ marginTop: '50px' }}>
                    <div className="productos-cuadricula">
                        {productosMostrar.map(producto => (
                            <div className="wrapper-tarjeta-oferta" key={producto.id}>
                                {producto.descuentoTag && (
                                    <div className="tag-descuento-absoluto">{producto.descuentoTag}</div>
                                )}
                                <TarjetaProducto producto={producto} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>

        </>
    );
};

export default Ofertas;
