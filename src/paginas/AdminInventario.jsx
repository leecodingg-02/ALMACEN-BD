import { useState, useEffect } from 'react';
import { Modal, ConfirmarSuspender } from '../componentes/AdminModals';
import { api } from '../servicios/api';

const sucursalesDisponibles = [
  'Todas',
  'Sede Principal',
  'Sucursal Norte',
  'Sucursal Sur',
  'Sucursal Oriente',
];

const datosIniciales = [
  // Sede Principal (Bogotá)
  { id: 1, producto: 'Taladro Inalámbrico 20V', sucursal: 'Sede Principal', ubicacion: 'Estante A-12', cantidad: 45, minimo: 10, estado: 'OK' },
  { id: 2, producto: 'Sofá Modular 3 Puestos', sucursal: 'Sede Principal', ubicacion: 'Zona Muebles B', cantidad: 12, minimo: 5, estado: 'OK' },
  { id: 3, producto: 'Lámpara Colgante', sucursal: 'Sede Principal', ubicacion: 'Estante C-04', cantidad: 4, minimo: 10, estado: 'Bajo' },
  { id: 4, producto: 'Cepillo Angular 4.5"', sucursal: 'Sede Principal', ubicacion: 'Estante A-08', cantidad: 27, minimo: 15, estado: 'OK' },
  { id: 5, producto: 'Espejo Redondo 60cm', sucursal: 'Sede Principal', ubicacion: 'Pasillo Decora 1', cantidad: 18, minimo: 5, estado: 'OK' },

  // Sucursal Norte (Medellín)
  { id: 6, producto: 'Maceta Moderna Con Base', sucursal: 'Sucursal Norte', ubicacion: 'Pasillo 3', cantidad: 89, minimo: 20, estado: 'OK' },
  { id: 7, producto: 'Sierra Circular 1400W', sucursal: 'Sucursal Norte', ubicacion: 'Estante Herram-02', cantidad: 3, minimo: 8, estado: 'Bajo' },
  { id: 8, producto: 'Mesa de Centro Roble', sucursal: 'Sucursal Norte', ubicacion: 'Zona Exhibición 1', cantidad: 14, minimo: 4, estado: 'OK' },
  { id: 9, producto: 'Set Destornilladores Pro', sucursal: 'Sucursal Norte', ubicacion: 'Estante Herram-05', cantidad: 52, minimo: 15, estado: 'OK' },

  // Sucursal Sur (Cali)
  { id: 10, producto: 'Silla Ergonómica', sucursal: 'Sucursal Sur', ubicacion: 'Zona Oficina', cantidad: 0, minimo: 5, estado: 'Suspendido' },
  { id: 11, producto: 'Pintura Acrílica Blanco 5G', sucursal: 'Sucursal Sur', ubicacion: 'Bodega Pinturas B', cantidad: 35, minimo: 10, estado: 'OK' },
  { id: 12, producto: 'Foco LED Inteligente RGB', sucursal: 'Sucursal Sur', ubicacion: 'Estante Luces A', cantidad: 6, minimo: 15, estado: 'Bajo' },
  { id: 13, producto: 'Cerradura Digital Biométrica', sucursal: 'Sucursal Sur', ubicacion: 'Estante Seg-01', cantidad: 11, minimo: 4, estado: 'OK' },

  // Sucursal Oriente (Bucaramanga)
  { id: 14, producto: 'Juego de Brocas Titanio', sucursal: 'Sucursal Oriente', ubicacion: 'Estante Accesorios 3', cantidad: 24, minimo: 10, estado: 'OK' },
  { id: 15, producto: 'Cojines Decorativos Velvet', sucursal: 'Sucursal Oriente', ubicacion: 'Pasillo Textil 2', cantidad: 40, minimo: 12, estado: 'OK' },
  { id: 16, producto: 'Escalera Aluminio 6 Pasos', sucursal: 'Sucursal Oriente', ubicacion: 'Bodega Mayor', cantidad: 2, minimo: 6, estado: 'Bajo' },
];

const formularioVacio = { producto: '', sucursal: 'Sede Principal', ubicacion: '', cantidad: '', minimo: '', estado: 'OK' };

export default function Inventario() {
  const [datos, setDatos] = useState(datosIniciales);
  const [busqueda, setBusqueda] = useState('');
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState('Todas');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  // Cargar inventario directamente desde MySQL
  useEffect(() => {
    api.get('/inventario', datosIniciales).then((res) => {
      if (res && res.length > 0) setDatos(res);
    });
  }, []);

  const guardarEnStorage = (nuevos) => {
    try {
      localStorage.setItem('novacasa_inventario', JSON.stringify(nuevos));
    } catch (e) {
      console.error(e);
    }
  };

  // Filtrado por sucursal activa + término de búsqueda
  const datosSucursal = sucursalSeleccionada === 'Todas'
    ? datos
    : datos.filter((i) => i.sucursal === sucursalSeleccionada);

  const filtrados = datosSucursal.filter(
    (i) =>
      i.producto.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.sucursal.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.ubicacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => {
    setFormulario({
      ...formularioVacio,
      sucursal: sucursalSeleccionada === 'Todas' ? 'Sede Principal' : sucursalSeleccionada,
    });
    setActual(null);
    setModal('crear');
  };
  
  const abrirEditar = (elem) => { setFormulario({ ...elem }); setActual(elem); setModal('editar'); };
  const abrirSuspender = (elem) => { setActual(elem); setModal('suspender'); };

  const guardar = async () => {
    if (!formulario.producto.trim()) return;
    const cantidad = Number(formulario.cantidad) || 0;
    const minimo = Number(formulario.minimo) || 0;
    const estado = cantidad === 0 ? 'Agotado' : cantidad < minimo ? 'Bajo' : 'OK';
    const payload = { ...formulario, cantidad, minimo, estado };

    if (modal === 'crear') {
      try {
        const nuevo = await api.post('/inventario', payload);
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
        await api.put(`/inventario/${actual.id}`, payload);
      } catch (e) {
        console.warn('Fallback local para editar inventario:', e);
      }
      const actualizados = datos.map((i) =>
        i.id === actual.id ? { ...payload, id: actual.id } : i
      );
      setDatos(actualizados);
      guardarEnStorage(actualizados);
    }
    setModal(null);
  };

  const suspender = async () => {
    const actualizados = datos.map((i) => {
      if (i.id === actual.id) {
        const nuevoEstado = i.estado === 'Suspendido'
          ? (i.cantidad === 0 ? 'Agotado' : i.cantidad < i.minimo ? 'Bajo' : 'OK')
          : 'Suspendido';
        return { ...i, estado: nuevoEstado };
      }
      return i;
    });
    setDatos(actualizados);
    guardarEnStorage(actualizados);
    setModal(null);
  };

  const contarPorSucursal = (suc) => {
    if (suc === 'Todas') return datos.length;
    return datos.filter((i) => i.sucursal === suc).length;
  };

  const insigniaEstado = { OK: 'completado', Bajo: 'pendiente', Agotado: 'cancelado', Suspendido: 'cancelado' };
  const colorEstado = { OK: 'var(--verde)', Bajo: 'var(--naranja)', Agotado: 'var(--rojo)', Suspendido: 'var(--rojo)' };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Inventario por Sucursal</h2>
          <p>
            {sucursalSeleccionada === 'Todas'
              ? `Visualizando el inventario consolidado (${datos.length} ítems en total)`
              : `Inventario de ${sucursalSeleccionada} (${datosSucursal.length} productos registrados)`}
          </p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Registrar Stock
          </button>
        </div>
      </div>

      {/* PESTAÑAS DE SELECCIÓN DE SUCURSAL */}
      <div className="pestanas-sucursales">
        {sucursalesDisponibles.map((suc) => {
          const activa = sucursalSeleccionada === suc;
          const cantidad = contarPorSucursal(suc);
          return (
            <button
              key={suc}
              className={`pestana-sucursal-btn ${activa ? 'activa' : ''}`}
              onClick={() => setSucursalSeleccionada(suc)}
            >
              <IconoEdificioPestana width="15" height="15" />
              <span>{suc}</span>
              <span className="pestana-sucursal-badge">{cantidad}</span>
            </button>
          );
        })}
      </div>

      {/* Resumen dinámico por la sucursal seleccionada */}
      <div className="grilla-estadisticas" style={{ marginBottom: 20 }}>
        {[
          { etiqueta: 'Ítems en ' + (sucursalSeleccionada === 'Todas' ? 'Todas' : sucursalSeleccionada), valor: datosSucursal.length, color: 'var(--azul)', fondo: 'var(--azul-fondo)', icono: IconoBodegaSVG },
          { etiqueta: 'Stock Normal', valor: datosSucursal.filter(d => d.estado === 'OK').length, color: 'var(--verde)', fondo: 'var(--verde-fondo)', icono: IconoCheckSVG },
          { etiqueta: 'Stock Bajo', valor: datosSucursal.filter(d => d.estado === 'Bajo').length, color: 'var(--naranja)', fondo: 'var(--naranja-fondo)', icono: IconoAlertaSVG },
          { etiqueta: 'Suspendidos / Agotados', valor: datosSucursal.filter(d => d.estado === 'Agotado' || d.estado === 'Suspendido').length, color: 'var(--rojo)', fondo: 'var(--rojo-fondo)', icono: IconoCruzSVG },
        ].map((est) => (
          <div className="tarjeta-estadistica" key={est.etiqueta}>
            <div className="tarjeta-est-encabezado">
              <span className="tarjeta-est-etiqueta">{est.etiqueta}</span>
              <div className="tarjeta-est-icono" style={{ background: est.fondo, color: est.color }}>
                <est.icono width="20" height="20" />
              </div>
            </div>
            <div className="tarjeta-est-valor" style={{ fontSize: 28, color: est.color }}>{est.valor}</div>
          </div>
        ))}
      </div>

      <div className="barra-herramientas">
        <div className="campo-busqueda">
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder={`Buscar en ${sucursalSeleccionada === 'Todas' ? 'todas las sucursales' : sucursalSeleccionada}...`}
          />
        </div>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Sucursal</th>
              <th>Ubicación</th>
              <th>Cantidad</th>
              <th>Mín. Requerido</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="estado-vacio">
                    <IconoBodegaSVG width="42" height="42" style={{ color: '#A1A1AA', marginBottom: 12 }} />
                    <h3>Sin registros para {sucursalSeleccionada}</h3>
                    <p>No se encontraron productos registrados para esta sucursal</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((elem) => (
                <tr key={elem.id}>
                  <td style={{ fontWeight: 700 }}>{elem.producto}</td>
                  <td>
                    <span className="chip-sucursal">
                      <IconoEdificioPestana width="13" height="13" />
                      {elem.sucursal}
                    </span>
                  </td>
                  <td style={{ color: 'var(--texto-secundario)', fontSize: 13 }}>{elem.ubicacion}</td>
                  <td>
                    <span style={{ fontWeight: 800, fontSize: 15, color: colorEstado[elem.estado] }}>
                      {elem.cantidad}
                    </span>
                  </td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{elem.minimo} uds.</td>
                  <td>
                    <span className={`insignia-estado ${insigniaEstado[elem.estado]}`}>{elem.estado}</span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(elem)} title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button
                        className={`btn-accion ${elem.estado === 'Suspendido' ? 'reactivar' : 'suspender'}`}
                        onClick={() => abrirSuspender(elem)}
                        title={elem.estado === 'Suspendido' ? 'Reactivar inventario' : 'Suspender inventario'}
                      >
                        {elem.estado === 'Suspendido' ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
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
          <span className="paginacion-info">Mostrando {filtrados.length} de {datosSucursal.length} registros</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Registrar Stock' : 'Editar Stock'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="grupo-campo">
            <label>Producto *</label>
            <input value={formulario.producto} onChange={(e) => setFormulario({ ...formulario, producto: e.target.value })} placeholder="Nombre del producto" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Sucursal</label>
              <select value={formulario.sucursal} onChange={(e) => setFormulario({ ...formulario, sucursal: e.target.value })}>
                <option>Sede Principal</option>
                <option>Sucursal Norte</option>
                <option>Sucursal Sur</option>
                <option>Sucursal Oriente</option>
              </select>
            </div>
            <div className="grupo-campo">
              <label>Ubicación Física</label>
              <input value={formulario.ubicacion} onChange={(e) => setFormulario({ ...formulario, ubicacion: e.target.value })} placeholder="Ej: Estante A-12" />
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Cantidad Actual</label>
              <input type="number" value={formulario.cantidad} onChange={(e) => setFormulario({ ...formulario, cantidad: e.target.value })} placeholder="0" min="0" />
            </div>
            <div className="grupo-campo">
              <label>Mínimo Requerido</label>
              <input type="number" value={formulario.minimo} onChange={(e) => setFormulario({ ...formulario, minimo: e.target.value })} placeholder="5" min="0" />
            </div>
          </div>
        </Modal>
      )}

      {modal === 'suspender' && (
        <ConfirmarSuspender
          nombreElemento={`${actual?.producto} (${actual?.sucursal})`}
          estadoActual={actual?.estado}
          alCerrar={() => setModal(null)}
          alConfirmar={suspender}
        />
      )}
    </>
  );
}

function IconoEdificioPestana(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="22" x2="9" y2="11" /><line x1="15" y1="22" x2="15" y2="11" /><line x1="9" y1="7" x2="9.01" y2="7" /><line x1="15" y1="7" x2="15.01" y2="7" /></svg>;
}

function IconoBodegaSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" /><path d="M6 18h12" /><path d="M6 14h12" /></svg>;
}
function IconoCheckSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
}
function IconoAlertaSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
}
function IconoCruzSVG(props) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
}
