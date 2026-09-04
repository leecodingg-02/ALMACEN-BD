import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import logoImg from '../imagenes/logo.png';
import logoBlancoImg from '../imagenes/logo_blanco.png';

import CortinaMetalica from './CortinaMetalica';
import './admin.css';
import { cerrarSesion, obtenerUsuarioSesion } from '../servicios/usuario';
import BandejaSuperior from './BandejaSuperior';

const secciones = [
  {
    titulo: 'General',
    elementos: [
      { etiqueta: 'Inicio', ruta: '/admin', icono: IconoInicio, exacto: true },
    ],
  },
  {
    titulo: 'Gestión',
    elementos: [
      { etiqueta: 'Productos', ruta: '/admin/productos', icono: IconoCaja },
      { etiqueta: 'Categorías', ruta: '/admin/categorias', icono: IconoEtiqueta },
      { etiqueta: 'Marcas', ruta: '/admin/marcas', icono: IconoEstrella },
      { etiqueta: 'Inventario', ruta: '/admin/inventario', icono: IconoBodega },
    ],
  },
  {
    titulo: 'Ventas y Compras',
    elementos: [
      { etiqueta: 'Ventas', ruta: '/admin/ventas', icono: IconoTendencia },
      { etiqueta: 'Compras', ruta: '/admin/compras', icono: IconoCarrito },
    ],
  },
  {
    titulo: 'Configuración',
    elementos: [
      { etiqueta: 'Usuarios', ruta: '/admin/usuarios', icono: IconoUsuarios },
      { etiqueta: 'Roles', ruta: '/admin/roles', icono: IconoEscudo },
      { etiqueta: 'Sucursales', ruta: '/admin/sucursales', icono: IconoEdificio },
      { etiqueta: 'Ubicaciones', ruta: '/admin/ubicaciones', icono: IconoUbicacion },
    ],
  },
];

export default function PanelLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nombreAdmin, setNombreAdmin] = useState(() => {
    const sesion = obtenerUsuarioSesion();
    return sesion?.nombreCompleto || localStorage.getItem('almacen_admin_nombre') || 'Admin Almacén';
  });
  const [rolAdmin] = useState('Administrador');
  const [fotoAdmin, setFotoAdmin] = useState(() => {
    return localStorage.getItem('almacen_admin_foto') || null;
  });
  const [nombreTemporal, setNombreTemporal] = useState('');

  const [modoOscuro, setModoOscuro] = useState(() => {
    return localStorage.getItem('modo-oscuro') === 'true';
  });

  // Estado para la animación del martillo al hacer clic
  const [golpeandoRuta, setGolpeandoRuta] = useState(null);

  const handleGolpeMartillo = (ruta, esActiva) => {
    if (esActiva) return; // Si ya está activa, no hace el golpe
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
    localStorage.setItem('almacen_admin_nombre', nombreAdmin);
  }, [nombreAdmin]);

  useEffect(() => {
    if (fotoAdmin) {
      localStorage.setItem('almacen_admin_foto', fotoAdmin);
    }
  }, [fotoAdmin]);

  const toggleModoOscuro = () => {
    setModoOscuro((prev) => !prev);
  };

  const abrirEdicion = () => {
    setNombreTemporal(nombreAdmin);
    setEditandoPerfil(true);
  };

  const guardarPerfil = () => {
    if (nombreTemporal.trim()) {
      setNombreAdmin(nombreTemporal.trim());
      localStorage.setItem('almacen_admin_nombre', nombreTemporal.trim());
    }
    setEditandoPerfil(false);
  };

  const cancelarEdicion = () => {
    setEditandoPerfil(false);
  };

  const handleCerrarSesion = () => {
    cerrarSesion();
    localStorage.removeItem('almacen_admin_nombre');
    localStorage.removeItem('almacen_admin_foto');
    navigate('/inicio-sesion');
  };

  const cambiarFoto = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (ev) => {
        const resultado = ev.target.result;
        setFotoAdmin(resultado);
        localStorage.setItem('almacen_admin_foto', resultado);
      };
      lector.readAsDataURL(archivo);
    }
  };

  const inicialNombre = nombreAdmin.charAt(0).toUpperCase();

  return (
    <div className={`panel-raiz ${modoOscuro ? 'modo-oscuro' : ''}`}>
      {/* PUERTA ENROLLABLE METÁLICA AL CARGAR */}
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

        {/* BARRA LATERAL */}
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

          <nav className="barra-lat-nav">
            {secciones.map((seccion) => (
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

                    {/* MARTILLO: SOLO APARECE EN PESTAÑAS NO SELECCIONADAS (O DURANTE EL GOLPE) */}
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

                    {/* PUNTO INDICADOR: APARECE POST-GOLPE O EN HOVER SOBRE LA PESTAÑA ACTIVA */}
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
              <h3>Panel de Administración</h3>
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
                    {fotoAdmin ? (
                      <img src={fotoAdmin} alt="Foto de perfil" />
                    ) : (
                      <span className="perfil-avatar-inicial">{inicialNombre}</span>
                    )}
                  </div>
                  <div className="perfil-info">
                    <h4>{nombreAdmin}</h4>
                    <span>{rolAdmin}</span>
                  </div>
                  
                  {/* FLECHA ESTÉTICA REFINADA */}
                  <div className={`perfil-chevron ${perfilAbierto ? 'abierto' : ''}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* DROPDOWN DE PERFIL */}
                {perfilAbierto && (
                  <>
                    <div className="perfil-overlay" onClick={() => { setPerfilAbierto(false); setEditandoPerfil(false); }} />
                    <div className="perfil-dropdown">
                      <div className="perfil-dropdown-header">
                        <div className="perfil-dropdown-avatar" onClick={() => inputFotoRef.current?.click()}>
                          {fotoAdmin ? (
                            <img src={fotoAdmin} alt="Foto de perfil" />
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
                            <h4>{nombreAdmin}</h4>
                            <span>{rolAdmin}</span>
                          </div>
                        ) : (
                          <div className="perfil-dropdown-info">
                            <input
                              className="perfil-editar-nombre"
                              value={nombreTemporal}
                              onChange={(e) => setNombreTemporal(e.target.value)}
                              placeholder="Nombre del administrador"
                              autoFocus
                              onKeyDown={(e) => { if (e.key === 'Enter') guardarPerfil(); if (e.key === 'Escape') cancelarEdicion(); }}
                            />
                            <span>{rolAdmin}</span>
                          </div>
                        )}
                      </div>

                      <div className="perfil-dropdown-separador" />

                      {!editandoPerfil ? (
                        <div className="perfil-dropdown-opciones">
                          <button className="perfil-dropdown-btn" onClick={abrirEdicion}>
                            <IconoLapiz />
                            Editar perfil
                          </button>
                          <button className="perfil-dropdown-btn" onClick={() => inputFotoRef.current?.click()}>
                            <IconoCamara />
                            Cambiar foto
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
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* CONTENIDO DE PÁGINA CON ANIMACIÓN TRANSICIONAL */}
          <div className="panel-contenido-contenedor" key={location.pathname}>
            {/* LUZ DE NAVEGACIÓN PROGRESS BAR GOLDEN */}
            <div className="transicion-haz-superior" aria-hidden="true" />
            <div className="panel-contenido vista-transicion-animada">
              <Outlet context={{ nombreAdmin, fotoAdmin, rolAdmin }} />
            </div>
          </div>
        </main>
      </div>

    </div>
  );
}

/* ===== ICONOS LINEALES UNIFICADOS (LUCIDE STYLE) ===== */
function IconoInicio({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}
function IconoCaja({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}
function IconoEtiqueta({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>;
}
function IconoEstrella({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}
function IconoBodega({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12" /><path d="M6 14h12" /><rect x="8" y="18" width="8" height="4" /></svg>;
}
function IconoTendencia({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
}
function IconoCarrito({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>;
}
function IconoUsuarios({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
function IconoEscudo({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
function IconoEdificio({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="11" /><line x1="15" y1="22" x2="15" y2="11" /><line x1="9" y1="7" x2="9.01" y2="7" /><line x1="15" y1="7" x2="15.01" y2="7" /></svg>;
}
function IconoUbicacion({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
function IconoCorona({ className }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-8-4 8-6-7z" /><path d="M5 20h14" /></svg>;
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
        {/* Acero cromado de la cabeza del martillo */}
        <linearGradient id="aceroCabeza" x1="10" y1="4" x2="32" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#CBD5E1" />
          <stop offset="60%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Reflejo dorado / bisel metálico */}
        <linearGradient id="oroBisel" x1="14" y1="4" x2="32" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="45%" stopColor="#FFC107" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Mango de madera pulida */}
        <linearGradient id="maderaMango" x1="4" y1="32" x2="22" y2="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="35%" stopColor="#B45309" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Empuñadura de goma antideslizante */}
        <linearGradient id="gomaGrip" x1="2" y1="34" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#090D16" />
          <stop offset="50%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>

        {/* Sombra de relieve */}
        <filter id="sombraMartilloHD" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      <g filter="url(#sombraMartilloHD)">
        {/* 1. MANGO DE MADERA */}
        <path
          d="M7 29L20.5 15.5C21.3 14.7 22.7 14.7 23.5 15.5C24.3 16.3 24.3 17.7 23.5 18.5L10 32C9.2 32.8 7.8 32.8 7 32C6.2 31.2 6.2 29.8 7 29Z"
          fill="url(#maderaMango)"
          stroke="#451A03"
          strokeWidth="0.8"
        />

        {/* 2. EMPUÑADURA DE GOMA (GRIP EN LA BASE) */}
        <path
          d="M5.5 30.5L12.5 23.5C13.1 22.9 14.1 22.9 14.7 23.5L15.5 24.3C16.1 24.9 16.1 25.9 15.5 26.5L8.5 33.5C7.9 34.1 6.9 34.1 6.3 33.5L5.5 32.7C4.9 32.1 4.9 31.1 5.5 30.5Z"
          fill="url(#gomaGrip)"
          stroke="#0F172A"
          strokeWidth="0.8"
        />
        {/* Ranuras doradas de agarre */}
        <line x1="8" y1="29.5" x2="10" y2="31.5" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        <line x1="10" y1="27.5" x2="12" y2="29.5" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
        <line x1="12" y1="25.5" x2="14" y2="27.5" stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.9" />

        {/* 3. CUELLO METÁLICO DE ACOPLE */}
        <path
          d="M19 17L22 14L24 16L21 19Z"
          fill="url(#aceroCabeza)"
          stroke="#1E293B"
          strokeWidth="0.8"
        />

        {/* 4. CABEZA DE IMPACTO (CILINDRO METÁLICO DE GOLPEO) */}
        <path
          d="M21.5 14.5L27.5 8.5C28.2 7.8 29.5 8.2 30 9L30.5 9.5C31.3 10.3 31.3 11.5 30.5 12.3L24.5 18.3L21.5 14.5Z"
          fill="url(#aceroCabeza)"
          stroke="#0F172A"
          strokeWidth="0.9"
        />
        {/* Cara frontal plana de choque (Boca de golpeo) */}
        <path
          d="M28.5 7.5L31.5 10.5C31.9 10.9 31.9 11.5 31.5 11.9L30.5 12.9L27.5 9.9L28.5 8.9C28.9 8.5 28.9 7.9 28.5 7.5Z"
          fill="url(#oroBisel)"
          stroke="#B45309"
          strokeWidth="0.8"
        />

        {/* 5. UÑA / GARRA CURVA TRASERA PARA SACAR CLAVOS */}
        <path
          d="M20 12C17.5 6.5 12.5 5 7.5 6.5C11.5 8.5 14.5 12 15.5 16.5L20 12Z"
          fill="url(#aceroCabeza)"
          stroke="#0F172A"
          strokeWidth="0.9"
        />
        {/* Borde brillante de la garra */}
        <path
          d="M19.5 11.5C17.2 6.8 12.8 5.4 7.8 6.8C12 8.5 15.2 11.8 16 16"
          stroke="url(#oroBisel)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}


