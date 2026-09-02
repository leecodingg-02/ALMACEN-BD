// Componente modal reutilizable para crear y editar
function Modal({ titulo, alCerrar, alGuardar, children }) {
  return (
    <div className="modal-fondo" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <div className="modal-caja">
        <div className="modal-encabezado">
          <h3>{titulo}</h3>
          <button className="modal-cerrar" onClick={alCerrar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
        <div className="modal-pie">
          <button className="btn-secundario" onClick={alCerrar}>Cancelar</button>
          <button className="btn-primario" onClick={alGuardar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de confirmación de suspensión (cambio de estado / pausar)
function ConfirmarSuspender({ nombreElemento, estadoActual = 'Activo', alCerrar, alConfirmar }) {
  const estaSuspendido = estadoActual === 'Suspendido' || estadoActual === 'Suspendida' || estadoActual === 'Inactivo' || estadoActual === 'Cancelada';
  const accionTexto = estaSuspendido ? 'Reactivar' : 'Suspender';
  
  return (
    <div className="modal-fondo" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <div className="modal-caja" style={{ maxWidth: 400 }}>
        <div className="eliminar-cuerpo">
          <div className="eliminar-icono" style={{ background: !estaSuspendido ? 'var(--naranja-fondo)' : 'var(--verde-fondo)', color: !estaSuspendido ? 'var(--naranja)' : 'var(--verde)' }}>
            {!estaSuspendido ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <h3>¿{accionTexto} registro?</h3>
          <p>
            {!estaSuspendido
              ? `El registro "${nombreElemento}" pasará a estado Suspendido e inactivo en las operaciones del sistema.`
              : `El registro "${nombreElemento}" volverá a estar activo y disponible en el sistema.`}
          </p>
        </div>
        <div className="modal-pie">
          <button className="btn-secundario" onClick={alCerrar}>Cancelar</button>
          <button
            className={!estaSuspendido ? 'btn-advertencia' : 'btn-exito'}
            onClick={alConfirmar}
          >
            {accionTexto}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal de confirmación de eliminación permanente (sólo para Categorías)
function ConfirmarEliminar({ nombreElemento, alCerrar, alConfirmar }) {
  return (
    <div className="modal-fondo" onClick={(e) => e.target === e.currentTarget && alCerrar()}>
      <div className="modal-caja" style={{ maxWidth: 400 }}>
        <div className="eliminar-cuerpo">
          <div className="eliminar-icono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </div>
          <h3>¿Eliminar categoría?</h3>
          <p>Esta acción eliminará <strong>"{nombreElemento}"</strong> permanentemente. No se puede deshacer.</p>
        </div>
        <div className="modal-pie">
          <button className="btn-secundario" onClick={alCerrar}>Cancelar</button>
          <button className="btn-peligro" onClick={alConfirmar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export { Modal, ConfirmarSuspender, ConfirmarEliminar };
