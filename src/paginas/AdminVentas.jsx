import { useState } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';

const datosIniciales = [
  { id: 1, fecha: '2026-09-02', cliente: 'Juan Pérez', total: 289900, items: 2, estado: 'Completada', metodo: 'Tarjeta' },
  { id: 2, fecha: '2026-09-02', cliente: 'María López', total: 1250000, items: 1, estado: 'En Proceso', metodo: 'Efectivo' },
  { id: 3, fecha: '2026-09-01', cliente: 'Carlos Ruiz', total: 95000, items: 3, estado: 'Pendiente', metodo: 'Transferencia' },
  { id: 4, fecha: '2026-09-01', cliente: 'Ana García', total: 540000, items: 2, estado: 'Completada', metodo: 'Tarjeta' },
  { id: 5, fecha: '2026-08-31', cliente: 'Pedro Martínez', total: 189900, items: 1, estado: 'Suspendida', metodo: 'Efectivo' },
  { id: 6, fecha: '2026-08-31', cliente: 'Sofía Torres', total: 320000, items: 4, estado: 'Completada', metodo: 'Transferencia' },
];

const formularioVacio = { fecha: '', cliente: '', total: '', items: '', estado: 'Pendiente', metodo: 'Efectivo' };

export default function Ventas() {
  const [datos, setDatos] = useState(() => {
    try {
      const guardadas = localStorage.getItem('novacasa_ventas');
      return guardadas ? JSON.parse(guardadas) : datosIniciales;
    } catch {
      return datosIniciales;
    }
  });
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const guardarEnStorage = (nuevas) => {
    try {
      localStorage.setItem('novacasa_ventas', JSON.stringify(nuevas));
    } catch (e) {
      console.error(e);
    }
  };

  const filtrados = datos.filter(
    (v) =>
      v.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      v.estado.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(v.id).includes(busqueda)
  );

  const abrirCrear = () => {
    setFormulario({ ...formularioVacio, fecha: new Date().toISOString().split('T')[0] });
    setActual(null);
    setModal('crear');
  };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = () => {
    if (!formulario.cliente.trim()) return;
    let actualizadas;
    if (modal === 'crear') {
      actualizadas = [
        ...datos,
        { ...formulario, id: Date.now(), total: Number(formulario.total) || 0, items: Number(formulario.items) || 0 },
      ];
    } else {
      actualizadas = datos.map((v) =>
        v.id === actual.id
          ? { ...formulario, id: actual.id, total: Number(formulario.total) || 0, items: Number(formulario.items) || 0 }
          : v
      );
    }
    setDatos(actualizadas);
    guardarEnStorage(actualizadas);
    setModal(null);
  };

  const suspender = () => {
    const actualizadas = datos.map((v) => {
      if (v.id === actual.id) {
        const nuevoEstado = v.estado === 'Suspendida' ? (v.estadoAnterior || 'Pendiente') : 'Suspendida';
        return {
          ...v,
          estado: nuevoEstado,
          estadoAnterior: v.estado !== 'Suspendida' ? v.estado : v.estadoAnterior,
        };
      }
      return v;
    });
    setDatos(actualizadas);
    guardarEnStorage(actualizadas);
    setModal(null);
  };

  const insigniaEstado = {
    Completada: 'completado',
    'En Proceso': 'proceso',
    Pendiente: 'pendiente',
    Suspendida: 'cancelado',
    Cancelada: 'cancelado',
  };

  const fondoMetodo = { Tarjeta: '#3b82f620', Efectivo: '#22c55e20', Transferencia: '#a855f720' };
  const colorMetodo = { Tarjeta: '#3b82f6', Efectivo: '#22c55e', Transferencia: '#a855f7' };

  const totalCompletado = datos
    .filter((d) => d.estado === 'Completada')
    .reduce((suma, v) => suma + v.total, 0);

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Ventas</h2>
          <p>
            {datos.length} ventas registradas (Gestión de suspensión) · Total completado:{' '}
            <strong style={{ color: 'var(--texto-principal)' }}>
              ${totalCompletado.toLocaleString('es-CO')}
            </strong>
          </p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Venta
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por cliente, estado, ID..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Ítems</th>
              <th>Total</th>
              <th>Método de Pago</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="estado-vacio">
                    <IconoVentasSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin ventas</h3>
                    <p>Registra la primera venta</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 700, color: 'var(--texto-principal)' }}>
                    #{String(v.id).slice(-4).padStart(4, '0')}
                  </td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{v.fecha}</td>
                  <td style={{ fontWeight: 700 }}>{v.cliente}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{v.items} ítem(s)</td>
                  <td style={{ fontWeight: 800 }}>${Number(v.total).toLocaleString('es-CO')}</td>
                  <td>
                    <span className={`badge-metodo ${v.metodo.toLowerCase()}`}>
                      {v.metodo}
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-estado ${insigniaEstado[v.estado] || 'proceso'}`}>{v.estado}</span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(v)} title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        className={`btn-accion ${v.estado === 'Suspendida' ? 'reactivar' : 'suspender'}`}
                        onClick={() => abrirSuspender(v)}
                        title={v.estado === 'Suspendida' ? 'Reactivar venta' : 'Suspender/Anular venta'}
                      >
                        {v.estado === 'Suspendida' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="crud-paginacion">
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} ventas</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva Venta' : 'Editar Venta'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Fecha</label>
              <input type="date" value={formulario.fecha} onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })} />
            </div>
            <div className="grupo-campo">
              <label>Estado</label>
              <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
                <option>Pendiente</option>
                <option>En Proceso</option>
                <option>Completada</option>
                <option>Suspendida</option>
              </select>
            </div>
          </div>
          <div className="grupo-campo">
            <label>Cliente *</label>
            <input value={formulario.cliente} onChange={(e) => setFormulario({ ...formulario, cliente: e.target.value })} placeholder="Nombre del cliente" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Total (COP)</label>
              <input type="number" value={formulario.total} onChange={(e) => setFormulario({ ...formulario, total: e.target.value })} placeholder="0" />
            </div>
            <div className="grupo-campo">
              <label>Cantidad de Ítems</label>
              <input type="number" value={formulario.items} onChange={(e) => setFormulario({ ...formulario, items: e.target.value })} placeholder="1" min="1" />
            </div>
          </div>
          <div className="grupo-campo">
            <label>Método de Pago</label>
            <select value={formulario.metodo} onChange={(e) => setFormulario({ ...formulario, metodo: e.target.value })}>
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Transferencia</option>
            </select>
          </div>
        </Modal>
      )}

      {modal === 'suspender' && (
        <ConfirmarSuspender
          nombreElemento={`Venta #${String(actual?.id).slice(-4)} (${actual?.cliente})`}
          estadoActual={actual?.estado}
          alCerrar={() => setModal(null)}
          alConfirmar={suspender}
        />
      )}
    </>
  );
}

function IconoVentasSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
}
