import { Link } from "react-router-dom";
import "./PiePagina.css";

function PiePagina() {
  return (
    <footer className="pie-pagina-contenedor">
      {/* Contenido Principal del Footer */}
      <div className="pie-pagina-cuerpo">
        {/* Columna Marca & Redes */}
        <div className="pie-pagina-col pie-col-marca">
          <div className="encabezado-logo pie-logo-encabezado">
            <Link to="/">
              <img src="/src/imagenes/logo.png" alt="Logo NovaCasa" />
            </Link>
          </div>

          <p className="pie-descripcion">
            En NovaCasa encuentras calidad, diseño y funcionalidad para cada rincón de tu
            hogar.
          </p>

          {/* Redes Sociales (Instagram, Facebook, YouTube) */}
          <div className="pie-redes-sociales">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram de NovaCasa"
              className="pie-red-item"
            >
              <svg
                className="pie-icono-social"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook de NovaCasa"
              className="pie-red-item"
            >
              <svg
                className="pie-icono-social"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Canal de YouTube de NovaCasa"
              className="pie-red-item"
            >
              <svg
                className="pie-icono-social"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        {/* Columna Productos */}
        <div className="pie-pagina-col">
          <h4 className="pie-col-titulo">Productos</h4>
          <ul className="pie-enlaces-lista">
            <li>
              <Link to="/productos" className="pie-enlace">
                Herramientas
              </Link>
            </li>
            <li>
              <Link to="/productos" className="pie-enlace">
                Muebles
              </Link>
            </li>
            <li>
              <Link to="/productos" className="pie-enlace">
                Decoración
              </Link>
            </li>
            <li>
              <Link to="/productos" className="pie-enlace">
                Iluminación
              </Link>
            </li>
            <li>
              <Link to="/productos" className="pie-enlace">
                Baño y Cocina
              </Link>
            </li>
            <li>
              <Link to="/productos" className="pie-enlace pie-enlace-destacado">
                Ofertas
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna Información */}
        <div className="pie-pagina-col">
          <h4 className="pie-col-titulo">Información</h4>
          <ul className="pie-enlaces-lista">
            <li>
              <Link to="/" className="pie-enlace">
                Nosotros
              </Link>
            </li>
            <li>
              <Link to="/usuario?tab=configuracion" className="pie-enlace">
                Términos y condiciones
              </Link>
            </li>
            <li>
              <Link to="/usuario?tab=configuracion" className="pie-enlace">
                Política de privacidad
              </Link>
            </li>
            <li>
              <Link to="/usuario?tab=configuracion" className="pie-enlace">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link to="/usuario?tab=configuracion" className="pie-enlace">
                Garantías
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna Ayuda */}
        <div className="pie-pagina-col">
          <h4 className="pie-col-titulo">Ayuda</h4>
          <ul className="pie-enlaces-lista">
            <li>
              <Link to="/usuario?tab=direccion" className="pie-enlace">
                Envíos y entregas
              </Link>
            </li>
            <li>
              <Link to="/usuario?tab=pedidos" className="pie-enlace">
                Cambios y devoluciones
              </Link>
            </li>
            <li>
              <Link to="/carrito" className="pie-enlace">
                Métodos de pago
              </Link>
            </li>
            <li>
              <Link to="/ubicaciones" className="pie-enlace">
                Nuestras Sucursales
              </Link>
            </li>
            <li>
              <Link to="/usuario" className="pie-enlace">
                Contáctanos
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="pie-pagina-inferior">
        <div className="pie-inferior-izq">
          <p>© {new Date().getFullYear()} NovaCasa. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export default PiePagina;
