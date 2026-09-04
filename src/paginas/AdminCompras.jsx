import { useState, useEffect } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';
import { api } from '../servicios/api';

const formularioVacio = { fecha: '', proveedor: '', total: '', items: '', estado: 'Pendiente', factura: '' };

export default function Compras() {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  // Cargar compras directamente desde MySQL
  useEffect(() => {
    api.get('/compras').then((res) => {
      if (Array.isArray(res)) setDatos(res);
    });
  }, []);

  const guardarEnStorage = (nuevas) => {
    try {
      localStorage.setItem('novacasa_compras', JSON.stringify(nuevas));
    } catch (e) {
      console.error(e);
    }
  };

  const filtrados = datos.filter(
    (c) =>
      c.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.factura.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.estado.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => {
    setFormulario({ ...formularioVacio, fecha: new Date().toISOString().split('T')[0] });
    setActual(null);
    setModal('crear');
  };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = async () => {
    if (!formulario.proveedor.trim()) return;
    const total = Number(formulario.total) || 0;
    const items = Number(formulario.items) || 0;
    const payload = { ...formulario, total, items };

    if (modal === 'crear') {
      try {
        const nueva = await api.post('/compras', payload);
        const actualizadas = [...datos, { ...payload, id: nueva.id || Date.now(), factura: nueva.factura || payload.factura }];
        setDatos(actualizadas);
        guardarEnStorage(actualizadas);
      } catch {
        const actualizadas = [...datos, { ...payload, id: Date.now() }];
        setDatos(actualizadas);
        guardarEnStorage(actualizadas);
      }
    } else {
      try {
        await api.put(`/compras/${actual.id}`, payload);
      } catch (e) {
        console.warn('Fallback local para editar compra:', e);
      }
      const actualizadas = datos.map((c) =>
        c.id === actual.id ? { ...payload, id: actual.id } : c
      );
      setDatos(actualizadas);
      guardarEnStorage(actualizadas);
    }
    setModal(null);
  };

  const suspender = () => {
    const actualizadas = datos.map((c) => {
      if (c.id === actual.id) {
        const nuevoEstado = c.estado === 'Cancelada' ? (c.estadoAnterior || 'Pendiente') : 'Cancelada';
        return {
          ...c,
          estado: nuevoEstado,
          estadoAnterior: c.estado !== 'Cancelada' ? c.estado : c.estadoAnterior,
        };
      }
      return c;
    });
    setDatos(actualizadas);
    guardarEnStorage(actualizadas);
    setModal(null);
  };

  const insigniaEstado = {
    Recibida: 'completado',
    Aprobada: 'proceso',
    Pendiente: 'pendiente',
    Cancelada: 'cancelado',
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Compras</h2>
          <p>Gestión de órdenes de compra a proveedores (Gestión de suspensión)</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Compra
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por proveedor, factura, estado..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>No. Factura</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Ítems</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="estado-vacio">
                    <IconoCarritoSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin compras</h3>
                    <p>Registra la primera orden de compra</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: 'var(--texto-principal)' }}>{c.factura}</td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{c.fecha}</td>
                  <td style={{ fontWeight: 700 }}>{c.proveedor}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{c.items} uds.</td>
                  <td style={{ fontWeight: 800 }}>${Number(c.total).toLocaleString('es-CO')}</td>
                  <td>
                    <span className={`insignia-estado ${insigniaEstado[c.estado] || 'proceso'}`}>{c.estado}</span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(c)} title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        className={`btn-accion ${c.estado === 'Cancelada' ? 'reactivar' : 'suspender'}`}
                        onClick={() => abrirSuspender(c)}
                        title={c.estado === 'Cancelada' ? 'Reactivar compra' : 'Suspender/Anular compra'}
                      >
                        {c.estado === 'Cancelada' ? (
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
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} compras</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva Compra' : 'Editar Compra'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>No. Factura</label>
              <input value={formulario.factura} onChange={(e) => setFormulario({ ...formulario, factura: e.target.value })} placeholder="FC-0025" />
            </div>
            <div className="grupo-campo">
              <label>Fecha</label>
              <input type="date" value={formulario.fecha} onChange={(e) => setFormulario({ ...formulario, fecha: e.target.value })} />
            </div>
          </div>
          <div className="grupo-campo">
            <label>Proveedor *</label>
            <input value={formulario.proveedor} onChange={(e) => setFormulario({ ...formulario, proveedor: e.target.value })} placeholder="Nombre del proveedor" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Total (COP)</label>
              <input type="number" value={formulario.total} onChange={(e) => setFormulario({ ...formulario, total: e.target.value })} placeholder="0" />
            </div>
            <div className="grupo-campo">
              <label>Cantidad de Ítems</label>
              <input type="number" value={formulario.items} onChange={(e) => setFormulario({ ...formulario, items: e.target.value })} placeholder="0" min="1" />
            </div>
          </div>
          <div className="grupo-campo">
            <label>Estado</label>
            <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
              <option>Pendiente</option>
              <option>Aprobada</option>
              <option>Recibida</option>
              <option>Cancelada</option>
            </select>
          </div>
        </Modal>
      )}

      {modal === 'suspender' && (
        <ConfirmarSuspender
          nombreElemento={`Orden de Compra ${actual?.factura} (${actual?.proveedor})`}
          estadoActual={actual?.estado}
          alCerrar={() => setModal(null)}
          alConfirmar={suspender}
        />
      )}
    </>
  );
}

function IconoCarritoSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>;
}
