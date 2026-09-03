import { useState } from "react";
import { Link } from "react-router-dom";
import "./Ubicaciones.css";

const SUCURSALES_DATA = [
  {
    id: "bogota",
    nombre: "NovaCasa Bogotá - Calle 80",
    ciudad: "Bogotá, D.C.",
    direccion: "Cra. 68G #79-56, Av. Calle 80",
    referencia: "Frente a Estación de TransMilenio Metrópolis",
    telefono: "(601) 690-3243",
    celular: "+57 300 890 1234",
    horarioSemana: "Lunes a Sábado: 7:00 AM - 9:00 PM",
    horarioFinSemana: "Domingos y Festivos: 8:00 AM - 8:00 PM",
    estado: "Abierto ahora",
    servicios: [
      "Centro de Corte y Dimensionado",
      "Drive-Thru de Materiales",
      "Alquiler de Herramientas",
      "Parqueadero Gratuito (300 cupos)",
      "Recogida en Tienda (Click & Collect 1h)",
      "Pet Friendly",
    ],
    coordenadas: "4.6865,-74.0831",
    imagen:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    mapaEmbedUrl:
      "https://maps.google.com/maps?q=Calle+80+Cra+68G+Bogota&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
  {
    id: "medellin",
    nombre: "NovaCasa Medellín - Industriales",
    ciudad: "Medellín, Antioquia",
    direccion: "Av. El Poblado #29-105",
    referencia: "Cerca a la estación Industriales del Metro",
    telefono: "(604) 444-8899",
    celular: "+57 315 765 4321",
    horarioSemana: "Lunes a Sábado: 7:30 AM - 9:00 PM",
    horarioFinSemana: "Domingos y Festivos: 8:30 AM - 7:30 PM",
    estado: "Abierto ahora",
    servicios: [
      "Centro de Pinturas y Colorística",
      "Asesoría de Arquitectura e Interiorismo",
      "Parqueadero Gratuito Cubierto",
      "Zona de Cafetería y Comidas",
      "Mantenimiento de Herramientas",
    ],
    coordenadas: "6.2294,-75.5721",
    imagen:
      "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80",
    mapaEmbedUrl:
      "https://maps.google.com/maps?q=Av+El+Poblado+29-105+Medellin&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
  {
    id: "cali",
    nombre: "NovaCasa Cali - Pasoancho",
    ciudad: "Cali, Valle del Cauca",
    direccion: "Calle 13 #100-25",
    referencia: "Frente a Centro Comercial Unicentro",
    telefono: "(602) 333-5500",
    celular: "+57 318 654 9870",
    horarioSemana: "Lunes a Sábado: 7:00 AM - 8:30 PM",
    horarioFinSemana: "Domingos y Festivos: 8:00 AM - 7:00 PM",
    estado: "Abierto ahora",
    servicios: [
      "Patio de Constructores e Insumos",
      "Servicio de Instalación a Domicilio",
      "Asesoría de Proyectos de Baño y Cocina",
      "Caja Preferencial y Facturación Electrónica",
      "Estación de Carga Eléctrica",
    ],
    coordenadas: "3.3758,-76.5367",
    imagen:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    mapaEmbedUrl:
      "https://maps.google.com/maps?q=Calle+13+100-25+Cali&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
  {
    id: "barranquilla",
    nombre: "NovaCasa Barranquilla - Buenavista",
    ciudad: "Barranquilla, Atlántico",
    direccion: "Calle 98 #52-115",
    referencia: "Sector Buenavista, cerca a la Vía 40",
    telefono: "(605) 385-4422",
    celular: "+57 311 234 5678",
    horarioSemana: "Lunes a Sábado: 8:00 AM - 9:00 PM",
    horarioFinSemana: "Domingos y Festivos: 9:00 AM - 8:00 PM",
    estado: "Abierto ahora",
    servicios: [
      "Soluciones de Climatización y Ventilación",
      "Centro de Iluminación LED y Domótica",
      "Venta Mayorista e Institucional",
      "Parqueadero Gratuito con Vigilancia",
      "Despachos Express 24h",
    ],
    coordenadas: "11.0118,-74.8219",
    imagen:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    mapaEmbedUrl:
      "https://maps.google.com/maps?q=Calle+98+52-115+Barranquilla&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
];

function Ubicaciones() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCiudad, setFiltroCiudad] = useState("Todas");
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(
    SUCURSALES_DATA[0],
  );
  const [copiadoId, setCopiadoId] = useState(null);

  const ciudades = ["Todas", "Bogotá", "Medellín", "Cali", "Barranquilla"];

  const sucursalesFiltradas = SUCURSALES_DATA.filter((sucursal) => {
    const coincideCiudad =
      filtroCiudad === "Todas" || sucursal.ciudad.includes(filtroCiudad);
    const coincideBusqueda =
      sucursal.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      sucursal.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
      sucursal.direccion.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCiudad && coincideBusqueda;
  });

  const copiarDireccion = (direccion, id) => {
    navigator.clipboard.writeText(direccion);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 3000);
  };

  return (
    <main className='ubicaciones-pagina'>
      {/* Hero Disruptivo estilo Inicio */}
      <section className='ubicaciones-hero-disruptivo'>
        <div className='hero-disruptivo-contenido'>
          <div className='hero-kicker'>
            <span className='badge-kicker'>Puntos de Atención</span>
            <span className='badge-kicker-destacado'>Puntos Físicos</span>
          </div>

          <h1 className='hero-disruptivo-titulo'>
            Nuestras <span>Sucursales</span>
          </h1>

          <p className='hero-disruptivo-subtitulo'>
            Encuentra la tienda NovaCasa más cercana. Ven y descubre
            herramientas profesionales, acabados para el hogar y asesoría
            personalizada en directo.
          </p>

          {/* Controles de Búsqueda y Filtro en Hero */}
          <div className='hero-disruptivo-controles'>
            <div className='caja-busqueda-disruptiva'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='2'
                stroke='currentColor'
                className='icono-lupa'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
                />
              </svg>
              <input
                type='text'
                className='input-disruptivo'
                placeholder='Buscar por ciudad, dirección o nombre...'
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <button
                  type='button'
                  className='btn-limpiar-disruptivo'
                  onClick={() => setBusqueda("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className='filtros-ciudad-disruptivos'>
              {ciudades.map((ciudad) => (
                <button
                  key={ciudad}
                  type='button'
                  className={`btn-ciudad-pill ${
                    filtroCiudad === ciudad ? "activo" : ""
                  }`}
                  onClick={() => setFiltroCiudad(ciudad)}
                >
                  {ciudad}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className='hero-disruptivo-decoracion'>
          <div className='circulo-decorativo'></div>
          <div className='poligono-decorativo'></div>
        </div>
      </section>

      {/* Contenedor de Sucursales y Mapa */}
      <section className='ubicaciones-contenedor-cuerpo'>
        {/* Listado de Sucursales */}
        <div className='ubicaciones-lista'>
          <div className='ubicaciones-contador'>
            <h2>
              Tiendas encontradas (<span>{sucursalesFiltradas.length}</span>)
            </h2>
          </div>

          {sucursalesFiltradas.length === 0 ? (
            <div className='ubicaciones-sin-resultados'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth='1.5'
                stroke='currentColor'
                className='icono-vacio'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z'
                />
              </svg>
              <h3>No se encontraron sucursales</h3>
              <p>
                Intenta buscar con otra palabra clave o selecciona otra ciudad.
              </p>
              <button
                type='button'
                className='btn-primario-inicio'
                onClick={() => {
                  setBusqueda("");
                  setFiltroCiudad("Todas");
                }}
              >
                Ver todas las sucursales
              </button>
            </div>
          ) : (
            sucursalesFiltradas.map((sucursal) => {
              const esSeleccionada = sucursalSeleccionada.id === sucursal.id;

              return (
                <article
                  key={sucursal.id}
                  className={`tarjeta-sucursal ${
                    esSeleccionada ? "seleccionada" : ""
                  }`}
                  onClick={() => setSucursalSeleccionada(sucursal)}
                >
                  <div className='tarjeta-sucursal-cabecera'>
                    <div className='tarjeta-sucursal-info'>
                      <span className='badge-ciudad-inicio'>
                        {sucursal.ciudad}
                      </span>
                      <h3 className='sucursal-nombre'>{sucursal.nombre}</h3>
                    </div>

                    {/* Botón "Abierto ahora" estilizado según Inicio.css / proyecto */}
                    <span
                      className='btn-abierto-ahora'
                      title='Atención presencial disponible'
                    >
                      <span className='punto-verde-inicio'></span>
                      {sucursal.estado}
                    </span>
                  </div>

                  <div className='tarjeta-sucursal-detalles'>
                    {/* Dirección */}
                    <div className='item-detalle'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.8'
                        stroke='currentColor'
                        className='icono-detalle'
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
                      <div>
                        <strong>{sucursal.direccion}</strong>
                        <span className='txt-referencia'>
                          {sucursal.referencia}
                        </span>
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div className='item-detalle'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.8'
                        stroke='currentColor'
                        className='icono-detalle'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 0 0-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z'
                        />
                      </svg>
                      <div>
                        <strong>PBX: {sucursal.telefono}</strong>
                        <span className='txt-secundario'>
                          Móvil: {sucursal.celular}
                        </span>
                      </div>
                    </div>

                    {/* Horarios */}
                    <div className='item-detalle'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.8'
                        stroke='currentColor'
                        className='icono-detalle'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                        />
                      </svg>
                      <div>
                        <span>{sucursal.horarioSemana}</span>
                        <span className='txt-secundario'>
                          {sucursal.horarioFinSemana}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Servicios */}
                  <div className='tarjeta-sucursal-servicios'>
                    <span className='servicios-titulo'>
                      Servicios disponibles:
                    </span>
                    <div className='servicios-tags'>
                      {sucursal.servicios.map((servicio, idx) => (
                        <span key={idx} className='tag-servicio'>
                          ✓ {servicio}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className='tarjeta-sucursal-acciones'>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        sucursal.nombre + " " + sucursal.direccion,
                      )}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='boton boton-primario btn-sucursal-accion'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='2'
                        stroke='currentColor'
                        className='icono-btn'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z'
                        />
                      </svg>
                      Cómo llegar
                    </a>

                    <a
                      href={`tel:${sucursal.telefono.replace(/[^0-9]/g, "")}`}
                      className='boton boton-contorno btn-sucursal-accion'
                      onClick={(e) => e.stopPropagation()}
                    >
                      Llamar
                    </a>

                    <button
                      type='button'
                      className='boton boton-contorno btn-sucursal-accion'
                      onClick={(e) => {
                        e.stopPropagation();
                        copiarDireccion(sucursal.direccion, sucursal.id);
                      }}
                    >
                      {copiadoId === sucursal.id
                        ? "¡Copiada!"
                        : "Copiar dirección"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Panel del Mapa alineado con límite máximo exacto al nivel de "Tiendas encontradas (4)" */}
        <aside className='ubicaciones-mapa-panel'>
          <div className='mapa-tarjeta-fija'>
            <div className='mapa-cabecera'>
              <span className='mapa-badge'>Tienda Seleccionada</span>
              <h3>{sucursalSeleccionada.nombre}</h3>
              <p className='mapa-direccion-txt'>
                {sucursalSeleccionada.direccion} — {sucursalSeleccionada.ciudad}
              </p>
            </div>

            {/* Iframe Google Maps */}
            <div className='mapa-iframe-contenedor'>
              <iframe
                title={`Mapa de ${sucursalSeleccionada.nombre}`}
                src={sucursalSeleccionada.mapaEmbedUrl}
                width='100%'
                height='310'
                style={{ border: 0 }}
                allowFullScreen=''
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              ></iframe>
            </div>

            {/* Banner promocional */}
            <div className='mapa-banner-ayuda'>
              <div className='banner-icono-casa'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.8'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-4.486c-.053-.615-.3-1.22-.647-1.742'
                  />
                </svg>
              </div>
              <div className='banner-texto'>
                <h4>¿Planeas un proyecto para tu hogar?</h4>
                <p>
                  Acércate a esta sucursal y solicita asesoría en nuestro módulo
                  de diseño y herramientas.
                </p>
                <Link to='/productos' className='btn-banner-catalogo'>
                  Ver catálogo de productos &rarr;
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default Ubicaciones;
