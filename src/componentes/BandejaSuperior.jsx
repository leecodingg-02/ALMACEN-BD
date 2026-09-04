import { useState } from 'react';

/*
 * BandejaSuperior
 * ----------------------------------------------------------------------------
 * Botones de "Notificaciones" y "Mensajes" del topbar, con panel desplegable
 * totalmente funcional: abrir/cerrar, clic fuera para cerrar, marcar como
 * leída, marcar todas como leídas, eliminar elemento y contador dinámico.
 * El estado se persiste en localStorage para conservarse entre navegaciones.
 */

const CLAVE_NOTIF = 'novacasa_bandeja_notificaciones';
const CLAVE_MENSAJES = 'novacasa_bandeja_mensajes';

const NOTIFICACIONES_SEMILLA = [
  { id: 1, tipo: 'inventario', titulo: 'Stock bajo en inventario', detalle: 'El producto «Martillo de carpintero 20 oz» quedó por debajo del mínimo.', tiempo: 'Hace 5 min', leida: false },
  { id: 2, tipo: 'pedido', titulo: 'Pedido pendiente de confirmación', detalle: 'Existe una orden de compra esperando revisión en el panel.', tiempo: 'Hace 1 h', leida: false },
  { id: 3, tipo: 'pago', titulo: 'Factura por revisar', detalle: 'Se registró una factura de proveedor en estado «Pendiente».', tiempo: 'Hace 3 h', leida: false },
  { id: 4, tipo: 'sistema', titulo: 'Bienvenido al panel', detalle: 'Tu sesión se inició correctamente y está activa.', tiempo: 'Hoy', leida: true },
];

const MENSAJES_SEMILLA = [
  { id: 1, remitente: 'Soporte NovaCasa', detalle: 'Hola, ¿necesitas ayuda gestionando tu catálogo?', tiempo: 'Hace 10 min', leida: false },
  { id: 2, remitente: 'Bodega Central', detalle: 'Confirmamos la recepción del inventario. Todo en orden.', tiempo: 'Hace 2 h', leida: false },
  { id: 3, remitente: 'Contabilidad', detalle: 'Recordatorio: cierre de facturación este viernes.', tiempo: 'Ayer', leida: false },
  { id: 4, remitente: 'Transportadora TCC', detalle: 'Tu despacho #TCC-982341 llegará en aproximadamente 2 días.', tiempo: 'Hace 2 días', leida: true },
  { id: 5, remitente: 'Mercadeo', detalle: 'Nueva campaña de iluminación disponible para tu catálogo.', tiempo: 'Hace 3 días', leida: false },
];

function cargarBandeja(clave, semilla) {
  try {
    const bruto = localStorage.getItem(clave);
    if (bruto) {
      const datos = JSON.parse(bruto);
      if (Array.isArray(datos) && datos.length) return datos;
    }
  } catch (e) { /* ignorar datos corruptos */ }
  return semilla;
}

function guardarBandeja(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch (e) { /* almacenamiento no disponible */ }
}

function IconoCampana() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconoMensaje() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconoEliminar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function IconoTipo({ tipo }) {
  const p = {
    width: 16, height: 16, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: '2',
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  if (tipo === 'inventario') {
    return (
      <svg {...p}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M21 7v5h-5" />
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    );
  }
  if (tipo === 'pedido') {
    return (
      <svg {...p}>
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    );
  }
  if (tipo === 'pago') {
    return (
      <svg {...p}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }
  return (
    <svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
export default function BandejaSuperior() {
  const [panel, setPanel] = useState(null); // 'notif' | 'mensajes' | null
  const [notificaciones, setNotificaciones] = useState(() =>
    cargarBandeja(CLAVE_NOTIF, NOTIFICACIONES_SEMILLA),
  );
  const [mensajes, setMensajes] = useState(() =>
    cargarBandeja(CLAVE_MENSAJES, MENSAJES_SEMILLA),
  );

  const noLeidas = notificaciones.filter((n) => !n.leida).length;
  const mensajesNoLeidos = mensajes.filter((m) => !m.leida).length;

  const alternar = (vista) => setPanel((prev) => (prev === vista ? null : vista));

  const marcarTodasLeidas = () => {
    setNotificaciones((prev) => {
      const nuevo = prev.map((n) => ({ ...n, leida: true }));
      guardarBandeja(CLAVE_NOTIF, nuevo);
      return nuevo;
    });
  };

  const marcarNotifLeida = (id) => {
    setNotificaciones((prev) => {
      const nuevo = prev.map((n) => (n.id === id ? { ...n, leida: true } : n));
      guardarBandeja(CLAVE_NOTIF, nuevo);
      return nuevo;
    });
  };

  const eliminarNotificacion = (id) => {
    setNotificaciones((prev) => {
      const nuevo = prev.filter((n) => n.id !== id);
      guardarBandeja(CLAVE_NOTIF, nuevo);
      return nuevo;
    });
  };

  const marcarTodosMensajes = () => {
    setMensajes((prev) => {
      const nuevo = prev.map((m) => ({ ...m, leida: true }));
      guardarBandeja(CLAVE_MENSAJES, nuevo);
      return nuevo;
    });
  };

  const marcarMensajeLeido = (id) => {
    setMensajes((prev) => {
      const nuevo = prev.map((m) => (m.id === id ? { ...m, leida: true } : m));
      guardarBandeja(CLAVE_MENSAJES, nuevo);
      return nuevo;
    });
  };

  const eliminarMensaje = (id) => {
    setMensajes((prev) => {
      const nuevo = prev.filter((m) => m.id !== id);
      guardarBandeja(CLAVE_MENSAJES, nuevo);
      return nuevo;
    });
  };
return (
    <>
      {/* ===== NOTIFICACIONES ===== */}
      <div className="bandeja-contenedor">
        <button
          className={`barra-sup-icono-btn ${panel === 'notif' ? 'bandeja-activo' : ''}`}
          title="Notificaciones"
          aria-label="Ver notificaciones"
          onClick={() => alternar('notif')}
        >
          <IconoCampana />
          {noLeidas > 0 && <span className="barra-sup-badge">{noLeidas}</span>}
        </button>

        {panel === 'notif' && (
          <>
            <div className="perfil-overlay" onClick={() => setPanel(null)} />
            <div className="bandeja-dropdown">
              <div className="bandeja-header">
                <h4>Notificaciones</h4>
                <span className="bandeja-contador">{noLeidas} sin leer</span>
                {noLeidas > 0 && (
                  <button className="bandeja-accion" onClick={marcarTodasLeidas}>
                    Marcar todas
                  </button>
                )}
              </div>

              {notificaciones.length === 0 ? (
                <div className="bandeja-vacio">
                  <IconoCampana />
                  <p>No tienes notificaciones pendientes.</p>
                </div>
              ) : (
                <ul className="bandeja-lista">
                  {notificaciones.map((n) => (
                    <li key={n.id}>
                      <div
                        className={`bandeja-item ${n.leida ? '' : 'sin-leer'}`}
                        role="button"
                        tabIndex={0}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => marcarNotifLeida(n.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') marcarNotifLeida(n.id);
                        }}
                      >
                        <span className={`bandeja-item-icono tipo-${n.tipo}`}>
                          <IconoTipo tipo={n.tipo} />
                        </span>
                        <span className="bandeja-item-texto">
                          <strong>{n.titulo}</strong>
                          <span>{n.detalle}</span>
                          <small>{n.tiempo}</small>
                        </span>
                        {!n.leida && <span className="bandeja-punto" />}
                        <button
                          className="bandeja-eliminar"
                          title="Eliminar"
                          aria-label="Eliminar notificación"
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarNotificacion(n.id);
                          }}
                        >
                          <IconoEliminar />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
{/* ===== MENSAJES ===== */}
      <div className="bandeja-contenedor">
        <button
          className={`barra-sup-icono-btn ${panel === 'mensajes' ? 'bandeja-activo' : ''}`}
          title="Mensajes"
          aria-label="Ver mensajes"
          onClick={() => alternar('mensajes')}
        >
          <IconoMensaje />
          {mensajesNoLeidos > 0 && <span className="barra-sup-badge">{mensajesNoLeidos}</span>}
        </button>

        {panel === 'mensajes' && (
          <>
            <div className="perfil-overlay" onClick={() => setPanel(null)} />
            <div className="bandeja-dropdown">
              <div className="bandeja-header">
                <h4>Mensajes</h4>
                <span className="bandeja-contador">{mensajesNoLeidos} sin leer</span>
                {mensajesNoLeidos > 0 && (
                  <button className="bandeja-accion" onClick={marcarTodosMensajes}>
                    Marcar todas
                  </button>
                )}
              </div>

              {mensajes.length === 0 ? (
                <div className="bandeja-vacio">
                  <IconoMensaje />
                  <p>No tienes mensajes nuevos.</p>
                </div>
              ) : (
                <ul className="bandeja-lista">
                  {mensajes.map((m) => (
                    <li key={m.id}>
                      <div
                        className={`bandeja-item ${m.leida ? '' : 'sin-leer'}`}
                        role="button"
                        tabIndex={0}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => marcarMensajeLeido(m.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') marcarMensajeLeido(m.id);
                        }}
                      >
                        <span className="bandeja-item-avatar">{m.remitente.charAt(0)}</span>
                        <span className="bandeja-item-texto">
                          <strong>{m.remitente}</strong>
                          <span>{m.detalle}</span>
                          <small>{m.tiempo}</small>
                        </span>
                        {!m.leida && <span className="bandeja-punto" />}
                        <button
                          className="bandeja-eliminar"
                          title="Eliminar"
                          aria-label="Eliminar mensaje"
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarMensaje(m.id);
                          }}
                        >
                          <IconoEliminar />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}