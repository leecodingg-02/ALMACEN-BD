import { useState } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';

const datosIniciales = [
  { id: 1, nombre: 'Estante A', zona: 'Herramientas', sucursal: 'Sede Principal', capacidad: 200, ocupacion: 145, descripcion: 'Estante principal área herramientas', estado: 'Activo' },
  { id: 2, nombre: 'Zona Muebles B', zona: 'Muebles', sucursal: 'Sede Principal', capacidad: 50, ocupacion: 32, descripcion: 'Exhibición de muebles grandes', estado: 'Activo' },
  { id: 3, nombre: 'Pasillo 3', zona: 'Decoración', sucursal: 'Sucursal Norte', capacidad: 300, ocupacion: 187, descripcion: 'Pasillo central de decoración', estado: 'Activo' },
  { id: 4, nombre: 'Estante C', zona: 'Iluminación', sucursal: 'Sede Principal', capacidad: 150, ocupacion: 89, descripcion: 'Lámparas y accesorios de luz', estado: 'Activo' },
  { id: 5, nombre: 'Zona Oficina', zona: 'Muebles', sucursal: 'Sucursal Sur', capacidad: 30, ocupacion: 8, descripcion: 'Mobiliario de oficina', estado: 'Suspendido' },
];

const formularioVacio = { nombre: '', zona: '', sucursal: '', capacidad: '', ocupacion: '', descripcion: '', estado: 'Activo' };

export default function Ubicaciones() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const filtrados = datos.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.zona.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.sucursal.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setFormulario(formularioVacio); setActual(null); setModal('crear'); };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = () => {
    if (!formulario.nombre.trim()) return;
    const capacidad = Number(formulario.capacidad);
    const ocupacion = Number(formulario.ocupacion);
    if (modal === 'crear') {
      setDatos((prev) => [...prev, { ...formulario, id: Date.now(), capacidad, ocupacion, estado: 'Activo' }]);
    } else {
      setDatos((prev) =>
        prev.map((u) => u.id === actual.id ? { ...formulario, id: actual.id, capacidad, ocupacion } : u)
      );
    }
    setModal(null);
  };

  const suspender = () => {
    setDatos((prev) =>
      prev.map((u) =>
        u.id === actual.id
          ? { ...u, estado: u.estado === 'Activo' ? 'Suspendido' : 'Activo' }
          : u
      )
    );
    setModal(null);
  };

  const calcularPorcentaje = (ocu, cap) => cap > 0 ? Math.min(100, Math.round((ocu / cap) * 100)) : 0;
  const colorOcupacion = (pct) => pct >= 90 ? 'var(--rojo)' : pct >= 70 ? 'var(--naranja)' : 'var(--verde)';

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Ubicaciones</h2>
          <p>Gestión de zonas y estantes por sucursal (Gestión de suspensión)</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Ubicación
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, zona, sucursal..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Ubicación</th>
              <th>Zona / Área</th>
              <th>Sucursal</th>
              <th>Ocupación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="estado-vacio">
                    <IconoUbicacionSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin ubicaciones</h3>
                    <p>Crea la primera ubicación</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((u) => {
                const pct = calcularPorcentaje(u.ocupacion, u.capacidad);
                const color = colorOcupacion(pct);
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="ubicacion-icono-badge">
                          <IconoUbicacionSVG width="18" height="18" />
                        </div>
                        <div>
                          <span style={{ fontWeight: 700, display: 'block' }}>{u.nombre}</span>
                          <span style={{ fontSize: 11, color: 'var(--texto-secundario)' }}>{u.descripcion}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-zona-morada">
                        {u.zona}
                      </span>
                    </td>
                    <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{u.sucursal}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progreso-barra-track">
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 36 }}>{pct}%</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--texto-secundario)', marginTop: 2 }}>
                        {u.ocupacion}/{u.capacidad} uds.
                      </div>
                    </td>
                    <td>
                      <span className={`insignia-estado ${u.estado === 'Activo' ? 'completado' : 'cancelado'}`}>{u.estado}</span>
                    </td>
                    <td>
                      <div className="acciones-tabla">
                        <button className="btn-accion editar" onClick={() => abrirEditar(u)} title="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        </button>
                        <button
                          className={`btn-accion ${u.estado === 'Activo' ? 'suspender' : 'reactivar'}`}
                          onClick={() => abrirSuspender(u)}
                          title={u.estado === 'Activo' ? 'Suspender ubicación' : 'Reactivar ubicación'}
                        >
                          {u.estado === 'Activo' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="crud-paginacion">
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} ubicaciones</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva Ubicación' : 'Editar Ubicación'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Nombre *</label>
              <input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Ej: Estante A-12" />
            </div>
            <div className="grupo-campo">
              <label>Zona / Área</label>
              <select value={formulario.zona} onChange={(e) => setFormulario({ ...formulario, zona: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option>Herramientas</option>
                <option>Muebles</option>
                <option>Decoración</option>
                <option>Iluminación</option>
                <option>Baño y Cocina</option>
                <option>Bodega</option>
              </select>
            </div>
          </div>
          <div className="grupo-campo">
            <label>Sucursal</label>
            <select value={formulario.sucursal} onChange={(e) => setFormulario({ ...formulario, sucursal: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option>Sede Principal</option>
              <option>Sucursal Norte</option>
              <option>Sucursal Sur</option>
              <option>Sucursal Oriente</option>
            </select>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Capacidad Máxima</label>
              <input type="number" value={formulario.capacidad} onChange={(e) => setFormulario({ ...formulario, capacidad: e.target.value })} placeholder="200" min="0" />
            </div>
            <div className="grupo-campo">
              <label>Ocupación Actual</label>
              <input type="number" value={formulario.ocupacion} onChange={(e) => setFormulario({ ...formulario, ocupacion: e.target.value })} placeholder="0" min="0" />
            </div>
          </div>
          <div className="grupo-campo">
            <label>Estado</label>
            <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
              <option>Activo</option>
              <option>Suspendido</option>
            </select>
          </div>
          <div className="grupo-campo">
            <label>Descripción</label>
            <textarea value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} placeholder="Descripción de la ubicación..." />
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

function IconoUbicacionSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
