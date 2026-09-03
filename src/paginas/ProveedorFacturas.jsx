import { useState, useMemo } from 'react';
import { Modal } from '../componentes/AdminModals';

const datosIniciales = [
  { id: 1, numeroFactura: 'FACT-2026-104', ordenCompra: 'OC-2026-088', fechaEmision: '2026-09-02', fechaVencimiento: '2026-10-02', subtotal: 1890000, iva: 359100, total: 2249100, estadoPago: 'En Revisión', metodoPago: 'Transferencia Bancaria' },
  { id: 2, numeroFactura: 'FACT-2026-103', ordenCompra: 'OC-2026-087', fechaEmision: '2026-09-01', fechaVencimiento: '2026-10-01', subtotal: 5200000, iva: 988000, total: 6188000, estadoPago: 'Pendiente', metodoPago: 'Transferencia Bancaria' },
  { id: 3, numeroFactura: 'FACT-2026-102', ordenCompra: 'OC-2026-086', fechaEmision: '2026-08-30', fechaVencimiento: '2026-09-30', subtotal: 980000, iva: 186200, total: 1166200, estadoPago: 'Pagada', metodoPago: 'Transferencia Bancaria' },
  { id: 4, numeroFactura: 'FACT-2026-101', ordenCompra: 'OC-2026-085', fechaEmision: '2026-08-28', fechaVencimiento: '2026-09-28', subtotal: 2400000, iva: 456000, total: 2856000, estadoPago: 'Pagada', metodoPago: 'Transferencia Bancaria' },
];

const formularioVacio = {
  numeroFactura: '',
  ordenCompra: '',
  fechaEmision: '',
  fechaVencimiento: '',
  total: '',
  estadoPago: 'En Revisión',
  metodoPago: 'Transferencia Bancaria',
};

export default function ProveedorFacturas() {
  const [datos, setDatos] = useState(() => {
    try {
      const guardados = localStorage.getItem('novacasa_proveedor_facturas');
      return guardados ? JSON.parse(guardados) : datosIniciales;
    } catch {
      return datosIniciales;
    }
  });

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const guardarEnStorage = (nuevos) => {
    try {
      localStorage.setItem('novacasa_proveedor_facturas', JSON.stringify(nuevos));
    } catch (e) {
      console.error(e);
    }
  };

  const conteoEstados = useMemo(() => {
    return {
      Todos: datos.length,
      'En Revisión': datos.filter((f) => f.estadoPago === 'En Revisión').length,
      Pendiente: datos.filter((f) => f.estadoPago === 'Pendiente').length,
      Pagada: datos.filter((f) => f.estadoPago === 'Pagada').length,
    };
  }, [datos]);

  const filtrados = datos.filter((f) => {
    const coincideTexto =
      f.numeroFactura.toLowerCase().includes(busqueda.toLowerCase()) ||
      f.ordenCompra.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos' || f.estadoPago === filtroEstado;
    return coincideTexto && coincideEstado;
  });

  const abrirCrear = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const fechaVenc = new Date();
    fechaVenc.setDate(fechaVenc.getDate() + 30);
    setFormulario({
      ...formularioVacio,
      numeroFactura: `FACT-2026-${Date.now().toString().slice(-4)}`,
      fechaEmision: hoy,
      fechaVencimiento: fechaVenc.toISOString().split('T')[0],
    });
    setActual(null);
    setModal('crear');
  };

  const abrirEditar = (elem) => {
    setFormulario({ ...elem });
    setActual(elem);
    setModal('editar');
  };

  const guardar = () => {
    if (!formulario.numeroFactura.trim() || !formulario.ordenCompra.trim()) return;
    const totalNum = Number(formulario.total) || 0;
    const subtotal = Math.round(totalNum / 1.19);
    const iva = totalNum - subtotal;

    let actualizados;
    if (modal === 'crear') {
      actualizados = [
        ...datos,
        {
          ...formulario,
          id: Date.now(),
          subtotal,
          iva,
          total: totalNum,
        },
      ];
    } else {
      actualizados = datos.map((f) =>
        f.id === actual.id
          ? {
              ...formulario,
              id: actual.id,
              subtotal,
              iva,
              total: totalNum,
            }
          : f
      );
    }
    setDatos(actualizados);
    guardarEnStorage(actualizados);
    setModal(null);
  };

  const insigniaEstado = {
    Pagada: 'completado',
    Pendiente: 'proceso',
    'En Revisión': 'pendiente',
  };

  const totalPendienteCobro = datos
    .filter((f) => f.estadoPago !== 'Pagada')
    .reduce((sum, f) => sum + f.total, 0);

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Facturación y Cuentas por Cobrar</h2>
          <p>
            Saldo pendiente de pago por NovaCasa:{' '}
            <strong style={{ color: '#10B981' }}>
              ${totalPendienteCobro.toLocaleString('es-CO')}
            </strong>{' '}
            (Término estándar de pago: 30 días calendario)
          </p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Radicar Nueva Factura
          </button>
        </div>
      </div>

      {/* Pestañas de estado con estilo dorado y negro */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {['Todos', 'En Revisión', 'Pendiente', 'Pagada'].map((est) => {
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
            placeholder="Buscar por # Factura o # Orden de Compra..."
          />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th># Factura</th>
              <th>Orden de Compra</th>
              <th>Fecha Emisión</th>
              <th>Vencimiento</th>
              <th>Subtotal</th>
              <th>IVA (19%)</th>
              <th>Total Facturado</th>
              <th>Estado de Pago</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="estado-vacio">
                    <p>No se encontraron facturas registradas.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((f) => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 800, color: 'var(--texto-principal)' }}>{f.numeroFactura}</td>
                  <td style={{ fontWeight: 600 }}>{f.ordenCompra}</td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: '13px' }}>{f.fechaEmision}</td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: '13px' }}>{f.fechaVencimiento}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>${Number(f.subtotal).toLocaleString('es-CO')}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>${Number(f.iva).toLocaleString('es-CO')}</td>
                  <td style={{ fontWeight: 800, color: 'var(--texto-principal)' }}>
                    ${Number(f.total).toLocaleString('es-CO')}
                  </td>
                  <td>
                    <span className={`insignia-estado ${insigniaEstado[f.estadoPago] || 'pendiente'}`}>
                      {f.estadoPago}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-accion editar"
                      onClick={() => abrirEditar(f)}
                      title="Editar factura"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="crud-paginacion">
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} facturas</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Radicar Factura Electrónica' : 'Editar Factura'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Número de Factura *</label>
              <input value={formulario.numeroFactura} onChange={(e) => setFormulario({ ...formulario, numeroFactura: e.target.value })} placeholder="FACT-2026-105" />
            </div>
            <div className="grupo-campo">
              <label>Orden de Compra Asociada *</label>
              <input value={formulario.ordenCompra} onChange={(e) => setFormulario({ ...formulario, ordenCompra: e.target.value })} placeholder="OC-2026-089" />
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Fecha de Emisión</label>
              <input type="date" value={formulario.fechaEmision} onChange={(e) => setFormulario({ ...formulario, fechaEmision: e.target.value })} />
            </div>
            <div className="grupo-campo">
              <label>Fecha de Vencimiento (30 Días)</label>
              <input type="date" value={formulario.fechaVencimiento} onChange={(e) => setFormulario({ ...formulario, fechaVencimiento: e.target.value })} />
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Total Factura con IVA (COP) *</label>
              <input type="number" value={formulario.total} onChange={(e) => setFormulario({ ...formulario, total: e.target.value })} placeholder="0" />
            </div>
            <div className="grupo-campo">
              <label>Estado de Pago</label>
              <select value={formulario.estadoPago} onChange={(e) => setFormulario({ ...formulario, estadoPago: e.target.value })}>
                <option value="En Revisión">En Revisión Contable</option>
                <option value="Pendiente">Pendiente de Pago</option>
                <option value="Pagada">Pagada / Liquidada</option>
              </select>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
