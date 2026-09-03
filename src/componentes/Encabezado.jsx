import { Link, NavLink } from "react-router-dom";
import "./Encabezado.css";
import { useState } from "react";

function Encabezado({
  cantidadCarrito,
  usuario,
  cantidadFavoritos = 0,
  onAlternarSesion,
}) {
  const [desplegableAbierto, setDesplegableAbierto] = useState(false);

  return (
    <header className='encabezado-contenedor'>
      <div className='encabezado-barra-sup'>
        <div className='contenedor-barra-supizq'>
          <div className='item-barrasup-izq'>
            <svg
              className='icono-barra-supizq'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z'
              />
            </svg>

            <p className='barra-supi-txt'> Envios a toda Colombia !</p>
          </div>

          <div className='item-barrasup-izq'>
            <svg
              className='icono-barra-supizq'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z'
              />
            </svg>

            <p className='barra-supi-txt'>Atencion al cliente: 690 324 343</p>
          </div>
        </div>

        <div className='contenedor-barra-supder'>
          <div className='item-barrasup-der'>
            <Link to='/ubicaciones' className='botones-barra-sup'>
              <svg
                className='icono-barra-supder'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z'
                />
              </svg>

              <p className='barra-sup-texto-izq'> Ubicaciones </p>
            </Link>
          </div>

          <Link to='/usuario?tab=configuracion' className='botones-barra-sup'>
            <p className='bara-sup-texto-ayu'> Ayuda </p>
          </Link>

          <div className='barra-sup-regini'>
            {usuario ? (
              <>
                <Link to='/usuario' className='botones-barra-sup'>
                  <svg
                    className='icono-barra-supder'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth='1.5'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
                    />
                  </svg>
                  <span>{usuario.nombre}</span>
                </Link>
                <span className='separador-sesion'>/</span>
                <button
                  className='btn-texto-sesion'
                  onClick={onAlternarSesion}
                  title='Cerrar sesión'
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <button
                  className='btn-texto-sesion'
                  onClick={onAlternarSesion}
                  title='Iniciar Sesión de prueba'
                >
                  Iniciar Sesión
                </button>
                <span className='separador-sesion'>/</span>
                <Link to='/usuario' className='botones-barra-sup'>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className='contenedor-encabezado-pri'>
        <div className='encabezado-logo'>
          <Link to='/'>
            <img src='/src/imagenes/logo.png' alt='Logo del almacén' />
          </Link>
        </div>

        <div className='busqueda-contenedor'>
          <input
            type='text'
            className='busqueda'
            placeholder='¿Qué quieres buscar?'
          />
          <button className='buscar-btn'>
            <svg
              className='icono-pri'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
              />
            </svg>
          </button>
        </div>

        <div className='encabezado-botones'>
          <NavLink to='/' className='navegacion'>
            {" "}
            Inicio{" "}
          </NavLink>

          <div className='btn-desplegable'>
            <button
              className={`btn-productos${desplegableAbierto ? " activo" : ""}`}
              onClick={() => setDesplegableAbierto(!desplegableAbierto)}
            >
              Categorias
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='size-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m19.5 8.25-7.5 7.5-7.5-7.5'
                />
              </svg>
            </button>

            <div
              className={`btn-desplegable-conte${desplegableAbierto ? " mostrar" : ""}`}
            >
              <NavLink
                to='/productos'
                onClick={() => setDesplegableAbierto(false)}
              >
                Herramientas
              </NavLink>

              <NavLink
                to='/productos'
                onClick={() => setDesplegableAbierto(false)}
              >
                Muebles
              </NavLink>

              <NavLink
                to='/productos'
                onClick={() => setDesplegableAbierto(false)}
              >
                Decoracion
              </NavLink>

              <NavLink
                to='/productos'
                onClick={() => setDesplegableAbierto(false)}
              >
                Iluminacion
              </NavLink>
            </div>
          </div>

          <NavLink to='/productos' className='navegacion'>
            {" "}
            Ofertas
          </NavLink>

          <NavLink to='/productos' className='navegacion'>
            {" "}
            Productos{" "}
          </NavLink>

          <NavLink to='/' className='navegacion'>
            {" "}
            Nosotros{" "}
          </NavLink>

          {/* Enlace de Favoritos conectado a la pestaña de usuario registrado */}
          <Link
            to={usuario ? "/usuario?tab=favoritos" : "/usuario"}
            className='enlace-favoritos'
            title={
              usuario
                ? "Ver mis productos favoritos"
                : "Inicia sesión para ver favoritos"
            }
          >
            {usuario && cantidadFavoritos > 0 && (
              <span className='contador-carrito contador-favoritos'>
                {cantidadFavoritos}
              </span>
            )}
            <svg
              className='icono-pri'
              xmlns='http://www.w3.org/2000/svg'
              fill={cantidadFavoritos > 0 ? "#ffc107" : "none"}
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z'
              />
            </svg>
          </Link>

          <Link to='/carrito'>
            {/* El contador permanece visible para mostrar tambien el estado inicial. */}
            <span className='contador-carrito'>{cantidadCarrito}</span>
            <svg
              className='icono-pri'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z'
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Encabezado;
