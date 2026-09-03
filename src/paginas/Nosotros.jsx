import './Nosotros.css';
import Encabezado from '../componentes/Encabezado';

const Nosotros = () => {
    return (
        <>
            <Encabezado />
            <div className="contenedor">
                {/* Hero Section */}
                <section className="portada">
                    <div className="portada-contenido">
                        <span className="etiqueta-historia">NUESTRA HISTORIA</span>
                        <h1>Redefiniendo<br/>el<br/>espacio que<br/><span>habitas.</span></h1>
                        <p>Nacimos con la convicción de que la funcionalidad ferretera y la elegancia del diseño mobiliario no son excluyentes. Somos la evolución de tu hogar.</p>
                    </div>
                    <div className="portada-imagen">
                        <div className="portada-imagen-marcador">
                            {/* Placeholder para la imagen de la tienda */}
                        </div>
                    </div>
                </section>

                {/* Misión y Visión */}
                <section className="nosotros-mision-vision">
                    <div className="tarjeta-mv">
                        <div className="icono-mv">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
                            </svg>
                        </div>
                        <h2>Nuestra Misión</h2>
                        <p>Democratizar el acceso a espacios de alta calidad. Proveer herramientas precisas y mobiliario aspiracional bajo un mismo techo, optimizando la experiencia de transformación del hogar mediante eficiencia operativa y estética superior.</p>
                        <span className="etiqueta-mv">PRECISIÓN & DISEÑO</span>
                    </div>
                    
                    <div className="tarjeta-mv">
                        <div className="icono-mv">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        </div>
                        <h2>Nuestra Visión</h2>
                        <p>Ser el estándar absoluto en mejoramiento del hogar a nivel regional. Aspiramos a ser el punto de convergencia donde la arquitectura, el diseño de interiores y la construcción se encuentran, inspirando a cada persona a construir su mejor versión de hábitat.</p>
                    </div>
                </section>

                {/* Sección Motor */}
                <section className="nosotros-motor">
                    <h2 className="titulo-motor">El Motor de NovaCasa</h2>
                    <div className="motor-contenido">
                        <div className="motor-imagen-container">
                            <div className="imagen-placeholder-equipo">
                                {/* Placeholder equipo */}
                            </div>
                            <div className="caja-flotante">
                                <h3>Expertos en <span className="texto-amarillo">soluciones.</span></h3>
                            </div>
                        </div>
                        <div className="motor-texto">
                            <p className="texto-principal">Nuestro equipo no está compuesto por simples vendedores; somos asesores de proyectos. Desde el cálculo estructural hasta la paleta de colores de tu sala, contamos con especialistas en cada área.</p>
                            <blockquote className="cita-motor">
                                <p>La innovación no ocurre en el vacío. Ocurre en pasillos de almacenes modernos, optimizados con tecnología logística de punta, donde cada tornillo y cada sofá modular tiene su propósito.</p>
                            </blockquote>
                            <a href="#" className="boton boton-sucursales">CONOCE NUESTRAS SUCURSALES</a>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Nosotros;
