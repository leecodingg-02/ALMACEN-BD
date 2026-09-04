import { useState, useEffect } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';
import { api } from '../servicios/api';

const datosIniciales = [
  { id: 1, nombre: 'DeWalt', pais: 'EE.UU.', contacto: 'ventas@dewalt.co', productos: 23, estado: 'Activo' },
  { id: 2, nombre: 'Bosch', pais: 'Alemania', contacto: 'bosch@bosch.co', productos: 31, estado: 'Activo' },
  { id: 3, nombre: 'HomeStyle', pais: 'Colombia', contacto: 'info@homestyleco.com', productos: 18, estado: 'Activo' },
  { id: 4, nombre: 'GreenHome', pais: 'Colombia', contacto: 'verde@greenhome.co', productos: 9, estado: 'Activo' },
  { id: 5, nombre: 'LumEx', pais: 'México', contacto: 'lumex@lumex.mx', productos: 14, estado: 'Suspendido' },
  { id: 6, nombre: 'ErgoWork', pais: 'España', contacto: 'ergo@ergowork.es', productos: 7, estado: 'Activo' },
];

const formularioVacio = { nombre: '', pais: '', contacto: '', estado: 'Activo' };

export default function Marcas() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  // Cargar marcas directamente desde la base de datos MySQL
  useEffect(() => {
    api.get('/marcas', datosIniciales).then((res) => {
      if (res && res.length > 0) setDatos(res);
    });
  }, []);

  const guardarEnStorage = (nuevas) => {
    try {
      localStorage.setItem('novacasa_marcas', JSON.stringify(nuevas));
    } catch (e) {
      console.error(e);
    }
  };

  const filtrados = datos.filter(
    (m) =>
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.pais.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setFormulario(formularioVacio); setActual(null); setModal('crear'); };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = async () => {
    if (!formulario.nombre.trim()) return;
    if (modal === 'crear') {
      try {
        const nueva = await api.post('/marcas', formulario);
        const actualizadas = [...datos, { ...formulario, id: nueva.id || Date.now(), productos: 0 }];
        setDatos(actualizadas);
        guardarEnStorage(actualizadas);
      } catch {
        const actualizadas = [...datos, { ...formulario, id: Date.now(), productos: 0 }];
        setDatos(actualizadas);
        guardarEnStorage(actualizadas);
      }
    } else {
      try {
        await api.put(`/marcas/${actual.id}`, formulario);
      } catch (e) {
        console.warn('Fallback local para editar marca:', e);
      }
      const actualizadas = datos.map((m) =>
        m.id === actual.id ? { ...formulario, id: actual.id, productos: actual.productos } : m
      );
      setDatos(actualizadas);
      guardarEnStorage(actualizadas);
    }
    setModal(null);
  };

  const suspender = async () => {
    const nuevoEstado = actual.estado === 'Activo' ? 'Suspendido' : 'Activo';
    try {
      await api.put(`/marcas/${actual.id}`, { ...actual, estado: nuevoEstado });
    } catch (e) {
      console.warn('Fallback local para suspender marca:', e);
    }
    const actualizadas = datos.map((m) =>
      m.id === actual.id ? { ...m, estado: nuevoEstado } : m
    );
    setDatos(actualizadas);
    guardarEnStorage(actualizadas);
    setModal(null);
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Marcas</h2>
          <p>{datos.length} marcas registradas (Gestión de suspensión)</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Marca
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar marcas..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Marca</th>
              <th>País</th>
              <th>Contacto</th>
              <th>Productos</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="estado-vacio">
                    <IconoMarcaSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin marcas</h3>
                    <p>Crea la primera marca</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="marca-avatar-badge">
                        {m.nombre.substring(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 700 }}>{m.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <IconoMundoSVG width="14" height="14" style={{ color: '#666' }} />
                      {m.pais}
                    </span>
                  </td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{m.contacto}</td>
                  <td><span style={{ fontWeight: 700 }}>{m.productos}</span></td>
                  <td>
                    <span className={`insignia-estado ${m.estado === 'Activo' ? 'completado' : 'cancelado'}`}>{m.estado}</span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(m)} title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        className={`btn-accion ${m.estado === 'Activo' ? 'suspender' : 'reactivar'}`}
                        onClick={() => abrirSuspender(m)}
                        title={m.estado === 'Activo' ? 'Suspender marca' : 'Reactivar marca'}
                      >
                        {m.estado === 'Activo' ? (
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
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} marcas</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva Marca' : 'Editar Marca'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="grupo-campo">
            <label>Nombre de la Marca *</label>
            <input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Ej: DeWalt" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>País de Origen</label>
              <select value={formulario.pais} onChange={(e) => setFormulario({ ...formulario, pais: e.target.value })}>
                <option value="">Seleccionar...</option>
                <option>Colombia</option>
                <option>EE.UU.</option>
                <option>Alemania</option>
                <option>México</option>
                <option>España</option>
                <option>Brasil</option>
                <option>China</option>
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
            <label>Correo de Contacto</label>
            <input type="email" value={formulario.contacto} onChange={(e) => setFormulario({ ...formulario, contacto: e.target.value })} placeholder="contacto@marca.com" />
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

function IconoMarcaSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}

function IconoMundoSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;
}
