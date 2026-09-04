import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../imagenes/logo.png';
import logoBlancoImg from '../imagenes/logo_blanco.png';

import CortinaMetalica from './CortinaMetalica';
import './admin.css';
import { cerrarSesionProveedor, obtenerProveedorSesion } from '../servicios/proveedor';
import BandejaSuperior from './BandejaSuperior';

const seccionesProveedor = [
  {
    titulo: 'Principal',
    elementos: [
      { etiqueta: 'Resumen Proveedor', ruta: '/proveedor', icono: IconoInicio, exacto: true },
    ],
  },
  {
    titulo: 'Catálogo y Suministro',
    elementos: [
      { etiqueta: 'Mis Productos', ruta: '/proveedor/productos', icono: IconoCaja },
      { etiqueta: 'Órdenes de Compra', ruta: '/proveedor/pedidos', icono: IconoPedido },
      { etiqueta: 'Despachos y Envíos', ruta: '/proveedor/despachos', icono: IconoCamion },
    ],
  },
  {
    titulo: 'Finanzas y Cuenta',
    elementos: [
      { etiqueta: 'Facturas y Pagos', ruta: '/proveedor/facturas', icono: IconoFactura },
      { etiqueta: 'Perfil de Empresa', ruta: '/proveedor/empresa', icono: IconoEmpresa },
    ],
  },
];

export default function ProveedorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nombreProveedor, setNombreProveedor] = useState(() => {
    const sesion = obtenerProveedorSesion();
    return sesion?.razon_social || localStorage.getItem('novacasa_proveedor_nombre') || 'Distribuidora Central S.A.S.';
  });
  const [contactoProveedor, setContactoProveedor] = useState('Proveedor Oficial');
  const [fotoProveedor, setFotoProveedor] = useState(() => {
    return localStorage.getItem('novacasa_proveedor_foto') || null;
  });
  const [nombreTemporal, setNombreTemporal] = useState('');

  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem('modo-oscuro') === 'true';
  });

  // Estado para la animación del martillo al hacer clic
  const [golpeandoRuta, setGolpeandoRuta] = useState(null);

  const handleGolpeMartillo = (ruta, esActiva) => {
    if (esActiva) return;
    setGolpeandoRuta(ruta);
    setTimeout(() => {
      setGolpeandoRuta(null);
    }, 420);
  };

  const inputFotoRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('modo-oscuro', modoOscuro);
  }, [modoOscuro]);

  useEffect(() => {
    localStorage.setItem('novacasa_proveedor_nombre', nombreProveedor);
  }, [nombreProveedor]);

  useEffect(() => {
    if (fotoProveedor) {
      localStorage.setItem('novacasa_proveedor_foto', fotoProveedor);
    }
  }, [fotoProveedor]);

  const toggleModoOscuro = () => {
    setModoOscuro((prev) => !prev);
  };

  const abrirEdicion = () => {
    setNombreTemporal(nombreProveedor);
    setEditandoPerfil(true);
  };

  const guardarPerfil = () => {
    if (nombreTemporal.trim()) {
      setNombreProveedor(nombreTemporal.trim());
      localStorage.setItem('novacasa_proveedor_nombre', nombreTemporal.trim());
    }
    setEditandoPerfil(false);
  };

  const cancelarEdicion = () => {
    setEditandoPerfil(false);
  };

  const handleCerrarSesion = () => {
    cerrarSesionProveedor();
    localStorage.removeItem('novacasa_proveedor_nombre');
    localStorage.removeItem('novacasa_proveedor_foto');
    navigate('/inicio-sesion');
  };

  const cambiarFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (ev) => {
        const resultado = ev.target.result;
        setFotoProveedor(resultado);
        localStorage.setItem('novacasa_proveedor_foto', resultado);
      };
      lector.readAsDataURL(archivo);
    }
  };

  const inicialNombre = nombreProveedor.charAt(0).toUpperCase();

  return (
    <div className={`panel-raiz ${modoOscuro ? 'modo-oscuro' : ''}`}>
      {/* CORTINA METÁLICA AL CARGAR */}
      <CortinaMetalica />

      {/* AURA FLOTANTE AMBIENTAL PERIMETRAL */}
      <div className="aura-flotante-contenedor" aria-hidden="true">
        <div className="aura-haz haz-arriba" />
        <div className="aura-haz haz-derecha" />
        <div className="aura-haz haz-abajo" />
        <div className="aura-haz haz-izquierda" />
        <div className="aura-orb orb-1" />
        <div className="aura-orb orb-2" />
        <div className="aura-orb orb-3" />
      </div>

      <div className="panel-diseno">
        {/* BARRA LATERAL DEL PROVEEDOR */}
        <aside className="barra-lateral">
          <Link to="/" className="barra-lat-logo" title="Ir a la tienda">
            <img 
              src={logoImg} 
              alt="Logo Almacén BD" 
              className="sidebar-logo-img logo-modo-claro" 
            />
            <img 
              src={logoBlancoImg} 
              alt="Logo Almacén BD" 
              className="sidebar-logo-img logo-modo-oscuro" 
            />
          </Link>

          {/* INSIGNIA DE PORTAL PROVEEDOR */}
          <div
            style={{
              margin: '0 12px 14px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.18), rgba(255, 193, 7, 0.05))',
              border: '1px solid rgba(255, 193, 7, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                boxShadow: '0 0 8px #10B981',
              }}
            />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--texto-principal)',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Portal Proveedores
            </span>
          </div>

          <nav className="barra-lat-nav">
            {seccionesProveedor.map((seccion) => (
              <div key={seccion.titulo} className="seccion-nav-grupo">
                <p className="barra-lat-seccion-titulo">{seccion.titulo}</p>
                {seccion.elementos.map((elem) => (
                  <NavLink
                    key={elem.ruta}
                    to={elem.ruta}
                    end={elem.exacto}
                    onClick={() => {
                      const esActiva = elem.exacto
                        ? location.pathname === elem.ruta
                        : location.pathname.startsWith(elem.ruta);
                      handleGolpeMartillo(elem.ruta, esActiva);
                    }}
                    className={({ isActive }) =>
                      `barra-lat-elemento ${isActive ? 'activo' : ''} ${golpeandoRuta === elem.ruta ? 'golpeando-martillo' : ''}`
                    }
                  >
                    <div className="barra-lat-elemento-brillo" aria-hidden="true" />
                    <elem.icono className="barra-lat-elemento-icono" />
                    <span className="barra-lat-elemento-texto">{elem.etiqueta}</span>

                    {/* MARTILLO: SOLO APARECE EN PESTAÑAS NO SELECCIONADAS */}
                    <div className="contenedor-martillo-interactivo" aria-hidden="true">
                      <IconoMartillo className="icono-martillo-svg" />
                      {golpeandoRuta === elem.ruta && (
                        <div className="chispas-impacto-martillo">
                          <span className="chispa c-1" />
                          <span className="chispa c-2" />
                          <span className="chispa c-3" />
                          <span className="chispa c-4" />
                        </div>
                      )}
                    </div>

                    {/* PUNTO INDICADOR FIJO */}
                    <span className="barra-lat-punto-activo" aria-hidden="true" />
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* CONTENIDO PRINCIPAL */}
        <main className="panel-principal">
          {/* BARRA SUPERIOR */}
          <div className="barra-superior">
            <div className="barra-sup-titulo">
              <h3>Portal de Proveedores</h3>
            </div>

            <div className="barra-sup-derecha">
              {/* BOTON MODO OSCURO */}
              <button
                className="barra-sup-icono-btn btn-tema-toggle"
                title={modoOscuro ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                onClick={toggleModoOscuro}
                aria-label="Alternar modo oscuro"
              >
                {modoOscuro ? <IconoSol /> : <IconoLuna />}
              </button>

              <BandejaSuperior />

              {/* PERFIL CON DROPDOWN */}
              <div className="perfil-contenedor">
                <div
                  className={`perfil-usuario-top ${perfilAbierto ? 'activo' : ''}`}
                  onClick={() => setPerfilAbierto(!perfilAbierto)}
                >
                  <div className="perfil-avatar">
                    {fotoProveedor ? (
                      <img src={fotoProveedor} alt="Foto de proveedor" />
                    ) : (
                      <span className="perfil-avatar-inicial">{inicialNombre}</span>
                    )}
                  </div>
                  <div className="perfil-info">
                    <h4>{nombreProveedor}</h4>
                    <span>{contactoProveedor}</span>
                  </div>
                  
                  <div className={`perfil-chevron ${perfilAbierto ? 'abierto' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {perfilAbierto && (
                  <>
                    <div className="perfil-overlay" onClick={() => { setPerfilAbierto(false); setEditandoPerfil(false); }} />
                    <div className="perfil-dropdown">
                      <div className="perfil-dropdown-header">
                        <div className="perfil-dropdown-avatar" onClick={() => inputFotoRef.current?.click()}>
                          {fotoProveedor ? (
                            <img src={fotoProveedor} alt="Foto de proveedor" />
                          ) : (
                            <span className="perfil-avatar-inicial grande">{inicialNombre}</span>
                          )}
                          <div className="perfil-avatar-cambiar">
                            <IconoCamara />
                          </div>
                          <input
                            ref={inputFotoRef}
                            type="file"
                            accept="image/*"
                            onChange={cambiarFoto}
                            style={{ display: 'none' }}
                          />
                        </div>
                        {!editandoPerfil ? (
                          <div className="perfil-dropdown-info">
                            <h4>{nombreProveedor}</h4>
                            <span>{contactoProveedor}</span>
                          </div>
                        ) : (
                          <div className="perfil-dropdown-info">
                            <input
                              className="perfil-editar-nombre"
                              value={nombreTemporal}
                              onChange={(e) => setNombreTemporal(e.target.value)}
                              placeholder="Nombre de la empresa"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') guardarPerfil(); if (e.key === 'Escape') cancelarEdicion(); }}
                            />
                            <span>{contactoProveedor}</span>
                          </div>
                        )}
                      </div>

                      <div className="perfil-dropdown-separador" />

                      {!editandoPerfil ? (
                        <div className="perfil-dropdown-opciones">
                          <button className="perfil-dropdown-btn" onClick={abrirEdicion}>
                            <IconoLapiz />
                            Editar nombre comercial
                          </button>
                          <button className="perfil-dropdown-btn" onClick={() => inputFotoRef.current?.click()}>
                            <IconoCamara />
                            Cambiar logo / foto
                          </button>
                        </div>
                      ) : (
                        <div className="perfil-dropdown-opciones">
                          <button className="perfil-dropdown-btn guardar" onClick={guardarPerfil}>
                            <IconoCheck />
                            Guardar cambios
                          </button>
                          <button className="perfil-dropdown-btn cancelar" onClick={cancelarEdicion}>
                            <IconoCerrar />
                            Cancelar
                          </button>
                        </div>
                      )}

                      <div className="perfil-dropdown-separador" />

                      <div className="perfil-dropdown-opciones">
                        <button className="perfil-dropdown-btn salir" onClick={handleCerrarSesion}>
                            <IconoSalir />
                            Cerrar sesión
                          </button>
                          <Link to="/" className="perfil-dropdown-btn" style={{ textDecoration: 'none' }}>
                          <IconoSalir />
                          Volver a la tienda
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CONTENIDO DE PÁGINA CON ANIMACIÓN TRANSICIONAL */}
          <div className="panel-contenido-contenedor" key={location.pathname}>
            <div className="transicion-haz-superior" aria-hidden="true" />
            <div className="panel-contenido vista-transicion-animada">
              <Outlet context={{ nombreProveedor, fotoProveedor, contactoProveedor }} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ===== ICONOS DEL PANEL DE PROVEEDOR ===== */
function IconoInicio({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function IconoCaja({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}
function IconoPedido({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>;
}
function IconoCamion({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>;
}
function IconoFactura({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><line x1="16" y1="8" x2="8" y2="8" /><line x1="16" y1="12" x2="8" y2="12" /><line x1="10" y1="16" x2="8" y2="16" /></svg>;
}
function IconoEmpresa({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="11" /><line x1="15" y1="22" x2="15" y2="11" /><line x1="9" y1="7" x2="9.01" y2="7" /><line x1="15" y1="7" x2="15.01" y2="7" /></svg>;
}
function IconoCamara() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>;
}
function IconoLapiz() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function IconoCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconoCerrar() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
function IconoSalir() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
function IconoLuna() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>;
}
function IconoSol() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>;
}

function IconoMartillo({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="aceroCabezaProv" x1="10" y1="4" x2="32" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#CBD5E1" />
          <stop offset="60%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        <linearGradient id="oroBiselProv" x1="14" y1="4" x2="32" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="45%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <linearGradient id="maderaMangoProv" x1="4" y1="32" x2="22" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="35%" stopColor="#B45309" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        <linearGradient id="gomaGripProv" x1="2" y1="34" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#090D16" />
          <stop offset="50%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>

        <filter id="sombraMartilloProv" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#sombraMartilloProv)">
        {/* Mango */}
        <path
          d="M7 29L20.5 15.5C21.3 14.7 22.7 14.7 23.5 15.5C24.3 16.3 24.3 17.7 23.5 18.5L10 32C9.2 32.8 7.8 32.8 7 32C6.2 31.2 6.2 29.8 7 29Z"
          fill="url(#maderaMangoProv)"
          stroke="#451A03"
          strokeWidth="0.8"
        />
        {/* Grip */}
        <path
          d="M5.5 30.5L12.5 23.5C13.1 22.9 14.1 22.9 14.7 23.5L15.5 24.3C16.1 24.9 16.1 25.9 15.5 26.5L8.5 33.5C7.9 34.1 6.9 34.1 6.3 33.5L5.5 32.7C4.9 32.1 4.9 31.1 5.5 30.5Z"
          fill="url(#gomaGripProv)"
          stroke="#0F172A"
          strokeWidth="0.8"
        />
        <line x1="8" y1="29.5" x2="10" y2="31.5" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        <line x1="10" y1="27.5" x2="12" y2="29.5" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        <line x1="12" y1="25.5" x2="14" y2="27.5" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.9" />

        {/* Cuello */}
        <path d="M19 17L22 14L24 16L21 19Z" fill="url(#aceroCabezaProv)" stroke="#1E293B" strokeWidth="0.8" />

        {/* Cabeza cilíndrica */}
        <path
          d="M21.5 14.5L27.5 8.5C28.2 7.8 29.5 8.2 30 9L30.5 9.5C31.3 10.3 31.3 11.5 30.5 12.3L24.5 18.3L21.5 14.5Z"
          fill="url(#aceroCabezaProv)"
          stroke="#0F172A"
          strokeWidth="0.9"
        />
        {/* Cara frontal */}
        <path
          d="M28.5 7.5L31.5 10.5C31.9 10.9 31.9 11.5 31.5 11.9L30.5 12.9L27.5 9.9L28.5 8.9C28.9 8.5 28.9 7.9 28.5 7.5Z"
          fill="url(#oroBiselProv)"
          stroke="#B45309"
          strokeWidth="0.8"
        />

        {/* Garra */}
        <path
          d="M20 12C17.5 6.5 12.5 5 7.5 6.5C11.5 8.5 14.5 12 15.5 16.5L20 12Z"
          fill="url(#aceroCabezaProv)"
          stroke="#0F172A"
          strokeWidth="0.9"
        />
        <path
          d="M19.5 11.5C17.2 6.8 12.8 5.4 7.8 6.8C12 8.5 15.2 11.8 16 16"
          stroke="url(#oroBiselProv)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
