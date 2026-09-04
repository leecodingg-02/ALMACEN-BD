import { useState, useMemo } from 'react';
import { Modal } from '../componentes/AdminModals';

const datosIniciales = [];

export default function ProveedorPedidos() {
  const [datos, setDatos] = useState(() => {
    try {
      const guardados = localStorage.getItem('novacasa_proveedor_pedidos');
      return guardados ? JSON.parse(guardados) : datosIniciales;
    } catch {
      return datosIniciales;
    }
  });

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState({ estado: '', transportadora: '', guia: '', fechaEstimada: '' });

  const guardarEnStorage = (nuevos) => {
    try {
      localStorage.setItem('novacasa_proveedor_pedidos', JSON.stringify(nuevos));
    } catch (e) {
      console.error(e);
    }
  };

  const conteoEstados = useMemo(() => {
    return {
      Todos: datos.length,
      'En Preparación': datos.filter((p) => p.estado === 'En Preparación').length,
      Despachado: datos.filter((p) => p.estado === 'Despachado').length,
      Entregado: datos.filter((p) => p.estado === 'Entregado').length,
    };
  }, [datos]);

  const filtrados = datos.filter((p) => {
    const coincideTexto =
      p.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sucursal.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.guia.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const abrirGestionar = (elem) => {
    setActual(elem);
    setFormulario({
      estado: elem.estado,
      transportadora: elem.transportadora || '',
      guia: elem.guia || '',
      fechaEstimada: elem.fechaEstimada || '',
    });
    setModal('gestionar');
  };

  const guardarGestion = () => {
    const actualizados = datos.map((p) =>
      p.id === actual.id
        ? {
            ...p,
            estado: formulario.estado,
            transportadora: formulario.transportadora,
            guia: formulario.guia,
            fechaEstimada: formulario.fechaEstimada,
          }
        : p
    );
    setDatos(actualizados);
    guardarEnStorage(actualizados);
    setModal(null);
  };

  const insigniaEstado = {
    'En Preparación': 'proceso',
    Despachado: 'proceso',
    Entregado: 'completado',
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Órdenes de Compra Recibidas</h2>
          <p>
            Pedidos de reabastecimiento emitidos por los almacenes NovaCasa para preparar y despachar.
          </p>
        </div>
      </div>

      {/* Pestañas de estado estilo dorado y negro */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {['Todos', 'En Preparación', 'Despachado', 'Entregado'].map((est) => {
          const activo = filtroEstado === est;
          return (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`filtro-estado-btn ${activo ? 'activo' : ''}`}
            >
              <span>{est}</span>
              <span className="filtro-estado-badge">
                {conteoEstados[est] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda" style={{ width: '100%', maxWidth: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por # Orden de Compra, Sucursal o Guía..."
          />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th># Orden Compra</th>
              <th>Fecha Emisión</th>
              <th>Sucursal Destino</th>
              <th>Cantidad Ítems</th>
              <th>Total Liquidación</th>
              <th>Transportadora / Guía</th>
              <th>Entrega Estimada</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="estado-vacio">
                    <p>No hay órdenes de compra registradas con ese criterio.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 800, color: 'var(--texto-principal)' }}>{p.id}</td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: '13px' }}>{p.fecha}</td>
                  <td style={{ fontWeight: 600 }}>{p.sucursal}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{p.items} unds</td>
                  <td style={{ fontWeight: 800, color: '#10B981' }}>
                    ${Number(p.total).toLocaleString('es-CO')}
                  </td>
                  <td>
                    <div style={{ fontSize: '12.5px', fontWeight: 600 }}>{p.transportadora}</div>
                    <span style={{ fontSize: '11px', color: 'var(--texto-secundario)' }}>Guía: {p.guia}</span>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--texto-secundario)' }}>{p.fechaEstimada}</td>
                  <td>
                    <span className={`insignia-estado ${insigniaEstado[p.estado] || 'proceso'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-accion editar"
                      onClick={() => abrirGestionar(p)}
                      title="Gestionar estado y despacho"
                      style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="crud-paginacion">
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} órdenes</span>
        </div>
      </div>

      {modal === 'gestionar' && (
        <Modal titulo={`Gestionar Orden ${actual?.id}`} alCerrar={() => setModal(null)} alGuardar={guardarGestion}>
          <div style={{ marginBottom: '14px', padding: '12px', borderRadius: '8px', background: 'var(--negro-sidebar-hover)', border: '1px solid var(--tarjeta-borde)' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--texto-principal)' }}>{actual?.sucursal}</div>
            <div style={{ fontSize: '12px', color: 'var(--texto-secundario)', marginTop: '2px' }}>
              Valor del pedido: <strong>${Number(actual?.total).toLocaleString('es-CO')}</strong> ({actual?.items} unidades)
            </div>
          </div>

          <div className="grupo-campo">
            <label>Estado del Suministro</label>
            <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
              <option value="En Preparación">En Preparación (Empacando)</option>
              <option value="Despachado">Despachado (En Camino con Transportadora)</option>
              <option value="Entregado">Entregado (Recibido en Sucursal NovaCasa)</option>
            </select>
          </div>

          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Empresa de Transporte</label>
              <input value={formulario.transportadora} onChange={(e) => setFormulario({ ...formulario, transportadora: e.target.value })} placeholder="TCC, Servientrega, Envía..." />
            </div>
            <div className="grupo-campo">
              <label>Número de Guía</label>
              <input value={formulario.guia} onChange={(e) => setFormulario({ ...formulario, guia: e.target.value })} placeholder="Ej. TCC-12345" />
            </div>
          </div>

          <div className="grupo-campo">
            <label>Fecha Estimada de Llegada a Tienda</label>
            <input type="date" value={formulario.fechaEstimada} onChange={(e) => setFormulario({ ...formulario, fechaEstimada: e.target.value })} />
          </div>
        </Modal>
      )}
    </>
  );
}
