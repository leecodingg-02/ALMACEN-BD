import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../componentes/AvisoSesionToast.css';

const AvisoSesionContext = createContext(null);

export const AvisoSesionProvider = ({ children }) => {
  const [aviso, setAviso] = useState({
    visible: false,
    accion: '',
    modulo: ''
  });

  const temporizadorRef = useRef(null);

  const cerrarAviso = useCallback(() => {
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
      temporizadorRef.current = null;
    }
    setAviso((prev) => ({ ...prev, visible: false }));
  }, []);

  const mostrarAvisoSesion = useCallback((accion, modulo = 'general') => {
    if (temporizadorRef.current) {
      clearTimeout(temporizadorRef.current);
    }

    setAviso({
      visible: true,
      accion: accion || 'continuar con esta acción',
      modulo: modulo
    });

    // Auto-cierre tras 6.5 segundos
    temporizadorRef.current = setTimeout(() => {
      setAviso((prev) => ({ ...prev, visible: false }));
    }, 6500);
  }, []);

  return (
    <AvisoSesionContext.Provider value={{ mostrarAvisoSesion, cerrarAviso }}>
      {children}
      {aviso.visible && (
        <div className="aviso-sesion-toast" role="alert" aria-live="assertive">
          <div className="aviso-sesion-barra-progreso" />
          <button 
            type="button" 
            className="aviso-sesion-btn-cerrar" 
            onClick={cerrarAviso} 
            title="Cerrar notificación"
            aria-label="Cerrar notificación"
          >
            &times;
          </button>

          <div className="aviso-sesion-contenido">
            <div className="aviso-sesion-icono-caja">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="2" 
                stroke="currentColor" 
                className="aviso-sesion-icono-svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <div className="aviso-sesion-textos">
              <span className="aviso-sesion-etiqueta">ACCESO REQUERIDO</span>
              <h4 className="aviso-sesion-titulo">
                Necesitas iniciar sesión para {aviso.accion}
              </h4>
              <p className="aviso-sesion-descripcion">
                Ingresa a tu cuenta para asegurar tus compras, gestionar favoritos y recibir seguimiento de pedidos.
              </p>

              <div className="aviso-sesion-acciones">
                <Link 
                  to="/inicio-sesion" 
                  className="aviso-sesion-btn aviso-sesion-btn-login"
                  onClick={cerrarAviso}
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/crear-cuenta" 
                  className="aviso-sesion-btn aviso-sesion-btn-registro"
                  onClick={cerrarAviso}
                >
                  Crear Cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AvisoSesionContext.Provider>
  );
};

export const useAvisoSesion = () => {
  const context = useContext(AvisoSesionContext);
  if (!context) {
    throw new Error('useAvisoSesion debe ser utilizado dentro de un AvisoSesionProvider');
  }
  return context;
};
