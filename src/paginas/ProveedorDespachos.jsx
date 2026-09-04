import { useState } from 'react';
import { Modal } from '../componentes/AdminModals';

const datosIniciales = [];

const formularioVacio = {
  orden: '',
  fechaEnvio: '',
  destino: 'Sede Principal (Bogotá)',
  bultos: 1,
  transportadora: 'TCC Carga',
  guia: '',
  costoEnvio: '',
  estadoEnvio: 'En Tránsito',
  fechaEstimada: '',
};

export default function ProveedorDespachos() {
  const [datos, setDatos] = useState(() => {
    try {
      const guardados = localStorage.getItem('novacasa_proveedor_despachos');
      return guardados ? JSON.parse(guardados) : datosIniciales;
    } catch {
      return datosIniciales;
    }
  });

  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const guardarEnStorage = (nuevos) => {
    try {
      localStorage.setItem('novacasa_proveedor_despachos', JSON.stringify(nuevos));
    } catch (e) {
      console.error(e);
    }
  };

  const filtrados = datos.filter(
    (d) =>
      d.orden.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.guia.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.destino.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.transportadora.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => {
    setFormulario({
      ...formularioVacio,
      fechaEnvio: new Date().toISOString().split('T')[0],
      guia: `GUIA-${Date.now().toString().slice(-6)}`,
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
    if (!formulario.orden.trim() || !formulario.guia.trim()) return;
    let actualizados;
    if (modal === 'crear') {
      actualizados = [
        ...datos,
        {
          ...formulario,
          id: Date.now(),
          bultos: Number(formulario.bultos) || 1,
          costoEnvio: Number(formulario.costoEnvio) || 0,
        },
      ];
    } else {
      actualizados = datos.map((d) =>
        d.id === actual.id
          ? {
              ...formulario,
              id: actual.id,
              bultos: Number(formulario.bultos) || 1,
              costoEnvio: Number(formulario.costoEnvio) || 0,
            }
          : d
      );
    }
    setDatos(actualizados);
    guardarEnStorage(actualizados);
    setModal(null);
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Despachos y Guías Logísticas</h2>
          <p>
            Rastreo de envíos, transportadoras y confirmación de recepción en sucursales.
          </p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Registrar Nuevo Despacho
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda" style={{ width: '100%', maxWidth: 'none' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por # Guía, # Orden de Compra o Transportadora..."
          />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Guía de Envío</th>
              <th>Orden Asociada</th>
              <th>Fecha Envío</th>
              <th>Sucursal Destino</th>
              <th>Bultos / Cajas</th>
              <th>Transportadora</th>
              <th>Flete (COP)</th>
              <th>Estado de Entrega</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="estado-vacio">
                    <p>No se encontraron despachos registrados.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((d) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 800, color: 'var(--texto-principal)' }}>{d.guia}</td>
                  <td style={{ fontWeight: 600 }}>{d.orden}</td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: '13px' }}>{d.fechaEnvio}</td>
                  <td style={{ fontWeight: 600 }}>{d.destino}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{d.bultos} bulto(s)</td>
                  <td style={{ fontWeight: 700 }}>{d.transportadora}</td>
                  <td style={{ fontWeight: 700 }}>${Number(d.costoEnvio).toLocaleString('es-CO')}</td>
                  <td>
                    <span className={`insignia-estado ${d.estadoEnvio.includes('Entregado') ? 'completado' : 'proceso'}`}>
                      {d.estadoEnvio}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-accion editar"
                      onClick={() => abrirEditar(d)}
                      title="Editar información de envío"
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
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} despachos</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Registrar Envío' : 'Actualizar Despacho'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label># Orden de Compra *</label>
              <input value={formulario.orden} onChange={(e) => setFormulario({ ...formulario, orden: e.target.value })} placeholder="Ej. OC-2026-089" />
            </div>
            <div className="grupo-campo">
              <label>Número de Guía *</label>
              <input value={formulario.guia} onChange={(e) => setFormulario({ ...formulario, guia: e.target.value })} placeholder="Ej. TCC-998822" />
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Transportadora</label>
              <input value={formulario.transportadora} onChange={(e) => setFormulario({ ...formulario, transportadora: e.target.value })} placeholder="TCC, Envía, Servientrega..." />
            </div>
            <div className="grupo-campo">
              <label>Sucursal Destino</label>
              <select value={formulario.destino} onChange={(e) => setFormulario({ ...formulario, destino: e.target.value })}>
                <option value="Sede Principal (Bogotá)">Sede Principal (Bogotá)</option>
                <option value="Sucursal Norte (Medellín)">Sucursal Norte (Medellín)</option>
                <option value="Sucursal Sur (Cali)">Sucursal Sur (Cali)</option>
                <option value="Sucursal Oriente (Bucaramanga)">Sucursal Oriente (Bucaramanga)</option>
              </select>
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Cantidad de Bultos / Cajas</label>
              <input type="number" value={formulario.bultos} onChange={(e) => setFormulario({ ...formulario, bultos: e.target.value })} placeholder="1" min="1" />
            </div>
            <div className="grupo-campo">
              <label>Costo de Flete (COP)</label>
              <input type="number" value={formulario.costoEnvio} onChange={(e) => setFormulario({ ...formulario, costoEnvio: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grupo-campo">
            <label>Estado del Envío</label>
            <select value={formulario.estadoEnvio} onChange={(e) => setFormulario({ ...formulario, estadoEnvio: e.target.value })}>
              <option value="En Preparación">En Preparación</option>
              <option value="En Tránsito">En Tránsito con Transportadora</option>
              <option value="En Reparto Local">En Reparto Local</option>
              <option value="Entregado en Destino">Entregado en Destino</option>
            </select>
          </div>
        </Modal>
      )}
    </>
  );
}
