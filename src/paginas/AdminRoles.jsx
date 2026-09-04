import { useState, useEffect } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';
import { api } from '../servicios/api';

const datosIniciales = [
  { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema', permisos: 12, usuarios: 1, color: '#FFC107', estado: 'Activo' },
  { id: 2, nombre: 'Supervisor', descripcion: 'Supervisión de ventas e inventario', permisos: 8, usuarios: 1, color: '#3b82f6', estado: 'Activo' },
  { id: 3, nombre: 'Vendedor', descripcion: 'Gestión de ventas al cliente', permisos: 5, usuarios: 2, color: '#22c55e', estado: 'Activo' },
  { id: 4, nombre: 'Bodeguero', descripcion: 'Control de inventario y recepciones', permisos: 4, usuarios: 1, color: '#a855f7', estado: 'Activo' },
];

const formularioVacio = { nombre: '', descripcion: '', color: '#FFC107', estado: 'Activo' };

export default function Roles() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  // Cargar roles desde MySQL
  useEffect(() => {
    api.get('/roles', datosIniciales).then((res) => {
      if (res && res.length > 0) setDatos(res);
    });
  }, []);

  const filtrados = datos.filter(
    (r) =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setFormulario(formularioVacio); setActual(null); setModal('crear'); };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = async () => {
    if (!formulario.nombre.trim()) return;
    if (modal === 'crear') {
      try {
        const nuevo = await api.post('/roles', formulario);
        setDatos((prev) => [...prev, { ...formulario, id: nuevo.id || Date.now(), permisos: 3, usuarios: 0, estado: 'Activo' }]);
      } catch {
        setDatos((prev) => [...prev, { ...formulario, id: Date.now(), permisos: 0, usuarios: 0, estado: 'Activo' }]);
      }
    } else {
      try {
        await api.put(`/roles/${actual.id}`, formulario);
      } catch (e) {
        console.warn('Fallback local para editar rol:', e);
      }
      setDatos((prev) =>
        prev.map((r) =>
          r.id === actual.id
            ? { ...formulario, id: actual.id, permisos: actual.permisos, usuarios: actual.usuarios }
            : r
        )
      );
    }
    setModal(null);
  };

  const suspender = async () => {
    const nuevoEstado = actual.estado === 'Activo' ? 'Suspendido' : 'Activo';
    try {
      await api.put(`/roles/${actual.id}`, { ...actual, estado: nuevoEstado });
    } catch (e) {
      console.warn('Fallback local para suspender rol:', e);
    }
    setDatos((prev) =>
      prev.map((r) =>
        r.id === actual.id ? { ...r, estado: nuevoEstado } : r
      )
    );
    setModal(null);
  };

  const coloresDisponibles = ['#FFC107', '#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444', '#06b6d4'];

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Roles</h2>
          <p>Define los niveles de acceso al sistema (Gestión de suspensión)</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Rol
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar roles..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Descripción</th>
              <th>Permisos</th>
              <th>Usuarios</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="estado-vacio">
                    <IconoEscudoSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin roles</h3>
                    <p>Crea el primer rol</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: `${r.color}28`, color: r.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${r.color}40`,
                      }}>
                        <IconoEscudoSVG width="18" height="18" />
                      </div>
                      <span style={{ fontWeight: 700 }}>{r.nombre}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{r.descripcion}</td>
                  <td><span style={{ fontWeight: 700 }}>{r.permisos} permisos</span></td>
                  <td>
                    <span style={{
                      background: `${r.color}22`, color: r.color,
                      border: `1px solid ${r.color}44`,
                      padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                    }}>
                      {r.usuarios} usuario(s)
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-estado ${r.estado === 'Activo' ? 'completado' : 'cancelado'}`}>{r.estado}</span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(r)} title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        className={`btn-accion ${r.estado === 'Activo' ? 'suspender' : 'reactivar'}`}
                        onClick={() => abrirSuspender(r)}
                        title={r.estado === 'Activo' ? 'Suspender rol' : 'Reactivar rol'}
                      >
                        {r.estado === 'Activo' ? (
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
          <span className="paginacion-info">{filtrados.length} roles encontrados</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nuevo Rol' : 'Editar Rol'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="grupo-campo">
            <label>Nombre del Rol *</label>
            <input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Ej: Vendedor" />
          </div>
          <div className="grupo-campo">
            <label>Descripción</label>
            <textarea value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} placeholder="¿Qué puede hacer este rol?" />
          </div>
          <div className="grupo-campo">
            <label>Color identificador</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {coloresDisponibles.map((col) => (
                <div
                  key={col}
                  onClick={() => setFormulario({ ...formulario, color: col })}
                  style={{
                    width: 28, height: 28, borderRadius: 6, background: col, cursor: 'pointer',
                    border: formulario.color === col ? '3px solid #000' : '3px solid transparent',
                    transition: 'transform 0.15s',
                    transform: formulario.color === col ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
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

function IconoEscudoSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
