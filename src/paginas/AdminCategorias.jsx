import { useState, useEffect } from 'react';
import { Modal, ConfirmarSuspender, ConfirmarEliminar } from '../componentes/AdminModals';
import { api } from '../servicios/api';

const datosIniciales = [
  { id: 1, nombre: 'Herramientas', descripcion: 'Herramientas manuales y eléctricas', estado: 'Activo', productos: 64 },
  { id: 2, nombre: 'Muebles', descripcion: 'Muebles para hogar y oficina', estado: 'Activo', productos: 48 },
  { id: 3, nombre: 'Decoración', descripcion: 'Artículos decorativos para el hogar', estado: 'Activo', productos: 37 },
  { id: 4, nombre: 'Iluminación', descripcion: 'Lámparas, bombillas y accesorios', estado: 'Activo', productos: 29 },
  { id: 5, nombre: 'Baño y Cocina', descripcion: 'Accesorios para baño y cocina', estado: 'Activo', productos: 22 },
  { id: 6, nombre: 'Jardín', descripcion: 'Plantas y artículos de jardinería', estado: 'Suspendido', productos: 15 },
];

const formularioVacio = { nombre: '', descripcion: '', estado: 'Activo' };
const colores = ['#f5c518', '#3b82f6', '#a855f7', '#22c55e', '#f97316', '#ef4444'];

export default function Categorias() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  // Cargar categorías directamente desde la base de datos MySQL
  useEffect(() => {
    api.get('/categorias', datosIniciales).then((res) => {
      if (res && res.length > 0) setDatos(res);
    });
  }, []);

  const guardarEnStorage = (nuevas) => {
    try {
      localStorage.setItem('novacasa_categorias', JSON.stringify(nuevas));
    } catch (e) {
      console.error(e);
    }
  };

  const filtrados = datos.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setFormulario(formularioVacio); setActual(null); setModal('crear'); };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };
  const abrirEliminar = (elem) => { setActual(elem); setModal('eliminar'); };

  const guardar = async () => {
    if (!formulario.nombre.trim()) return;
    if (modal === 'crear') {
      try {
        const nueva = await api.post('/categorias', formulario);
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
        await api.put(`/categorias/${actual.id}`, formulario);
      } catch (e) {
        console.warn('Fallback local para editar categoría:', e);
      }
      const actualizadas = datos.map((c) =>
        c.id === actual.id ? { ...formulario, id: actual.id, productos: actual.productos } : c
      );
      setDatos(actualizadas);
      guardarEnStorage(actualizadas);
    }
    setModal(null);
  };

  const suspender = async () => {
    const nuevoEstado = actual.estado === 'Activo' ? 'Suspendido' : 'Activo';
    try {
      await api.put(`/categorias/${actual.id}`, { ...actual, estado: nuevoEstado });
    } catch (e) {
      console.warn('Fallback local para suspender categoría:', e);
    }
    const actualizadas = datos.map((c) =>
      c.id === actual.id ? { ...c, estado: nuevoEstado } : c
    );
    setDatos(actualizadas);
    guardarEnStorage(actualizadas);
    setModal(null);
  };

  const eliminar = async () => {
    try {
      await api.delete(`/categorias/${actual.id}`);
    } catch (e) {
      console.warn('Fallback local para eliminar categoría:', e);
    }
    const actualizadas = datos.filter((c) => c.id !== actual.id);
    setDatos(actualizadas);
    guardarEnStorage(actualizadas);
    setModal(null);
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Categorías</h2>
          <p>{datos.length} categorías registradas (Se pueden suspender y eliminar)</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Categoría
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar categorías..." />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Descripción</th>
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
                    <IconoEtiquetaSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin categorías</h3>
                    <p>Crea la primera categoría</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>#{c.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: `${colores[i % colores.length]}22`,
                        color: colores[i % colores.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <IconoEtiquetaSVG width="18" height="18" />
                      </div>
                      <span style={{ fontWeight: 700 }}>{c.nombre}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{c.descripcion}</td>
                  <td>
                    <span className="badge-productos">
                      {c.productos} productos
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-estado ${c.estado === 'Activo' ? 'completado' : 'cancelado'}`}>{c.estado}</span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(c)} title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        className={`btn-accion ${c.estado === 'Activo' ? 'suspender' : 'reactivar'}`}
                        onClick={() => abrirSuspender(c)}
                        title={c.estado === 'Activo' ? 'Suspender' : 'Reactivar'}
                      >
                        {c.estado === 'Activo' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                      <button className="btn-accion eliminar" onClick={() => abrirEliminar(c)} title="Eliminar definitivamente">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="crud-paginacion">
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} categorías</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nueva Categoría' : 'Editar Categoría'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="grupo-campo">
            <label>Nombre *</label>
            <input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Ej: Herramientas" />
          </div>
          <div className="grupo-campo">
            <label>Descripción</label>
            <textarea value={formulario.descripcion} onChange={(e) => setFormulario({ ...formulario, descripcion: e.target.value })} placeholder="Descripción de la categoría..." />
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

      {modal === 'eliminar' && (
        <ConfirmarEliminar nombreElemento={actual?.nombre} alCerrar={() => setModal(null)} alConfirmar={eliminar} />
      )}
    </>
  );
}

function IconoEtiquetaSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>;
}
