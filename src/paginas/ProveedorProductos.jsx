import { useState } from 'react';
import { Modal, ConfirmarEliminar } from '../componentes/AdminModals';

const datosIniciales = [
  { id: 1, sku: 'PROV-MUE-01', nombre: 'Sofá Modular 3 Puestos Velvet', categoria: 'Muebles', precioCosto: 850000, precioSugerido: 1450000, stockLote: 25, tiempoEntrega: '3 a 5 días', estado: 'Disponible' },
  { id: 2, sku: 'PROV-ILU-04', nombre: 'Lámpara Colgante Nórdica LED', categoria: 'Iluminación', precioCosto: 75000, precioSugerido: 149900, stockLote: 60, tiempoEntrega: '24 a 48 hrs', estado: 'Disponible' },
  { id: 3, sku: 'PROV-DEC-12', nombre: 'Espejo Redondo Biselado 80cm', categoria: 'Decoración', precioCosto: 95000, precioSugerido: 189900, stockLote: 18, tiempoEntrega: '2 a 3 días', estado: 'Disponible' },
  { id: 4, sku: 'PROV-BAN-08', nombre: 'Grifería Monocontrol Cascada Negra', categoria: 'Baño y Cocina', precioCosto: 120000, precioSugerido: 239900, stockLote: 40, tiempoEntrega: '24 a 48 hrs', estado: 'Disponible' },
  { id: 5, sku: 'PROV-HER-02', nombre: 'Juego de Brocas Titanio Pro x50', categoria: 'Herramientas', precioCosto: 45000, precioSugerido: 89900, stockLote: 5, tiempoEntrega: 'Bajo Pedido (7 días)', estado: 'Stock Bajo' },
  { id: 6, sku: 'PROV-PIS-15', nombre: 'Piso Porcelanato Pulido 60x60 (Caja)', categoria: 'Pisos y Pinturas', precioCosto: 65000, precioSugerido: 119900, stockLote: 120, tiempoEntrega: '24 a 48 hrs', estado: 'Disponible' },
];

const formularioVacio = {
  sku: '',
  nombre: '',
  categoria: 'Muebles',
  precioCosto: '',
  precioSugerido: '',
  stockLote: '',
  tiempoEntrega: '24 a 48 hrs',
  estado: 'Disponible',
};

export default function ProveedorProductos() {
  const [datos, setDatos] = useState(() => {
    try {
      const guardados = localStorage.getItem('novacasa_proveedor_productos');
      return guardados ? JSON.parse(guardados) : datosIniciales;
    } catch {
      return datosIniciales;
    }
  });
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [modal, setModal] = useState(null);
  const [actual, setActual] = useState(null);
  const [formulario, setFormulario] = useState(formularioVacio);

  const guardarEnStorage = (nuevos) => {
    try {
      localStorage.setItem('novacasa_proveedor_productos', JSON.stringify(nuevos));
    } catch (e) {
      console.error(e);
    }
  };

  const categorias = ['Todas', 'Muebles', 'Iluminación', 'Decoración', 'Baño y Cocina', 'Herramientas', 'Pisos y Pinturas'];

  const filtrados = datos.filter((p) => {
    const coincideTexto =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCat = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    return coincideTexto && coincideCat;
  });

  const abrirCrear = () => {
    setFormulario({ ...formularioVacio, sku: `PROV-${Date.now().toString().slice(-4)}` });
    setActual(null);
    setModal('crear');
  };

  const abrirEditar = (elem) => {
    setFormulario({ ...elem });
    setActual(elem);
    setModal('editar');
  };

  const abrirEliminar = (elem) => {
    setActual(elem);
    setModal('eliminar');
  };

  const guardar = () => {
    if (!formulario.nombre.trim()) return;
    let actualizados;
    if (modal === 'crear') {
      actualizados = [
        ...datos,
        {
          ...formulario,
          id: Date.now(),
          precioCosto: Number(formulario.precioCosto) || 0,
          precioSugerido: Number(formulario.precioSugerido) || 0,
          stockLote: Number(formulario.stockLote) || 0,
        },
      ];
    } else {
      actualizados = datos.map((p) =>
        p.id === actual.id
          ? {
              ...formulario,
              id: actual.id,
              precioCosto: Number(formulario.precioCosto) || 0,
              precioSugerido: Number(formulario.precioSugerido) || 0,
              stockLote: Number(formulario.stockLote) || 0,
            }
          : p
      );
    }
    setDatos(actualizados);
    guardarEnStorage(actualizados);
    setModal(null);
  };

  const eliminar = () => {
    const actualizados = datos.filter((p) => p.id !== actual.id);
    setDatos(actualizados);
    guardarEnStorage(actualizados);
    setModal(null);
  };

  return (
    <>
      <div className="crud-encabezado">
        <div className="crud-encabezado-izq">
          <h2>Catálogo de Suministro</h2>
          <p>
            {datos.length} productos registrados para abastecimiento de tiendas NovaCasa.
          </p>
        </div>
        <div className="crud-acciones">
          <button className="btn-primario" onClick={abrirCrear}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar Producto a Suministro
          </button>
        </div>
      </div>

      <div className="barra-herramientas" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div className="campo-busqueda" style={{ margin: 0, flex: 1, minWidth: '220px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#71717A" strokeWidth="2" width="15" height="15">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por SKU o nombre de producto..."
          />
        </div>

        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            border: '1px solid var(--tarjeta-borde)',
            background: 'var(--tarjeta-blanca)',
            color: 'var(--texto-principal)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {categorias.map((c) => (
            <option key={c} value={c}>{c === 'Todas' ? 'Todas las Categorías' : c}</option>
          ))}
        </select>
      </div>

      <div className="tabla-contenedor">
        <table className="tabla-panel">
          <thead>
            <tr>
              <th>SKU Proveedor</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio Coste (Almacén)</th>
              <th>PVP Sugerido</th>
              <th>Stock en Lote</th>
              <th>Tiempo Despacho</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="estado-vacio">
                    <p>No se encontraron productos en el catálogo de suministro.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtrados.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--texto-principal)' }}>{p.sku}</td>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td style={{ color: 'var(--texto-secundario)' }}>{p.categoria}</td>
                  <td style={{ fontWeight: 800, color: '#10B981' }}>
                    ${Number(p.precioCosto).toLocaleString('es-CO')}
                  </td>
                  <td style={{ color: 'var(--texto-secundario)' }}>
                    ${Number(p.precioSugerido).toLocaleString('es-CO')}
                  </td>
                  <td style={{ fontWeight: 700 }}>{p.stockLote} unds</td>
                  <td style={{ fontSize: '12px', color: 'var(--texto-secundario)' }}>{p.tiempoEntrega}</td>
                  <td>
                    <span className={`insignia-estado ${p.estado === 'Disponible' ? 'completado' : 'pendiente'}`}>
                      {p.estado}
                    </span>
                  </td>
                  <td>
                    <div className="acciones-tabla">
                      <button className="btn-accion editar" onClick={() => abrirEditar(p)} title="Editar producto">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button className="btn-accion eliminar" onClick={() => abrirEliminar(p)} title="Eliminar de catálogo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="crud-paginacion">
          <span className="paginacion-info">Mostrando {filtrados.length} de {datos.length} productos</span>
        </div>
      </div>

      {(modal === 'crear' || modal === 'editar') && (
        <Modal titulo={modal === 'crear' ? 'Nuevo Producto a Suministrar' : 'Editar Producto de Suministro'} alCerrar={() => setModal(null)} alGuardar={guardar}>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>SKU / Código Proveedor *</label>
              <input value={formulario.sku} onChange={(e) => setFormulario({ ...formulario, sku: e.target.value })} placeholder="PROV-001" />
            </div>
            <div className="grupo-campo">
              <label>Categoría</label>
              <select value={formulario.categoria} onChange={(e) => setFormulario({ ...formulario, categoria: e.target.value })}>
                {categorias.filter(c => c !== 'Todas').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grupo-campo">
            <label>Nombre del Producto *</label>
            <input value={formulario.nombre} onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })} placeholder="Nombre detallado del artículo" />
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Precio Coste para NovaCasa (COP) *</label>
              <input type="number" value={formulario.precioCosto} onChange={(e) => setFormulario({ ...formulario, precioCosto: e.target.value })} placeholder="0" />
            </div>
            <div className="grupo-campo">
              <label>PVP Venta Sugerido (COP)</label>
              <input type="number" value={formulario.precioSugerido} onChange={(e) => setFormulario({ ...formulario, precioSugerido: e.target.value })} placeholder="0" />
            </div>
          </div>
          <div className="fila-campos">
            <div className="grupo-campo">
              <label>Stock Disponible en Lote *</label>
              <input type="number" value={formulario.stockLote} onChange={(e) => setFormulario({ ...formulario, stockLote: e.target.value })} placeholder="0" />
            </div>
            <div className="grupo-campo">
              <label>Tiempo Promedio de Entrega</label>
              <input value={formulario.tiempoEntrega} onChange={(e) => setFormulario({ ...formulario, tiempoEntrega: e.target.value })} placeholder="24 a 48 hrs" />
            </div>
          </div>
        </Modal>
      )}

      {modal === 'eliminar' && (
        <ConfirmarEliminar
          nombreElemento={`${actual?.sku} - ${actual?.nombre}`}
          alCerrar={() => setModal(null)}
          alConfirmar={eliminar}
        />
      )}
    </>
  );
}
