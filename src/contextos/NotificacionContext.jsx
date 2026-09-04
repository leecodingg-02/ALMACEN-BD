import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../componentes/NotificacionToast.css';

const NotificacionContext = createContext(null);

export const NotificacionProvider = ({ children }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const contadorRef = useRef(0);

  const removerNotificacion = useCallback((id) => {
    setNotificaciones((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const mostrarNotificacion = useCallback(({
    tipo = 'carrito', // 'carrito' | 'favorito' | 'favorito-removido' | 'info' | 'exito'
    titulo = '',
    mensaje = '',
    imagen = '',
    enlace = '',
    textoEnlace = 'Ver más',
    icono = '',
    duracion = 3800
  }) => {
    const id = ++contadorRef.current;
    const nueva = {
      id,
      tipo,
      titulo,
      mensaje,
      imagen,
      enlace,
      textoEnlace,
      icono,
      duracion
    };

    setNotificaciones((prev) => [nueva, ...prev.slice(0, 2)]);

    setTimeout(() => {
      removerNotificacion(id);
    }, duracion);
  }, [removerNotificacion]);

  return (
    <NotificacionContext.Provider value={{ mostrarNotificacion, removerNotificacion }}>
      {children}
      <div className="notificaciones-toast-container" aria-live="polite">
        {notificaciones.map((n) => (
          <div
            key={n.id}
            className={`notificacion-toast notificacion-tipo-${n.tipo}`}
            role="alert"
          >
            <div
              className="notificacion-barra-progreso"
              style={{ animationDuration: `${n.duracion}ms` }}
            />
            <button
              type="button"
              className="notificacion-btn-cerrar"
              onClick={() => removerNotificacion(n.id)}
              aria-label="Cerrar notificación"
            >
              &times;
            </button>

            <div className="notificacion-contenido">
              {n.imagen ? (
                <div className="notificacion-img-wrapper">
                  <img src={n.imagen} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              ) : (
                <div className={`notificacion-icono notificacion-icono-${n.tipo}`}>
                  {n.icono || (n.tipo === 'carrito' ? '🛒' : n.tipo === 'favorito' ? '❤️' : '🔔')}
                </div>
              )}

              <div className="notificacion-textos">
                <span className="notificacion-tag">
                  {n.tipo === 'carrito' ? 'CARRITO' : n.tipo.startsWith('favorito') ? 'FAVORITOS' : 'SISTEMA'}
                </span>
                <h4 className="notificacion-titulo">{n.titulo}</h4>
                {n.mensaje && <p className="notificacion-mensaje">{n.mensaje}</p>}

                {n.enlace && (
                  <Link
                    to={n.enlace}
                    className="notificacion-link-accion"
                    onClick={() => removerNotificacion(n.id)}
                  >
                    {n.textoEnlace} &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </NotificacionContext.Provider>
  );
};

export const useNotificacion = () => {
  const context = useContext(NotificacionContext);
  if (!context) {
    throw new Error('useNotificacion debe ser utilizado dentro de un NotificacionProvider');
  }
  return context;
};
