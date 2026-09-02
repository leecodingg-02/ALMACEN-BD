import { useState, useEffect, useCallback } from 'react';
import './GuiaInteractiva.css';

const PASOS_GUIA = [
  {
    id: 'sidebar',
    selector: '.barra-lateral',
    titulo: 'Navegación Modular',
    icono: '🧭',
    descripcion: 'Accede rápidamente a todos los módulos: Gestión de Productos, Categorías, Marcas, Inventario, Ventas, Compras y Sucursales.',
    etiquetaCursor: 'Explorando menú...',
    posicionTooltip: 'right',
  },
  {
    id: 'tema',
    selector: '.btn-tema-toggle',
    titulo: 'Modo Cálido & Oscuro',
    icono: '🌓',
    descripcion: 'Alterna entre el modo claro con tonos cálidos descansados para la vista y el modo oscuro integral con intercambio dinámico de logos.',
    etiquetaCursor: 'Cambio de tema',
    posicionTooltip: 'bottom',
  },
  {
    id: 'perfil',
    selector: '.perfil-usuario-top',
    titulo: 'Perfil de Administrador',
    icono: '👤',
    descripcion: 'Gestiona tu información: edita tu nombre de administrador, cambia tu fotografía de perfil o cierra sesión cuando lo requieras.',
    etiquetaCursor: 'Perfil y cuenta',
    posicionTooltip: 'bottom-left',
  },
  {
    id: 'contenido',
    selector: '.panel-contenido',
    titulo: 'Área de Trabajo y Datos',
    icono: '📊',
    descripcion: 'Aquí interactúas con las tablas CRUD, realizas búsquedas en tiempo real, filtros avanzados y visualizas estadísticas actualizadas.',
    etiquetaCursor: 'Panel activo',
    posicionTooltip: 'center',
  },
];

export default function GuiaInteractiva({ abierta, alCerrar }) {
  const [pasoActual, setPasoActual] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [posicionCursor, setPosicionCursor] = useState({ top: 100, left: 100 });
  const [posicionTooltip, setPosicionTooltip] = useState({ top: 100, left: 100 });

  const paso = PASOS_GUIA[pasoActual];

  const actualizarPosiciones = useCallback(() => {
    if (!abierta) return;
    const elemento = document.querySelector(paso.selector);

    if (elemento) {
      const rect = elemento.getBoundingClientRect();
      const padding = 8;

      const spot = {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      };

      setSpotlightRect(spot);

      // Posición del cursor animado (centrado en el elemento con leve offset)
      setPosicionCursor({
        top: Math.min(window.innerHeight - 50, spot.top + Math.min(spot.height / 2, 40)),
        left: Math.min(window.innerWidth - 60, spot.left + Math.min(spot.width / 2, 80)),
      });

      // Cálculo de posición del Tooltip inteligente
      const tooltipAncho = 340;
      const tooltipAlto = 220;
      let topT = 100;
      let leftT = 100;

      if (paso.posicionTooltip === 'right') {
        leftT = spot.left + spot.width + 20;
        topT = Math.max(20, spot.top + 10);
        if (leftT + tooltipAncho > window.innerWidth) {
          leftT = window.innerWidth - tooltipAncho - 20;
          topT = spot.top + spot.height + 20;
        }
      } else if (paso.posicionTooltip === 'bottom') {
        topT = spot.top + spot.height + 16;
        leftT = Math.max(20, spot.left - tooltipAncho / 2 + spot.width / 2);
        if (leftT + tooltipAncho > window.innerWidth) {
          leftT = window.innerWidth - tooltipAncho - 20;
        }
      } else if (paso.posicionTooltip === 'bottom-left') {
        topT = spot.top + spot.height + 16;
        leftT = Math.max(20, spot.left + spot.width - tooltipAncho);
      } else {
        // center / default
        topT = Math.max(80, window.innerHeight / 2 - tooltipAlto / 2);
        leftT = Math.max(20, window.innerWidth / 2 - tooltipAncho / 2);
      }

      // Asegurar que no se desborde la pantalla
      topT = Math.max(16, Math.min(window.innerHeight - tooltipAlto - 20, topT));
      leftT = Math.max(16, Math.min(window.innerWidth - tooltipAncho - 20, leftT));

      setPosicionTooltip({ top: topT, left: leftT });
    } else {
      // Fallback si no encuentra el elemento
      setSpotlightRect({
        top: window.innerHeight / 3,
        left: window.innerWidth / 3,
        width: 300,
        height: 150,
      });
      setPosicionCursor({ top: window.innerHeight / 2, left: window.innerWidth / 2 });
      setPosicionTooltip({ top: window.innerHeight / 2 + 30, left: window.innerWidth / 2 - 170 });
    }
  }, [abierta, paso]);

  useEffect(() => {
    actualizarPosiciones();
    window.addEventListener('resize', actualizarPosiciones);
    window.addEventListener('scroll', actualizarPosiciones, true);
    return () => {
      window.removeEventListener('resize', actualizarPosiciones);
      window.removeEventListener('scroll', actualizarPosiciones, true);
    };
  }, [actualizarPosiciones]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!abierta) return;
      if (e.key === 'Escape') alCerrar();
      if (e.key === 'ArrowRight' && pasoActual < PASOS_GUIA.length - 1) setPasoActual((p) => p + 1);
      if (e.key === 'ArrowLeft' && pasoActual > 0) setPasoActual((p) => p - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [abierta, pasoActual, alCerrar]);

  if (!abierta) return null;

  const handleSiguiente = () => {
    if (pasoActual < PASOS_GUIA.length - 1) {
      setPasoActual((prev) => prev + 1);
    } else {
      alCerrar();
    }
  };

  const handleAnterior = () => {
    if (pasoActual > 0) {
      setPasoActual((prev) => prev - 1);
    }
  };

  return (
    <div className="guia-overlay" role="dialog" aria-modal="true" aria-label="Guía rápida del panel">
      {/* Telón de fondo */}
      <div className="guia-backdrop" onClick={alCerrar} />

      {/* Recuadro de foco (Spotlight) */}
      {spotlightRect && (
        <div
          className="guia-spotlight"
          style={{
            top: `${spotlightRect.top}px`,
            left: `${spotlightRect.left}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
          }}
        >
          <div className="guia-spotlight-pulse" />
        </div>
      )}

      {/* Cursor virtual animado */}
      <div
        className="guia-cursor-virtual"
        style={{
          top: `${posicionCursor.top}px`,
          left: `${posicionCursor.left}px`,
        }}
      >
        <div className="guia-cursor-ripple" />
        <svg className="guia-cursor-svg" viewBox="0 0 24 24">
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" />
        </svg>
        <div className="guia-cursor-etiqueta">
          <span>✨</span>
          <span>{paso.etiquetaCursor}</span>
        </div>
      </div>

      {/* Tarjeta explicativa Tooltip */}
      <div
        className="guia-tooltip"
        style={{
          top: `${posicionTooltip.top}px`,
          left: `${posicionTooltip.left}px`,
        }}
      >
        <div className="guia-tooltip-cabecera">
          <span className="guia-paso-badge">
            <span>Paso {pasoActual + 1} de {PASOS_GUIA.length}</span>
          </span>
          <button className="guia-btn-cerrar" onClick={alCerrar} title="Cerrar guía (Esc)">
            ✕
          </button>
        </div>

        <div className="guia-tooltip-titulo">
          <span className="guia-tooltip-icono">{paso.icono}</span>
          <span>{paso.titulo}</span>
        </div>

        <p className="guia-tooltip-descripcion">{paso.descripcion}</p>

        <div className="guia-tooltip-pie">
          <div className="guia-progreso-dots">
            {PASOS_GUIA.map((_, index) => (
              <div
                key={index}
                className={`guia-dot ${index === pasoActual ? 'activo' : ''}`}
                onClick={() => setPasoActual(index)}
                title={`Ir al paso ${index + 1}`}
              />
            ))}
          </div>

          <div className="guia-botones-accion">
            {pasoActual > 0 && (
              <button className="guia-btn-nav guia-btn-anterior" onClick={handleAnterior}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="15 18 9 12 15 6" /></svg>
                Anterior
              </button>
            )}

            {pasoActual < PASOS_GUIA.length - 1 ? (
              <button className="guia-btn-nav guia-btn-siguiente" onClick={handleSiguiente}>
                Siguiente
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            ) : (
              <button className="guia-btn-nav guia-btn-finalizar" onClick={handleSiguiente}>
                ¡Entendido!
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
