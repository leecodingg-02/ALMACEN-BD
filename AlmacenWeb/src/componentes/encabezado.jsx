import { Link, useNavigate } from "react-router-dom";

function Encabezado() {
  return (
    <header className='encabezado-contenedor'>
      <div className='encabezado-barra-sup'>
        <div className='contenedor-barra-sup-izq'>
          <svg
            className='icono-barra-sup-izq'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke-width='1.5'
            stroke='currentColor'
            class='size-6'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              d='M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
            />
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              d='M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z'
            />
          </svg>

          <p className='barra-sup-texto'> Envios a toda Colombia !</p>

          <svg
            className='icono-barra-sup-izq'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke-width='1.5'
            stroke='currentColor'
            class='size-6'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              d='M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z'
            />
          </svg>

          <p className='barra-sup-texto-izq'>
            {" "}
            Atencion al cliente: 690 324 343
          </p>
        </div>

        <div className='contenedor-barra-sup-der'>
          <svg
            className='icono-barra-sup-der'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            stroke-width='1.5'
            stroke='currentColor'
            class='size-6'
          >
            <path
              stroke-linecap='round'
              stroke-linejoin='round'
              d='M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z'
            />
          </svg>

          <Link to='ubicacion' className='btn-ubicacion'>
            <p className='barra-sup-texto-izq'> Ubicacion </p>
          </Link>

          <Link to='ayuda' className='btn-ayuda'>
            <p className='bara-sup-texto-ayu'> Ayuda </p>
          </Link>

          <p className='barra-sup-texto-reg/ini'>
            <Link to='Inicio-sesion' className='iniciar-sesion'>
              Iniciar Sesión
            </Link>
            /
            <Link to='regisrar' className='registrar'>
              Registrarse
            </Link>
          </p>
        </div>
      </div>

      <div className='encabezado-logo'>
        <Link to='/'>
          <img src='./src/imagenes/logo.png' alt='Logo del almacén' />
        </Link>
      </div>

      <div className='busqueda-contenedor'>
        <input
          type='text'
          className='busqueda'
          placeholder='¿Qué quieres buscar?'
        />

        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          stroke-width='1.5'
          stroke='currentColor'
          class='size-6'
        >
          <path
            stroke-linecap='round'
            stroke-linejoin='round'
            d='m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
          />
        </svg>
      </div>
    </header>
  );
}

export default Encabezado;
