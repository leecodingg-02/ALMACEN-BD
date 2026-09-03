import './Ofertas.css';
import { PRODUCTOS_DATA, TarjetaProducto } from './Productos';

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
                                {/* Simulando la imagen torcida de la captura */}
                            </div>
                        </div>
                    </div>
                </main>

                <div className="ofertas-seccion-titulo">
                    <div className="titulo-texto">
                        <h2>Ofertas por Categoría</h2>
                        <p>Encuentra los mejores descuentos en lo que necesitas.</p>
                    </div>
                    <button className="boton-filtros">&#9881; Filtros</button>
                </div>

                {/* Sección Categorías (Misma estructura que Inicio) */}
                <section className="categorias">
                    <div className="tarjeta-categoria destacado">
                        <div className="categoria-imagen-marcador">
                            {/* Marcador de imagen de taladro */}
                        </div>
                        <div className="categoria-informacion">
                            <h3>Herramientas</h3>
                            <p>Todo para construir y reparar.</p>
                            <span className="tag-descuento">Hasta -50%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    <div className="tarjeta-categoria">
                        <div className="categoria-imagen-marcador">
                            {/* Marcador de imagen de silla */}
                        </div>
                        <div className="categoria-informacion">
                            <h3>Muebles</h3>
                            <p>Diseños para cada espacio de tu hogar.</p>
                            <span className="tag-descuento">Hasta -40%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    <div className="tarjeta-categoria">
                        <div className="categoria-imagen-marcador">
                            {/* Marcador de imagen de plantas */}
                        </div>
                        <div className="categoria-informacion">
                            <h3>Decoración</h3>
                            <p>Detalles que transforman tus espacios.</p>
                            <span className="tag-descuento">Hasta -30%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    <div className="tarjeta-categoria">
                        <div className="categoria-imagen-marcador">
                            {/* Marcador de imagen de lámpara */}
                        </div>
                        <div className="categoria-informacion">
                            <h3>Iluminación</h3>
                            <p>Ambientes que inspiran.</p>
                            <span className="tag-descuento">Hasta -60%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
                    <div className="tarjeta-categoria">
                        <div className="categoria-imagen-marcador">
                            {/* Marcador de imagen de grifo de baño */}
                        </div>
                        <div className="categoria-informacion">
                            <h3>Baño y Cocina</h3>
                            <p>Funcionalidad y estilo.</p>
                            <span className="tag-descuento">Hasta -20%</span>
                            <span className="categoria-icono">&rarr;</span>
                        </div>
                    </div>
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
                
                <div className="boton-cargar-mas-contenedor">
                    <button className="boton-cargar-mas">CARGAR MÁS OFERTAS &or;</button>
                </div>
            </div>

        </>
    );
};

export default Ofertas;
