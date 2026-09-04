import { useState, useRef, useEffect } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';
import { api } from '../servicios/api';

const datosIniciales = [
  { id: 1, nombre: 'Taladro Inalámbrico 20V', categoria: 'Herramientas', marca: 'DeWalt', precio: 289900, stock: 45, estado: 'Activo', imagen: '' },
  { id: 2, nombre: 'Sofá Modular 3 Puestos', categoria: 'Muebles', marca: 'HomeStyle', precio: 1250000, stock: 12, estado: 'Activo', imagen: '' },
  { id: 3, nombre: 'Maceta Moderna Con Base', categoria: 'Decoración', marca: 'GreenHome', precio: 45000, stock: 89, estado: 'Activo', imagen: '' },
  { id: 4, nombre: 'Lámpara Colgante Minimalista', categoria: 'Iluminación', marca: 'LumEx', precio: 189900, stock: 33, estado: 'Activo', imagen: '' },
  { id: 5, nombre: 'Silla de Oficina Ergonómica', categoria: 'Muebles', marca: 'ErgoWork', precio: 650000, stock: 8, estado: 'Agotado', imagen: '' },
  { id: 6, nombre: 'Cepillo Angular 4.5"', categoria: 'Herramientas', marca: 'Bosch', precio: 129900, stock: 27, estado: 'Activo', imagen: '' },
  { id: 7, nombre: 'Espejo Decorativo Redondo', categoria: 'Decoración', marca: 'ArtDeco', precio: 95000, stock: 0, estado: 'Suspendido', imagen: '' },
];

const formularioVacio = { nombre: '', categoria: '', marca: '', precio: '', stock: '', estado: 'Activo', imagen: '' };

export default function Productos() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);
  const inputImagenRef = useRef(null);

  // Cargar productos directamente desde MySQL
  useEffect(() => {
    api.get('/productos', datosIniciales).then((res) => {
      if (res && res.length > 0) setDatos(res);
    });
  }, []);

  // Obtener lista dinámica de marcas registradas
  const obtenerMarcasDisponibles = () => {
    try {
      const guardadas = localStorage.getItem('novacasa_marcas');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        const activas = parsed.filter((m) => m.estado === 'Activo').map((m) => m.nombre);
        if (activas.length > 0) return activas;
      }
    } catch (e) {
      console.error(e);
    }
    return ['DeWalt', 'Bosch', 'HomeStyle', 'GreenHome', 'LumEx', 'ErgoWork', 'ArtDeco'];
  };

  // Obtener lista dinámica de categorías registradas
  const obtenerCategoriasDisponibles = () => {
    try {
      const guardadas = localStorage.getItem('novacasa_categorias');
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        const activas = parsed.filter((c) => c.estado === 'Activo').map((c) => c.nombre);
        if (activas.length > 0) return activas;
      }
    } catch (e) {
      console.error(e);
    }
    return ['Herramientas', 'Muebles', 'Decoración', 'Iluminación', 'Baño y Cocina', 'Jardín'];
  };

  const marcasDisponibles = obtenerMarcasDisponibles();
  const categoriasDisponibles = obtenerCategoriasDisponibles();

  const guardarEnStorage = (nuevos) => {
    try {
      localStorage.setItem('novacasa_productos', JSON.stringify(nuevos));
    } catch (e) {
      console.error(e);
    }
  };

  const filtrados = datos.filter(
    (p) =>
      (p.nombre || p.titulo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.categoria || '').toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.marca || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => { setFormulario(formularioVacio); setActual(null); setModal('crear'); };
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const manejarSubidaImagen = (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const lector = new FileReader();
      lector.onload = (ev) => {
        setFormulario((prev) => ({ ...prev, imagen: ev.target.result }));
      };
      lector.readAsDataURL(archivo);
    }
  };

  const eliminarImagen = (e) => {
    e.stopPropagation();
    setFormulario((prev) => ({ ...prev, imagen: '' }));
    if (inputImagenRef.current) inputImagenRef.current.value = '';
  };

  const guardar = async () => {
    if (!formulario.nombre.trim()) return;
    const precio = Number(formulario.precio) || 0;
    const stock = Number(formulario.stock) || 0;
    const payload = { ...formulario, precio, stock };

    if (modal === 'crear') {
      try {
        const nuevo = await api.post('/productos', payload);
        const actualizados = [...datos, { ...payload, id: nuevo.id || Date.now() }];
        setDatos(actualizados);
        guardarEnStorage(actualizados);
      } catch {
        const actualizados = [...datos, { ...payload, id: Date.now() }];
        setDatos(actualizados);
        guardarEnStorage(actualizados);
      }
    } else {
      try {
        await api.put(`/productos/${actual.id}`, payload);
      } catch (e) {
        console.warn('Fallback local para editar producto:', e);
      }
      const actualizados = datos.map((p) =>
        p.id === actual.id ? { ...payload, id: actual.id } : p
      );
      setDatos(actualizados);
      guardarEnStorage(actualizados);
    }
    setModal(null);
  };

  const suspender = async () => {
    const nuevoEstado = actual.estado === 'Activo' ? 'Suspendido' : 'Activo';
    try {
      await api.put(`/productos/${actual.id}`, { ...actual, estado: nuevoEstado });
    } catch (e) {
      console.warn('Fallback local para suspender producto:', e);
    }
    const actualizados = datos.map((p) =>
      p.id === actual.id ? { ...p, estado: nuevoEstado } : p
    );
    setDatos(actualizados);
    guardarEnStorage(actualizados);
    setModal(null);
  };

  const insigniaEstado = { Activo: 'completado', Agotado: 'pendiente', Suspendido: 'cancelado', Inactivo: 'cancelado' };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Productos</h2>
          <p>{datos.length} productos registrados (Gestión de suspensión de artículos)</p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, categoría, marca..."
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="boton-filtrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filtrar
          </div>
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="estado-vacio">
                    <IconoCajaSinFondo width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin resultados</h3>
                    <p>No se encontraron productos con esa búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="celda-producto">
                      <div className="celda-producto-imagen">
                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre} />
                        ) : (
                          <IconoCajaSVG width="20" height="20" />
                        )}
                      </div>
                      <div className="celda-producto-info">
                        <h4>{p.nombre}</h4>
                        <span>ID: #{p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>{p.categoria}</td>
                  <td>{p.marca}</td>
                  <td style={{ fontWeight: 700, color: 'var(--texto-principal)' }}>
                    ${Number(p.precio).toLocaleString('es-CO')}
                  </td>
                  <td>
                    <span style={{
                      color: p.stock === 0 ? 'var(--rojo)' : p.stock < 15 ? 'var(--naranja)' : 'var(--verde)',
                      fontWeight: 700,
                    }}>
                      {p.stock} uds.
                    </span>
                  </td>
                  <td>
                    <span className={`insignia-estado ${insigniaEstado[p.estado] || 'proceso'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(p)} title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className={`btn-accion ${p.estado === 'Activo' ? 'suspender' : 'reactivar'}`}
                        onClick={() => abrirSuspender(p)}
                        title={p.estado === 'Activo' ? 'Suspender producto' : 'Reactivar producto'}
                      >
                        {p.estado === 'Activo' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
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
          <span className="paginacion-info">
            Mostrando {filtrados.length} de {datos.length} productos
          </span>
          <div className="paginacion-botones">
            <button className="btn-pagina">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button className="btn-pagina activo">1</button>
            <button className="btn-pagina">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR */}
      {(modal === 'crear' || modal === 'editar') && (
        <Modal
          titulo={modal === 'crear' ? 'Nuevo Producto' : 'Editar Producto'}
          alCerrar={() => setModal(null)}
          alGuardar={guardar}
        >
          {/* CAMPO DE SUBIDA DE IMAGEN */}
          <div className="grupo-campo">
            <label>Imagen del Producto</label>
            <input
              ref={inputImagenRef}
              type="file"
              accept="image/*"
              onChange={manejarSubidaImagen}
              style={{ display: 'none' }}
            />
            {formulario.imagen ? (
              <div className="preview-imagen-contenedor">
                <img src={formulario.imagen} alt="Vista previa del producto" className="preview-imagen-img" />
                <div className="preview-imagen-acciones">
                  <button
                    type="button"
                    className="btn-cambiar-imagen"
                    onClick={() => inputImagenRef.current?.click()}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    Cambiar
                  </button>
                  <button
                    type="button"
                    className="btn-eliminar-imagen"
                    onClick={eliminarImagen}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="subir-imagen-dropzone"
                onClick={() => inputImagenRef.current?.click()}
              >
                <div className="subir-imagen-icono">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <span className="subir-imagen-texto">Haz clic para subir una imagen</span>
                <span className="subir-imagen-pista">PNG, JPG o WEBP (máx. 5MB)</span>
              </div>
            )}
          </div>

          <div className="grupo-campo">
            <label>Nombre del Producto *</label>
            <input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Ej: Taladro Inalámbrico 20V" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Categoría</label>
              <select value={formulario.categoria} onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}>
                <option value="">Seleccionar categoría...</option>
                {categoriasDisponibles.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="grupo-campo">
              <label>Marca</label>
              <select value={formulario.marca} onChange={(e) => setFormulario({ ...formulario, marca: e.target.value })}>
                <option value="">Seleccionar marca...</option>
                {marcasDisponibles.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
                {formulario.marca && !marcasDisponibles.includes(formulario.marca) && (
                  <option value={formulario.marca}>{formulario.marca}</option>
                )}
              </select>
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Precio (COP)</label>
              <input type="number" value={formulario.precio} onChange={(e) => setFormulario({ ...formulario, precio: e.target.value })} placeholder="289900" />
            </div>
            <div className="grupo-campo">
              <label>Stock</label>
              <input type="number" value={formulario.stock} onChange={(e) => setFormulario({ ...formulario, stock: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="grupo-campo">
            <label>Estado</label>
            <select value={formulario.estado} onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}>
              <option>Activo</option>
              <option>Suspendido</option>
              <option>Agotado</option>
            </select>
          </div>
        </Modal>
      )}

      {/* MODAL SUSPENDER */}
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

function IconoCajaSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="#555555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
}

function IconoCajaSinFondo(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>;
}
