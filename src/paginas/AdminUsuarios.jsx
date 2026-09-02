import { useState } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';

const datosIniciales = [
  { id: 1, nombre: 'Carlos Rodríguez', correo: 'carlos@email.com', rol: 'Administrador', sucursal: 'Sede Principal', estado: 'Activo', fechaRegistro: '2024-01-15' },
  { id: 2, nombre: 'Luisa Fernández', correo: 'luisa@email.com', rol: 'Vendedor', sucursal: 'Sede Principal', estado: 'Activo', fechaRegistro: '2024-03-22' },
  { id: 3, nombre: 'Miguel Ángel Torres', correo: 'miguel@email.com', rol: 'Bodeguero', sucursal: 'Sucursal Norte', estado: 'Activo', fechaRegistro: '2024-05-10' },
  { id: 4, nombre: 'Diana Pérez', correo: 'diana@email.com', rol: 'Vendedor', sucursal: 'Sucursal Sur', estado: 'Suspendido', fechaRegistro: '2024-07-01' },
  { id: 5, nombre: 'Andrés Castro', correo: 'andres@email.com', rol: 'Supervisor', sucursal: 'Sede Principal', estado: 'Activo', fechaRegistro: '2025-01-18' },
];

const formularioVacio = { nombre: '', correo: '', rol: '', sucursal: '', estado: 'Activo' };
const coloresAvatar = ['#FFC107', '#3b82f6', '#a855f7', '#22c55e', '#f97316'];

export default function Usuarios() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const filtrados = datos.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setFormulario(formularioVacio); setActual(null); setModal('crear'); };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = () => {
    if (!formulario.nombre.trim()) return;
    if (modal === 'crear') {
      setDatos((prev) => [
        ...prev,
        { ...formulario, id: Date.now(), fechaRegistro: new Date().toISOString().split('T')[0] },
      ]);
    } else {
      setDatos((prev) =>
        prev.map((u) =>
          u.id === actual.id ? { ...formulario, id: actual.id, fechaRegistro: actual.fechaRegistro } : u
        )
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

  const estiloRol = {
    Administrador: { fondo: 'rgba(255, 193, 7, 0.18)', color: '#FFC107' },
    Vendedor: { fondo: 'rgba(59, 130, 246, 0.18)', color: '#3b82f6' },
    Bodeguero: { fondo: 'rgba(168, 85, 247, 0.18)', color: '#a855f7' },
    Supervisor: { fondo: 'rgba(34, 197, 94, 0.18)', color: '#22c55e' },
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Usuarios</h2>
          <p>{datos.length} usuarios registrados (Gestión de suspensión de cuentas)</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, correo, rol..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Sucursal</th>
              <th>Fecha Registro</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="estado-vacio">
                    <IconoUsuariosSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin usuarios</h3>
                    <p>Crea el primer usuario</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((u, i) => {
                const er = estiloRol[u.rol] || { fondo: '#55557020', color: '#888' };
                const iniciales = u.nombre.split(' ').map((n) => n[0]).slice(0, 2).join('');
                const claseRol = u.rol.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="celda-producto">
                        <div
                          className="celda-producto-imagen"
                          style={{
                            background: `${coloresAvatar[i % coloresAvatar.length]}28`,
                            color: coloresAvatar[i % coloresAvatar.length],
                            fontWeight: 800, fontSize: 13,
                          }}
                        >
                          {iniciales}
                        </div>
                        <div className="celda-producto-info">
                          <h4>{u.nombre}</h4>
                          <span>{u.correo}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge-rol ${claseRol}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{u.sucursal}</td>
                    <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{u.fechaRegistro}</td>
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
                          title={u.estado === 'Activo' ? 'Suspender usuario' : 'Reactivar usuario'}
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
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} usuarios</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nuevo Usuario' : 'Editar Usuario'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="grupo-campo">
            <label>Nombre Completo *</label>
            <input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Ej: Carlos Rodríguez" />
          </div>
          <div className="grupo-campo">
            <label>Correo Electrónico</label>
            <input type="email" value={formulario.correo} onChange={(e) => setFormulario({ ...formulario, correo: e.target.value })} placeholder="usuario@correo.com" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Rol</label>
              <select value={formulario.rol} onChange={(e) => setFormulario({ ...formulario, rol: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option>Administrador</option>
                <option>Supervisor</option>
                <option>Vendedor</option>
                <option>Bodeguero</option>
              </select>
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
          </div>
          <div className="grupo-campo">
            <label>Estado</label>
            <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
              <option>Activo</option>
              <option>Suspendido</option>
            </select>
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

function IconoUsuariosSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
}
