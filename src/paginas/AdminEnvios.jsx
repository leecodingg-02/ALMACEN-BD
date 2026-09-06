import { useState, useEffect } from 'react';
import { Modal } from '../componentes/AdminModals';
import { api } from '../servicios/api';

const ESTADOS_ENVIO = ['Preparando', 'En Transito', 'Entregado', 'Devuelto', 'Cancelado'];

const formularioVacio = {
  id_venta: '',
  transportadora: '',
  numero_guia: '',
  fecha_estimada: '',
  costo_envio: '',
  cantidad_bultos: '1',
  estado: 'Preparando',
  observacion: '',
};

const formatearFecha = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return fecha;
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const colorEstado = (estado) => {
  switch (estado) {
    case 'Entregado': return 'completado';
    case 'En Transito': return 'pendiente';
    case 'Cancelado': return 'cancelado';
    case 'Devuelto': return 'cancelado';
    default: return 'pendiente';
  }
};

export default function Envios() {
  const [datos, setDatos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(false);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [cargando, setCargando] = useState(true);

  const cargarEnvios = () => {
    api.get('/envios', []).then((res) => {
      setDatos(Array.isArray(res) ? res : []);
      setCargando(false);
    });
  };

  useEffect(() => {
    cargarEnvios();
  }, []);

  const filtrados = datos.filter((e) =>
    (e.orden || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.cliente || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.transportadora || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (e.guia || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirEditar = (elem) => {
    setFormulario({
      id_venta: elem.id_venta || '',
      transportadora: elem.transportadora || '',
      numero_guia: elem.guia || '',
      fecha_estimada: elem.fecha_estimada ? String(elem.fecha_estimada).slice(0, 10) : '',
      costo_envio: elem.costo_envio ?? '',
      cantidad_bultos: elem.cantidad_bultos ?? '1',
      estado: elem.estado || 'Preparando',
      observacion: elem.observacion || '',
    });
    setActual(elem);
    setModal(true);
  };

  const guardar = async () => {
    if (!actual) return;
    const payload = {
      transportadora: formulario.transportadora || null,
      numero_guia: formulario.numero_guia || null,
      fecha_estimada: formulario.fecha_estimada || null,
      costo_envio: Number(formulario.costo_envio) || 0,
      cantidad_bultos: Number(formulario.cantidad_bultos) || 1,
      estado: formulario.estado,
      observacion: formulario.observacion || null,
    };
    try {
      await api.put(`/envios/${actual.id}`, payload);
    } catch (e) {
      console.warn('Error al actualizar envío:', e);
    }
    const actualizado = {
      ...actual,
      transportadora: payload.transportadora,
      guia: payload.numero_guia,
      fecha_estimada: payload.fecha_estimada,
      costo_envio: payload.costo_envio,
      cantidad_bultos: payload.cantidad_bultos,
      estado: payload.estado,
      observacion: payload.observacion,
    };
    setDatos((prev) => prev.map((d) => (d.id === actual.id ? actualizado : d)));
    setModal(false);
  };

  const cambiarEstado = async (elem, nuevoEstado) => {
    if (elem.estado === nuevoEstado) return;
    try {
      await api.put(`/envios/${elem.id}/estado`, { estado: nuevoEstado });
    } catch (e) {
      console.warn('Error al cambiar estado del envío:', e);
    }
    setDatos((prev) =>
      prev.map((d) => (d.id === elem.id ? { ...d, estado: nuevoEstado } : d))
    );
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Envíos</h2>
          <p>Gestión de despachos a domicilio asociados a ventas</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={cargarEnvios}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por orden, cliente, transportadora, guía..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Cliente</th>
              <th>Transportadora</th>
              <th>Guía</th>
              <th>Estimado</th>
              <th>Costo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
<tbody>
            {cargando ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24 }}>Cargando envíos...</td></tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <div className="estado-vacio">
                    <IconoCamionSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin envíos registrados</h3>
                    <p>Los envíos se crean automáticamente al completar una compra con despacho a domicilio</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 700 }}>{e.orden}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{e.cliente}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{e.transportadora || '—'}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{e.guia || '—'}</td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{formatearFecha(e.fecha_estimada)}</td>
                  <td style={{ fontWeight: 600 }}>{e.costo_envio != null ? `$${Number(e.costo_envio).toLocaleString('es-CO')}` : '—'}</td>
                  <td>
                    <span className={`insignia-estado ${colorEstado(e.estado)}`}>{e.estado}</span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(e)} title="Editar envío">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      {e.estado !== 'Entregado' && e.estado !== 'Cancelado' && (
                        <button className="btn-accion" onClick={() => cambiarEstado(e, 'Entregado')} title="Marcar como entregado" style={{ color: 'var(--verde)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="crud-paginacion">
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} envíos</span>
        </div>
      </div>

      {modal && (
        <Modal titulo="Editar Envío" alCerrar={() => setModal(false)} alGuardar={guardar}>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Transportadora</label>
              <input value={formulario.transportadora} onChange={(e) => setFormulario({ ...formulario, transportadora: e.target.value })} placeholder="Ej: Servientrega" />
            </div>
            <div className="grupo-campo">
              <label>Número de Guía</label>
              <input value={formulario.numero_guia} onChange={(e) => setFormulario({ ...formulario, numero_guia: e.target.value })} placeholder="Ej: 1234567890" />
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Fecha Estimada</label>
              <input type="date" value={formulario.fecha_estimada} onChange={(e) => setFormulario({ ...formulario, fecha_estimada: e.target.value })} />
            </div>
            <div className="grupo-campo">
              <label>Costo de Envío ($)</label>
              <input type="number" min="0" value={formulario.costo_envio} onChange={(e) => setFormulario({ ...formulario, costo_envio: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Bultos</label>
              <input type="number" min="1" value={formulario.cantidad_bultos} onChange={(e) => setFormulario({ ...formulario, cantidad_bultos: e.target.value })} placeholder="1" />
            </div>
            <div className="grupo-campo">
              <label>Estado</label>
              <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
                {ESTADOS_ENVIO.map((estado) => <option key={estado}>{estado}</option>)}
              </select>
            </div>
          </div>
          <div className="grupo-campo">
            <label>Observación</label>
            <textarea value={formulario.observacion} onChange={(e) => setFormulario({ ...formulario, observacion: e.target.value })} placeholder="Dirección de entrega u observaciones..." />
          </div>
        </Modal>
      )}
    </>
  );
}

function IconoCamionSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>;
}