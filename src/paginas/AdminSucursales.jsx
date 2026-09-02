import { useState } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';

const datosIniciales = [
  { id: 1, nombre: 'Sede Principal', ciudad: 'Bogotá', direccion: 'Cra 15 # 93-75', telefono: '601-234-5678', gerente: 'Carlos Rodríguez', estado: 'Activo' },
  { id: 2, nombre: 'Sucursal Norte', ciudad: 'Medellín', direccion: 'Calle 10 # 43-22', telefono: '604-567-8901', gerente: 'Luisa Fernández', estado: 'Activo' },
  { id: 3, nombre: 'Sucursal Sur', ciudad: 'Cali', direccion: 'Av. 6N # 23-45', telefono: '602-345-6789', gerente: 'Miguel Torres', estado: 'Activo' },
  { id: 4, nombre: 'Sucursal Oriente', ciudad: 'Bucaramanga', direccion: 'Calle 36 # 12-08', telefono: '607-456-7890', gerente: 'Diana Pérez', estado: 'Suspendido' },
];

const formularioVacio = { nombre: '', ciudad: '', direccion: '', telefono: '', gerente: '', estado: 'Activo' };

export default function Sucursales() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const filtrados = datos.filter(
    (s) =>
      s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.ciudad.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.gerente.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setFormulario(formularioVacio); setActual(null); setModal('crear'); };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = () => {
    if (!formulario.nombre.trim()) return;
    if (modal === 'crear') {
      setDatos((prev) => [...prev, { ...formulario, id: Date.now() }]);
    } else {
      setDatos((prev) =>
        prev.map((s) => s.id === actual.id ? { ...formulario, id: actual.id } : s)
      );
    }
    setModal(null);
  };

  const suspender = () => {
    setDatos((prev) =>
      prev.map((s) =>
        s.id === actual.id
          ? { ...s, estado: s.estado === 'Activo' ? 'Suspendido' : 'Activo' }
          : s
      )
    );
    setModal(null);
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Sucursales</h2>
          <p>{datos.length} sucursales registradas (Gestión de suspensión)</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Sucursal
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, ciudad, gerente..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Sucursal</th>
              <th>Ciudad</th>
              <th>Dirección</th>
              <th>Teléfono</th>
              <th>Gerente</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="estado-vacio">
                    <IconoEdificioSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin sucursales</h3>
                    <p>Crea la primera sucursal</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="sucursal-icono-badge">
                        <IconoEdificioSVG width="18" height="18" />
                      </div>
                      <span style={{ fontWeight: 700 }}>{s.nombre}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--texto-secundario)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <IconoUbicacionSVG width="14" height="14" />
                      {s.ciudad}
                    </span>
                  </td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{s.direccion}</td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{s.telefono}</td>
                  <td style={{ fontWeight: 600 }}>{s.gerente}</td>
                  <td>
                    <span className={`insignia-estado ${s.estado === 'Activo' ? 'completado' : 'cancelado'}`}>{s.estado}</span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(s)} title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        className={`btn-accion ${s.estado === 'Activo' ? 'suspender' : 'reactivar'}`}
                        onClick={() => abrirSuspender(s)}
                        title={s.estado === 'Activo' ? 'Suspender sucursal' : 'Reactivar sucursal'}
                      >
                        {s.estado === 'Activo' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
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
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} sucursales</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva Sucursal' : 'Editar Sucursal'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="grupo-campo">
            <label>Nombre de la Sucursal *</label>
            <input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Ej: Sucursal Norte" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Ciudad</label>
              <select value={formulario.ciudad} onChange={(e) => setFormulario({ ...formulario, ciudad: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option>Bogotá</option>
                <option>Medellín</option>
                <option>Cali</option>
                <option>Bucaramanga</option>
                <option>Barranquilla</option>
                <option>Cartagena</option>
                <option>Pereira</option>
                <option>Manizales</option>
              </select>
            </div>
            <div className="grupo-campo">
              <label>Estado</label>
              <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
                <option>Activo</option>
                <option>Suspendido</option>
              </select>
            </div>
          </div>
          <div className="grupo-campo">
            <label>Dirección</label>
            <input value={formulario.direccion} onChange={(e) => setFormulario({ ...formulario, direccion: e.target.value })} placeholder="Cra 15 # 93-75" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Teléfono</label>
              <input value={formulario.telefono} onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })} placeholder="601-234-5678" />
            </div>
            <div className="grupo-campo">
              <label>Gerente</label>
              <input value={formulario.gerente} onChange={(e) => setFormulario({ ...formulario, gerente: e.target.value })} placeholder="Nombre del gerente" />
            </div>
          </div>
        </Modal>
      )}

      {modal === 'suspender' && (
        <ConfirmarSuspender
          nombreElemento={actual?.nombre}
          estadoActual={actual?.estado}
          alCerrar={() => setModal(null)}
          alConfirmar={suspender}
        />
      )}
    </>
  );
}

function IconoEdificioSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="11" /><line x1="15" y1="22" x2="15" y2="11" /><line x1="9" y1="7" x2="9.01" y2="7" /><line x1="15" y1="7" x2="15.01" y2="7" /></svg>;
}

function IconoUbicacionSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
